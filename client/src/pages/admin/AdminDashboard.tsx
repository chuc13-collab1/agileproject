// Admin Dashboard Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: { total: 0, students: 0, teachers: 0 },
    topics: { total: 0, approved: 0 },
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { auth } = await import('../../services/firebase/config');
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/stats/counts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  return (
    <MainLayout>
      <div className={styles.dashboard}>
        <div className={styles.welcomeSection}>
          <h2>Xin chào, {user?.fullName}! 👋</h2>
          <p>Quản trị hệ thống quản lý đồ án</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>Người dùng</h3>
              <p className={styles.statNumber}>{stats.users.total || 0}</p>
              <p className={styles.statLabel}>Tổng số người dùng</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📚</div>
            <div className={styles.statContent}>
              <h3>Đề tài</h3>
              <p className={styles.statNumber}>{stats.topics.total || 0}</p>
              <p className={styles.statLabel}>Tổng số đề tài</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👨‍🎓</div>
            <div className={styles.statContent}>
              <h3>Sinh viên</h3>
              <p className={styles.statNumber}>{stats.users.students || 0}</p>
              <p className={styles.statLabel}>Tổng số sinh viên</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👨‍🏫</div>
            <div className={styles.statContent}>
              <h3>Giảng viên</h3>
              <p className={styles.statNumber}>{stats.users.teachers || 0}</p>
              <p className={styles.statLabel}>Tổng số giảng viên</p>
            </div>
          </div>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.card}>
            <h3>⏰ Đồ án sắp đến hạn</h3>
            <div className={styles.deadlineList}>
              <div className={styles.emptyState}>
                <p>Không có đồ án nào sắp hết hạn</p>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3>🔔 Thông báo mới nhất</h3>
            <div className={styles.notificationList}>
              <div className={styles.notificationItem}>
                <div className={styles.notificationIcon}>📝</div>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationTitle}>Hệ thống khởi chạy thành công</div>
                  <div className={styles.notificationTime}>Vừa xong</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.card}>
            <h3>⚙️ Quản lý hệ thống</h3>
            <div className={styles.actionGrid}>
              <button className={styles.actionButton} onClick={() => navigate('/admin/users')}>
                <span className={styles.actionIcon}>👥</span>
                <span>Quản lý người dùng</span>
              </button>
              <button className={styles.actionButton} onClick={() => navigate('/admin/topics')}>
                <span className={styles.actionIcon}>🎯</span>
                <span>Quản lý đề tài</span>
              </button>
              <button className={styles.actionButton} onClick={() => navigate('/admin/projects')}>
                <span className={styles.actionIcon}>📚</span>
                <span>Quản lý đồ án</span>
              </button>
              <button className={styles.actionButton} onClick={() => navigate('/admin/announcements')}>
                <span className={styles.actionIcon}>📢</span>
                <span>Quản lý thông báo</span>
              </button>
              <button className={styles.actionButton} onClick={() => navigate('/admin/reviewer-assignment')}>
                <span className={styles.actionIcon}>👨‍🏫</span>
                <span>Phân công phản biện</span>
              </button>
              <button className={styles.actionButton} onClick={() => navigate('/admin/class-assignment')}>
                <span className={styles.actionIcon}>🎓</span>
                <span>Phân công lớp</span>
              </button>
              <button className={styles.actionButton} onClick={() => navigate('/admin/statistics')}>
                <span className={styles.actionIcon}>📊</span>
                <span>Báo cáo thống kê</span>
              </button>
            </div>
          </div>


        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
