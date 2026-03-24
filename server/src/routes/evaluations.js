import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { createNotification, createBulkNotifications } from '../utils/notificationHelper.js';

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

        const evaluatorId = req.user.uid; // uid từ Firebase


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
      VALUES (?, ?, (SELECT id FROM teachers WHERE user_id = (SELECT id FROM users WHERE uid = ?)), ?, ?, ?, ?, ?, ?, ?)
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

        // Fetch student & topic info (needed for notifications)
        const [evalStudent] = await connection.query(
            `SELECT u.uid as student_uid, t.title as topic_title
             FROM projects p
             INNER JOIN students s ON p.student_id = s.id
             INNER JOIN users u ON s.user_id = u.id
             INNER JOIN topics t ON p.topic_id = t.id
             WHERE p.id = ?`, [projectId]
        );

        const topicTitle = evalStudent.length > 0 ? evalStudent[0].topic_title : 'Đồ án';

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
                    'UPDATE projects SET final_score = ?, grade = ?, status = ?, updated_at = NOW() WHERE id = ?',
                    [finalScore, grade, 'graded', projectId]
                );

                // Notify all admins about the graded project
                const [adminUsers] = await connection.query(
                    `SELECT u.uid FROM users u WHERE u.role = 'admin' AND u.is_active = 1`
                );

                if (adminUsers.length > 0) {
                    const adminNotifications = adminUsers.map(admin => ({
                        userUid: admin.uid,
                        title: 'Đồ án đã có điểm tổng kết',
                        message: `Đồ án "${topicTitle}" đã được chấm điểm đầy đủ. Điểm tổng kết: ${finalScore} (${grade}).`,
                        type: 'project',
                        link: '/admin/projects',
                    }));
                    await createBulkNotifications(adminNotifications, connection);
                }

                // Auto-archive when all 3 scores are present (supervisor + reviewer + council)
                if (council_score) {
                    const [[{ alreadyArchived }]] = await connection.query(
                        `SELECT COUNT(*) as alreadyArchived FROM project_archive WHERE project_id = ?`,
                        [projectId]
                    );

                    if (!alreadyArchived) {
                        const [fullProject] = await connection.query(
                            `SELECT
                                t.title as topic_title, t.field as topic_field,
                                u_student.display_name as student_name,
                                s.student_id as student_code, s.class_name,
                                u_supervisor.display_name as supervisor_name,
                                u_reviewer.display_name as reviewer_name,
                                p.notes as description
                             FROM projects p
                             INNER JOIN topics t ON p.topic_id = t.id
                             INNER JOIN students s ON p.student_id = s.id
                             INNER JOIN users u_student ON s.user_id = u_student.id
                             LEFT JOIN teachers te ON p.supervisor_id = te.id
                             LEFT JOIN users u_supervisor ON te.user_id = u_supervisor.id
                             LEFT JOIN teachers tr ON p.reviewer_id = tr.id
                             LEFT JOIN users u_reviewer ON tr.user_id = u_reviewer.id
                             WHERE p.id = ?`, [projectId]
                        );

                        if (fullProject.length > 0) {
                            const fp = fullProject[0];
                            const currentYear = new Date().getFullYear();
                            const academicYear = `${currentYear - 1}-${currentYear}`;

                            await connection.query(
                                `INSERT INTO project_archive
                                 (project_id, topic_title, topic_field, student_name, student_code, class_name,
                                  supervisor_name, reviewer_name, academic_year, final_score, grade, status, description)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
                                [projectId, fp.topic_title, fp.topic_field || null, fp.student_name,
                                    fp.student_code || null, fp.class_name || null, fp.supervisor_name || null,
                                    fp.reviewer_name || null, academicYear, finalScore, grade, fp.description || null]
                            );

                            await connection.query(
                                `UPDATE projects SET archived_at = CURRENT_TIMESTAMP WHERE id = ?`,
                                [projectId]
                            );
                        }
                    }
                }
            }
        }

        // Send notification to student about this evaluation
        if (evalStudent.length > 0) {
            const roleLabel = evaluatorType === 'supervisor' ? 'GVHD' : 'GVPB';
            await createNotification({
                userUid: evalStudent[0].student_uid,
                title: `${roleLabel} đã chấm điểm`,
                message: `Đồ án "${topicTitle}" đã được ${roleLabel} chấm: ${totalScore} điểm.`,
                type: 'success',
                link: '/student/results',
                connection,
            });
        }

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
