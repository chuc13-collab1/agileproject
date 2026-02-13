import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import './config/database.js'; // Initialize database connection
import './config/firebase.js'; // Initialize Firebase Admin
import { verifyToken } from './middleware/auth.js';
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

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
