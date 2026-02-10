import express from 'express';
import pool from '../config/database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/stats/counts
 * Get dashboard statistics (users, topics, etc.)
 */
router.get('/counts', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const stats = {
            users: { total: 0, students: 0, teachers: 0, admins: 0 },
            topics: { total: 0, approved: 0, pending: 0, rejected: 0 },
            overview: []
        };

        // 1. User Counts
        const [userRows] = await pool.query(`
            SELECT role, COUNT(*) as count 
            FROM users 
            GROUP BY role
        `);

        userRows.forEach(row => {
            stats.users.total += row.count;
            if (row.role === 'student') stats.users.students = row.count;
            if (row.role === 'teacher') stats.users.teachers = row.count;
            if (row.role === 'admin') stats.users.admins = row.count;
        });

        // 2. Topic Counts
        const [topicRows] = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM topics 
            GROUP BY status
        `);

        topicRows.forEach(row => {
            stats.topics.total += row.count;
            if (row.status === 'approved') stats.topics.approved = row.count;
            if (row.status === 'pending') stats.topics.pending = row.count;
            if (row.status === 'rejected') stats.topics.rejected = row.count;
        });

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

export default router;
