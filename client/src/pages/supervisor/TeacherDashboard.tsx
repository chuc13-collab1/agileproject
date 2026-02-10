// Teacher Dashboard Page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';
import * as topicService from '../../services/api/topic.service';
import * as projectService from '../../services/api/project.service';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({
    studentCount: 0,
    topicCount: 0,
    pendingCount: 0,
    completedCount: 0
  });

  React.useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const [allTopics, allProjects] = await Promise.all([
        topicService.getAllTopics(),
        projectService.getAllProjects()
      ]);

      const myTopics = allTopics.filter(t => t.supervisorId === user?.uid);
      const myProjects = allProjects.filter(p => p.supervisor.id === user?.uid);

      setStats({
        studentCount: myProjects.filter(p => p.status !== 'rejected').length,
        topicCount: myTopics.length,
        pendingCount: myProjects.filter(p => p.status === 'submitted' || p.status === 'pending').length,
        completedCount: myProjects.filter(p => p.status === 'completed').length
      });
    } catch (error) {
      console.error('Failed to load stats', error);
    }
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
            onClick={() => navigate('/teacher/topics')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.statIcon}>📚</div>
            <div className={styles.statContent}>
              <h3>Đồ án</h3>
              <p className={styles.statNumber}>{stats.topicCount}</p>
              <p className={styles.statLabel}>Quản lý đề tài</p>
            </div>
          </div>

          <div className={styles.statCard}>
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
          <div className={styles.card}>
            <h3>📋 Đồ án đang hướng dẫn</h3>
            <div className={styles.emptyState}>
              <p>Chưa có đồ án nào</p>
            </div>
          </div>

          <div className={styles.card}>
            <h3>📝 Báo cáo cần duyệt</h3>
            <div className={styles.emptyState}>
              <p>Không có báo cáo nào cần duyệt</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeacherDashboard;
