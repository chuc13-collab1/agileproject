import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

const router = express.Router();

// Auto-create sprints table
const createSprintsTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS sprints (
                id VARCHAR(36) PRIMARY KEY,
                project_id VARCHAR(36) NOT NULL,
                sprint_number INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                goals TEXT,
                start_week INT NOT NULL,
                end_week INT NOT NULL,
                weight_percent INT DEFAULT 0,
                status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
                actual_progress INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_sprint (project_id, sprint_number)
            )
        `);
    } catch (error) {
        console.error('Error creating sprints table:', error.message);
    }
};
createSprintsTable();

/**
 * GET /api/sprints/:projectId
 * Get all sprints for a project
 */
router.get('/:projectId', async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const [sprints] = await db.query(
            'SELECT * FROM sprints WHERE project_id = ? ORDER BY sprint_number ASC',
            [projectId]
        );

        res.json({ success: true, data: sprints });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/sprints
 * Create or replace all sprints for a project (batch)
 */
router.post('/', async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        const { projectId, sprints } = req.body;

        if (!projectId || !sprints || !Array.isArray(sprints) || sprints.length === 0) {
            return res.status(400).json({ success: false, message: 'ProjectId and sprints array are required' });
        }

        // Validate total weight = 100%
        const totalWeight = sprints.reduce((sum, s) => sum + (s.weightPercent || 0), 0);
        if (totalWeight !== 100) {
            return res.status(400).json({ success: false, message: `Tổng trọng số phải bằng 100% (hiện tại: ${totalWeight}%)` });
        }

        await connection.beginTransaction();

        // Delete existing sprints for this project
        await connection.query('DELETE FROM sprints WHERE project_id = ?', [projectId]);

        // Insert new sprints
        for (const sprint of sprints) {
            const id = uuidv4();
            await connection.query(`
                INSERT INTO sprints (id, project_id, sprint_number, title, goals, start_week, end_week, weight_percent, status, actual_progress)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id, projectId, sprint.sprintNumber, sprint.title,
                sprint.goals || '', sprint.startWeek, sprint.endWeek,
                sprint.weightPercent || 0, sprint.status || 'not_started',
                sprint.actualProgress || 0
            ]);
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Sprint plan saved successfully' });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

/**
 * PATCH /api/sprints/:id
 * Update sprint progress
 */
router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, actualProgress } = req.body;

        const updates = [];
        const values = [];

        if (status) {
            updates.push('status = ?');
            values.push(status);
        }
        if (actualProgress !== undefined) {
            updates.push('actual_progress = ?');
            values.push(Math.min(100, Math.max(0, actualProgress)));
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        values.push(id);
        await db.query(`UPDATE sprints SET ${updates.join(', ')} WHERE id = ?`, values);

        res.json({ success: true, message: 'Sprint updated successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/sprints/:projectId/burndown
 * Get burndown chart data for a project
 */
router.get('/:projectId/burndown', async (req, res, next) => {
    try {
        const { projectId } = req.params;

        // Get sprints
        const [sprints] = await db.query(
            'SELECT * FROM sprints WHERE project_id = ? ORDER BY sprint_number ASC',
            [projectId]
        );

        // Get progress reports
        const [reports] = await db.query(
            'SELECT week_number, status, created_at FROM progress_reports WHERE project_id = ? ORDER BY week_number ASC',
            [projectId]
        );

        if (sprints.length === 0) {
            return res.json({
                success: true,
                data: { planned: [], actual: [], sprints: [], reports: [] }
            });
        }

        // Calculate planned burndown (ideal path)
        const totalWeeks = Math.max(...sprints.map(s => s.end_week));
        const planned = [];
        let remainingWork = 100;

        for (let week = 0; week <= totalWeeks; week++) {
            planned.push({ week, remaining: Math.round(remainingWork) });

            // Check which sprints end at this week
            const endingSprints = sprints.filter(s => s.end_week === week);
            for (const sprint of endingSprints) {
                remainingWork -= sprint.weight_percent;
            }
        }

        // Calculate actual burndown (from sprint progress)
        const actual = [];
        let totalCompleted = 0;

        for (let week = 0; week <= totalWeeks; week++) {
            // Find reports for this week
            const weekReport = reports.find(r => r.week_number === week);

            // Calculate total completed based on sprint actual_progress
            totalCompleted = sprints.reduce((sum, s) => {
                if (week >= s.start_week) {
                    return sum + (s.actual_progress / 100) * s.weight_percent;
                }
                return sum;
            }, 0);

            actual.push({
                week,
                remaining: Math.round(100 - totalCompleted),
                hasReport: !!weekReport
            });
        }

        res.json({
            success: true,
            data: { planned, actual, sprints, reports, totalWeeks }
        });
    } catch (error) {
        next(error);
    }
});

// Auto-create sprint_comments table
const createSprintCommentsTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS sprint_comments (
                id VARCHAR(36) PRIMARY KEY,
                sprint_id VARCHAR(36) NOT NULL,
                project_id VARCHAR(36) NOT NULL,
                author_uid VARCHAR(255) NOT NULL,
                author_name VARCHAR(255) NOT NULL,
                author_role ENUM('teacher', 'student') NOT NULL DEFAULT 'teacher',
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_sprint_comments_sprint (sprint_id),
                INDEX idx_sprint_comments_project (project_id)
            )
        `);
    } catch (error) {
        console.error('Error creating sprint_comments table:', error.message);
    }
};
createSprintCommentsTable();

/**
 * GET /api/sprints/:projectId/comments
 * Get all sprint comments for a project
 */
router.get('/:projectId/comments', async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const [comments] = await db.query(
            `SELECT * FROM sprint_comments
             WHERE project_id = ?
             ORDER BY created_at DESC`,
            [projectId]
        );

        res.json({ success: true, data: comments });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/sprints/:sprintId/comments
 * Add a comment to a sprint
 */
router.post('/:sprintId/comments', async (req, res, next) => {
    try {
        const { sprintId } = req.params;
        const { projectId, authorUid, authorName, authorRole, content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }
        if (!projectId || !authorUid || !authorName) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const id = uuidv4();
        await db.query(`
            INSERT INTO sprint_comments (id, sprint_id, project_id, author_uid, author_name, author_role, content)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [id, sprintId, projectId, authorUid, authorName, authorRole || 'teacher', content.trim()]);

        const [newComment] = await db.query('SELECT * FROM sprint_comments WHERE id = ?', [id]);

        res.status(201).json({ success: true, data: newComment[0] });
    } catch (error) {
        next(error);
    }
});

export default router;
