import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { createNotification } from '../utils/notificationHelper.js';

// ─── Score Calculation ────────────────────────────────────────────────
const SCORE_WEIGHTS = {
    content: 0.4,
    technical: 0.3,
    presentation: 0.2,
    defense: 0.1,
};

const GRADE_SCALE = [
    { min: 9.0, grade: 'A' },
    { min: 8.5, grade: 'B+' },
    { min: 8.0, grade: 'B' },
    { min: 7.0, grade: 'C' },
    { min: 5.0, grade: 'D' },
    { min: 0, grade: 'F' },
];

const VALID_STATUSES = ['registered', 'in_progress', 'submitted', 'graded', 'completed', 'failed'];

export function calculateCriteriaScore(criteriaScore) {
    const { content = 0, technical = 0, presentation = 0, defense = 0 } = criteriaScore;
    return (
        content * SCORE_WEIGHTS.content +
        technical * SCORE_WEIGHTS.technical +
        presentation * SCORE_WEIGHTS.presentation +
        defense * SCORE_WEIGHTS.defense
    );
}

export function calculateFinalScore(supervisorScore, reviewerScore, councilScore) {
    return supervisorScore * 0.25 + reviewerScore * 0.25 + councilScore * 0.5;
}

export function resolveGrade(score) {
    for (const { min, grade } of GRADE_SCALE) {
        if (score >= min) return grade;
    }
    return 'F';
}

// ─── Project Queries (Repository-style) ──────────────────────────────

const PROJECT_BASE_SELECT = `
    SELECT
        p.*,
        t.title   AS topic_title,
        t.field,
        t.description AS topic_description,
        u_student.display_name  AS student_name,
        u_student.email         AS student_email,
        u_student.uid           AS student_uid,
        s.student_id            AS student_code,
        s.class_name,
        COALESCE(u_supervisor.display_name, u_topic_supervisor.display_name) AS supervisor_name,
        COALESCE(u_supervisor.uid,          u_topic_supervisor.uid)          AS supervisor_uid,
        u_reviewer.display_name AS reviewer_name,
        u_reviewer.uid          AS reviewer_uid
    FROM projects p
    INNER JOIN topics      t           ON p.topic_id   = t.id
    INNER JOIN students    s           ON p.student_id  = s.id
    INNER JOIN users       u_student   ON s.user_id     = u_student.id
    LEFT  JOIN teachers    te          ON p.supervisor_id = te.id
    LEFT  JOIN users       u_supervisor ON te.user_id    = u_supervisor.id
    LEFT  JOIN users       u_topic_supervisor ON t.supervisor_id = u_topic_supervisor.id
    LEFT  JOIN teachers    tr          ON p.reviewer_id = tr.id
    LEFT  JOIN users       u_reviewer  ON tr.user_id    = u_reviewer.id
`;

function formatProject(p) {
    return {
        id: p.id,
        title: p.topic_title,
        description: p.description || p.topic_description || '',
        studentId: p.student_uid,
        studentName: p.student_name,
        studentEmail: p.student_email,
        studentCode: p.student_code,
        className: p.class_name,
        supervisor: p.supervisor_name ? { id: p.supervisor_uid, name: p.supervisor_name } : null,
        reviewer: p.reviewer_name ? { id: p.reviewer_uid, name: p.reviewer_name } : null,
        field: p.field,
        registrationDate: p.registration_date,
        status: p.status,
        semester: p.semester || '1',
        academicYear: p.academic_year || '2024-2025',
        reportDeadline: p.report_deadline,
        supervisorComment: p.supervisor_comment || '',
        supervisorScore: p.supervisor_score ?? null,
        reviewerScore: p.reviewer_score ?? null,
        councilScore: p.council_score ?? null,
        finalScore: p.final_score ?? null,
        grade: p.grade ?? null,
        createdAt: p.created_at,
    };
}

// ─── Service Methods ──────────────────────────────────────────────────

