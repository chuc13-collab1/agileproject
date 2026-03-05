import express from 'express';
import * as studentService from '../services/studentService.js';

const router = express.Router();

// GET /api/students
router.get('/', async (req, res, next) => {
    try {
        const data = await studentService.getAllStudents();
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// POST /api/students
router.post('/', async (req, res, next) => {
    try {
        const data = await studentService.createStudent(req.body);
        res.status(201).json({ success: true, message: 'Student created successfully', data });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
        next(err);
    }
});

// PUT /api/students/:id
router.put('/:id', async (req, res, next) => {
    try {
        await studentService.updateStudent(req.params.id, req.body);
        res.json({ success: true, message: 'Student updated successfully' });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
        next(err);
    }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await studentService.deleteStudent(req.params.id);
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
        next(err);
    }
});

// PATCH /api/students/:id/toggle-active
router.patch('/:id/toggle-active', async (req, res, next) => {
    try {
        await studentService.toggleStudentActive(req.params.id);
        res.json({ success: true, message: 'Student status updated successfully' });
    } catch (err) { next(err); }
});

// POST /api/students/batch-import
router.post('/batch-import', async (req, res, next) => {
    try {
        const data = await studentService.batchImportStudents(req.body.students);
        res.json({ success: true, data });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
        next(err);
    }
});

// POST /api/students/batch-delete
router.post('/batch-delete', async (req, res, next) => {
    try {
        await studentService.batchDeleteStudents(req.body.studentIds);
        res.json({ success: true, message: `Deleted ${req.body.studentIds?.length} students` });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
        next(err);
    }
});

// POST /api/students/batch-update-class
router.post('/batch-update-class', async (req, res, next) => {
    try {
        const { studentIds, className, academicYear } = req.body;
        await studentService.batchUpdateClass(studentIds, className, academicYear);
        res.json({ success: true, message: `Updated class for ${studentIds?.length} students` });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
        next(err);
    }
});

export default router;
