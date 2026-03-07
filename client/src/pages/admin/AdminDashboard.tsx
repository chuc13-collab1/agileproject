import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

interface Announcement {
  id: string;
  title: string;
  created_at: string;
}

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

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUpcomingDeadlines();
    fetchAnnouncements();
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
      const allProjects: any[] = Array.isArray(result) ? result : (result.data || []);

      const upcoming = allProjects
        .filter((p: any) => {
          const deadlineRaw = p.reportDeadline || p.report_deadline;
          if (!deadlineRaw) return false;
          if (['completed', 'graded', 'failed'].includes(p.status)) return false;
          const deadline = new Date(deadlineRaw);
          const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86400000);
          return daysLeft <= 7;
        })
        .map((p: any) => {
          const deadlineRaw = p.reportDeadline || p.report_deadline;
          const daysLeft = Math.ceil((new Date(deadlineRaw).getTime() - Date.now()) / 86400000);
          return {
            id: p.id,
            title: p.title,
            studentName: p.studentName || p.student_name || 'N/A',
            reportDeadline: deadlineRaw,
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

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const { auth } = await import('../../services/firebase/config');
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAnnouncements(data.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load announcements', error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const getDayColor = (daysLeft: number) => {
    if (daysLeft < 0) return '#dc2626';
    if (daysLeft <= 1) return '#ef4444';
    if (daysLeft <= 3) return '#f97316';
    return '#f59e0b';
  };

  const getDayLabel = (daysLeft: number) => {
    if (daysLeft < 0) return `🚨 Quá hạn ${Math.abs(daysLeft)} ngày`;
    if (daysLeft === 0) return '⚠️ Hôm nay!';
    return `⏳ ${daysLeft} ngày`;
  };

  const QUICK_ACTIONS = [
    { icon: '👥', label: 'Người dùng', path: '/admin/users' },
    { icon: '🎯', label: 'Đề tài', path: '/admin/topics' },
    { icon: '📚', label: 'Đồ án', path: '/admin/projects' },
    { icon: '📢', label: 'Thông báo', path: '/admin/announcements' },
    { icon: '👨‍🏫', label: 'Phân công phản biện', path: '/admin/reviewer-assignment' },
    { icon: '🎓', label: 'Phân lớp', path: '/admin/class-assignment' },
    { icon: '📊', label: 'Thống kê', path: '/admin/statistics' },
  ];

  return (
    <MainLayout>
      <div className={styles.dashboard}>

        {/* ── Welcome Banner ── */}
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeText}>
            <h2>Xin chào, {user?.fullName}! 👋</h2>
            <p>Tổng quan hệ thống quản lý đồ án</p>
          </div>
          <span className={styles.welcomeBadge}>⚙️ Quản trị viên</span>
        </div>

        {/* ── Stats Grid ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>👥</div>
            <div className={styles.statContent}>
              <h3>Người dùng</h3>
              <p className={styles.statNumber}>{stats.users.total || 0}</p>
              <p className={styles.statLabel}>Tổng số người dùng</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>📚</div>
            <div className={styles.statContent}>
              <h3>Đề tài</h3>
              <p className={styles.statNumber}>{stats.topics.total || 0}</p>
              <p className={styles.statLabel}>Tổng số đề tài</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>👨‍🎓</div>
            <div className={styles.statContent}>
              <h3>Sinh viên</h3>
              <p className={styles.statNumber}>{stats.users.students || 0}</p>
              <p className={styles.statLabel}>Tổng số sinh viên</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>👨‍🏫</div>
            <div className={styles.statContent}>
              <h3>Giảng viên</h3>
              <p className={styles.statNumber}>{stats.users.teachers || 0}</p>
              <p className={styles.statLabel}>Tổng số giảng viên</p>
            </div>
          </div>
        </div>

        {/* ── Content Row: Deadlines + Announcements ── */}
        <div className={styles.contentSection}>

          {/* Deadlines */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>⏰ Đồ án sắp đến hạn</h3>
              {!loadingDeadlines && upcomingProjects.length > 0 && (
                <span className={styles.cardBadge}>{upcomingProjects.length} đồ án</span>
              )}
            </div>
            <div className={styles.deadlineList}>
              {loadingDeadlines ? (
                <div className={styles.emptyState}><p>Đang tải...</p></div>
              ) : upcomingProjects.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>✅ Không có đồ án nào sắp hoặc đã hết hạn</p>
                </div>
              ) : (
                upcomingProjects.map(p => (
                  <div
                    key={p.id}
                    className={styles.deadlineItem}
                    onClick={() => navigate('/admin/projects')}
                    style={{ borderLeftColor: getDayColor(p.daysLeft) }}
                  >
                    <div className={styles.deadlineInfo}>
                      <p className={styles.deadlineTitle}>{p.title}</p>
                      <p className={styles.deadlineMeta}>
                        👤 {p.studentName} · Hạn: {new Date(p.reportDeadline).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <span
                      className={styles.deadlineBadge}
                      style={{
                        color: getDayColor(p.daysLeft),
                        background: `${getDayColor(p.daysLeft)}18`,
                      }}
                    >
                      {getDayLabel(p.daysLeft)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>🔔 Thông báo mới nhất</h3>
              {!loadingAnnouncements && announcements.length > 0 && (
                <span className={styles.cardBadge}>{announcements.length} thông báo</span>
              )}
            </div>
            <div className={styles.notificationList}>
              {loadingAnnouncements ? (
                <div className={styles.emptyState}><p>Đang tải...</p></div>
              ) : announcements.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Không có thông báo nào</p>
                </div>
              ) : (
                announcements.map(a => (
                  <div
                    key={a.id}
                    className={styles.notificationItem}
                    onClick={() => navigate('/admin/announcements')}
                  >
                    <div className={styles.notificationIcon}>📝</div>
                    <div className={styles.notificationContent}>
                      <div className={styles.notificationTitle}>{a.title}</div>
                      <div className={styles.notificationTime}>
                        {new Date(a.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className={styles.actionsSection}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>⚙️ Quản lý hệ thống</h3>
          </div>
          <div className={styles.actionGrid}>
            {QUICK_ACTIONS.map(({ icon, label, path }) => (
              <button
                key={path}
                className={styles.actionButton}
                onClick={() => navigate(path)}
              >
                <span className={styles.actionIcon}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
