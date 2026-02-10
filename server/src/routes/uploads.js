import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

const router = express.Router();

/**
 * POST /api/uploads/documents
 * Upload a project document
 * Note: This is a placeholder - actual file upload should use multipart/form-data
 */
router.post('/documents', async (req, res, next) => {
    try {
        const {
            projectId,
            documentType,
            fileName,
            filePath,  // Firebase Storage URL
            fileSize,
            mimeType,
            description,
            uploadedBy
        } = req.body;

        if (!projectId || !documentType || !fileName || !filePath) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Valid document types
        const validTypes = ['proposal', 'report', 'presentation', 'source_code', 'other'];
        if (!validTypes.includes(documentType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid document type'
            });
        }

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
            await connection.query(`
        INSERT INTO documents (
          id, project_id, document_type, file_name, file_path,
          file_size, mime_type, version, is_latest, uploaded_by, description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)
      `, [
                documentId, projectId, documentType, fileName, filePath,
                fileSize || null, mimeType || null, version, uploadedBy, description || null
            ]);

            await connection.commit();

            res.status(201).json({
                success: true,
                message: 'Document uploaded successfully',
                data: {
                    documentId,
                    version
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
 * GET /api/documents/:id/download
 * Get download URL for a document
 */
router.get('/documents/:id/download', async (req, res, next) => {
    try {
        const { id } = req.params;

        const [documents] = await db.query(
            'SELECT file_path, file_name FROM documents WHERE id = ?',
            [id]
        );

        if (documents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Return the Firebase Storage URL
        // In production, you might want to generate a signed URL here
        res.json({
            success: true,
            data: {
                downloadUrl: documents[0].file_path,
                fileName: documents[0].file_name
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/projects/:projectId/documents
 * Get all documents for a project
 */
router.get('/projects/:projectId/documents', async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { type } = req.query; // Optional filter by document_type

        let typeFilter = '';
        if (type) {
            typeFilter = `AND document_type = '${type}'`;
        }

        const [documents] = await db.query(`
      SELECT 
        d.*,
        u.display_name as uploaded_by_name
      FROM documents d
      INNER JOIN users u ON d.uploaded_by = u.id
      WHERE d.project_id = ? ${typeFilter}
      ORDER BY d.document_type, d.version DESC
    `, [projectId]);

        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        next(error);
    }
});

export default router;
