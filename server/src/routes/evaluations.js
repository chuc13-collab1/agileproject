import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

const router = express.Router();

/**
 * POST /api/projects/:projectId/evaluate
 *  Submit an evaluation for a project
 */
router.post('/projects/:projectId/evaluate', async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        const { projectId } = req.params;
        const {
            evaluatorType, // 'supervisor' or 'reviewer'
            criteriaScore,  // { content: 8.5, technical: 9.0, presentation: 7.5, defense: 8.0 }
            comments,
            strengths,
            weaknesses,
            suggestions
        } = req.body;

        const evaluatorId = req.user.id; // From auth middleware

        // Validate
        if (!evaluatorType || !criteriaScore) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (!['supervisor', 'reviewer'].includes(evaluatorType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid evaluator type'
            });
        }

        // Calculate total score (weighted average)
        const weights = {
            content: 0.4,     // 40%
            technical: 0.3,   // 30%
            presentation: 0.2, // 20%
            defense: 0.1      // 10%
        };

        let totalScore = 0;
        for (const [key, weight] of Object.entries(weights)) {
            if (criteriaScore[key] !== undefined) {
                totalScore += criteriaScore[key] * weight;
            }
        }

        totalScore = parseFloat(totalScore.toFixed(2));

        await connection.beginTransaction();

        const evaluationId = uuidv4();

        // Create evaluation
        await connection.query(`
      INSERT INTO evaluations (
        id, project_id, evaluator_id, evaluator_type,
        criteria_score, total_score, comments, strengths, weaknesses, suggestions
      )
      VALUES (?, ?, (SELECT id FROM teachers WHERE user_id = ?), ?, ?, ?, ?, ?, ?, ?)
    `, [
            evaluationId, projectId, evaluatorId, evaluatorType,
            JSON.stringify(criteriaScore), totalScore,
            comments || null, strengths || null, weaknesses || null, suggestions || null
        ]);

        // Update project score
        const scoreField = evaluatorType === 'supervisor' ? 'supervisor_score' : 'reviewer_score';
        await connection.query(
            `UPDATE projects SET ${scoreField} = ? WHERE id = ?`,
            [totalScore, projectId]
        );

        // Calculate final score if both supervisor and reviewer scores exist
        const [project] = await connection.query(
            'SELECT supervisor_score, reviewer_score, council_score FROM projects WHERE id = ?',
            [projectId]
        );

        if (project.length > 0) {
            const { supervisor_score, reviewer_score, council_score } = project[0];

            if (supervisor_score && reviewer_score) {
                // Formula: supervisor*0.4 + reviewer*0.2 + council*0.4
                let finalScore = supervisor_score * 0.4 + reviewer_score * 0.2;

                if (council_score) {
                    finalScore += council_score * 0.4;
                }

                finalScore = parseFloat(finalScore.toFixed(2));

                // Calculate grade
                let grade;
                if (finalScore >= 9.0) grade = 'A';
                else if (finalScore >= 8.5) grade = 'B+';
                else if (finalScore >= 8.0) grade = 'B';
                else if (finalScore >= 7.5) grade = 'C+';
                else if (finalScore >= 7.0) grade = 'C';
                else if (finalScore >= 6.5) grade = 'D+';
                else if (finalScore >= 6.0) grade = 'D';
                else grade = 'F';

                await connection.query(
                    'UPDATE projects SET final_score = ?, grade = ? WHERE id = ?',
                    [finalScore, grade, projectId]
                );
            }
        }

        // TODO: Send notification to student

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Evaluation submitted successfully',
            data: {
                evaluationId,
                totalScore
            }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

/**
 * GET /api/projects/:projectId/evaluations
 * Get all evaluations for a project
 */
router.get('/projects/:projectId/evaluations', async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const [evaluations] = await db.query(`
      SELECT 
        e.*,
        u.display_name as evaluator_name
      FROM evaluations e
      INNER JOIN teachers t ON e.evaluator_id = t.id
      INNER JOIN users u ON t.user_id = u.id
      WHERE e.project_id = ?
      ORDER BY e.evaluation_date ASC
    `, [projectId]);

        res.json({
            success: true,
            data: evaluations
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/evaluations/:id
 * Get a specific evaluation
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const [evaluations] = await db.query(`
      SELECT 
        e.*,
        u.display_name as evaluator_name,
        p.id as project_id,
        t.title as topic_title
      FROM evaluations e
      INNER JOIN teachers tea ON e.evaluator_id = tea.id
      INNER JOIN users u ON tea.user_id = u.id
      INNER JOIN projects p ON e.project_id = p.id
      INNER JOIN topics t ON p.topic_id = t.id
      WHERE e.id = ?
    `, [id]);

        if (evaluations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evaluation not found'
            });
        }

        res.json({
            success: true,
            data: evaluations[0]
        });
    } catch (error) {
        next(error);
    }
});

export default router;
