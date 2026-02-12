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

        // Auto-generate password from adminId
        // Format: AdminID@2026 (e.g., ADMIN001@2026)
        const finalPassword = password || `${adminId}@2026`;
        
        // Create Firebase Auth user
        const userRecord = await firebaseAuth.createUser({
            email,
            password: finalPassword,
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
                displayName,
                // Return generated password only when creating new user
                ...(password ? {} : { generatedPassword: finalPassword })
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
 * PUT /api/admins/:id
 * Update admin information
 */
router.put('/:id', async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        const { id } = req.params;
        const {
            displayName,
            adminId,
            permissions,
            password
        } = req.body;

        await connection.beginTransaction();

        // Update password if provided
        if (password) {
            try {
                const [users] = await connection.query('SELECT uid FROM users WHERE id = ?', [id]);
                if (users.length > 0) {
                    await firebaseAuth.updateUser(users[0].uid, { password });
                }
            } catch (authError) {
                console.error('Error updating Firebase password:', authError);
                throw new Error(`Failed to update password: ${authError.message}`);
            }
        }

        // Update users table
        if (displayName) {
            await connection.query(
                'UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [displayName, id]
            );
        }

        // Update admins table
        if (adminId) {
            await connection.query(
                'UPDATE admins SET admin_id = ? WHERE user_id = ?',
                [adminId, id]
            );
        }

        // Update permissions
        if (Array.isArray(permissions)) {
            // Get admin record id
            const [adminRecord] = await connection.query(
                'SELECT id FROM admins WHERE user_id = ?',
                [id]
            );

            if (adminRecord.length > 0) {
                const adminRecordId = adminRecord[0].id;

                // Delete old permissions
                await connection.query(
                    'DELETE FROM admin_permissions WHERE admin_id = ?',
                    [adminRecordId]
                );

                // Insert new permissions
                for (const perm of permissions) {
                    await connection.query(
                        'INSERT INTO admin_permissions (admin_id, permission) VALUES (?, ?)',
                        [adminRecordId, perm]
                    );
                }
            }
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Admin updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});/**
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
