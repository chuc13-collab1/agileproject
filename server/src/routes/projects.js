import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

const router = express.Router();

/**
 * GET /api/teachers/:teacherId/projects
 * Get all projects supervised by a teacher
 */
router.get('/teachers/:teacherId/projects', async (req, res, next) => {
    try {
        const { teacherId } = req.params;

        const [projects] = await db.query(`
      SELECT 
        p.*,
        t.title as topic_title,
        t.field,
        u.display_name as student_name,
        s.student_id as student_code,
        s.class_name,
        -- Latest progress report
        (SELECT COUNT(*) FROM progress_reports pr WHERE pr.project_id = p.id AND pr.status = 'submitted') as unreviewed_reports
      FROM projects p
      INNER JOIN topics t ON p.topic_id = t.id
      INNER JOIN students s ON p.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      WHERE p.supervisor_id = (SELECT id FROM teachers WHERE user_id = ?)
      ORDER BY p.created_at DESC
    `, [teacherId]);

        res.json({
            success: true,
            data: projects
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/projects/:id
 * Get detailed project information
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get project with related data
        const [projects] = await db.query(`
      SELECT 
        p.*,
        t.title as topic_title,
        t.description as topic_description,
        t.field,
        u_student.display_name as student_name,
        u_student.email as student_email,
        s.student_id as student_code,
        s.class_name,
        u_supervisor.display_name as supervisor_name,
        u_reviewer.display_name as reviewer_name
      FROM projects p
      INNER JOIN topics t ON p.topic_id = t.id
      INNER JOIN students s ON p.student_id = s.id
      INNER JOIN users u_student ON s.user_id = u_student.id
      INNER JOIN teachers t_supervisor ON p.supervisor_id = t_supervisor.id
      INNER JOIN users u_supervisor ON t_supervisor.user_id = u_supervisor.id
      LEFT JOIN teachers t_reviewer ON p.reviewer_id = t_reviewer.id
      LEFT JOIN users u_reviewer ON t_reviewer.user_id = u_reviewer.id
      WHERE p.id = ?
    `, [id]);

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const project = projects[0];

        // Get progress reports
        const [progressReports] = await db.query(`
      SELECT * FROM progress_reports
      WHERE project_id = ?
      ORDER BY week_number ASC
    `, [id]);

        // Get documents
        const [documents] = await db.query(`
      SELECT * FROM documents
      WHERE project_id = ? AND is_latest = TRUE
      ORDER BY document_type, uploaded_at DESC
    `, [id]);

        // Get evaluations
        const [evaluations] = await db.query(`
      SELECT 
        e.*,
        u.display_name as evaluator_name
      FROM evaluations e
      INNER JOIN teachers t ON e.evaluator_id = t.id
      INNER JOIN users u ON t.user_id = u.id
      WHERE e.project_id = ?
    `, [id]);

        res.json({
            success: true,
            data: {
                ...project,
                progress_reports: progressReports,
                documents: documents,
                evaluations: evaluations
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/projects/:id/status
 * Update project status
 */
router.patch('/:id/status', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['registered', 'in_progress', 'submitted', 'reviewed', 'completed', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await db.query(
            'UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        res.json({
            success: true,
            message: 'Project status updated successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/projects
 * Create a new project (student registration)
 */
router.post('/', async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        const {
            topicId,
            studentId,
            supervisorId,
        } = req.body;

        // Validate required fields
        if (!topicId || !studentId || !supervisorId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if student already has a project this semester
        const [existing] = await connection.query(`
      SELECT COUNT(*) as count FROM projects p
      INNER JOIN topics t ON p.topic_id = t.id
      INNER JOIN students s ON p.student_id = s.id
      WHERE s.user_id = ? AND p.status NOT IN ('completed', 'failed')
    `, [studentId]);

        if (existing[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Student already has an active project'
            });
        }

        // Check if topic has available slots
        const [topics] = await connection.query(
            'SELECT current_students, max_students FROM topics WHERE id = ?',
            [topicId]
        );

        if (topics.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Topic not found'
            });
        }

        if (topics[0].current_students >= topics[0].max_students) {
            return res.status(400).json({
                success: false,
                message: 'Topic has reached maximum students'
            });
        }

        await connection.beginTransaction();

        const projectId = uuidv4();

        // Create project
        await connection.query(`
      INSERT INTO projects (id, topic_id, student_id, supervisor_id, status)
      VALUES (?, ?, (SELECT id FROM students WHERE user_id = ?), (SELECT id FROM teachers WHERE user_id = ?), 'registered')
    `, [projectId, topicId, studentId, supervisorId]);

        // Update topic current_students and teacher current_students
        await connection.query(
            'UPDATE topics SET current_students = current_students + 1 WHERE id = ?',
            [topicId]
        );

        await connection.query(
            'UPDATE teachers SET current_students = current_students + 1 WHERE user_id = ?',
            [supervisorId]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Project registered successfully',
            data: { projectId }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

export default router;
