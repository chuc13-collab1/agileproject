// Student Dashboard Page
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import * as projectService from '../../services/api/project.service';
import styles from './Dashboard.module.css';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    hasProject: false,
    projectStatus: '',
    pendingReports: 0,
    completedReports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const allProjects = await projectService.getAllProjects();
      const myProject = allProjects.find(p => p.studentId === user?.uid);

      if (myProject) {
        setStats({
          hasProject: true,
          projectStatus: myProject.status,
          pendingReports: 0, // Would fetch from reports API
          completedReports: 0 // Would fetch from reports API
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.dashboard}>
        <div className={styles.welcomeSection}>
          <h2>Xin chào, {user?.fullName}! 👋</h2>
          <p>Chào mừng bạn đến với hệ thống quản lý đồ án</p>
        </div>

        <div className={styles.statsGrid}>
          <div
            className={styles.statCard}
            onClick={() => navigate('/student/my-project')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.statIcon}>📝</div>
            <div className={styles.statContent}>
              <h3>Đồ án của tôi</h3>
              <p className={styles.statNumber}>{stats.hasProject ? '1' : '0'}</p>
              <p className={styles.statLabel}>
                {stats.hasProject ? `Trạng thái: ${getStatusText(stats.projectStatus)}` : 'Chưa đăng ký'}
              </p>
            </div>
          </div>

          <div
            className={styles.statCard}
            onClick={() => navigate('/student/reports')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <h3>Báo cáo tiến độ</h3>
              <p className={styles.statNumber}>{stats.completedReports}</p>
              <p className={styles.statLabel}>Báo cáo đã nộp</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏰</div>
            <div className={styles.statContent}>
              <h3>Cần làm</h3>
              <p className={styles.statNumber}>{stats.pendingReports}</p>
              <p className={styles.statLabel}>Báo cáo cần nộp</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💬</div>
            <div className={styles.statContent}>
              <h3>Thông báo</h3>
              <p className={styles.statNumber}>0</p>
              <p className={styles.statLabel}>Thông báo mới</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          {!stats.hasProject ? (
            <button
              onClick={() => navigate('/student/topics')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 500
              }}
            >
              📚 Xem danh sách đề tài
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/student/my-project')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                📋 Xem đồ án của tôi
              </button>
              <button
                onClick={() => navigate('/student/reports/submit')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                ➕ Nộp báo cáo tiến độ
              </button>
              <button
                onClick={() => navigate('/student/documents')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                📁 Quản lý tài liệu
              </button>
            </>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            Đang tải dữ liệu...
          </div>
        )}
      </div>
    </MainLayout>
  );
};

const getStatusText = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Chờ duyệt',
    'approved': 'Đã duyệt',
    'in-progress': 'Đang thực hiện',
    'submitted': 'Đã nộp',
    'completed': 'Hoàn thành',
    'rejected': 'Bị từ chối'
  };
  return statusMap[status] || status;
};

export default StudentDashboard;
