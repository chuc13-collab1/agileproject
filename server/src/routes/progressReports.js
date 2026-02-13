import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * GET /api/progress-reports/students/:studentId/reports
 * Get progress reports for a student
 */
router.get('/students/:studentId/reports', async (req, res, next) => {
    try {
        const { studentId } = req.params; // This is the Firebase user_id

        const [reports] = await db.query(`
      SELECT 
        pr.*,
        p.id as project_id,
        t.title as topic_title
      FROM progress_reports pr
      INNER JOIN projects p ON pr.project_id = p.id
      LEFT JOIN topics t ON p.topic_id = t.id
      INNER JOIN students s ON p.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      WHERE u.uid = ?
      ORDER BY pr.submitted_date DESC
    `, [studentId]);

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/teachers/:teacherId/progress-reports
 * Get progress reports for supervised students
 */
router.get('/teachers/:teacherId/progress-reports', async (req, res, next) => {
    try {
        const { teacherId } = req.params;
        const { status } = req.query; // 'submitted', 'reviewed', 'all'

        let statusFilter = '';
        if (status && status !== 'all') {
            statusFilter = `AND pr.status = '${status}'`;
        }

        const [reports] = await db.query(`
      SELECT 
        pr.*,
        p.id as project_id,
        t.title as topic_title,
        u.display_name as student_name,
        s.student_id as student_code
      FROM progress_reports pr
      INNER JOIN projects p ON pr.project_id = p.id
      LEFT JOIN topics t ON p.topic_id = t.id
      INNER JOIN students s ON p.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      WHERE p.supervisor_id = (
        SELECT t.id 
        FROM teachers t 
        INNER JOIN users u2 ON t.user_id = u2.id 
        WHERE u2.uid = ?
      )
      ${statusFilter}
      ORDER BY pr.submitted_date DESC
    `, [teacherId]);

        // Count unreviewed
        const [unreviewed] = await db.query(`
      SELECT COUNT(*) as count FROM progress_reports pr
      INNER JOIN projects p ON pr.project_id = p.id
      WHERE p.supervisor_id = (
        SELECT t.id 
        FROM teachers t 
        INNER JOIN users u ON t.user_id = u.id 
        WHERE u.uid = ?
      )
      AND pr.status = 'submitted'
    `, [teacherId]);

        res.json({
            success: true,
            data: {
                reports,
                unreviewed_count: unreviewed[0].count
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/progress-reports/:id
 * Get a single progress report with comments
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const [reports] = await db.query(`
      SELECT 
        pr.*,
        p.id as project_id,
        t.title as topic_title,
        u.display_name as student_name,
        s.student_id as student_code
      FROM progress_reports pr
      INNER JOIN projects p ON pr.project_id = p.id
      LEFT JOIN topics t ON p.topic_id = t.id
      INNER JOIN students s ON p.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      WHERE pr.id = ?
    `, [id]);

        if (reports.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Progress report not found'
            });
        }

        // Get comments
        const [comments] = await db.query(`
      SELECT 
        c.*,
        u.display_name as teacher_name
      FROM comments c
      INNER JOIN teachers t ON c.teacher_id = t.id
      INNER JOIN users u ON t.user_id = u.id
      WHERE c.report_id = ?
      ORDER BY c.comment_date ASC
    `, [id]);

        res.json({
            success: true,
            data: {
                ...reports[0],
                comments
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/progress-reports/:id/comments
 * Add a comment to a progress report
 */
router.post('/:id/comments', async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        const { id } = req.params;
        const { content, rating, status } = req.body;
        const teacherUid = req.user.uid; // From auth middleware (Firebase UID)

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        // Validate status
        const validStatuses = ['approved', 'revision_needed', 'reviewed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await connection.beginTransaction();

        const commentId = uuidv4();

        // Create comment
        // Look up teacher ID using UID
        await connection.query(`
      INSERT INTO comments (id, report_id, teacher_id, content, rating)
      VALUES (?, ?, (
        SELECT t.id 
        FROM teachers t 
        INNER JOIN users u ON t.user_id = u.id 
        WHERE u.uid = ?
      ), ?, ?)
    `, [commentId, id, teacherUid, content, rating || null]);

        // Update report status
        if (status) {
            await connection.query(
                'UPDATE progress_reports SET status = ?, reviewed_date = CURRENT_TIMESTAMP WHERE id = ?',
                [status, id]
            );
        }

        // TODO: Send notification to student

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: { commentId }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

/**
 * POST /api/progress-reports
 * Submit a new progress report (used by students)
 */
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        const {
            projectId,
            reportTitle,
            weekNumber,
            content,
            achievements,
            difficulties,
            nextSteps
        } = req.body;

        // Extract file info from multer
        const filePath = req.file ? req.file.path : null;
        const fileName = req.file ? req.file.originalname : null;
        const fileSize = req.file ? req.file.size : null;

        if (!projectId || !reportTitle || !content) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const reportId = uuidv4();

        await db.query(`
      INSERT INTO progress_reports (
        id, project_id, report_title, week_number, content, 
        achievements, difficulties, next_steps,
        file_path, file_name, file_size, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')
    `, [
            reportId, projectId, reportTitle, weekNumber || null, content,
            achievements || null, difficulties || null, nextSteps || null,
            filePath || null, fileName || null, fileSize || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Progress report submitted successfully',
            data: { reportId }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
