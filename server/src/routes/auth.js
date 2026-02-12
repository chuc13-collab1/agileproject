import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/auth/me
 * Get current user information from MySQL
 * Requires verifyToken middleware (req.user.uid must be set)
 */
router.get('/me', async (req, res) => {
    try {
        const { uid } = req.user;

        // Get user info from MySQL
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE uid = ?',
            [uid]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found in database'
            });
        }

        const user = rows[0];

        return res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get user information',
            error: error.message
        });
    }
});

export default router;