export async function getAllProjects() {
    const [rows] = await db.query(
        `${PROJECT_BASE_SELECT} WHERE p.archived_at IS NULL ORDER BY p.created_at DESC`
    );
    return rows.map(formatProject);
}

export async function getProjectsByTeacher(teacherUserId) {
    const [rows] = await db.query(
        `SELECT
            p.*,
            t.title AS topic_title,
            t.field,
            u.display_name AS student_name,
            s.student_id   AS student_code,
            s.class_name,
            (SELECT COUNT(*) FROM progress_reports pr
             WHERE pr.project_id = p.id AND pr.status = 'submitted') AS unreviewed_reports
         FROM projects p
         INNER JOIN topics   t ON p.topic_id  = t.id
         INNER JOIN students s ON p.student_id = s.id
         INNER JOIN users    u ON s.user_id    = u.id
         WHERE p.supervisor_id = (SELECT id FROM teachers WHERE user_id = ?)
         ORDER BY p.created_at DESC`,
        [teacherUserId]
    );
    return rows;
}

export async function getReviewProjectsByTeacher(teacherUserId) {
    const [rows] = await db.query(
        `SELECT
            p.*,
            t.title AS topic_title,
            t.field,
            u.display_name        AS student_name,
            u.email               AS student_email,
            s.student_id          AS student_code,
            s.class_name,
            u_supervisor.display_name AS supervisor_name
         FROM projects p
         INNER JOIN topics    t           ON p.topic_id     = t.id
         INNER JOIN students  s           ON p.student_id   = s.id
         INNER JOIN users     u           ON s.user_id      = u.id
         LEFT  JOIN teachers  te          ON p.supervisor_id = te.id
         LEFT  JOIN users     u_supervisor ON te.user_id    = u_supervisor.id
         WHERE p.reviewer_id = (SELECT id FROM teachers WHERE user_id = ?)
         ORDER BY p.created_at DESC`,
        [teacherUserId]
    );
    return rows.map(p => ({
        id: p.id,
        title: p.topic_title,
        studentName: p.student_name,
        studentEmail: p.student_email,
        studentCode: p.student_code,
        className: p.class_name,
        field: p.field,
        status: p.status,
        supervisorName: p.supervisor_name,
        supervisorScore: p.supervisor_score,
        reviewerScore: p.reviewer_score,
        finalScore: p.final_score,
        grade: p.grade,
        createdAt: p.created_at,
    }));
}

export async function getProjectById(id) {
    const [rows] = await db.query(
        `${PROJECT_BASE_SELECT} WHERE p.id = ?`,
        [id]
    );
    if (rows.length === 0) return null;

    const project = formatProject(rows[0]);

    // Fetch related data — gracefully handle missing tables
    const safeQuery = async (sql, params, fallback = []) => {
        try {
            const [result] = await db.query(sql, params);
            return result;
        } catch (err) {
            if (err.code === 'ER_NO_SUCH_TABLE') return fallback;
            throw err;
        }
    };

    project.progressReports = await safeQuery(
        'SELECT * FROM progress_reports WHERE project_id = ? ORDER BY week_number ASC',
        [id]
    );
    project.documents = await safeQuery(
        'SELECT * FROM documents WHERE project_id = ? AND is_latest = TRUE ORDER BY document_type, uploaded_at DESC',
        [id]
    );
    project.evaluations = await safeQuery(
        `SELECT e.*, u.display_name AS evaluator_name
         FROM evaluations e
         INNER JOIN teachers t ON e.evaluator_id = t.id
         INNER JOIN users    u ON t.user_id = u.id
         WHERE e.project_id = ?`,
        [id]
    );

    return project;
}

export async function getProjectByStudentUid(studentUid) {
    const [rows] = await db.query(
        `${PROJECT_BASE_SELECT}
         WHERE u_student.uid = ? AND p.archived_at IS NULL
         ORDER BY p.created_at DESC LIMIT 1`,
        [studentUid]
    );
    if (rows.length === 0) return null;
    return formatProject(rows[0]);
}

