import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/topics
 * Get all topics (Filterable)
 * Query params: status, semester, field
 */
router.get('/', verifyToken, async (req, res, next) => {
    try {
        const { status, semester, field } = req.query;
        let query = `
            SELECT t.*, 
                   u.display_name as supervisor_name,
                   u.email as supervisor_email,
                   u.id as supervisor_user_id,
                   r.display_name as reviewer_name,
                   r.email as reviewer_email
            FROM topics t
            JOIN users u ON t.supervisor_id = u.id
            LEFT JOIN users r ON t.reviewer_id = r.id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'all') {
            query += ' AND t.status = ?';
            params.push(status);
        }
        if (semester && semester !== 'all') {
            query += ' AND t.semester = ?';
            params.push(semester);
        }
        if (field && field !== 'all') {
            query += ' AND t.field = ?';
            params.push(field);
        }

        query += ' ORDER BY t.created_at DESC';

        const [rows] = await pool.query(query, params);

        // Transform data to match frontend expectations
        const topics = rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            supervisorId: row.supervisor_id,
            supervisorName: row.supervisor_name,
            supervisorEmail: row.supervisor_email,
            status: row.status,
            rejectionReason: row.rejection_reason,
            semester: row.semester,
            academicYear: row.academic_year,
            field: row.field,
            maxStudents: row.max_students,
            currentStudents: row.current_students,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            approvedAt: row.approved_at,
            approvedBy: row.approved_by,
            reviewerId: row.reviewer_id,
            reviewerName: row.reviewer_name
        }));

        res.json({
            success: true,
            data: topics
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/topics
 * Create a new topic (Teacher Only - but unrestricted for now for testing)
 */
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const { title, description, semester, academicYear, field, maxStudents } = req.body;

        // In real app, check if req.user.role === 'teacher'

        // Find user ID from users table using uid
        const [users] = await pool.query('SELECT id, display_name FROM users WHERE uid = ?', [req.user.uid]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found in database' });
        }
        const user = users[0];

        const id = uuidv4();
        await pool.query(
            `INSERT INTO topics 
            (id, title, description, supervisor_id, semester, academic_year, field, max_students, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [id, title, description, user.id, semester, academicYear, field, maxStudents || 2]
        );

        const [newTopic] = await pool.query('SELECT * FROM topics WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            data: {
                ...newTopic[0],
                supervisorName: user.display_name
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/topics/:id
 * Update topic (Teacher/Admin)
 */
router.put('/:id', verifyToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, semester, academicYear, field, maxStudents } = req.body;

        await pool.query(
            `UPDATE topics 
             SET title = ?, description = ?, semester = ?, academic_year = ?, field = ?, max_students = ?
             WHERE id = ?`,
            [title, description, semester, academicYear, field, maxStudents, id]
        );

        res.json({ success: true, message: 'Topic updated successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/topics/:id/status
 * Approve/Reject Topic (Admin only)
 */
router.patch('/:id/status', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Get Admin ID
        const [admins] = await pool.query('SELECT id FROM users WHERE uid = ?', [req.user.uid]);
        const adminId = admins[0]?.id;

        let query = 'UPDATE topics SET status = ?, updated_at = CURRENT_TIMESTAMP';
        const params = [status];

        if (status === 'approved') {
            query += ', approved_at = CURRENT_TIMESTAMP, approved_by = ?';
            params.push(adminId);
        } else if (status === 'rejected') {
            query += ', rejection_reason = ?';
            params.push(rejectionReason || 'No reason provided');
        }

        query += ' WHERE id = ?';
        params.push(id);

        await pool.query(query, params);

        res.json({ success: true, message: `Topic ${status} successfully` });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/topics/:id/reviewer
 * Assign Reviewer (Admin only)
 */
router.patch('/:id/reviewer', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reviewerId } = req.body;

        // Check if topic exists and get supervisor_id
        const [topics] = await pool.query('SELECT supervisor_id FROM topics WHERE id = ?', [id]);
        if (topics.length === 0) return res.status(404).json({ message: 'Topic not found' });

        // Prevent assigning supervisor as reviewer
        if (topics[0].supervisor_id === reviewerId) {
            return res.status(400).json({ message: 'Supervisor cannot be the reviewer' });
        }

        await pool.query('UPDATE topics SET reviewer_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [reviewerId, id]);

        res.json({ success: true, message: 'Reviewer assigned successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/topics/auto-assign-reviewers
 * Auto Assign Random Reviewers (Admin only)
 * Logic: Randomly assign a teacher to each approved topic, excluding the supervisor.
 */
router.post('/auto-assign-reviewers', verifyToken, isAdmin, async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get all approved topics directly from table
        const [topics] = await connection.query('SELECT id, supervisor_id FROM topics WHERE status = "approved"');

        // 2. Get all teachers
        const [teachers] = await connection.query('SELECT id, display_name FROM users WHERE role = "teacher" AND is_active = TRUE');

        if (teachers.length < 2) {
            // If only 1 teacher exists, they can't review anything if they are the supervisor.
            // But we proceed best-effort.
        }

        let assignedCount = 0;

        for (const topic of topics) {
            // Filter candidates: Teachers who are NOT the supervisor
            const candidates = teachers.filter(t => t.id !== topic.supervisor_id);

            if (candidates.length > 0) {
                // Pick random
                const randomReviewer = candidates[Math.floor(Math.random() * candidates.length)];

                await connection.query(
                    'UPDATE topics SET reviewer_id = ? WHERE id = ?',
                    [randomReviewer.id, topic.id]
                );
                assignedCount++;
            }
        }

        await connection.commit();
        res.json({
            success: true,
            message: `Auto-assigned reviewers for ${assignedCount}/${topics.length} topics`,
            totalProcessed: topics.length,
            assigned: assignedCount
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

/**
 * DELETE /api/topics/:id
 * Delete topic
 */
router.delete('/:id', verifyToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM topics WHERE id = ?', [id]);
        res.json({ success: true, message: 'Topic deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
