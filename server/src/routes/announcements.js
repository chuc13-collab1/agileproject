import express from 'express';
import pool from '../config/database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { sendAnnouncementEmail } from '../utils/emailService.js';
import { createBulkNotifications } from '../utils/notificationHelper.js';

// Helper: notify all active students in-app
const notifyAllStudents = async (title, message, link = null) => {
    try {
        const [students] = await pool.query(
            `SELECT u.uid FROM users u INNER JOIN students s ON s.user_id = u.id WHERE u.is_active = TRUE`
        );
        if (students.length === 0) return;

        const notifications = students.map(s => ({
            userUid: s.uid,
            title,
            message,
            type: 'system',
            link,
        }));
        await createBulkNotifications(notifications);
        console.log(`🔔 In-app notification sent to ${students.length} students`);
    } catch (err) {
        console.error('🔔 Failed to send in-app notifications:', err.message);
    }
};

const router = express.Router();

// GET all announcements
router.get('/', verifyToken, async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        next(error);
    }
});

// GET active announcements (for students/teachers)
router.get('/active', verifyToken, async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM announcements WHERE status = "published" ORDER BY created_at DESC'
        );
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        next(error);
    }
});

// POST create announcement
router.post('/', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const { title, content, semester, academicYear, registrationStart, registrationEnd, status, sendEmail } = req.body;

        if (!title || !semester || !academicYear || !registrationStart || !registrationEnd) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const id = uuidv4();
        await pool.query(
            `INSERT INTO announcements 
            (id, title, content, semester, academic_year, registration_start, registration_end, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, title, content, semester, academicYear, new Date(registrationStart), new Date(registrationEnd), status || 'draft']
        );

        const [newAnnouncement] = await pool.query('SELECT * FROM announcements WHERE id = ?', [id]);

        // Send email + in-app notification async (non-blocking)
        if (status === 'published') {
            notifyAllStudents(
                `📋 ${title}`,
                `Thông báo mới: ${title} - ${semester}/${academicYear}`,
                '/notifications'
            );
            if (sendEmail) {
                sendAnnouncementEmail({ title, content, semester, academicYear, registrationStart, registrationEnd })
                    .then(result => console.log('📧 Email result:', result))
                    .catch(err => console.error('📧 Email error:', err.message));
            }
        }

        res.status(201).json({
            success: true,
            data: newAnnouncement[0]
        });
    } catch (error) {
        next(error);
    }
});

// PUT update announcement
router.put('/:id', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, semester, academicYear, registrationStart, registrationEnd, status, sendEmail } = req.body;

        await pool.query(
            `UPDATE announcements 
            SET title = ?, content = ?, semester = ?, academic_year = ?, 
                registration_start = ?, registration_end = ?, status = ?
             WHERE id = ?`,
            [title, content, semester, academicYear, new Date(registrationStart), new Date(registrationEnd), status, id]
        );

        const [updatedAnnouncement] = await pool.query('SELECT * FROM announcements WHERE id = ?', [id]);

        if (updatedAnnouncement.length === 0) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Send email + in-app notification async (non-blocking)
        if (status === 'published') {
            notifyAllStudents(
                `📋 ${title}`,
                `Thông báo mới: ${title} - ${semester}/${academicYear}`,
                '/notifications'
            );
            if (sendEmail) {
                sendAnnouncementEmail({ title, content, semester, academicYear, registrationStart, registrationEnd })
                    .then(result => console.log('📧 Email result:', result))
                    .catch(err => console.error('📧 Email error:', err.message));
            }
        }

        res.json({
            success: true,
            data: updatedAnnouncement[0]
        });
    } catch (error) {
        next(error);
    }
});

// DELETE announcement
router.delete('/:id', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM announcements WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
