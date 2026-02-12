import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import StudentDashboard from '../pages/student/StudentDashboard';
import TopicBrowsing from '../pages/student/TopicBrowsing';
import TopicRegistration from '../pages/student/TopicRegistration';
import MyProject from '../pages/student/MyProject';
import ProgressReports from '../pages/student/ProgressReports';
import SubmitReport from '../pages/student/SubmitReport';
import DocumentManagement from '../pages/student/DocumentManagement';
import ProjectResults from '../pages/student/ProjectResults';
import StudentTopicProposal from '../pages/student/StudentTopicProposal';
import TeacherDashboard from '../pages/supervisor/TeacherDashboard';
import TeacherTopicList from '../pages/supervisor/TeacherTopicList';
import TeacherStudentList from '../pages/supervisor/TeacherStudentList';
import TeacherProjectDetail from '../pages/supervisor/TeacherProjectDetail';
import TeacherProgressTracking from '../pages/supervisor/TeacherProgressTracking';
import TeacherTopicProposal from '../pages/supervisor/TeacherTopicProposal';
import TeacherProposalReview from '../pages/supervisor/TeacherProposalReview';
import TeacherStatistics from '../pages/supervisor/TeacherStatistics';
import TeacherCalendar from '../pages/supervisor/TeacherCalendar';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProjectManagement from '../pages/admin/ProjectManagement';
import AnnouncementManagement from '../pages/admin/AnnouncementManagement';
import UserManagement from '../pages/admin/UserManagement';
import TopicManagement from '../pages/admin/TopicManagement';
import ReviewerAssignment from '../pages/admin/ReviewerAssignment';
import ClassAssignment from '../pages/admin/ClassAssignment';
import Statistics from '../pages/admin/Statistics';
import Unauthorized from '../pages/auth/Unauthorized';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement, allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Role-based routing
const RoleDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
    case 'supervisor':
    case 'reviewer':
      return <TeacherDashboard />;
    default:
      return <StudentDashboard />;
  }
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleDashboard />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/topics" element={
        <ProtectedRoute allowedRoles={['student']}>
          <TopicBrowsing />
        </ProtectedRoute>
      } />
      <Route path="/student/topics/register/:topicId" element={
        <ProtectedRoute allowedRoles={['student']}>
          <TopicRegistration />
        </ProtectedRoute>
      } />
      <Route path="/student/my-project" element={
        <ProtectedRoute allowedRoles={['student']}>
          <MyProject />
        </ProtectedRoute>
      } />
      <Route path="/student/reports" element={
        <ProtectedRoute allowedRoles={['student']}>
          <ProgressReports />
        </ProtectedRoute>
      } />
      <Route path="/student/reports/submit" element={
        <ProtectedRoute allowedRoles={['student']}>
          <SubmitReport />
        </ProtectedRoute>
      } />
      <Route path="/student/documents" element={
        <ProtectedRoute allowedRoles={['student']}>
          <DocumentManagement />
        </ProtectedRoute>
      } />
      <Route path="/student/results" element={
        <ProtectedRoute allowedRoles={['student']}>
          <ProjectResults />
        </ProtectedRoute>
      } />
      <Route path="/student/propose-topic" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentTopicProposal />
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/topics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TopicManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute>
            <ProjectManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <ProtectedRoute>
            <AnnouncementManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reviewer-assignment"
        element={
          <ProtectedRoute>
            <ReviewerAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/statistics"
        element={
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/class-assignment"
        element={
          <ProtectedRoute>
            <ClassAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/topics"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'supervisor']}>
            <TeacherTopicList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/students"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'supervisor']}>
            <TeacherStudentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/projects/:projectId"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'supervisor']}>
            <TeacherProjectDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/progress-tracking"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'supervisor']}>
            <TeacherProgressTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/topic-proposal"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'supervisor']}>
            <TeacherTopicProposal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/proposals"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'supervisor']}>
            <TeacherProposalReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/statistics"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'supervisor']}>
            <TeacherStatistics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/calendar"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'supervisor']}>
            <TeacherCalendar />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
