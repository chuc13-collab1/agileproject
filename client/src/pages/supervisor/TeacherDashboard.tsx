// Teacher Dashboard Page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';
import * as projectService from '../../services/api/project.service';
import { auth } from '../../services/firebase/config';

interface Project {
  id: string;
  title: string;
  studentName: string;
  status: string;
  field?: string;
}

interface PendingReport {
  id: string;
  week_number: number;
  student_name: string;
  topic_title: string;
  submitted_date: string;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({
    studentCount: 0,
    topicCount: 0,
    pendingCount: 0,
    completedCount: 0
  });
  const [activeProjects, setActiveProjects] = React.useState<Project[]>([]);
  const [pendingReports, setPendingReports] = React.useState<PendingReport[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user) {
      loadStats();
      loadActiveProjects();
      loadPendingReports();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const allProjects = await projectService.getAllProjects();
      const myProjects = allProjects.filter(p => p.supervisor?.id === user?.uid);

      setStats({
        studentCount: myProjects.filter(p => p.status !== 'failed').length,
        topicCount: myProjects.length,
        pendingCount: myProjects.filter(p => p.status === 'submitted' || p.status === 'registered').length,
        completedCount: myProjects.filter(p => p.status === 'completed').length
      });
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  const loadActiveProjects = async () => {
    try {
      const allProjects = await projectService.getAllProjects();
      const myActiveProjects = allProjects
        .filter(p => p.supervisor?.id === user?.uid)
        .filter(p => ['in_progress', 'registered', 'submitted'].includes(p.status))
        .slice(0, 5); // Only show 5 most recent

      setActiveProjects(myActiveProjects);
    } catch (error) {
      console.error('Failed to load active projects', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingReports = async () => {
    try {
      if (!auth.currentUser) {
        console.log('No authenticated user');
        return;
      }

      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:3001/api/progress-reports/teachers/${user?.uid}/progress-reports?status=submitted`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setPendingReports(data.data.reports.slice(0, 5)); // Only show 5 most recent
      }
    } catch (error) {
      console.error('Failed to load pending reports', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { text: string; color: string; bg: string } } = {
      registered: { text: '📝 Đã đăng ký', color: '#1e40af', bg: '#dbeafe' },
      in_progress: { text: '⚙️ Đang thực hiện', color: '#0891b2', bg: '#cffafe' },
      submitted: { text: '📤 Đã nộp', color: '#ca8a04', bg: '#fef9c3' },
      graded: { text: '📊 Đã chấm', color: '#16a34a', bg: '#dcfce7' },
      completed: { text: '✅ Hoàn thành', color: '#166534', bg: '#bbf7d0' },
    };
    const badge = badges[status] || { text: status, color: '#64748b', bg: '#f1f5f9' };
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: badge.color,
        background: badge.bg
      }}>
        {badge.text}
      </span>
    );
  };

  return (
    <MainLayout>
      <div className={styles.dashboard}>
        <div className={styles.welcomeSection}>
          <h2>Xin chào, {user?.fullName}! 👋</h2>
          <p>Quản lý đồ án và hướng dẫn sinh viên</p>
        </div>

        <div className={styles.statsGrid}>
          <div
            className={styles.statCard}
            onClick={() => navigate('/teacher/students')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>Sinh viên</h3>
              <p className={styles.statNumber}>{stats.studentCount}</p>
              <p className={styles.statLabel}>Sinh viên đang hướng dẫn</p>
            </div>
          </div>

          <div
            className={styles.statCard}
            onClick={() => navigate('/teacher/students')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.statIcon}>📚</div>
            <div className={styles.statContent}>
              <h3>Đồ án</h3>
              <p className={styles.statNumber}>{stats.topicCount}</p>
              <p className={styles.statLabel}>Đồ án đang hướng dẫn</p>
            </div>
          </div>

          <div
            className={styles.statCard}
            onClick={() => navigate('/teacher/progress-tracking')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.statIcon}>⏰</div>
            <div className={styles.statContent}>
              <h3>Chờ duyệt</h3>
              <p className={styles.statNumber}>{stats.pendingCount}</p>
              <p className={styles.statLabel}>Yêu cầu/Báo cáo cần duyệt</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <h3>Hoàn thành</h3>
              <p className={styles.statNumber}>{stats.completedCount}</p>
              <p className={styles.statLabel}>Đồ án đã hoàn thành</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button
            className={styles.actionBtn}
            onClick={() => navigate('/teacher/progress-tracking')}
          >
            📊 Xem Báo Cáo Tiến Độ
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => navigate('/teacher/topic-proposal')}
          >
            ➕ Đề Xuất Đề Tài Mới
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => navigate('/teacher/proposals')}
            style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' }}
          >
            📝 Duyệt Đề Xuất SV
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => navigate('/teacher/students')}
          >
            👥 Quản Lý Sinh Viên
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => navigate('/teacher/statistics')}
          >
            📈 Thống Kê Chi Tiết
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => navigate('/teacher/calendar')}
          >
            📅 Lịch Làm Việc
          </button>
        </div>

        <div className={styles.contentSection}>
          {/* Active Projects */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>📋 Đồ án đang hướng dẫn</h3>
              <button
                onClick={() => navigate('/teacher/students')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Xem tất cả →
              </button>
            </div>

            {loading ? (
              <div className={styles.emptyState}>
                <p>⏳ Đang tải...</p>
              </div>
            ) : activeProjects.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Chưa có đồ án nào</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/teacher/projects/${project.id}`)}
                    style={{
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: '0.5rem',
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a', flex: 1 }}>{project.title}</div>
                      {getStatusBadge(project.status)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      👤 {project.studentName} • {project.field || 'Chưa phân loại'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Reports */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>📝 Báo cáo cần duyệt</h3>
              <button
                onClick={() => navigate('/teacher/progress-tracking')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Xem tất cả →
              </button>
            </div>

            {loading ? (
              <div className={styles.emptyState}>
                <p>⏳ Đang tải...</p>
              </div>
            ) : pendingReports.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Không có báo cáo nào cần duyệt</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => navigate('/teacher/progress-tracking')}
                    style={{
                      padding: '1rem',
                      background: '#fffbeb',
                      borderRadius: '0.5rem',
                      border: '1px solid #fde68a',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#fef3c7';
                      e.currentTarget.style.borderColor = '#fcd34d';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#fffbeb';
                      e.currentTarget.style.borderColor = '#fde68a';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>Tuần {report.week_number}</div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#b45309',
                        background: '#fde68a'
                      }}>
                        ⏰ Chờ duyệt
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.25rem' }}>
                      {report.topic_title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#a16207' }}>
                      👤 {report.student_name} • {new Date(report.submitted_date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeacherDashboard;
