import express from 'express';
import * as projectService from '../services/projectService.js';

const router = express.Router();

// GET /api/projects
router.get('/', async (req, res, next) => {
    try {
        const data = await projectService.getAllProjects();
        res.json(data);
    } catch (err) { next(err); }
});

// GET /api/projects/teachers/:teacherId/projects
router.get('/teachers/:teacherId/projects', async (req, res, next) => {
    try {
        const data = await projectService.getProjectsByTeacher(req.params.teacherId);
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// GET /api/projects/teachers/:teacherId/review-projects
router.get('/teachers/:teacherId/review-projects', async (req, res, next) => {
    try {
        const data = await projectService.getReviewProjectsByTeacher(req.params.teacherId);
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// GET /api/projects/student/:studentUid
router.get('/student/:studentUid', async (req, res, next) => {
    try {
        const data = await projectService.getProjectByStudentUid(req.params.studentUid);
        if (!data) return res.status(404).json({ success: false, message: 'No active project found' });
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// GET /api/projects/:id
router.get('/:id', async (req, res, next) => {
    try {
        const data = await projectService.getProjectById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Project not found' });
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// POST /api/projects
router.post('/', async (req, res, next) => {
    try {
        const { topicId, studentId, supervisorId, studentEmail, studentName } = req.body;
        if (!topicId || !studentId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const data = await projectService.createProject({ topicId, studentId, supervisorId, studentEmail, studentName });
        res.status(201).json({ success: true, message: 'Project registered successfully', data });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
        next(err);
    }
});

// PATCH /api/projects/:id/status
router.patch('/:id/status', async (req, res, next) => {
    try {
        await projectService.updateProjectStatus(req.params.id, req.body.status);
        res.json({ success: true, message: 'Project status updated successfully' });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
        next(err);
    }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res, next) => {
    try {
        await projectService.updateProject(req.params.id, req.body);
        res.json({ success: true, message: 'Project updated successfully' });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
        next(err);
    }
});

// POST /api/projects/:id/evaluate
router.post('/:id/evaluate', async (req, res, next) => {
    try {
        const data = await projectService.evaluateProject(req.params.id, req.user.uid, req.body);
        res.json({ success: true, message: 'Evaluation submitted successfully', data });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
        next(err);
    }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await projectService.deleteProject(req.params.id);
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
        next(err);
    }
});

export default router;
