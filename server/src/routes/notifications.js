import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

const router = express.Router();

// Ensure notifications table exists
const ensureTable = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id VARCHAR(36) PRIMARY KEY,
            user_uid VARCHAR(128) NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type ENUM('info','success','warning','error','project','report','chat','system') DEFAULT 'info',
            link VARCHAR(500) DEFAULT NULL,
            is_read TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_uid (user_uid),
            INDEX idx_is_read (is_read),
            INDEX idx_created_at (created_at)
        )
    `);
};
ensureTable();

/**
 * GET /api/notifications
 * Get notifications for the current user
 */
router.get('/', async (req, res, next) => {
    try {
        const userUid = req.user.uid;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const unreadOnly = req.query.unread === 'true';

        let whereClause = 'WHERE user_uid = ?';
        const params = [userUid];

        if (unreadOnly) {
            whereClause += ' AND is_read = 0';
        }

        const [notifications] = await db.query(
            `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) as total FROM notifications ${whereClause}`,
            params
        );

        const [[{ unread }]] = await db.query(
            `SELECT COUNT(*) as unread FROM notifications WHERE user_uid = ? AND is_read = 0`,
            [userUid]
        );

        res.json({
            success: true,
            data: notifications,
            unreadCount: unread,
            pagination: { page, limit, total },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/notifications/unread-count
 * Get unread count quickly
 */
router.get('/unread-count', async (req, res, next) => {
    try {
        const userUid = req.user.uid;
        const [[{ count }]] = await db.query(
            `SELECT COUNT(*) as count FROM notifications WHERE user_uid = ? AND is_read = 0`,
            [userUid]
        );
        res.json({ success: true, count });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', async (req, res, next) => {
    try {
        const { id } = req.params;
        const userUid = req.user.uid;

        await db.query(
            `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_uid = ?`,
            [id, userUid]
        );

        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', async (req, res, next) => {
    try {
        const userUid = req.user.uid;

        await db.query(
            `UPDATE notifications SET is_read = 1 WHERE user_uid = ? AND is_read = 0`,
            [userUid]
        );

        res.json({ success: true, message: 'All marked as read' });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const userUid = req.user.uid;

        await db.query(
            `DELETE FROM notifications WHERE id = ? AND user_uid = ?`,
            [id, userUid]
        );

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/notifications
 * Create a notification (internal/admin use)
 */
router.post('/', async (req, res, next) => {
    try {
        const { userUid, title, message, type, link } = req.body;

        if (!userUid || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'userUid, title, and message are required',
            });
        }

        const id = uuidv4();
        await db.query(
            `INSERT INTO notifications (id, user_uid, title, message, type, link) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, userUid, title, message, type || 'info', link || null]
        );

        res.status(201).json({ success: true, data: { id } });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/notifications/broadcast
 * Send notification to multiple users (admin only)
 */
router.post('/broadcast', async (req, res, next) => {
    try {
        const { userUids, title, message, type, link } = req.body;

        if (!userUids || !Array.isArray(userUids) || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'userUids (array), title, and message are required',
            });
        }

        const values = userUids.map((uid) => [uuidv4(), uid, title, message, type || 'info', link || null]);

        for (const val of values) {
            await db.query(
                `INSERT INTO notifications (id, user_uid, title, message, type, link) VALUES (?, ?, ?, ?, ?, ?)`,
                val
            );
        }

        res.status(201).json({ success: true, message: `Sent to ${userUids.length} users` });
    } catch (error) {
        next(error);
    }
});

export default router;