export async function createProject({ topicId, studentId, supervisorId, studentEmail, studentName }) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Check student already has active project
        const [existing] = await connection.query(
            `SELECT COUNT(*) AS count FROM projects p
             INNER JOIN students s ON p.student_id = s.id
             WHERE s.user_id = ? AND p.status NOT IN ('completed', 'failed')`,
            [studentId]
        );
        if (existing[0].count > 0) {
            throw Object.assign(new Error('Student already has an active project'), { statusCode: 400 });
        }

        // Validate topic availability
        const [topics] = await connection.query(
            'SELECT current_students, max_students, supervisor_id FROM topics WHERE id = ?',
            [topicId]
        );
        if (topics.length === 0) {
            throw Object.assign(new Error('Topic not found'), { statusCode: 404 });
        }
        if (topics[0].current_students >= topics[0].max_students) {
            throw Object.assign(new Error('Topic has reached maximum students'), { statusCode: 400 });
        }

        const finalSupervisorId = supervisorId || topics[0].supervisor_id;

        // Resolve teacher DB id
        let supervisorDbId = null;
        if (finalSupervisorId) {
            const [teachers] = await connection.query('SELECT id FROM teachers WHERE user_id = ?', [finalSupervisorId]);
            if (teachers.length > 0) supervisorDbId = teachers[0].id;
        }

        // Ensure student DB record exists
        const studentDbId = await ensureStudentRecord(connection, studentId, studentEmail, studentName);

        // Create project
        const projectId = uuidv4();
        await connection.query(
            `INSERT INTO projects (id, topic_id, student_id, supervisor_id, status) VALUES (?, ?, ?, ?, 'registered')`,
            [projectId, topicId, studentDbId, supervisorDbId]
        );

        // Update counters
        await connection.query(
            'UPDATE topics SET current_students = current_students + 1 WHERE id = ?',
            [topicId]
        );
        if (finalSupervisorId) {
            await connection.query(
                'UPDATE teachers SET current_students = current_students + 1 WHERE user_id = ?',
                [finalSupervisorId]
            );

            // Notify supervisor
            const [topicInfo] = await connection.query('SELECT title FROM topics WHERE id = ?', [topicId]);
            await createNotification({
                userUid: finalSupervisorId,
                title: 'Sinh viên đăng ký đồ án',
                message: `Có sinh viên mới đăng ký đồ án "${topicInfo[0]?.title || ''}".`,
                type: 'project',
                link: '/teacher/topics',
                connection,
            });
        }

        await connection.commit();
        return { projectId };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

export async function updateProjectStatus(id, status) {
    if (!VALID_STATUSES.includes(status)) {
        throw Object.assign(new Error('Invalid status'), { statusCode: 400 });
    }

    await db.query(
        'UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
    );

    // Notify student
    const [projectInfo] = await db.query(
        `SELECT u.uid AS student_uid, t.title AS topic_title
         FROM projects p
         INNER JOIN students s ON p.student_id = s.id
         INNER JOIN users    u ON s.user_id = u.id
         INNER JOIN topics   t ON p.topic_id = t.id
         WHERE p.id = ?`,
        [id]
    );

    const STATUS_MESSAGES = {
        in_progress: { title: 'Đồ án được duyệt', message: (title) => `Đồ án "${title}" đã được duyệt và đang thực hiện.`, type: 'success' },
        submitted: { title: 'Đồ án đã nộp', message: (title) => `Đồ án "${title}" đã chuyển sang trạng thái nộp.`, type: 'info' },
        completed: { title: 'Đồ án hoàn thành', message: (title) => `Đồ án "${title}" đã hoàn thành. Chúc mừng bạn!`, type: 'success' },
        failed: { title: 'Đồ án không đạt', message: (title) => `Đồ án "${title}" không đạt yêu cầu.`, type: 'error' },
    };

    if (projectInfo.length > 0) {
        const notif = STATUS_MESSAGES[status];
        if (notif) {
            await createNotification({
                userUid: projectInfo[0].student_uid,
                title: notif.title,
                message: notif.message(projectInfo[0].topic_title),
                type: notif.type,
                link: '/student/my-project',
            });
        }
    }
}

