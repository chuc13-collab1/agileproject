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
 * TEMPORARY: POST /api/uploads/setup-db
 * Use this to create the documents table if you can't access SQL editor
 */
router.get('/setup-db', async (req, res) => {
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS \`documents\` (
                \`id\` varchar(36) NOT NULL,
                \`project_id\` varchar(36) NOT NULL,
                \`document_type\` enum('outline', 'report', 'slides', 'source_code', 'other') NOT NULL,
                \`file_name\` varchar(255) NOT NULL,
                \`file_path\` varchar(500) NOT NULL,
                \`file_size\` bigint(20) DEFAULT NULL,
                \`mime_type\` varchar(100) DEFAULT NULL,
                \`version\` int(11) DEFAULT 1,
                \`is_latest\` tinyint(1) DEFAULT 1,
                \`uploaded_by\` varchar(36) NOT NULL,
                \`description\` text DEFAULT NULL,
                \`uploaded_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (\`id\`),
                KEY \`idx_project_id\` (\`project_id\`),
                CONSTRAINT \`fk_documents_project_setup\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await db.query(sql);
        res.send('✅ Database setup successful! The "documents" table has been created. You can now close this page.');
    } catch (error) {
        console.error('Setup DB error:', error);
        res.status(500).send('❌ Setup failed: ' + error.message);
    }
});

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
        const { type } = req.query;

        console.log(`[DEBUG] Fetching documents for project: ${projectId}`);

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

        try {
            const [documents] = await db.query(query, params);
            console.log(`[DEBUG] Found ${documents.length} documents`);

            // Map internal paths to accessible URLs
            const documentsWithUrls = documents.map(doc => {
                try {
                    const relativePath = path.relative(path.join(__dirname, '../../uploads'), doc.file_path).replace(/\\/g, '/');
                    return {
                        ...doc,
                        url: `/uploads/${relativePath}`
                    };
                } catch (err) {
                    console.error(`[DEBUG] Error mapping path for doc ${doc.id}:`, err);
                    return { ...doc, url: '#' };
                }
            });

            res.json({
                success: true,
                data: documentsWithUrls
            });
        } catch (dbError) {
            console.error('[DEBUG] Database error in fetch documents:', dbError);
            if (dbError.code === 'ER_NO_SUCH_TABLE') {
                return res.status(500).json({
                    success: false,
                    message: 'Database table "documents" is missing. Please run the SQL migration.'
                });
            }
            throw dbError;
        }
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
