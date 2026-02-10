import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { auth as firebaseAuth } from '../config/firebase.js';

const router = express.Router();

/**
 * GET /api/admins
 * Get all admins with permissions
 */
router.get('/', async (req, res, next) => {
    try {
        // Get admins with user info
        const [admins] = await db.query(`
      SELECT 
        u.id, u.uid, u.email, u.display_name, u.phone, u.photo_url,
        u.is_active, u.created_at, u.updated_at,
        a.admin_id
      FROM users u
      INNER JOIN admins a ON u.id = a.user_id
      WHERE u.role = 'admin'
      ORDER BY u.created_at DESC
    `);

        // Get permissions for each admin
        for (const admin of admins) {
            const [perms] = await db.query(
                'SELECT permission FROM admin_permissions WHERE admin_id = (SELECT id FROM admins WHERE user_id = ?)',
                [admin.id]
            );
            admin.permissions = perms.map(p => p.permission);
        }

        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/admins
 * Create a new admin
 */
router.post('/', async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        const {
            email,
            displayName,
            adminId,
            permissions, // array
            password
        } = req.body;

        // Validate required fields
        if (!email || !displayName || !adminId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Create Firebase Auth user
        const userRecord = await firebaseAuth.createUser({
            email,
            password: password || 'admin123',
            displayName
        });

        const userId = uuidv4();
        const adminRecordId = uuidv4();

        await connection.beginTransaction();

        // Insert into users table
        await connection.query(
            `INSERT INTO users (id, uid, email, display_name, role, is_active)
       VALUES (?, ?, ?, ?, 'admin', TRUE)`,
            [userId, userRecord.uid, email, displayName]
        );

        // Insert into admins table
        await connection.query(
            'INSERT INTO admins (id, user_id, admin_id) VALUES (?, ?, ?)',
            [adminRecordId, userId, adminId]
        );

        // Insert permissions
        if (Array.isArray(permissions) && permissions.length > 0) {
            for (const perm of permissions) {
                await connection.query(
                    'INSERT INTO admin_permissions (admin_id, permission) VALUES (?, ?)',
                    [adminRecordId, perm]
                );
            }
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: {
                id: userId,
                adminId,
                email,
                displayName
            }
        });
    } catch (error) {
        await connection.rollback();

        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({
                success: false,
                message: `Email ${req.body.email} already exists`
            });
        }

        next(error);
    } finally {
        connection.release();
    }
});

/**
 * DELETE /api/admins/:id
 * Delete admin
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const [users] = await db.query('SELECT uid FROM users WHERE id = ?', [id]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        const { uid } = users[0];

        await db.query('DELETE FROM users WHERE id = ?', [id]);

        try {
            await firebaseAuth.deleteUser(uid);
        } catch (error) {
            console.error('Firebase Auth delete error:', error);
        }

        res.json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/admins/:id/toggle-active
 * Toggle admin active status
 */
router.patch('/:id/toggle-active', async (req, res, next) => {
    try {
        const { id } = req.params;

        await db.query(
            `UPDATE users 
       SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Admin status updated successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
