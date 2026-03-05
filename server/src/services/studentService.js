import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { auth as firebaseAuth } from '../config/firebase.js';

// ─── Helpers ──────────────────────────────────────────────────────────

function formatStudent(row) {
    return {
        id: row.id,
        uid: row.uid,
        email: row.email,
        displayName: row.display_name,
        phone: row.phone,
        photoUrl: row.photo_url,
        isActive: row.is_active,
        studentId: row.student_id,
        className: row.class_name,
        major: row.major,
        academicYear: row.academic_year,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// ─── Service Methods ──────────────────────────────────────────────────

export async function getAllStudents() {
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
    return rows;
}

export async function createStudent({ email, displayName, studentId, className, major, academicYear, phone, password }) {
    if (!email || !displayName || !studentId || !className || !academicYear) {
        throw Object.assign(new Error('Missing required fields'), { statusCode: 400 });
    }

    const finalPassword = password || `${studentId}@2026`;
    const connection = await db.getConnection();

    try {
        // Create Firebase Auth user first (outside transaction — non-rollbackable)
        const userRecord = await firebaseAuth.createUser({ email, password: finalPassword, displayName });

        await connection.beginTransaction();

        const userId = uuidv4();
        const studentRecordId = uuidv4();

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

        return {
            id: userId,
            studentId,
            email,
            displayName,
            ...(password ? {} : { generatedPassword: finalPassword }),
        };
    } catch (err) {
        await connection.rollback();

        if (err.code === 'auth/email-already-exists') {
            throw Object.assign(new Error(`Email ${email} already exists`), { statusCode: 400 });
        }
        throw err;
    } finally {
        connection.release();
    }
}

export async function updateStudent(userId, fields) {
    const { displayName, phone, studentId, className, major, academicYear, password } = fields;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Update Firebase password if provided
        if (password) {
            const [users] = await connection.query('SELECT uid FROM users WHERE id = ?', [userId]);
            if (users.length > 0) {
                await firebaseAuth.updateUser(users[0].uid, { password });
            }
        }

        // Update users table
        const userUpdates = [];
        const userValues = [];
        if (displayName) { userUpdates.push('display_name = ?'); userValues.push(displayName); }
        if (phone !== undefined) { userUpdates.push('phone = ?'); userValues.push(phone); }

        if (userUpdates.length > 0) {
            userValues.push(userId);
            await connection.query(
                `UPDATE users SET ${userUpdates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                userValues
            );
        }

        // Update students table
        const studentUpdates = [];
        const studentValues = [];
        if (studentId) { studentUpdates.push('student_id = ?'); studentValues.push(studentId); }
        if (className) { studentUpdates.push('class_name = ?'); studentValues.push(className); }
        if (major !== undefined) { studentUpdates.push('major = ?'); studentValues.push(major); }
        if (academicYear) { studentUpdates.push('academic_year = ?'); studentValues.push(academicYear); }

        if (studentUpdates.length > 0) {
            studentValues.push(userId);
            await connection.query(
                `UPDATE students SET ${studentUpdates.join(', ')} WHERE user_id = ?`,
                studentValues
            );
        }

        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

export async function deleteStudent(userId) {
    const [users] = await db.query('SELECT uid FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
        throw Object.assign(new Error('Student not found'), { statusCode: 404 });
    }

    const { uid } = users[0];

    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    // Firebase delete is best-effort — MySQL is source of truth
    try {
        await firebaseAuth.deleteUser(uid);
    } catch (err) {
        console.warn(`Firebase deleteUser failed for uid ${uid}:`, err.message);
    }
}

export async function toggleStudentActive(userId) {
    await db.query(
        'UPDATE users SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
    );
}

export async function batchImportStudents(students) {
    if (!Array.isArray(students) || students.length === 0) {
        throw Object.assign(new Error('Invalid students array'), { statusCode: 400 });
    }

    // Pre-check existing emails and studentIds in DB
    const emails = students.map(s => s.email).filter(Boolean);
    const studentIds = students.map(s => s.studentId).filter(Boolean);

    const existingEmails = new Set(
        emails.length > 0
            ? (await db.query('SELECT email FROM users WHERE email IN (?)', [emails]))[0].map(r => r.email)
            : []
    );
    const existingStudentIds = new Set(
        studentIds.length > 0
            ? (await db.query('SELECT student_id FROM students WHERE student_id IN (?)', [studentIds]))[0].map(r => r.student_id)
            : []
    );

    const result = { success: 0, failed: 0, skipped: 0, errors: [] };
    const batchEmails = new Set();
    const batchStudentIds = new Set();

    for (let i = 0; i < students.length; i++) {
        const { email, displayName, studentId, className, academicYear, phone, major } = students[i];
        const row = i + 2; // Excel row number

        // Validate required fields
        if (!email || !displayName || !studentId || !className) {
            result.failed++;
            result.errors.push({ row, email: email || '?', reason: 'Thiếu thông tin bắt buộc (email/tên/MSSV/lớp)' });
            continue;
        }

        // Duplicate checks
        if (existingEmails.has(email)) { result.skipped++; result.errors.push({ row, email, reason: `Email "${email}" đã tồn tại trong hệ thống` }); continue; }
        if (existingStudentIds.has(studentId)) { result.skipped++; result.errors.push({ row, email, reason: `Mã SV "${studentId}" đã tồn tại trong hệ thống` }); continue; }
        if (batchEmails.has(email)) { result.skipped++; result.errors.push({ row, email, reason: `Email "${email}" bị trùng trong file Excel` }); continue; }
        if (batchStudentIds.has(studentId)) { result.skipped++; result.errors.push({ row, email, reason: `Mã SV "${studentId}" bị trùng trong file Excel` }); continue; }

        batchEmails.add(email);
        batchStudentIds.add(studentId);

        const connection = await db.getConnection();
        try {
            const userRecord = await firebaseAuth.createUser({ email, password: `${studentId}@2026`, displayName });

            const userId = uuidv4();
            const studentRecordId = uuidv4();

            await connection.beginTransaction();
            await connection.query(
                `INSERT INTO users (id, uid, email, display_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, 'student', TRUE)`,
                [userId, userRecord.uid, email, displayName, phone || null]
            );
            await connection.query(
                `INSERT INTO students (id, user_id, student_id, class_name, major, academic_year) VALUES (?, ?, ?, ?, ?, ?)`,
                [studentRecordId, userId, studentId, className, major || null, academicYear]
            );
            await connection.commit();
            result.success++;
        } catch (err) {
            await connection.rollback();
            result.failed++;
            result.errors.push({
                row, email,
                reason: err.code === 'auth/email-already-exists'
                    ? `Email "${email}" đã tồn tại trên Firebase`
                    : err.message,
            });
        } finally {
            connection.release();
        }
    }

    return result;
}

export async function batchDeleteStudents(userIds) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
        throw Object.assign(new Error('Invalid studentIds array'), { statusCode: 400 });
    }

    const [users] = await db.query('SELECT uid FROM users WHERE id IN (?)', [userIds]);
    const uids = users.map(u => u.uid);

    await db.query('DELETE FROM users WHERE id IN (?)', [userIds]);

    if (uids.length > 0) {
        try {
            await firebaseAuth.deleteUsers(uids);
        } catch {
            for (const uid of uids) {
                try { await firebaseAuth.deleteUser(uid); } catch { /* best-effort */ }
            }
        }
    }
}

export async function batchUpdateClass(userIds, className, academicYear) {
    if (!Array.isArray(userIds) || userIds.length === 0 || !className) {
        throw Object.assign(new Error('Missing required fields'), { statusCode: 400 });
    }
    await db.query(
        'UPDATE students SET class_name = ?, academic_year = ? WHERE user_id IN (?)',
        [className, academicYear || '2024-2028', userIds]
    );
}
