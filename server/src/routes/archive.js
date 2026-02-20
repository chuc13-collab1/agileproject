import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Ensure project_archive table exists
const ensureTable = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS project_archive (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_id VARCHAR(36) NOT NULL,
            topic_title VARCHAR(500) NOT NULL,
            topic_field VARCHAR(255) DEFAULT NULL,
            student_name VARCHAR(255) NOT NULL,
            student_code VARCHAR(50) DEFAULT NULL,
            class_name VARCHAR(50) DEFAULT NULL,
            supervisor_name VARCHAR(255) DEFAULT NULL,
            reviewer_name VARCHAR(255) DEFAULT NULL,
            academic_year VARCHAR(20) NOT NULL,
            semester VARCHAR(20) DEFAULT NULL,
            final_score DECIMAL(5,2) DEFAULT NULL,
            grade VARCHAR(5) DEFAULT NULL,
            status VARCHAR(50) DEFAULT 'completed',
            description TEXT DEFAULT NULL,
            document_url VARCHAR(500) DEFAULT NULL,
            archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_academic_year (academic_year),
            INDEX idx_topic_field (topic_field),
            INDEX idx_grade (grade),
            FULLTEXT idx_search (topic_title, student_name, supervisor_name)
        )
    `);
};
ensureTable();

/**
 * GET /api/archive
 * Browse project archive with search, filter, pagination
 */
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        const {
            search,
            field,
            year,
            grade,
            sort = 'newest',
        } = req.query;

        let whereClause = 'WHERE 1=1';
        const params = [];

        if (search) {
            whereClause += ' AND (topic_title LIKE ? OR student_name LIKE ? OR supervisor_name LIKE ?)';
            const q = `%${search}%`;
            params.push(q, q, q);
        }

        if (field) {
            whereClause += ' AND topic_field = ?';
            params.push(field);
        }

        if (year) {
            whereClause += ' AND academic_year = ?';
            params.push(year);
        }

        if (grade) {
            whereClause += ' AND grade = ?';
            params.push(grade);
        }

        let orderClause = 'ORDER BY archived_at DESC';
        switch (sort) {
            case 'oldest': orderClause = 'ORDER BY archived_at ASC'; break;
            case 'score_high': orderClause = 'ORDER BY final_score DESC'; break;
            case 'score_low': orderClause = 'ORDER BY final_score ASC'; break;
            case 'alpha': orderClause = 'ORDER BY topic_title ASC'; break;
        }

        const [projects] = await db.query(
            `SELECT * FROM project_archive ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) as total FROM project_archive ${whereClause}`,
            params
        );

        // Get available filters
        const [fields] = await db.query(
            `SELECT DISTINCT topic_field FROM project_archive WHERE topic_field IS NOT NULL ORDER BY topic_field`
        );
        const [years] = await db.query(
            `SELECT DISTINCT academic_year FROM project_archive ORDER BY academic_year DESC`
        );
        const [grades] = await db.query(
            `SELECT DISTINCT grade FROM project_archive WHERE grade IS NOT NULL ORDER BY grade`
        );

        res.json({
            success: true,
            data: projects,
            filters: {
                fields: fields.map((f) => f.topic_field),
                years: years.map((y) => y.academic_year),
                grades: grades.map((g) => g.grade),
            },
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/archive/:id
 * Get single archived project detail
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const [projects] = await db.query(
            `SELECT * FROM project_archive WHERE id = ?`,
            [id]
        );

        if (projects.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        res.json({ success: true, data: projects[0] });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/archive
 * Archive a completed project (admin only)
 */
router.post('/', async (req, res, next) => {
    try {
        const {
            projectId,
            topicTitle,
            topicField,
            studentName,
            studentCode,
            className,
            supervisorName,
            reviewerName,
            academicYear,
            semester,
            finalScore,
            grade,
            description,
            documentUrl,
        } = req.body;

        if (!topicTitle || !studentName || !academicYear) {
            return res.status(400).json({
                success: false,
                message: 'topicTitle, studentName, and academicYear are required',
            });
        }

        const [result] = await db.query(
            `INSERT INTO project_archive 
            (project_id, topic_title, topic_field, student_name, student_code, class_name,
             supervisor_name, reviewer_name, academic_year, semester, final_score, grade, description, document_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [projectId || null, topicTitle, topicField || null, studentName, studentCode || null,
            className || null, supervisorName || null, reviewerName || null,
                academicYear, semester || null, finalScore || null, grade || null,
            description || null, documentUrl || null]
        );

        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/archive/batch
 * Auto-archive all completed projects from projects table
 */
router.post('/batch', async (req, res, next) => {
    try {
        const { academicYear, semester } = req.body;

        if (!academicYear) {
            return res.status(400).json({
                success: false,
                message: 'academicYear is required',
            });
        }

        const [completedProjects] = await db.query(`
            SELECT 
                p.id as project_id,
                t.title as topic_title,
                t.field as topic_field,
                u_student.display_name as student_name,
                s.student_id as student_code,
                s.class_name,
                u_supervisor.display_name as supervisor_name,
                u_reviewer.display_name as reviewer_name,
                p.final_score,
                p.grade,
                p.description
            FROM projects p
            INNER JOIN topics t ON p.topic_id = t.id
            INNER JOIN students s ON p.student_id = s.id
            INNER JOIN users u_student ON s.user_id = u_student.id
            LEFT JOIN teachers te ON p.supervisor_id = te.id
            LEFT JOIN users u_supervisor ON te.user_id = u_supervisor.id
            LEFT JOIN teachers tr ON p.reviewer_id = tr.id
            LEFT JOIN users u_reviewer ON tr.user_id = u_reviewer.id
            WHERE p.status = 'completed'
        `);

        let archived = 0;
        for (const p of completedProjects) {
            // Skip if already archived
            const [[{ exists }]] = await db.query(
                `SELECT COUNT(*) as exists FROM project_archive WHERE project_id = ?`,
                [p.project_id]
            );
            if (exists > 0) continue;

            await db.query(
                `INSERT INTO project_archive 
                (project_id, topic_title, topic_field, student_name, student_code, class_name,
                 supervisor_name, reviewer_name, academic_year, semester, final_score, grade, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.project_id, p.topic_title, p.topic_field, p.student_name, p.student_code,
                p.class_name, p.supervisor_name, p.reviewer_name,
                    academicYear, semester || null, p.final_score, p.grade, p.description]
            );
            archived++;
        }

        res.json({
            success: true,
            message: `Archived ${archived} projects`,
            data: { archived, total: completedProjects.length },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/archive/stats/summary
 * Get archive statistics
 */
router.get('/stats/summary', async (req, res, next) => {
    try {
        const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM project_archive`);
        const [byYear] = await db.query(
            `SELECT academic_year, COUNT(*) as count FROM project_archive GROUP BY academic_year ORDER BY academic_year DESC`
        );
        const [byField] = await db.query(
            `SELECT topic_field, COUNT(*) as count FROM project_archive WHERE topic_field IS NOT NULL GROUP BY topic_field ORDER BY count DESC`
        );
        const [byGrade] = await db.query(
            `SELECT grade, COUNT(*) as count FROM project_archive WHERE grade IS NOT NULL GROUP BY grade ORDER BY grade`
        );

        res.json({
            success: true,
            data: { total, byYear, byField, byGrade },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
