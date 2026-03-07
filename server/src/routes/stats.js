import express from 'express';
import pool from '../config/database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/stats/counts
 * Get dashboard statistics (users, topics, projects, archive)
 */
router.get('/counts', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const stats = {
            users: { total: 0, students: 0, teachers: 0, admins: 0 },
            topics: { total: 0, approved: 0, pending: 0, rejected: 0 },
            projects: { total: 0, registered: 0, in_progress: 0, submitted: 0, graded: 0, completed: 0, failed: 0, overdue: 0 },
            archive: { total: 0 },
        };

        // 1. User Counts
        const [userRows] = await pool.query(`SELECT role, COUNT(*) as count FROM users GROUP BY role`);
        userRows.forEach(row => {
            stats.users.total += Number(row.count);
            if (row.role === 'student') stats.users.students = Number(row.count);
            if (row.role === 'teacher') stats.users.teachers = Number(row.count);
            if (row.role === 'admin') stats.users.admins = Number(row.count);
        });

        // 2. Topic Counts
        const [topicRows] = await pool.query(`SELECT status, COUNT(*) as count FROM topics GROUP BY status`);
        topicRows.forEach(row => {
            stats.topics.total += Number(row.count);
            if (row.status === 'approved') stats.topics.approved = Number(row.count);
            if (row.status === 'pending') stats.topics.pending = Number(row.count);
            if (row.status === 'rejected') stats.topics.rejected = Number(row.count);
        });

        // 3. Project Counts (only non-archived)
        const [projectRows] = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM projects 
            WHERE archived_at IS NULL
            GROUP BY status
        `);
        projectRows.forEach(row => {
            stats.projects.total += Number(row.count);
            const s = row.status;
            if (stats.projects[s] !== undefined) stats.projects[s] = Number(row.count);
        });

        // 4. Overdue projects
        const [[{ overdue }]] = await pool.query(`
            SELECT COUNT(*) as overdue FROM projects
            WHERE report_deadline IS NOT NULL
              AND report_deadline < NOW()
              AND status NOT IN ('completed', 'failed', 'graded')
              AND archived_at IS NULL
        `);
        stats.projects.overdue = Number(overdue);

        // 5. Archive total (safe - ignore if table doesn't exist)
        try {
            const [[{ archiveTotal }]] = await pool.query(`SELECT COUNT(*) as archiveTotal FROM project_archive`);
            stats.archive.total = Number(archiveTotal);
        } catch (_) { /* table may not exist */ }

        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
});

export default router;
