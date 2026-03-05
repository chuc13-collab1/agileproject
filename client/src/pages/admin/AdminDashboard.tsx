// Admin Dashboard Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

interface UpcomingProject {
  id: string;
  title: string;
  studentName: string;
  reportDeadline: string;
  status: string;
  daysLeft: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: { total: 0, students: 0, teachers: 0 },
    topics: { total: 0, approved: 0 },
  });
  const [upcomingProjects, setUpcomingProjects] = useState<UpcomingProject[]>([]);
  const [loadingDeadlines, setLoadingDeadlines] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUpcomingDeadlines();
  }, []);

  const fetchStats = async () => {
    try {
      const { auth } = await import('../../services/firebase/config');
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stats/counts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  const fetchUpcomingDeadlines = async () => {
    setLoadingDeadlines(true);
    try {
      const { auth } = await import('../../services/firebase/config');
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();

      // Hỗ trợ cả 2 format: array hoặc { success, data: [] }
      const allProjects: any[] = Array.isArray(result) ? result : (result.data || []);

      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const upcoming = allProjects
        .filter((p: any) => {
          const deadlineRaw = p.reportDeadline || p.report_deadline;
          if (!deadlineRaw) return false;
          if (['completed', 'graded', 'failed'].includes(p.status)) return false;
          const deadline = new Date(deadlineRaw);
          return deadline >= now && deadline <= sevenDaysLater;
        })
        .map((p: any) => {
          const deadline = new Date(p.reportDeadline || p.report_deadline);
          const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return {
            id: p.id,
            title: p.title,
            studentName: p.studentName || p.student_name || 'N/A',
            reportDeadline: p.reportDeadline || p.report_deadline,
            status: p.status,
            daysLeft,
          };
        })
        .sort((a, b) => a.daysLeft - b.daysLeft);

      setUpcomingProjects(upcoming);
    } catch (error) {
      console.error('Failed to load upcoming deadlines', error);
    } finally {
      setLoadingDeadlines(false);
    }
  };

  const getDayColor = (daysLeft: number) => {
    if (daysLeft <= 1) return '#ef4444';
    if (daysLeft <= 3) return '#f97316';
    return '#f59e0b';
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
          {/* Deadlines */}
          <div className={styles.card}>
            <h3>⏰ Đồ án sắp đến hạn</h3>
            <div className={styles.deadlineList}>
              {loadingDeadlines ? (
                <div className={styles.emptyState}><p>Đang tải...</p></div>
              ) : upcomingProjects.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Không có đồ án nào sắp hết hạn</p>
                </div>
              ) : (
                upcomingProjects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => navigate('/admin/projects')}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.75rem 1rem', marginBottom: '0.5rem',
                      background: '#fff9f0', borderRadius: '0.5rem',
                      borderLeft: `4px solid ${getDayColor(p.daysLeft)}`,
                      cursor: 'pointer', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fff0e0')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff9f0')}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                        👤 {p.studentName} · Hạn: {new Date(p.reportDeadline).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <span style={{
                      fontWeight: 700, fontSize: '0.85rem',
                      color: getDayColor(p.daysLeft),
                      background: `${getDayColor(p.daysLeft)}18`,
                      padding: '0.25rem 0.75rem', borderRadius: '999px', whiteSpace: 'nowrap',
                    }}>
                      {p.daysLeft === 0 ? '⚠️ Hôm nay!' : `⏳ ${p.daysLeft} ngày`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className={styles.card}>
            <h3> Thông báo mới nhất</h3>
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

        {/* Quick Actions */}
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
