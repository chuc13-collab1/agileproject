import { auth } from '../config/firebase.js';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to verify Firebase authentication token
 * Extracts token from Authorization header and verifies it
 */
export const verifyToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify token with Firebase Admin
        const decodedToken = await auth.verifyIdToken(token);

        // Attach user info to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified
        };

        next();
    } catch (error) {
        console.error('Auth verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

/**
 * Middleware to check if user is admin
 * Must be used AFTER verifyToken
 */
export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.uid) {
            console.log('isAdmin: No user info in req');
            return res.status(401).json({ message: 'Unauthorized: No user info' });
        }

        console.log(`isAdmin: Checking role for UID: ${req.user.uid}`);
        const [rows] = await pool.query('SELECT role, email FROM users WHERE uid = ?', [req.user.uid]);

        if (rows.length === 0) {
            // Check if DB is empty
            const [countCheck] = await pool.query('SELECT count(*) as count FROM users');
            if (countCheck[0].count == 0) {
                console.log('Auto-initializing first user as Admin:', req.user.email);
                await pool.query(
                    'INSERT INTO users (id, uid, email, display_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
                    [uuidv4(), req.user.uid, req.user.email, req.user.email?.split('@')[0] || 'Admin', 'admin', true]
                );
                return next();
            }

            console.log(`isAdmin: User not found in DB for UID: ${req.user.uid}`);
            return res.status(403).json({ message: 'Access denied: User not found in DB' });
        }

        console.log(`isAdmin: Found user ${rows[0].email} with role: ${rows[0].role}`);

        if (rows[0].role !== 'admin') {
            console.log(`isAdmin: Role mismatch. Required 'admin', got '${rows[0].role}'`);
            return res.status(403).json({ message: `Access denied: Admin role required (Current: ${rows[0].role})` });
        }

        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Middleware to check if user is teacher
 * Must be used AFTER verifyToken
 */
export const isTeacher = async (req, res, next) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ message: 'Unauthorized: No user info' });
        }

        const [rows] = await pool.query('SELECT role FROM users WHERE uid = ?', [req.user.uid]);

        if (rows.length === 0) {
            return res.status(403).json({ message: 'Access denied: User not found' });
        }

        if (rows[0].role !== 'teacher' && rows[0].role !== 'supervisor') { // Supervisor is also a teacher role context usually
            return res.status(403).json({ message: 'Access denied: Teacher role required' });
        }

        next();
    } catch (error) {
        console.error('Teacher verification error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Middleware to check if user is student
 * Must be used AFTER verifyToken
 */
export const isStudent = async (req, res, next) => {
    try {
        if (!req.user || !req.user.uid) {
            return res.status(401).json({ message: 'Unauthorized: No user info' });
        }

        const [rows] = await pool.query('SELECT role FROM users WHERE uid = ?', [req.user.uid]);

        if (rows.length === 0) {
            return res.status(403).json({ message: 'Access denied: User not found' });
        }

        if (rows[0].role !== 'student') {
            return res.status(403).json({ message: 'Access denied: Student role required' });
        }

        next();
    } catch (error) {
        console.error('Student verification error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
