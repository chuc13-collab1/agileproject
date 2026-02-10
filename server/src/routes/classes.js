import { Router } from 'express';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/classes - Get all classes with student count
router.get('/', async (req, res, next) => {
    let connection;
    try {
        const { active, academicYear } = req.query;

        connection = await pool.getConnection();

        let query = `
      SELECT 
        c.id,
        c.class_code,
        c.class_name,
        c.academic_year,
        c.advisor_teacher_id,
        c.max_students,
        c.major,
        c.description,
        c.is_active,
        c.created_at,
        c.updated_at,
        u.display_name AS advisor_name,
        u.email AS advisor_email,
        COUNT(DISTINCT s.id) AS current_students
      FROM classes c
      LEFT JOIN teachers t ON c.advisor_teacher_id = t.user_id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN students s ON s.class_name = c.class_code AND s.user_id IS NOT NULL
      WHERE 1=1
    `;

        const params = [];

        if (active === 'true') {
            query += ' AND c.is_active = TRUE';
        } else if (active === 'false') {
            query += ' AND c.is_active = FALSE';
        }

        if (academicYear) {
            query += ' AND c.academic_year = ?';
            params.push(academicYear);
        }

        query += ' GROUP BY c.id ORDER BY c.academic_year DESC, c.class_code ASC';

        const [classes] = await connection.query(query, params);

        const formattedClasses = classes.map(cls => ({
            id: cls.id,
            classCode: cls.class_code,
            className: cls.class_name,
            academicYear: cls.academic_year,
            advisorTeacher: cls.advisor_teacher_id ? {
                id: cls.advisor_teacher_id,
                displayName: cls.advisor_name,
                email: cls.advisor_email
            } : null,
            maxStudents: cls.max_students,
            currentStudents: parseInt(cls.current_students) || 0,
            major: cls.major,
            description: cls.description,
            isActive: Boolean(cls.is_active),
            createdAt: cls.created_at,
            updatedAt: cls.updated_at
        }));

        res.json({
            success: true,
            data: formattedClasses
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
});

// POST /api/classes - Create new class
router.post('/', async (req, res, next) => {
    let connection;
    try {
        const {
            classCode,
            className,
            academicYear,
            advisorTeacherId,
            maxStudents,
            major,
            description
        } = req.body;

        // Validation
        if (!classCode || !academicYear) {
            return res.status(400).json({
                success: false,
                message: 'Mã lớp và năm học là bắt buộc'
            });
        }

        connection = await pool.getConnection();

        // Check if class code already exists
        const [existing] = await connection.query(
            'SELECT id FROM classes WHERE class_code = ?',
            [classCode]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Mã lớp ${classCode} đã tồn tại`
            });
        }

        const classId = uuidv4();

        await connection.query(
            `INSERT INTO classes (
        id, class_code, class_name, academic_year, 
        advisor_teacher_id, max_students, major, description, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [
                classId,
                classCode,
                className || null,
                academicYear,
                advisorTeacherId || null,
                maxStudents || 40,
                major || null,
                description || null
            ]
        );

        // Fetch the created class
        const [classes] = await connection.query(
            `SELECT 
        c.*,
        u.display_name AS advisor_name
      FROM classes c
      LEFT JOIN teachers t ON c.advisor_teacher_id = t.user_id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE c.id = ?`,
            [classId]
        );

        const newClass = classes[0];

        res.status(201).json({
            success: true,
            data: {
                id: newClass.id,
                classCode: newClass.class_code,
                className: newClass.class_name,
                academicYear: newClass.academic_year,
                advisorTeacher: newClass.advisor_teacher_id ? {
                    id: newClass.advisor_teacher_id,
                    displayName: newClass.advisor_name
                } : null,
                maxStudents: newClass.max_students,
                currentStudents: 0,
                major: newClass.major,
                description: newClass.description,
                isActive: Boolean(newClass.is_active)
            }
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
});

// PUT /api/classes/:id - Update class
router.put('/:id', async (req, res, next) => {
    let connection;
    try {
        const { id } = req.params;
        const {
            className,
            academicYear,
            advisorTeacherId,
            maxStudents,
            major,
            description,
            isActive
        } = req.body;

        connection = await pool.getConnection();

        // Check if class exists
        const [existing] = await connection.query(
            'SELECT id FROM classes WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lớp học'
            });
        }

        // Build update query
        const updates = [];
        const params = [];

        if (className !== undefined) {
            updates.push('class_name = ?');
            params.push(className);
        }
        if (academicYear !== undefined) {
            updates.push('academic_year = ?');
            params.push(academicYear);
        }
        if (advisorTeacherId !== undefined) {
            updates.push('advisor_teacher_id = ?');
            params.push(advisorTeacherId || null);
        }
        if (maxStudents !== undefined) {
            updates.push('max_students = ?');
            params.push(maxStudents);
        }
        if (major !== undefined) {
            updates.push('major = ?');
            params.push(major);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (isActive !== undefined) {
            updates.push('is_active = ?');
            params.push(isActive);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có thông tin để cập nhật'
            });
        }

        params.push(id);

        await connection.query(
            `UPDATE classes SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Fetch updated class
        const [classes] = await connection.query(
            `SELECT 
        c.*,
        u.display_name AS advisor_name,
        COUNT(DISTINCT s.id) AS current_students
      FROM classes c
      LEFT JOIN teachers t ON c.advisor_teacher_id = t.user_id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN students s ON s.class_name = c.class_code
      WHERE c.id = ?
      GROUP BY c.id`,
            [id]
        );

        const updatedClass = classes[0];

        res.json({
            success: true,
            data: {
                id: updatedClass.id,
                classCode: updatedClass.class_code,
                className: updatedClass.class_name,
                academicYear: updatedClass.academic_year,
                advisorTeacher: updatedClass.advisor_teacher_id ? {
                    id: updatedClass.advisor_teacher_id,
                    displayName: updatedClass.advisor_name
                } : null,
                maxStudents: updatedClass.max_students,
                currentStudents: parseInt(updatedClass.current_students) || 0,
                major: updatedClass.major,
                description: updatedClass.description,
                isActive: Boolean(updatedClass.is_active)
            }
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
});

// DELETE /api/classes/:id - Delete class
router.delete('/:id', async (req, res, next) => {
    let connection;
    try {
        const { id } = req.params;

        connection = await pool.getConnection();

        // Check if class has students
        const [students] = await connection.query(
            `SELECT COUNT(*) as count 
       FROM students s
       JOIN classes c ON s.class_name = c.class_code
       WHERE c.id = ?`,
            [id]
        );

        if (students[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa lớp có ${students[0].count} sinh viên. Vui lòng chuyển sinh viên sang lớp khác trước.`
            });
        }

        await connection.query('DELETE FROM classes WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Đã xóa lớp học thành công'
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
});

// GET /api/classes/:classCode/students - Get students in a class
router.get('/:classCode/students', async (req, res, next) => {
    let connection;
    try {
        const { classCode } = req.params;

        connection = await pool.getConnection();

        const [students] = await connection.query(
            `SELECT 
        u.id,
        u.uid,
        u.email,
        u.display_name,
        u.photo_url,
        u.is_active,
        u.created_at,
        u.updated_at,
        s.student_id,
        s.class_name,
        s.major,
        s.academic_year
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.class_name = ?
      ORDER BY s.student_id ASC`,
            [classCode]
        );

        const formattedStudents = students.map(student => ({
            id: student.id,
            uid: student.uid,
            email: student.email,
            displayName: student.display_name,
            photoURL: student.photo_url,
            role: 'student',
            isActive: Boolean(student.is_active),
            createdAt: student.created_at,
            updatedAt: student.updated_at,
            studentId: student.student_id,
            className: student.class_name,
            major: student.major,
            academicYear: student.academic_year
        }));

        res.json({
            success: true,
            data: formattedStudents
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
});

export default router;
