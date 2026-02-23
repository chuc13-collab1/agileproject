import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { auth as firebaseAuth } from '../config/firebase.js';

const router = express.Router();

/**
 * GET /api/students
 * Get all students with their user information
 */
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await db.query(`
      SELECT 
        u.id, u.uid, u.email, u.display_name, u.phone, u.photo_url,
        u.is_active, u.created_at, u.updated_at,
        s.student_id, s.class_name, s.major, s.academic_year
      FROM users u
      INNER JOIN students s ON u.id = s.user_id
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/students
 * Create a new student (creates Firebase Auth user + MySQL records)
 */
router.post('/', async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        const {
            email,
            displayName,
            studentId,
            className,
            major,
            academicYear,
            phone,
            password
        } = req.body;

        // Validate required fields
        if (!email || !displayName || !studentId || !className || !academicYear) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Auto-generate password from studentId (min 6 chars required by Firebase)
        // Format: StudentID@2026 (e.g., B20DCCN001@2026)
        const finalPassword = password || `${studentId}@2026`;

        // 1. Create Firebase Auth user
        const userRecord = await firebaseAuth.createUser({
            email,
            password: finalPassword,
            displayName
        });

        const userId = uuidv4();
        const studentRecordId = uuidv4();

        // 2. Start MySQL transaction
        await connection.beginTransaction();

        // 3. Insert into users table
        await connection.query(
            `INSERT INTO users (id, uid, email, display_name, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, 'student', TRUE)`,
            [userId, userRecord.uid, email, displayName, phone || null]
        );

        // 4. Insert into students table (WITHOUT GPA)
        await connection.query(
            `INSERT INTO students (id, user_id, student_id, class_name, major, academic_year)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [studentRecordId, userId, studentId, className, major || null, academicYear]
        );

        // 5. Commit transaction
        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: {
                id: userId,
                studentId,
                email,
                displayName,
                // Return generated password only when creating new user
                ...(password ? {} : { generatedPassword: finalPassword })
            }
        });
    } catch (error) {
        await connection.rollback();

        // Handle Firebase Auth errors
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
 * PUT /api/students/:id
 * Update student information
 */
router.put('/:id', async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        const { id } = req.params;
        const {
            displayName,
            phone,
            studentId,
            className,
            major,
            academicYear
        } = req.body;

        await connection.beginTransaction();

        // Update password if provided
        if (req.body.password) {
            try {
                const [users] = await connection.query('SELECT uid FROM users WHERE id = ?', [id]);
                if (users.length > 0) {
                    await firebaseAuth.updateUser(users[0].uid, { password: req.body.password });
                }
            } catch (authError) {
                console.error('Error updating Firebase password:', authError);
                throw new Error(`Failed to update password: ${authError.message}`);
            }
        }

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

        // Update students table (WITHOUT GPA)
        if (studentId || className || major !== undefined || academicYear) {
            const studentUpdates = [];
            const studentValues = [];

            if (studentId) {
                studentUpdates.push('student_id = ?');
                studentValues.push(studentId);
            }
            if (className) {
                studentUpdates.push('class_name = ?');
                studentValues.push(className);
            }
            if (major !== undefined) {
                studentUpdates.push('major = ?');
                studentValues.push(major);
            }
            if (academicYear) {
                studentUpdates.push('academic_year = ?');
                studentValues.push(academicYear);
            }

            studentValues.push(id);

            await connection.query(
                `UPDATE students SET ${studentUpdates.join(', ')} WHERE user_id = ?`,
                studentValues
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Student updated successfully'
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

/**
 * DELETE /api/students/:id
 * Delete student (cascades to students table)
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get Firebase UID before deleting
        const [users] = await db.query('SELECT uid FROM users WHERE id = ?', [id]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const { uid } = users[0];

        // Delete from MySQL (cascades to students table)
        await db.query('DELETE FROM users WHERE id = ?', [id]);

        // Delete from Firebase Auth
        try {
            await firebaseAuth.deleteUser(uid);
        } catch (error) {
            console.error('Firebase Auth delete error:', error);
            // Continue even if Firebase delete fails
        }

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/students/:id/toggle-active
 * Toggle student active status
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
            message: 'Student status updated successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/students/batch-import
 * Batch import students from Excel with server-side validation
 */
router.post('/batch-import', async (req, res, next) => {
    try {
        const { students } = req.body;

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid students array'
            });
        }

        // === Phase 1: Server-side duplicate check ===
        const emails = students.map(s => s.email).filter(Boolean);
        const studentIds = students.map(s => s.studentId).filter(Boolean);

        // Check duplicate emails in DB
        let existingEmails = new Set();
        if (emails.length > 0) {
            const [rows] = await db.query(
                `SELECT email FROM users WHERE email IN (?)`, [emails]
            );
            existingEmails = new Set(rows.map(r => r.email));
        }

        // Check duplicate student IDs in DB
        let existingStudentIds = new Set();
        if (studentIds.length > 0) {
            const [rows] = await db.query(
                `SELECT student_id FROM students WHERE student_id IN (?)`, [studentIds]
            );
            existingStudentIds = new Set(rows.map(r => r.student_id));
        }

        // Check duplicates within the batch itself
        const batchEmails = new Set();
        const batchStudentIds = new Set();

        const result = {
            success: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };

        // === Phase 2: Process each student (skip duplicates) ===
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const { email, displayName, studentId, className, academicYear, phone, major } = student;

            // Server-side validation
            if (!email || !displayName || !studentId || !className) {
                result.failed++;
                result.errors.push({
                    row: i + 2, email: email || '?',
                    reason: 'Thiếu thông tin bắt buộc (email/tên/MSSV/lớp)'
                });
                continue;
            }

            // Check duplicate in DB
            if (existingEmails.has(email)) {
                result.skipped++;
                result.errors.push({
                    row: i + 2, email,
                    reason: `Email "${email}" đã tồn tại trong hệ thống`
                });
                continue;
            }
            if (existingStudentIds.has(studentId)) {
                result.skipped++;
                result.errors.push({
                    row: i + 2, email,
                    reason: `Mã SV "${studentId}" đã tồn tại trong hệ thống`
                });
                continue;
            }

            // Check duplicate within batch
            if (batchEmails.has(email)) {
                result.skipped++;
                result.errors.push({
                    row: i + 2, email,
                    reason: `Email "${email}" bị trùng trong file Excel`
                });
                continue;
            }
            if (batchStudentIds.has(studentId)) {
                result.skipped++;
                result.errors.push({
                    row: i + 2, email,
                    reason: `Mã SV "${studentId}" bị trùng trong file Excel`
                });
                continue;
            }

            batchEmails.add(email);
            batchStudentIds.add(studentId);

            const connection = await db.getConnection();
            try {
                const password = `${studentId}@2026`;

                const userRecord = await firebaseAuth.createUser({
                    email, password, displayName
                });

                const userId = uuidv4();
                const studentRecordId = uuidv4();

                await connection.beginTransaction();

                await connection.query(
                    `INSERT INTO users (id, uid, email, display_name, phone, role, is_active)
           VALUES (?, ?, ?, ?, ?, 'student', TRUE)`,
                    [userId, userRecord.uid, email, displayName, phone || null]
                );

                await connection.query(
                    `INSERT INTO students (id, user_id, student_id, class_name, major, academic_year)
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [studentRecordId, userId, studentId, className, major || null, academicYear]
                );

                await connection.commit();
                result.success++;
            } catch (error) {
                await connection.rollback();
                result.failed++;
                result.errors.push({
                    row: i + 2, email,
                    reason: error.code === 'auth/email-already-exists'
                        ? `Email "${email}" đã tồn tại trên Firebase`
                        : error.message
                });
            } finally {
                connection.release();
            }
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// ... existing imports ...

/**
 * POST /api/students/batch-delete
 * Delete multiple students
 */
router.post('/batch-delete', async (req, res, next) => {
    try {
        const { studentIds } = req.body;

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid studentIds array' });
        }

        // Get UIDs for Firebase deletion
        const [users] = await db.query('SELECT uid FROM users WHERE id IN (?)', [studentIds]);
        const uids = users.map(u => u.uid);

        // Delete from MySQL (Cascade)
        await db.query('DELETE FROM users WHERE id IN (?)', [studentIds]);

        // Delete from Firebase
        if (uids.length > 0) {
            // Note: bulkDelete is not available in standard client SDK, but here we use Admin SDK
            // However, if bulkDelete fails for some, we proceed.
            // Ideally use: await firebaseAuth.deleteUsers(uids);  (Requires Admin SDK check)
            // If deleteUsers is not available, loop delete (slower but safer for standard setup)
            try {
                // Try bulk delete if available in this version of admin-sdk
                const deleteResult = await firebaseAuth.deleteUsers(uids);
                console.log('Firebase bulk delete result:', deleteResult);
            } catch (e) {
                console.warn('Bulk deleteUsers failed, trying individual delete', e);
                // Fallback
                for (const uid of uids) {
                    try { await firebaseAuth.deleteUser(uid); } catch (err) { }
                }
            }
        }

        res.json({ success: true, message: `Deleted ${studentIds.length} students` });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/students/batch-update-class
 * Update class for multiple students
 */
router.post('/batch-update-class', async (req, res, next) => {
    try {
        const { studentIds, className, academicYear } = req.body;

        if (!Array.isArray(studentIds) || studentIds.length === 0 || !className) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Update students table
        await db.query(
            'UPDATE students SET class_name = ?, academic_year = ? WHERE user_id IN (?)',
            [className, academicYear || '2024-2028', studentIds]
        );

        res.json({ success: true, message: `Updated class for ${studentIds.length} students` });
    } catch (error) {
        next(error);
    }
});

export default router;
