import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Ensure project_archive table exists (safe version - no inline FULLTEXT)
const ensureTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS project_archive (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id VARCHAR(36) DEFAULT NULL,
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
                INDEX idx_grade (grade)
            )
        `);

        // Add FULLTEXT index separately (ignore error if already exists)
        await db.query(`
            ALTER TABLE project_archive ADD FULLTEXT idx_search (topic_title, student_name, supervisor_name)
        `).catch(() => { /* already exists */ });
    } catch (err) {
        console.error('[archive] ensureTable error:', err.message);
    }
};
ensureTable();

/**
 * POST /api/archive/batch
 * Auto-archive all completed OR failed projects from projects table
 * NOTE: Must be declared BEFORE /:id to avoid route conflict
 */
router.post('/batch', async (req, res, next) => {
    try {
        const { academicYear, semester, softDelete = true } = req.body;

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
                p.status,
                p.report_deadline,
                p.notes as description
            FROM projects p
            INNER JOIN topics t ON p.topic_id = t.id
            INNER JOIN students s ON p.student_id = s.id
            INNER JOIN users u_student ON s.user_id = u_student.id
            LEFT JOIN teachers te ON p.supervisor_id = te.id
            LEFT JOIN users u_supervisor ON te.user_id = u_supervisor.id
            LEFT JOIN teachers tr ON p.reviewer_id = tr.id
            LEFT JOIN users u_reviewer ON tr.user_id = u_reviewer.id
            WHERE p.status IN ('completed', 'failed') AND p.archived_at IS NULL
        `);

        let archived = 0;
        const archivedIds = [];

        for (const p of completedProjects) {
            // Skip if already archived
            if (p.project_id) {
                const [[{ existsCount }]] = await db.query(
                    `SELECT COUNT(*) as existsCount FROM project_archive WHERE project_id = ?`,
                    [p.project_id]
                );
                if (existsCount > 0) continue;
            }

            const archiveStatus = p.status === 'failed' ? 'failed' : 'completed';
            const archiveDesc = p.status === 'failed'
                ? `[Không đạt] ${p.description || ''}`
                : (p.description || null);

            await db.query(
                `INSERT INTO project_archive 
                (project_id, topic_title, topic_field, student_name, student_code, class_name,
                 supervisor_name, reviewer_name, academic_year, semester, final_score, grade, status, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.project_id || null, p.topic_title, p.topic_field || null, p.student_name,
                p.student_code || null, p.class_name || null, p.supervisor_name || null,
                p.reviewer_name || null, academicYear, semester || null,
                p.final_score || null, p.grade || null, archiveStatus, archiveDesc || null]
            );
            archivedIds.push(p.project_id);
            archived++;
        }

        // Soft-delete: mark original projects as archived
        if (softDelete && archivedIds.length > 0) {
            const validIds = archivedIds.filter(Boolean);
            if (validIds.length > 0) {
                await db.query(
                    `UPDATE projects SET archived_at = CURRENT_TIMESTAMP WHERE id IN (?)`,
                    [validIds]
                );
            }
        }

        res.json({
            success: true,
            message: `Archived ${archived} projects${softDelete ? ' (soft-deleted originals)' : ''}`,
            data: { archived, total: completedProjects.length, softDeleted: softDelete ? archivedIds.filter(Boolean).length : 0 },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/archive/batch-overdue
 * Auto-mark overdue projects as 'failed' then archive them
 * Overdue = report_deadline < NOW() AND status NOT IN ('completed', 'failed', archived)
 */
router.post('/batch-overdue', async (req, res, next) => {
    try {
        const { academicYear, semester } = req.body;

        if (!academicYear) {
            return res.status(400).json({
                success: false,
                message: 'academicYear is required',
            });
        }

        // Step 1: Find overdue projects that are not yet completed/failed/archived
        const [overdueProjects] = await db.query(`
            SELECT 
                p.id as project_id,
                t.title as topic_title,
                t.field as topic_field,
                u_student.display_name as student_name,
                u_student.uid as student_uid,
                s.student_id as student_code,
                s.class_name,
                u_supervisor.display_name as supervisor_name,
                u_reviewer.display_name as reviewer_name,
                p.final_score,
                p.grade,
                p.report_deadline,
                p.notes as description
            FROM projects p
            INNER JOIN topics t ON p.topic_id = t.id
            INNER JOIN students s ON p.student_id = s.id
            INNER JOIN users u_student ON s.user_id = u_student.id
            LEFT JOIN teachers te ON p.supervisor_id = te.id
            LEFT JOIN users u_supervisor ON te.user_id = u_supervisor.id
            LEFT JOIN teachers tr ON p.reviewer_id = tr.id
            LEFT JOIN users u_reviewer ON tr.user_id = u_reviewer.id
            WHERE p.report_deadline IS NOT NULL
              AND p.report_deadline < NOW()
              AND p.status NOT IN ('completed', 'failed', 'graded')
              AND p.archived_at IS NULL
        `);

        if (overdueProjects.length === 0) {
            return res.json({
                success: true,
                message: 'No overdue projects found',
                data: { markedFailed: 0, archived: 0 },
            });
        }

        let markedFailed = 0;
        let archived = 0;
        const overdueIds = overdueProjects.map(p => p.project_id).filter(Boolean);

        // Step 2: Mark all overdue projects as 'failed'
        if (overdueIds.length > 0) {
            await db.query(
                `UPDATE projects SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id IN (?)`,
                [overdueIds]
            );
            markedFailed = overdueIds.length;
        }

        // Step 3: Archive each overdue project
        for (const p of overdueProjects) {
            // Skip if already in archive
            if (p.project_id) {
                const [[{ existsCount }]] = await db.query(
                    `SELECT COUNT(*) as existsCount FROM project_archive WHERE project_id = ?`,
                    [p.project_id]
                );
                if (existsCount > 0) continue;
            }

            const deadlineStr = p.report_deadline
                ? new Date(p.report_deadline).toLocaleDateString('vi-VN')
                : 'N/A';
            const archiveDesc = `[Quá hạn - Hạn nộp: ${deadlineStr}] ${p.description || ''}`;

            await db.query(
                `INSERT INTO project_archive 
                (project_id, topic_title, topic_field, student_name, student_code, class_name,
                 supervisor_name, reviewer_name, academic_year, semester, final_score, grade, status, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'failed', ?)`,
                [p.project_id || null, p.topic_title, p.topic_field || null, p.student_name,
                p.student_code || null, p.class_name || null, p.supervisor_name || null,
                p.reviewer_name || null, academicYear, semester || null,
                p.final_score || null, p.grade || null, archiveDesc]
            );
            archived++;
        }

        // Step 4: Soft-delete originals (mark as archived)
        if (overdueIds.length > 0) {
            await db.query(
                `UPDATE projects SET archived_at = CURRENT_TIMESTAMP WHERE id IN (?)`,
                [overdueIds]
            );
        }

        res.json({
            success: true,
            message: `Marked ${markedFailed} overdue projects as failed and archived ${archived} projects`,
            data: { markedFailed, archived, totalOverdue: overdueProjects.length },
        });
    } catch (error) {
        next(error);
    }
});

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
 * GET /api/archive/stats/summary
 * Get archive statistics
 * NOTE: Must be declared BEFORE /:id to avoid route conflict
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
 * Archive a completed project manually (admin only)
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

export default router;
