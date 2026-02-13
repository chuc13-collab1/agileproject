import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { verifyToken, isTeacher, isStudent } from '../middleware/auth.js';

const router = express.Router();

// Get available slots (filtered by teacher or date)
router.get('/slots', verifyToken, async (req, res) => {
    try {
        const { teacher_id, from_date, to_date } = req.query;
        let query = `
            SELECT s.*, t.user_id, u.display_name as teacher_name
            FROM meeting_slots s
            JOIN teachers t ON s.teacher_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (teacher_id) {
            query += ' AND s.teacher_id = ?';
            params.push(teacher_id);
        }
        if (from_date) {
            query += ' AND s.start_time >= ?';
            params.push(from_date);
        }
        if (to_date) {
            query += ' AND s.end_time <= ?';
            params.push(to_date);
        }

        query += ' ORDER BY s.start_time ASC';

        const [slots] = await db.query(query, params);
        res.json(slots);
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create slots (Teacher only)
router.post('/slots', verifyToken, isTeacher, async (req, res) => {
    try {
        const { start_time, end_time, location, max_students } = req.body;
        const firebase_uid = req.user.uid;

        // Get teacher internal ID via JOIN
        const [teachers] = await db.query(`
            SELECT t.id 
            FROM teachers t
            JOIN users u ON t.user_id = u.id
            WHERE u.uid = ?
        `, [firebase_uid]);

        if (teachers.length === 0) return res.status(404).json({ message: 'Teacher not found' });
        const teacher_id = teachers[0].id;

        const id = uuidv4();
        await db.query(`
            INSERT INTO meeting_slots (id, teacher_id, start_time, end_time, location, max_students)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id, teacher_id, start_time, end_time, location, max_students || 1]);

        res.status(201).json({ message: 'Slot created successfully', id });
    } catch (error) {
        console.error('Error creating slot:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete slot (Teacher only)
router.delete('/slots/:id', verifyToken, isTeacher, async (req, res) => {
    try {
        const { id } = req.params;
        const firebase_uid = req.user.uid;

        // Verify ownership
        const [slots] = await db.query(`
            SELECT s.id 
            FROM meeting_slots s
            JOIN teachers t ON s.teacher_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE s.id = ? AND u.uid = ?
        `, [id, firebase_uid]);

        if (slots.length === 0) {
            return res.status(403).json({ message: 'Not authorized direct delete' });
        }

        await db.query('DELETE FROM meeting_slots WHERE id = ?', [id]);
        res.json({ message: 'Slot deleted' });
    } catch (error) {
        console.error('Error deleting slot:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Book a slot (Student only)
router.post('/bookings', verifyToken, isStudent, async (req, res) => {
    try {
        const { slot_id, notes, project_id } = req.body;
        const firebase_uid = req.user.uid;

        // Get student internal ID via JOIN
        const [students] = await db.query(`
            SELECT s.id 
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE u.uid = ?
        `, [firebase_uid]);

        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        const student_id = students[0].id;

        // Check if slot available
        const [slots] = await db.query('SELECT * FROM meeting_slots WHERE id = ?', [slot_id]);
        if (slots.length === 0) return res.status(404).json({ message: 'Slot not found' });
        if (slots[0].is_booked) return res.status(400).json({ message: 'Slot already fully booked' });

        const id = uuidv4();
        await db.query(`
            INSERT INTO bookings (id, slot_id, student_id, project_id, notes, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        `, [id, slot_id, student_id, project_id, notes]);

        // Update slot to is_booked (simple logic for now, later check max_students)
        await db.query('UPDATE meeting_slots SET is_booked = 1 WHERE id = ?', [slot_id]);

        res.status(201).json({ message: 'Booking requested', id });
    } catch (error) {
        console.error('Error booking slot:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get my bookings (Student and Teacher)
router.get('/my-bookings', verifyToken, async (req, res) => {
    try {
        const firebase_uid = req.user.uid;

        // Check if student
        const [students] = await db.query(`
            SELECT s.id 
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE u.uid = ?
        `, [firebase_uid]);

        if (students.length > 0) {
            const student_id = students[0].id;
            const [bookings] = await db.query(`
                SELECT b.*, s.start_time, s.end_time, s.location, u.display_name as teacher_name
                FROM bookings b
                JOIN meeting_slots s ON b.slot_id = s.id
                JOIN teachers t ON s.teacher_id = t.id
                JOIN users u ON t.user_id = u.id
                WHERE b.student_id = ?
                ORDER BY s.start_time DESC
            `, [student_id]);
            return res.json(bookings);
        }

        // Check if teacher
        const [teachers] = await db.query(`
            SELECT t.id 
            FROM teachers t
            JOIN users u ON t.user_id = u.id
            WHERE u.uid = ?
        `, [firebase_uid]);

        if (teachers.length > 0) {
            const teacher_id = teachers[0].id;
            const [bookings] = await db.query(`
                SELECT b.*, s.start_time, s.end_time, s.location, s.id as slot_id,
                       std.student_id as student_code, u.display_name as student_name
                FROM meeting_slots s
                LEFT JOIN bookings b ON s.id = b.slot_id
                LEFT JOIN students std ON b.student_id = std.id
                LEFT JOIN users u ON std.user_id = u.id
                WHERE s.teacher_id = ?
                ORDER BY s.start_time ASC
            `, [teacher_id]);
            // This returns slots + bookings. 
            return res.json(bookings);
        }

        res.status(404).json({ message: 'User role not found' });

    } catch (error) {
        console.error('Error fetching my bookings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Update booking status (Approve/Reject/Cancel)
router.put('/bookings/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'confirmed', 'cancelled'

        if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Add authorization check here (Teacher owns slot or Student owns booking)
        // For simplicity, allowed for now, but should verify

        await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

        if (status === 'cancelled') {
            // Free up the slot
            const [bookings] = await db.query('SELECT slot_id FROM bookings WHERE id = ?', [id]);
            if (bookings.length > 0) {
                await db.query('UPDATE meeting_slots SET is_booked = 0 WHERE id = ?', [bookings[0].slot_id]);
            }
        }

        res.json({ message: 'Booking updated' });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
