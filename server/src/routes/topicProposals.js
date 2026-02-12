
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { verifyToken, isTeacher } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/topic-proposals
 * Student creates a new topic proposal
 */
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const { title, description, requirements, expectedResults, requestedSupervisorId } = req.body;
        const studentUid = req.user.uid;

        // 1. Get Student ID from UID
        const [students] = await pool.query(
            'SELECT s.id, s.user_id FROM students s JOIN users u ON s.user_id = u.id WHERE u.uid = ?',
            [studentUid]
        );

        if (students.length === 0) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        const studentId = students[0].id;

        // 2. Check for existing active proposals
        const [existing] = await pool.query(
            "SELECT COUNT(*) as count FROM topic_proposals WHERE proposed_by_student_id = ? AND status IN ('pending', 'approved')",
            [studentId]
        );

        if (existing[0].count > 0) {
            return res.status(400).json({ message: 'You already have a pending or approved proposal.' });
        }

        // 3. Check if proposal deadline passed (optional, based on announcements)
        const [announcements] = await pool.query(
            "SELECT proposal_deadline FROM announcements WHERE status = 'published' AND proposal_deadline IS NOT NULL AND proposal_deadline < NOW()"
        );
        if (announcements.length > 0) {
            return res.status(400).json({ message: 'The deadline for topic proposals has passed.' });
        }

        const id = uuidv4();
        await pool.query(
            `INSERT INTO topic_proposals 
            (id, title, description, requirements, expected_results, proposed_by_student_id, requested_supervisor_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [id, title, description, requirements, expectedResults, studentId, requestedSupervisorId]
        );

        res.status(201).json({ success: true, message: 'Proposal submitted successfully', data: { id } });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/topic-proposals/my
 * Student gets their own proposals
 */
router.get('/my', verifyToken, async (req, res, next) => {
    try {
        const studentUid = req.user.uid;

        const [rows] = await pool.query(`
            SELECT tp.*, 
                   u.display_name as supervisor_name,
                   u.email as supervisor_email
            FROM topic_proposals tp
            JOIN students s ON tp.proposed_by_student_id = s.id
            JOIN users us ON s.user_id = us.id
            JOIN teachers t ON tp.requested_supervisor_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE us.uid = ?
            ORDER BY tp.created_at DESC
        `, [studentUid]);

        res.json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/topic-proposals/teacher
 * Teacher gets proposals assigned to them
 */
router.get('/teacher', verifyToken, isTeacher, async (req, res, next) => {
    try {
        // Teacher ID logic might need adjustment depending on how isTeacher middleware attaches info
        // Assuming req.user.uid is available. need to find teacher_id
        const [teachers] = await pool.query('SELECT id FROM teachers JOIN users ON teachers.user_id = users.id WHERE users.uid = ?', [req.user.uid]);
        if (teachers.length === 0) return res.status(404).json({ message: 'Teacher not found' });
        const teacherId = teachers[0].id;

        const [rows] = await pool.query(`
            SELECT tp.*, 
                   s.student_id as student_code,
                   s.class_name,
                   u.display_name as student_name,
                   u.email as student_email
            FROM topic_proposals tp
            JOIN students s ON tp.proposed_by_student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE tp.requested_supervisor_id = ?
            ORDER BY tp.created_at DESC
        `, [teacherId]);

        res.json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/topic-proposals/:id/review
 * Teacher approves or rejects a proposal
 */
router.patch('/:id/review', verifyToken, isTeacher, async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        const { action, feedback } = req.body; // action: 'approve', 'reject', 'request_revision'
        const { id } = req.params;

        if (!['approve', 'reject', 'request_revision'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        // Check ownership (is this teacher actually the requested supervisor?)
        const [teachers] = await connection.query('SELECT id FROM teachers JOIN users ON teachers.user_id = users.id WHERE users.uid = ?', [req.user.uid]);
        const teacherId = teachers[0].id;

        const [proposals] = await connection.query('SELECT * FROM topic_proposals WHERE id = ?', [id]);
        if (proposals.length === 0) return res.status(404).json({ message: 'Proposal not found' });

        if (proposals[0].requested_supervisor_id !== teacherId) {
            return res.status(403).json({ message: 'You are not the requested supervisor for this proposal' });
        }

        await connection.beginTransaction();

        if (action === 'approve') {
            // 1. Create a Topic from the Proposal
            const topicId = uuidv4();
            await connection.query(`
                INSERT INTO topics 
                (id, title, description, requirements, expected_results, supervisor_id, semester, academic_year, field, max_students, current_students, status, proposed_by_type, original_proposal_id, assigned_to_student_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'pending', 'student', ?, ?) 
             `, [
                topicId,
                proposals[0].title,
                proposals[0].description,
                proposals[0].requirements,
                proposals[0].expected_results,
                teacherId,
                '1', '2025-2026', 'Software Engineering', // Defaults
                proposals[0].id,
                proposals[0].proposed_by_student_id
            ]);

            // 2. Create a Project for the Student
            const projectId = uuidv4();
            await connection.query(`
                INSERT INTO projects 
                (id, topic_id, student_id, supervisor_id, status)
                VALUES (?, ?, ?, ?, 'registered')
             `, [projectId, topicId, proposals[0].proposed_by_student_id, teacherId]);

            // 3. Update Proposal Status
            await connection.query('UPDATE topic_proposals SET status = ?, teacher_feedback = ?, reviewed_at = NOW() WHERE id = ?', ['approved', feedback, id]);

        } else if (action === 'reject') {
            await connection.query('UPDATE topic_proposals SET status = ?, teacher_feedback = ?, reviewed_at = NOW() WHERE id = ?', ['rejected', feedback, id]);
        } else if (action === 'request_revision') {
            await connection.query('UPDATE topic_proposals SET status = ?, teacher_feedback = ?, reviewed_at = NOW() WHERE id = ?', ['revision_requested', feedback, id]);
        }

        await connection.commit();
        res.json({ success: true, message: `Proposal ${action}ed successfully` });

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

/**
 * DELETE /api/topic-proposals/:id
 * Student cancels/deletes their proposal
 */
router.delete('/:id', verifyToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const studentUid = req.user.uid;

        // Verify ownership
        const [owners] = await pool.query(`
            SELECT tp.id 
            FROM topic_proposals tp
            JOIN students s ON tp.proposed_by_student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE tp.id = ? AND u.uid = ? AND tp.status = 'pending'
        `, [id, studentUid]);

        if (owners.length === 0) {
            return res.status(403).json({ message: 'Cannot delete: Proposal not found, not yours, or already processed.' });
        }

        await pool.query('DELETE FROM topic_proposals WHERE id = ?', [id]);
        res.json({ success: true, message: 'Proposal deleted successfully' });

    } catch (error) {
        next(error);
    }
});

export default router;
