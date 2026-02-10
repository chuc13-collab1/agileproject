import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
// import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

interface Stats {
  users: {
    total: number;
    students: number;
    teachers: number;
  };
  topics: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

function Statistics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MainLayout><div className={styles.loading}>Loading...</div></MainLayout>;
  if (!stats) return <MainLayout><div className={styles.error}>Error loading stats</div></MainLayout>;

  return (
    <MainLayout>
      <div className={styles.dashboard}>
        <div className={styles.welcomeSection}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                color: '#64748b'
              }}
              title="Quay lại Dashboard"
            >
              ⬅️
            </button>
            <div>
              <h2>Báo Cáo Thống Kê 📊</h2>
              <p>Tổng quan số liệu hệ thống</p>
            </div>
          </div>
        </div>

        <h3 className={styles.sectionTitle}>Người dùng</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>Tổng số</h3>
              <p className={styles.statNumber}>{stats.users.total}</p>
              <p className={styles.statLabel}>Tài khoản</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👨‍🎓</div>
            <div className={styles.statContent}>
              <h3>Sinh viên</h3>
              <p className={styles.statNumber}>{stats.users.students}</p>
              <p className={styles.statLabel}>Tài khoản</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👨‍🏫</div>
            <div className={styles.statContent}>
              <h3>Giảng viên</h3>
              <p className={styles.statNumber}>{stats.users.teachers}</p>
              <p className={styles.statLabel}>Tài khoản</p>
            </div>
          </div>
        </div>

        <h3 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Đề tài</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📚</div>
            <div className={styles.statContent}>
              <h3>Tổng số</h3>
              <p className={styles.statNumber}>{stats.topics.total}</p>
              <p className={styles.statLabel}>Đề tài</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <h3>Đã duyệt</h3>
              <p className={styles.statNumber}>{stats.topics.approved}</p>
              <p className={styles.statLabel}>Đề tài</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statContent}>
              <h3>Chờ duyệt</h3>
              <p className={styles.statNumber}>{stats.topics.pending}</p>
              <p className={styles.statLabel}>Đề tài</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>❌</div>
            <div className={styles.statContent}>
              <h3>Từ chối</h3>
              <p className={styles.statNumber}>{stats.topics.rejected}</p>
              <p className={styles.statLabel}>Đề tài</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Statistics;
