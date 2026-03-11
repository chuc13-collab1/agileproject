import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import upload from '../middleware/upload.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * POST /api/uploads/documents
 * Upload a project document
 */
router.post('/documents', upload.single('file'), async (req, res, next) => {
    try {
        const {
            projectId,
            documentType,
            description
        } = req.body;

        const uploadedBy = req.user?.uid; // From verifyToken middleware

        if (!projectId || !documentType || !req.file) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields or file'
            });
        }

        // Valid document types
        const validTypes = ['outline', 'report', 'slides', 'source_code', 'other'];
        if (!validTypes.includes(documentType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid document type'
            });
        }

        const fileName = req.file.originalname;
        const filePath = req.file.path;
        const fileSize = req.file.size;
        const mimeType = req.file.mimetype;

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Mark previous versions as not latest
            await connection.query(
                'UPDATE documents SET is_latest = FALSE WHERE project_id = ? AND document_type = ?',
                [projectId, documentType]
            );

            // Get next version number
            const [versions] = await connection.query(
                'SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM documents WHERE project_id = ? AND document_type = ?',
                [projectId, documentType]
            );

            const version = versions[0].next_version;
            const documentId = uuidv4();

            // Insert new document
            // Assuming the 'uploaded_by' in SQL is the user's UUID from the 'users' table
            // We need to look it up if req.user.uid is the Firebase UID
            const [users] = await connection.query('SELECT id FROM users WHERE uid = ?', [uploadedBy]);
            const userInternalId = users[0]?.id || uploadedBy;

            await connection.query(`
        INSERT INTO documents (
          id, project_id, document_type, file_name, file_path,
          file_size, mime_type, version, is_latest, uploaded_by, description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)
      `, [
                documentId, projectId, documentType, fileName, filePath,
                fileSize, mimeType, version, userInternalId, description || null
            ]);

            await connection.commit();

            res.status(201).json({
                success: true,
                message: 'Document uploaded successfully',
                data: {
                    documentId,
                    version,
                    fileName
                }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/uploads/projects/:projectId/documents
 * Get all documents for a project
 */
router.get('/projects/:projectId/documents', async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { type } = req.query; // Optional filter by document_type

        let query = `
      SELECT 
        d.*,
        u.display_name as uploaded_by_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.project_id = ?
    `;
        
        const params = [projectId];
        
        if (type) {
            query += " AND d.document_type = ?";
            params.push(type);
        }
        
        query += " ORDER BY d.uploaded_at DESC";

        const [documents] = await db.query(query, params);

        // Map internal paths to accessible URLs
        const documentsWithUrls = documents.map(doc => ({
            ...doc,
            url: `/uploads/${path.relative(path.join(__dirname, '../../uploads'), doc.file_path).replace(/\\/g, '/')}`
        }));

        res.json({
            success: true,
            data: documentsWithUrls
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/uploads/documents/:id
 * Delete a document
 */
router.delete('/documents/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const [documents] = await db.query('SELECT file_path FROM documents WHERE id = ?', [id]);
        
        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const filePath = documents[0].file_path;

        // Delete from database
        await db.query('DELETE FROM documents WHERE id = ?', [id]);

        // Delete from filesystem
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
