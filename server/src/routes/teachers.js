import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { auth as firebaseAuth } from '../config/firebase.js';

const router = express.Router();

/**
 * GET /api/teachers
 * Get all teachers with specializations
 */
router.get('/', async (req, res, next) => {
    try {
        // Get teachers with user info
        const [teachers] = await db.query(`
      SELECT 
        u.id, u.uid, u.email, u.display_name, u.phone, u.photo_url,
        u.is_active, u.created_at, u.updated_at,
        t.teacher_id, t.department, t.max_students, t.current_students,
        t.can_supervise, t.can_review
      FROM users u
      INNER JOIN teachers t ON u.id = t.user_id
      WHERE u.role IN ('teacher', 'supervisor', 'reviewer')
      ORDER BY u.created_at DESC
    `);

        // Get specializations for each teacher
        for (const teacher of teachers) {
            const [specs] = await db.query(
                'SELECT specialization FROM teacher_specializations WHERE teacher_id = (SELECT id FROM teachers WHERE user_id = ?)',
                [teacher.id]
            );
            teacher.specialization = specs.map(s => s.specialization);
        }

        res.json({
            success: true,
            data: teachers
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/teachers
 * Create a new teacher
 */
router.post('/', async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        const {
            email,
            displayName,
            teacherId,
            department,
            specialization, // array
            maxStudents,
            phone,
            canSupervise,
            canReview,
            password
        } = req.body;

        // Validate required fields
        if (!email || !displayName || !teacherId || !department) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Create Firebase Auth user
        const userRecord = await firebaseAuth.createUser({
            email,
            password: password || 'teacher123',
            displayName
        });

        const userId = uuidv4();
        const teacherRecordId = uuidv4();

        await connection.beginTransaction();

        // Insert into users table
        await connection.query(
            `INSERT INTO users (id, uid, email, display_name, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, 'teacher', TRUE)`,
            [userId, userRecord.uid, email, displayName, phone || null]
        );

        // Insert into teachers table
        await connection.query(
            `INSERT INTO teachers (id, user_id, teacher_id, department, max_students, current_students, can_supervise, can_review)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
            [teacherRecordId, userId, teacherId, department, maxStudents || 5, canSupervise !== false, canReview !== false]
        );

        // Insert specializations
        if (Array.isArray(specialization) && specialization.length > 0) {
            for (const spec of specialization) {
                await connection.query(
                    'INSERT INTO teacher_specializations (teacher_id, specialization) VALUES (?, ?)',
                    [teacherRecordId, spec]
                );
            }
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            data: {
                id: userId,
                teacherId,
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
 * PUT /api/teachers/:id
 * Update teacher information
 */
router.put('/:id', async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        const { id } = req.params;
        const {
            displayName,
            phone,
            teacherId,
            department,
            maxStudents,
            canSupervise,
            canReview,
            specialization
        } = req.body;

        await connection.beginTransaction();

        // Update users table
        if (displayName || phone !== undefined) {
            const userUpdates = [];
            const userValues = [];

            if (displayName) {
                userUpdates.push('display_name = ?');
                userValues.push(displayName);
            }
            if (phone !== undefined) {
                userUpdates.push('phone = ?');
                userValues.push(phone);
            }

            userValues.push(id);

            await connection.query(
                `UPDATE users SET ${userUpdates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                userValues
            );
        }

        // Update teachers table
        if (teacherId || department || maxStudents || canSupervise !== undefined || canReview !== undefined) {
            const teacherUpdates = [];
            const teacherValues = [];

            if (teacherId) {
                teacherUpdates.push('teacher_id = ?');
                teacherValues.push(teacherId);
            }
            if (department) {
                teacherUpdates.push('department = ?');
                teacherValues.push(department);
            }
            if (maxStudents) {
                teacherUpdates.push('max_students = ?');
                teacherValues.push(maxStudents);
            }
            if (canSupervise !== undefined) {
                teacherUpdates.push('can_supervise = ?');
                teacherValues.push(canSupervise);
            }
            if (canReview !== undefined) {
                teacherUpdates.push('can_review = ?');
                teacherValues.push(canReview);
            }

            teacherValues.push(id);

            await connection.query(
                `UPDATE teachers SET ${teacherUpdates.join(', ')} WHERE user_id = ?`,
                teacherValues
            );
        }

        // Update specializations
        if (Array.isArray(specialization)) {
            // Get teacher record id
            const [teacherRecord] = await connection.query(
                'SELECT id FROM teachers WHERE user_id = ?',
                [id]
            );

            if (teacherRecord.length > 0) {
                const teacherRecordId = teacherRecord[0].id;

                // Delete old specializations
                await connection.query(
                    'DELETE FROM teacher_specializations WHERE teacher_id = ?',
                    [teacherRecordId]
                );

                // Insert new specializations
                for (const spec of specialization) {
                    await connection.query(
                        'INSERT INTO teacher_specializations (teacher_id, specialization) VALUES (?, ?)',
                        [teacherRecordId, spec]
                    );
                }
            }
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Teacher updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

/**
 * DELETE /api/teachers/:id
 * Delete teacher
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const [users] = await db.query('SELECT uid FROM users WHERE id = ?', [id]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
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
            message: 'Teacher deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/teachers/:id/toggle-active
 * Toggle teacher active status
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
            message: 'Teacher status updated successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
