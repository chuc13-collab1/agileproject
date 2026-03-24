import dotenv from 'dotenv';
dotenv.config(); // Must be FIRST before any other imports

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import './config/database.js'; // Initialize database connection
import './config/firebase.js'; // Initialize Firebase Admin
import { verifyToken } from './middleware/auth.js';
import pool from './config/database.js'; // Ensure pool is imported
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import studentRoutes from './routes/students.js';
import teacherRoutes from './routes/teachers.js';
import adminRoutes from './routes/admins.js';
import announcementRoutes from './routes/announcements.js';
import classesRouter from './routes/classes.js';
import topicRoutes from './routes/topics.js';
import statsRoutes from './routes/stats.js';
import teacherGroupRoutes from './routes/teacherGroups.js';
import projectRoutes from './routes/projects.js';
import progressReportRoutes from './routes/progressReports.js';
import evaluationRoutes from './routes/evaluations.js';
import uploadRoutes from './routes/uploads.js';
import topicProposalRoutes from './routes/topicProposals.js';
import authRoutes from './routes/auth.js';
import schedulingRoutes from './routes/scheduling.js';
import notificationRoutes from './routes/notifications.js';
import archiveRoutes from './routes/archive.js';
import aiRoutes from './routes/ai.js';
import sprintRoutes from './routes/sprints.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow all cross-origin requests for now to fix production CORS issues
        callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: true, limit: '1000mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// TEMPORARY: Test email SMTP connection
app.get('/api/test-email', async (req, res) => {
    try {
        const nodemailer = (await import('nodemailer')).default;
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
            connectionTimeout: 10000,
        });
        await transporter.verify();
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: '✅ SMTP Test từ Railway',
            text: 'Email SMTP đang hoạt động bình thường!',
        });
        res.json({ success: true, message: 'SMTP OK', messageId: info.messageId, emailUser: process.env.EMAIL_USER });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message, code: error.code });
    }
});

// TEMPORARY: Public DB setup endpoint
app.get('/api/setup-db', async (req, res) => {
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS \`documents\` (
                \`id\` varchar(36) NOT NULL,
                \`project_id\` varchar(36) NOT NULL,
                \`document_type\` enum('outline', 'report', 'slides', 'source_code', 'other') NOT NULL,
                \`file_name\` varchar(255) NOT NULL,
                \`file_path\` varchar(500) NOT NULL,
                \`file_size\` bigint(20) DEFAULT NULL,
                \`mime_type\` varchar(100) DEFAULT NULL,
                \`version\` int(11) DEFAULT 1,
                \`is_latest\` tinyint(1) DEFAULT 1,
                \`uploaded_by\` varchar(36) NOT NULL,
                \`description\` text DEFAULT NULL,
                \`uploaded_at\` timestamp NOT NULL DEFAULT current_timestamp(),
                \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                PRIMARY KEY (\`id\`),
                KEY \`idx_project_id\` (\`project_id\`),
                CONSTRAINT \`fk_documents_project_setup_v2\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await pool.query(sql);
        res.send('✅ Database setup successful! The "documents" table has been created. You can now close this page.');
    } catch (error) {
        console.error('Setup DB error:', error);
        res.status(500).send('❌ Setup failed: ' + error.message);
    }
});

// API routes (with authentication)
app.use('/api/auth', verifyToken, authRoutes);
app.use('/api/students', verifyToken, studentRoutes);
app.use('/api/teachers', verifyToken, teacherRoutes);
app.use('/api/admins', verifyToken, adminRoutes);
app.use('/api/announcements', verifyToken, announcementRoutes);
app.use('/api/classes', verifyToken, classesRouter);
app.use('/api/topics', verifyToken, topicRoutes);
app.use('/api/stats', verifyToken, statsRoutes);
app.use('/api/teacher-groups', verifyToken, teacherGroupRoutes);
app.use('/api/projects', verifyToken, projectRoutes);
app.use('/api/progress-reports', verifyToken, progressReportRoutes);
app.use('/api/evaluations', verifyToken, evaluationRoutes);
app.use('/api/uploads', verifyToken, uploadRoutes);
app.use('/api/topic-proposals', verifyToken, topicProposalRoutes);
app.use('/api/scheduling', verifyToken, schedulingRoutes);
app.use('/api/notifications', verifyToken, notificationRoutes);
app.use('/api/archive', verifyToken, archiveRoutes);
app.use('/api/ai', verifyToken, aiRoutes);
app.use('/api/sprints', verifyToken, sprintRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`
  ╔════════════════════════════════════════╗
  ║  🚀 Server Started Successfully       ║
  ╠════════════════════════════════════════╣
  ║  Port: ${PORT.toString().padEnd(29)}║
  ║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(23)}║
  ║  Database: MySQL                      ║
  ║  Auth: Firebase                       ║
  ╚════════════════════════════════════════╝
  
  📡 API Endpoints:
     GET    /health
     GET    /api/students
     POST   /api/students
     PUT    /api/students/:id
     DELETE /api/students/:id
     PATCH  /api/students/:id/toggle-active
     POST   /api/students/batch-import
     
     GET    /api/teachers
     POST   /api/teachers
     PUT    /api/teachers/:id
     DELETE /api/teachers/:id
     PATCH  /api/teachers/:id/toggle-active
     
     GET    /api/admins
     POST   /api/admins
     DELETE /api/admins/:id
     PATCH  /api/admins/:id/toggle-active
     
     GET    /api/classes
     POST   /api/classes
     PUT    /api/classes/:id
     DELETE /api/classes/:id
     GET    /api/classes/:classCode/students
  `);
});

export default app;