export async function updateProject(id, fields) {
    const { status, supervisorId, reviewerId, reportDeadline, defenseDate, score } = fields;
    const updates = [];
    const values = [];

    if (status !== undefined) {
        if (!VALID_STATUSES.includes(status)) {
            throw Object.assign(
                new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`),
                { statusCode: 400 }
            );
        }
        updates.push('status = ?'); values.push(status);
    }
    if (supervisorId !== undefined) { updates.push('supervisor_id = ?'); values.push(supervisorId); }
    if (reviewerId !== undefined) { updates.push('reviewer_id = ?'); values.push(reviewerId); }
    if (reportDeadline !== undefined) { updates.push('report_deadline = ?'); values.push(new Date(reportDeadline)); }
    if (defenseDate !== undefined) { updates.push('defense_date = ?'); values.push(new Date(defenseDate)); }
    if (score !== undefined) { updates.push('final_score = ?'); values.push(score); }

    if (updates.length === 0) return;

    values.push(id);
    await db.query(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, values);
}

export async function evaluateProject(projectId, evaluatorUid, payload) {
    const { evaluatorType, criteriaScore, totalScore, comments, strengths, weaknesses, suggestions } = payload;

    const VALID_EVALUATOR_TYPES = ['supervisor', 'reviewer', 'council'];
    if (!VALID_EVALUATOR_TYPES.includes(evaluatorType)) {
        throw Object.assign(new Error('Invalid evaluator type'), { statusCode: 400 });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Identify teacher
        const [teachers] = await connection.query(
            'SELECT t.id FROM teachers t JOIN users u ON t.user_id = u.id WHERE u.uid = ?',
            [evaluatorUid]
        );
        if (teachers.length === 0) {
            throw Object.assign(new Error('User is not a teacher'), { statusCode: 403 });
        }
        const teacherId = teachers[0].id;

        // Load project to check permissions
        const [projects] = await connection.query('SELECT * FROM projects WHERE id = ?', [projectId]);
        if (projects.length === 0) {
            throw Object.assign(new Error('Project not found'), { statusCode: 404 });
        }
        const project = projects[0];

        if (evaluatorType === 'supervisor' && project.supervisor_id !== teacherId) {
            throw Object.assign(new Error('You are not the supervisor of this project'), { statusCode: 403 });
        }
        if (evaluatorType === 'reviewer' && project.reviewer_id !== teacherId) {
            throw Object.assign(new Error('You are not the reviewer of this project'), { statusCode: 403 });
        }

        // Compute score
        const finalScore = totalScore !== undefined
            ? totalScore
            : calculateCriteriaScore(criteriaScore || {});

        // Upsert evaluation
        const [existing] = await connection.query(
            'SELECT id FROM evaluations WHERE project_id = ? AND evaluator_id = ? AND evaluator_type = ?',
            [projectId, teacherId, evaluatorType]
        );

        const evaluationId = existing.length > 0 ? existing[0].id : uuidv4();

        if (existing.length > 0) {
            await connection.query(
                `UPDATE evaluations
                 SET criteria_score = ?, total_score = ?, comments = ?,
                     strengths = ?, weaknesses = ?, suggestions = ?,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [JSON.stringify(criteriaScore), finalScore, comments, strengths, weaknesses, suggestions, evaluationId]
            );
        } else {
            await connection.query(
                `INSERT INTO evaluations
                 (id, project_id, evaluator_id, evaluator_type, criteria_score, total_score, comments, strengths, weaknesses, suggestions)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [evaluationId, projectId, teacherId, evaluatorType, JSON.stringify(criteriaScore), finalScore, comments, strengths, weaknesses, suggestions]
            );
        }

        // Update denormalized score column
        const SCORE_FIELD_MAP = { supervisor: 'supervisor_score', reviewer: 'reviewer_score', council: 'council_score' };
        const scoreField = SCORE_FIELD_MAP[evaluatorType];
        if (scoreField) {
            await connection.query(`UPDATE projects SET ${scoreField} = ? WHERE id = ?`, [finalScore, projectId]);
        }

        // Recalculate final score if all 3 present
        const [updatedProject] = await connection.query(
            'SELECT supervisor_score, reviewer_score, council_score FROM projects WHERE id = ?',
            [projectId]
        );
        const p = updatedProject[0];
        if (p.supervisor_score !== null && p.reviewer_score !== null && p.council_score !== null) {
            const computedFinal = calculateFinalScore(p.supervisor_score, p.reviewer_score, p.council_score);
            const grade = resolveGrade(computedFinal);
            await connection.query(
                "UPDATE projects SET final_score = ?, grade = ?, status = 'completed' WHERE id = ?",
                [computedFinal, grade, projectId]
            );
        } else {
            await connection.query(
                "UPDATE projects SET status = 'graded' WHERE id = ? AND status NOT IN ('completed', 'failed')",
                [projectId]
            );
        }

        // Notify student
        const [studentInfo] = await connection.query(
            `SELECT u.uid AS student_uid, t.title AS topic_title
             FROM projects p
             INNER JOIN students s ON p.student_id = s.id
             INNER JOIN users    u ON s.user_id = u.id
             INNER JOIN topics   t ON p.topic_id = t.id
             WHERE p.id = ?`,
            [projectId]
        );
        if (studentInfo.length > 0) {
            const ROLE_LABELS = { supervisor: 'GVHD', reviewer: 'GVPB', council: 'Hội đồng' };
            await createNotification({
                userUid: studentInfo[0].student_uid,
                title: `${ROLE_LABELS[evaluatorType]} đã chấm điểm`,
                message: `Đồ án "${studentInfo[0].topic_title}" đã được ${ROLE_LABELS[evaluatorType]} chấm điểm: ${finalScore?.toFixed(1) || 'N/A'} điểm.`,
                type: 'success',
                link: '/student/results',
                connection,
            });
        }

        await connection.commit();
        return { evaluationId, totalScore: finalScore };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

export async function deleteProject(id) {
    const [projects] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) {
        throw Object.assign(new Error('Project not found'), { statusCode: 404 });
    }

    await db.query('DELETE FROM progress_reports WHERE project_id = ?', [id]);
    await db.query('DELETE FROM documents WHERE project_id = ?', [id]);
    await db.query('DELETE FROM evaluations WHERE project_id = ?', [id]);
    await db.query('DELETE FROM projects WHERE id = ?', [id]);

    if (projects[0].topic_id) {
        await db.query(
            'UPDATE topics SET current_students = GREATEST(current_students - 1, 0) WHERE id = ?',
            [projects[0].topic_id]
        );
    }
}

// ─── Private Helpers ──────────────────────────────────────────────────

async function ensureStudentRecord(connection, studentUid, studentEmail, studentName) {
    const [records] = await connection.query(
        'SELECT s.id FROM students s JOIN users u ON s.user_id = u.id WHERE u.uid = ?',
        [studentUid]
    );
    if (records.length > 0) return records[0].id;

    let [users] = await connection.query('SELECT id FROM users WHERE uid = ?', [studentUid]);

    if (users.length === 0 && studentEmail && studentName) {
        const newUserId = uuidv4();
        await connection.query(
            'INSERT INTO users (id, uid, email, display_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [newUserId, studentUid, studentEmail, studentName, 'student', true]
        );
        [users] = await connection.query('SELECT id FROM users WHERE uid = ?', [studentUid]);
    }

    if (users.length === 0) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    const studentDbId = uuidv4();
    const studentCode = 'S' + Math.floor(100000 + Math.random() * 900000);
    await connection.query(
        'INSERT INTO students (id, user_id, student_id, class_name, major) VALUES (?, ?, ?, ?, ?)',
        [studentDbId, users[0].id, studentCode, 'D20CQCN01-N', 'Software Engineering']
    );
    return studentDbId;
}
