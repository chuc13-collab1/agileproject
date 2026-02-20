import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

/**
 * Create a single notification for a user
 * @param {Object} params
 * @param {string} params.userUid - Firebase UID of the recipient
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} [params.type='info'] - Notification type: info|success|warning|error|project|report|chat|system
 * @param {string|null} [params.link=null] - Optional link to navigate to
 * @param {Object} [params.connection=null] - Optional DB connection (for transactions)
 */
export const createNotification = async ({ userUid, title, message, type = 'info', link = null, connection = null }) => {
    try {
        const id = uuidv4();
        const executor = connection || db;
        await executor.query(
            `INSERT INTO notifications (id, user_uid, title, message, type, link) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, userUid, title, message, type, link]
        );
        return id;
    } catch (error) {
        console.error('❌ Failed to create notification:', error.message);
        // Non-blocking: don't throw so main flow continues
        return null;
    }
};

/**
 * Create notifications for multiple users
 * @param {Array<Object>} notifications - Array of notification params (same shape as createNotification)
 * @param {Object} [connection=null] - Optional DB connection (for transactions)
 */
export const createBulkNotifications = async (notifications, connection = null) => {
    try {
        const executor = connection || db;
        const ids = [];

        for (const notif of notifications) {
            const id = uuidv4();
            await executor.query(
                `INSERT INTO notifications (id, user_uid, title, message, type, link) VALUES (?, ?, ?, ?, ?, ?)`,
                [id, notif.userUid, notif.title, notif.message, notif.type || 'info', notif.link || null]
            );
            ids.push(id);
        }

        return ids;
    } catch (error) {
        console.error('❌ Failed to create bulk notifications:', error.message);
        return [];
    }
};

/**
 * Get user UID from student/teacher ID (database ID)
 * @param {string} tableName - 'students' or 'teachers'
 * @param {string} id - Database ID of the student/teacher
 * @param {Object} [connection=null] - Optional DB connection
 */
export const getUserUidById = async (tableName, id, connection = null) => {
    try {
        const executor = connection || db;
        const [rows] = await executor.query(
            `SELECT u.uid FROM users u INNER JOIN ${tableName} t ON t.user_id = u.id WHERE t.id = ?`,
            [id]
        );
        return rows.length > 0 ? rows[0].uid : null;
    } catch (error) {
        console.error(`❌ Failed to get user UID from ${tableName}:`, error.message);
        return null;
    }
};
