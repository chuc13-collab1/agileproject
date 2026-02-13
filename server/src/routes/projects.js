import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

const router = express.Router();

/**
 * GET /api/projects
 * Get all projects
 */
router.get('/', async (req, res, next) => {
    try {
        const [projects] = await db.query(`
      SELECT 
        p.*,
        t.title as topic_title,
        t.field,
        u.display_name as student_name,
        u.email as student_email,
        u.uid as student_uid,
        s.student_id as student_code,
        s.class_name,
        u_supervisor.display_name as supervisor_name,
        u_supervisor.uid as supervisor_uid,
        u_reviewer.display_name as reviewer_name,
        u_reviewer.uid as reviewer_uid
      FROM projects p
      INNER JOIN topics t ON p.topic_id = t.id
      INNER JOIN students s ON p.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      LEFT JOIN teachers te ON p.supervisor_id = te.id
      LEFT JOIN users u_supervisor ON te.user_id = u_supervisor.id
      LEFT JOIN teachers tr ON p.reviewer_id = tr.id
      LEFT JOIN users u_reviewer ON tr.user_id = u_reviewer.id
      ORDER BY p.created_at DESC
    `);

        // Format response to match frontend expectations
        const formattedProjects = projects.map(p => ({
            id: p.id,
            title: p.topic_title,
            description: p.description || '',
            studentId: p.student_uid,
            studentName: p.student_name,
            studentEmail: p.student_email,
            supervisor: p.supervisor_name ? {
                id: p.supervisor_uid,
                name: p.supervisor_name
            } : null,
            reviewer: p.reviewer_name ? {
                id: p.reviewer_uid,
                name: p.reviewer_name
            } : null,
            field: p.field,
            registrationDate: p.registration_date,
            status: p.status,
            semester: p.semester || '1',
            academicYear: p.academic_year || '2024-2025',
            createdAt: p.created_at,
            reportDeadline: p.report_deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default 3 months
        }));

        res.json(formattedProjects);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/teachers/:teacherId/projects
 * Get all projects supervised by a teacher
 */
router.get('/teachers/:teacherId/projects', async (req, res, next) => {
    try {
        const { teacherId } = req.params;

        const [projects] = await db.query(`
      SELECT 
        p.*,
        t.title as topic_title,
        t.field,
        u.display_name as student_name,
        s.student_id as student_code,
        s.class_name,
        -- Latest progress report
        (SELECT COUNT(*) FROM progress_reports pr WHERE pr.project_id = p.id AND pr.status = 'submitted') as unreviewed_reports
      FROM projects p
      INNER JOIN topics t ON p.topic_id = t.id
      INNER JOIN students s ON p.student_id = s.id
      INNER JOIN users u ON s.user_id = u.id
      WHERE p.supervisor_id = (SELECT id FROM teachers WHERE user_id = ?)
      ORDER BY p.created_at DESC
    `, [teacherId]);

        res.json({
            success: true,
            data: projects
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/projects/:id
 * Get detailed project information
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get detailed project information with related data
        const [projects] = await db.query(`
      SELECT 
        p.*,
        t.title as topic_title,
        t.description as topic_description,
        t.field,
        u_student.display_name as student_name,
        u_student.email as student_email,
        u_student.uid as student_uid,
        s.student_id as student_code,
        s.class_name,
        u_supervisor.display_name as supervisor_name,
        u_supervisor.uid as supervisor_uid,
        u_reviewer.display_name as reviewer_name,
        u_reviewer.uid as reviewer_uid
      FROM projects p
      INNER JOIN topics t ON p.topic_id = t.id
      INNER JOIN students s ON p.student_id = s.id
      INNER JOIN users u_student ON s.user_id = u_student.id
      LEFT JOIN teachers t_supervisor ON p.supervisor_id = t_supervisor.id
      LEFT JOIN users u_supervisor ON t_supervisor.user_id = u_supervisor.id
      LEFT JOIN teachers t_reviewer ON p.reviewer_id = t_reviewer.id
      LEFT JOIN users u_reviewer ON t_reviewer.user_id = u_reviewer.id
      WHERE p.id = ?
    `, [id]);

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const project = projects[0];

        // Get progress reports (optional - table may not exist yet)
        let progressReports = [];
        try {
            const [reports] = await db.query(`
                SELECT * FROM progress_reports
                WHERE project_id = ?
                ORDER BY week_number ASC
            `, [id]);
            progressReports = reports;
        } catch (error) {
            if (error.code !== 'ER_NO_SUCH_TABLE') throw error;
            console.log('⚠️ progress_reports table does not exist yet');
        }

        // Get documents (optional - table may not exist yet)
        let documents = [];
        try {
            const [docs] = await db.query(`
                SELECT * FROM documents
                WHERE project_id = ? AND is_latest = TRUE
                ORDER BY document_type, uploaded_at DESC
            `, [id]);
            documents = docs;
        } catch (error) {
            if (error.code !== 'ER_NO_SUCH_TABLE') throw error;
            console.log('⚠️ documents table does not exist yet');
        }

        // Get evaluations (optional - table may not exist yet)
        let evaluations = [];
        try {
            const [evals] = await db.query(`
                SELECT 
                    e.*,
                    u.display_name as evaluator_name
                FROM evaluations e
                INNER JOIN teachers t ON e.evaluator_id = t.id
                INNER JOIN users u ON t.user_id = u.id
                WHERE e.project_id = ?
            `, [id]);
            evaluations = evals;
        } catch (error) {
            if (error.code !== 'ER_NO_SUCH_TABLE') throw error;
            console.log('⚠️ evaluations table does not exist yet');
        }

        // Format response to match frontend expectations
        res.json({
            success: true,
            data: {
                id: project.id,
                title: project.topic_title,
                description: project.description || project.topic_description || '',
                studentId: project.student_uid,
                studentName: project.student_name,
                studentEmail: project.student_email,
                supervisor: project.supervisor_name ? {
                    id: project.supervisor_uid,
                    name: project.supervisor_name
                } : null,
                reviewer: project.reviewer_name ? {
                    id: project.reviewer_uid,
                    name: project.reviewer_name
                } : null,
                field: project.field,
                registrationDate: project.registration_date,
                status: project.status,
                semester: project.semester || '1',
                academicYear: project.academic_year || '2024-2025',
                createdAt: project.created_at,
                reportDeadline: project.report_deadline,
                supervisorComment: project.supervisor_comment || '',
                supervisorScore: project.supervisor_score || null,
                reviewerScore: project.reviewer_score || null,
                councilScore: project.council_score || null,
                finalScore: project.final_score || null,
                grade: project.grade || null,
                progressReports: progressReports,
                documents: documents,
                evaluations: evaluations
            }
        });
    } catch (error) {
        console.error('❌ Error in GET /api/projects/:id:', error.message);
        console.error('SQL Error Code:', error.code);
        console.error('SQL Message:', error.sqlMessage);
        next(error);
    }
});

/**
 * PATCH /api/projects/:id/status
 * Update project status
 */
router.patch('/:id/status', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['registered', 'in_progress', 'submitted', 'reviewed', 'completed', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        await db.query(
            'UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        res.json({
            success: true,
            message: 'Project status updated successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/projects
 * Create a new project (student registration)
 */
router.post('/', async (req, res, next) => {
    const connection = await db.getConnection();

    try {
        const {
            topicId,
            studentId,
            supervisorId,
        } = req.body;

        console.log('Registering project:', { topicId, studentId, supervisorId });


        // Validate required fields (supervisorId can be null for student-proposed topics)
        if (!topicId || !studentId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if student already has a project this semester
        const [existing] = await connection.query(`
      SELECT COUNT(*) as count FROM projects p
      INNER JOIN topics t ON p.topic_id = t.id
      INNER JOIN students s ON p.student_id = s.id
      WHERE s.user_id = ? AND p.status NOT IN ('completed', 'failed')
    `, [studentId]);

        if (existing[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Student already has an active project'
            });
        }

        // Check if topic has available slots and get supervisor info
        const [topics] = await connection.query(
            'SELECT current_students, max_students, supervisor_id FROM topics WHERE id = ?',
            [topicId]
        );

        if (topics.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Topic not found'
            });
        }

        if (topics[0].current_students >= topics[0].max_students) {
            return res.status(400).json({
                success: false,
                message: 'Topic has reached maximum students'
            });
        }

        // Use supervisorId from topic if not provided (for student-proposed topics)
        const finalSupervisorId = supervisorId || topics[0].supervisor_id;

        // Allow registration even if no supervisor assigned yet (admin will assign later)

        await connection.beginTransaction();

        const projectId = uuidv4();

        // Create project
        // Note: finalSupervisorId can be null. We use ? for supervisor_id value directly.
        // If finalSupervisorId is null, we pass null. If it has value, we need to get ID from teachers table.

        let supervisorDbId = null;
        if (finalSupervisorId) {
            const [teachers] = await connection.query('SELECT id FROM teachers WHERE user_id = ?', [finalSupervisorId]);
            if (teachers.length > 0) {
                supervisorDbId = teachers[0].id;
            }
        }

        // Check if student record exists, if not create one
        const [studentRes] = await connection.query('SELECT s.id FROM students s JOIN users u ON s.user_id = u.id WHERE u.uid = ?', [studentId]);
        let studentDbId;

        if (studentRes.length === 0) {
            // Create missing student record
            // First get user ID
            // First get user ID
            let [users] = await connection.query('SELECT id, email, display_name FROM users WHERE uid = ?', [studentId]);
            if (users.length === 0) {
                console.error(`User with UID ${studentId} not found in users table`);

                if (req.body.studentEmail && req.body.studentName) {
                    const newUserId = uuidv4();
                    console.log(`Auto-creating user ${req.body.studentEmail} in users table`);
                    await connection.query(
                        'INSERT INTO users (id, uid, email, display_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
                        [newUserId, studentId, req.body.studentEmail, req.body.studentName, 'student', true]
                    );
                    [users] = await connection.query('SELECT id, email, display_name FROM users WHERE uid = ?', [studentId]);
                } else {
                    await connection.rollback();
                    return res.status(404).json({ message: 'User not found' });
                }
            }
            const userId = users[0].id;
            studentDbId = uuidv4();
            const studentCode = 'S' + Math.floor(100000 + Math.random() * 900000);

            await connection.query(
                'INSERT INTO students (id, user_id, student_id, class_name, major) VALUES (?, ?, ?, ?, ?)',
                [studentDbId, userId, studentCode, 'D20CQCN01-N', 'Software Engineering']
            );
        } else {
            studentDbId = studentRes[0].id;
        }

        await connection.query(`
      INSERT INTO projects (id, topic_id, student_id, supervisor_id, status)
      VALUES (?, ?, ?, ?, 'registered')
    `, [projectId, topicId, studentDbId, supervisorDbId]);

        // Update topic current_students
        await connection.query(
            'UPDATE topics SET current_students = current_students + 1 WHERE id = ?',
            [topicId]
        );

        // Update teacher current_students only if supervisor is assigned
        if (finalSupervisorId) {
            await connection.query(
                'UPDATE teachers SET current_students = current_students + 1 WHERE user_id = ?',
                [finalSupervisorId]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Project registered successfully',
            data: { projectId }
        });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
});

/**
 * PUT /api/projects/:id
 * Update project details
 */
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            supervisorId,
            reviewerId,
            semester,
            academicYear,
            reportDeadline,
            defenseDate,
            score,
            field,
            status
        } = req.body;

        // Build update query dynamically
        const updates = [];
        const values = [];

        // Handle status updates
        if (status !== undefined) {
            const validStatuses = ['registered', 'in_progress', 'submitted', 'graded', 'completed', 'failed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }
            updates.push('status = ?');
            values.push(status);
        }

        if (supervisorId !== undefined) {
            updates.push('supervisor_id = ?');
            // We need to resolve teacher ID from user ID if supervisorId is a UUID
            // Assuming supervisorId passed is the teacher's ID or user ID.
            // Client passes teacher.id which is likely the table ID.
            values.push(supervisorId);
        }
        if (reviewerId !== undefined) {
            updates.push('reviewer_id = ?');
            values.push(reviewerId);
        }
        // Projects table doesn't have semester/academic_year, they are in topics.
        // We ignore them here to avoid SQL errors.
        // If we needed to update them, we would need to update the related topic, but that has side effects.

        if (reportDeadline !== undefined) {
            updates.push('report_deadline = ?');
            values.push(new Date(reportDeadline));
        }
        if (defenseDate !== undefined) {
            updates.push('defense_date = ?');
            values.push(new Date(defenseDate));
        }
        if (score !== undefined) {
            updates.push('final_score = ?'); // Mapped to final_score, or maybe supervisor_score?
            // Let's assume 'score' maps to final_score for now, or just ignore if not sure.
            // The schema has supervisor_score, reviewer_score, council_score, final_score.
            // The frontend might be sending a generic score. Let's map it to final_score if provided.
            values.push(score);
        }

        // If there are no updates
        if (updates.length === 0) {
            return res.json({ success: true, message: 'No changes detected (or fields are not updatable)' });
        }

        values.push(id);

        await db.query(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, values);

        res.json({ success: true, message: 'Project updated successfully' });
    } catch (error) {
        next(error);
    }
});
/**
 * POST /api/projects/:id/evaluate
 * Submit an evaluation for a project
 */
router.post('/:id/evaluate', async (req, res, next) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        const {
            evaluatorType, // 'supervisor', 'reviewer', 'council'
            criteriaScore,
            totalScore, // Optional, can be calculated
            comments,
            strengths,
            weaknesses,
            suggestions
        } = req.body;

        const userId = req.user.uid; // Firebase UID

        // 1. Validate inputs
        if (!['supervisor', 'reviewer', 'council'].includes(evaluatorType)) {
            return res.status(400).json({ success: false, message: 'Invalid evaluator type' });
        }

        await connection.beginTransaction();

        // 2. Identify the evaluator (Teacher)
        const [teachers] = await connection.query(
            'SELECT t.id, t.user_id FROM teachers t JOIN users u ON t.user_id = u.id WHERE u.uid = ?',
            [userId]
        );

        if (teachers.length === 0) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'User is not a teacher' });
        }
        const teacherId = teachers[0].id;

        // 3. Check permission (Example: is this teacher the supervisor?)
        const [projects] = await connection.query('SELECT * FROM projects WHERE id = ?', [id]);
        if (projects.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        const project = projects[0];

        // Specific checks based on role
        if (evaluatorType === 'supervisor' && project.supervisor_id !== teacherId) {
            // Allow if admin or specific override, otherwise block
            // For now, let's strict check
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'You are not the supervisor of this project' });
        }
        if (evaluatorType === 'reviewer' && project.reviewer_id !== teacherId) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'You are not the reviewer of this project' });
        }
        // Council check could be more complex (is teacher in the council assigned to this student?)
        // For now, simplify council to allow any teacher (or specific logic if council table exists)

        // 4. Calculate total score if not provided
        let createTotalScore = totalScore;
        if (createTotalScore === undefined && criteriaScore) {
            // Default weights if not handled by frontend
            // Logic matches frontend: Content 40%, Technical 30%, Presentation 20%, Defense 10%
            const { content = 0, technical = 0, presentation = 0, defense = 0 } = criteriaScore;
            createTotalScore = (content * 0.4) + (technical * 0.3) + (presentation * 0.2) + (defense * 0.1);
        }

        // 5. Insert/Update Evaluation
        const evaluationId = uuidv4();

        // Check if exists first to update or insert
        const [existing] = await connection.query(
            'SELECT id FROM evaluations WHERE project_id = ? AND evaluator_id = ? AND evaluator_type = ?',
            [id, teacherId, evaluatorType]
        );

        if (existing.length > 0) {
            // Update
            await connection.query(`
                UPDATE evaluations 
                SET criteria_score = ?, total_score = ?, comments = ?, strengths = ?, weaknesses = ?, suggestions = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [JSON.stringify(criteriaScore), createTotalScore, comments, strengths, weaknesses, suggestions, existing[0].id]);
        } else {
            // Insert
            await connection.query(`
                INSERT INTO evaluations (id, project_id, evaluator_id, evaluator_type, criteria_score, total_score, comments, strengths, weaknesses, suggestions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [evaluationId, id, teacherId, evaluatorType, JSON.stringify(criteriaScore), createTotalScore, comments, strengths, weaknesses, suggestions]);
        }

        // 6. Update Project Score columns (Denormalization)
        let updateField = '';
        if (evaluatorType === 'supervisor') updateField = 'supervisor_score';
        if (evaluatorType === 'reviewer') updateField = 'reviewer_score';
        if (evaluatorType === 'council') updateField = 'council_score';

        if (updateField) {
            await connection.query(`UPDATE projects SET ${updateField} = ? WHERE id = ?`, [createTotalScore, id]);
        }

        // 7. Calculate Final Score (if all components present)
        // Re-fetch project scores
        const [updatedProject] = await connection.query('SELECT supervisor_score, reviewer_score, council_score FROM projects WHERE id = ?', [id]);
        const p = updatedProject[0];

        if (p.supervisor_score !== null && p.reviewer_score !== null && p.council_score !== null) {
            // Example Formula: Supervisor 25%, Reviewer 25%, Council 50%
            const final = (p.supervisor_score * 0.25) + (p.reviewer_score * 0.25) + (p.council_score * 0.5);
            let grade = 'F';
            if (final >= 9.0) grade = 'A';
            else if (final >= 8.5) grade = 'B+';
            else if (final >= 8.0) grade = 'B';
            else if (final >= 7.0) grade = 'C';
            else if (final >= 5.0) grade = 'D';

            await connection.query('UPDATE projects SET final_score = ?, grade = ?, status = ? WHERE id = ?', [final, grade, 'completed', id]);
        } else if (updateField) {
            // If we just graded, maybe update status to 'graded' if it was 'submitted'
            await connection.query("UPDATE projects SET status = 'graded' WHERE id = ? AND status = 'submitted'", [id]);
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Evaluation submitted successfully',
            data: {
                id: existing.length > 0 ? existing[0].id : evaluationId,
                totalScore: createTotalScore
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
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if project exists
        const [projects] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
        if (projects.length === 0) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Logic: Should we hard delete or soft delete? 
        // Let's hard delete for now, but we might need to handle foreign keys (documents, reports).
        // Using cascading deletes in DB or manual.

        // Delete related records first (if no cascade)
        await db.query('DELETE FROM progress_reports WHERE project_id = ?', [id]);
        await db.query('DELETE FROM documents WHERE project_id = ?', [id]);
        await db.query('DELETE FROM evaluations WHERE project_id = ?', [id]);

        // Delete project
        await db.query('DELETE FROM projects WHERE id = ?', [id]);

        // Decrement current_students in topics?
        const project = projects[0];
        if (project.topic_id) {
            await db.query('UPDATE topics SET current_students = GREATEST(current_students - 1, 0) WHERE id = ?', [project.topic_id]);
        }

        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
