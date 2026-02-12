import express from 'express';
import pool from '../config/database.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/debug/topics
 * Get current state of topics (for debugging)
 */
router.get('/topics', verifyToken, isAdmin, async (req, res, next) => {
    try {
        const [topics] = await pool.query(`
            SELECT 
                id, 
                title, 
                supervisor_id,
                current_students, 
                max_students, 
                status,
                created_at
            FROM topics
            ORDER BY created_at DESC
        `);

        const [projects] = await pool.query(`
            SELECT 
                id,
                topic_id,
                student_id,
                status
            FROM projects
        `);

        res.json({
            success: true,
            data: {
                topics,
                projects,
                summary: {
                    totalTopics: topics.length,
                    totalProjects: projects.length
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/debug/reset-topic-counts
 * Reset all topic current_students to 0
 */
router.post('/reset-topic-counts', verifyToken, isAdmin, async (req, res, next) => {
    try {
        await pool.query('UPDATE topics SET current_students = 0');

        const [topics] = await pool.query('SELECT id, title, current_students, max_students FROM topics');

        res.json({
            success: true,
            message: 'Reset all topic counts to 0',
            data: topics
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/debug/create-projects-table
 * Create projects table if it doesn't exist
 */
router.post('/create-projects-table', verifyToken, isAdmin, async (req, res, next) => {
    try {
        // Create projects table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`projects\` (
              \`id\` varchar(36) NOT NULL COMMENT 'UUID',
              \`topic_id\` varchar(36) NOT NULL,
              \`student_id\` varchar(36) NOT NULL,
              \`supervisor_id\` varchar(36) NOT NULL COMMENT 'Teacher who supervises',
              \`reviewer_id\` varchar(36) DEFAULT NULL COMMENT 'Teacher who reviews',
              \`status\` enum('registered','in_progress','submitted','graded','completed','failed') DEFAULT 'registered',
              \`registration_date\` timestamp NOT NULL DEFAULT current_timestamp(),
              \`start_date\` date DEFAULT NULL,
              \`end_date\` date DEFAULT NULL,
              \`defense_date\` datetime DEFAULT NULL,
              \`final_grade\` decimal(4,2) DEFAULT NULL COMMENT 'Final grade 0-10',
              \`notes\` text DEFAULT NULL,
              \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
              \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
              PRIMARY KEY (\`id\`),
              KEY \`idx_topic\` (\`topic_id\`),
              KEY \`idx_student\` (\`student_id\`),
              KEY \`idx_supervisor\` (\`supervisor_id\`),
              KEY \`idx_reviewer\` (\`reviewer_id\`),
              KEY \`idx_status\` (\`status\`),
              CONSTRAINT \`fk_projects_topic\` FOREIGN KEY (\`topic_id\`) REFERENCES \`topics\` (\`id\`) ON DELETE CASCADE,
              CONSTRAINT \`fk_projects_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE,
              CONSTRAINT \`fk_projects_supervisor\` FOREIGN KEY (\`supervisor_id\`) REFERENCES \`teachers\` (\`id\`) ON DELETE RESTRICT,
              CONSTRAINT \`fk_projects_reviewer\` FOREIGN KEY (\`reviewer_id\`) REFERENCES \`teachers\` (\`id\`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        res.json({
            success: true,
            message: 'Projects table created successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/debug/add-topic-columns
 * Add missing columns to topics table
 */
router.post('/add-topic-columns', verifyToken, isAdmin, async (req, res, next) => {
    try {
        // Try to add requirements column
        try {
            await pool.query(`
                ALTER TABLE topics 
                ADD COLUMN requirements TEXT DEFAULT NULL COMMENT 'Project requirements'
            `);
        } catch (e) {
            // Column might already exist, ignore error
        }

        // Try to add expected_results column
        try {
            await pool.query(`
                ALTER TABLE topics 
                ADD COLUMN expected_results TEXT DEFAULT NULL COMMENT 'Expected project results'
            `);
        } catch (e) {
            // Column might already exist, ignore error
        }

        res.json({
            success: true,
            message: 'Topic columns added successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
