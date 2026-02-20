// Main Layout Component with Header and Logout
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'teacher':
        return 'Giảng viên';
      case 'student':
        return 'Sinh viên';
      case 'supervisor':
        return 'Giáo viên hướng dẫn';
      case 'reviewer':
        return 'Giảng viên phản biện';
      default:
        return role;
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <h1>📚 Hệ Thống Quản Lý Đồ Án</h1>
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.fullName}</span>
              <span className={styles.userRole}>{getRoleLabel(user?.role || '')}</span>
            </div>
            <button
              onClick={() => navigate('/archive')}
              className={styles.chatButton}
              title="Thư viện đồ án"
            >
              📚
            </button>
            <NotificationBell />
            <button
              onClick={() => navigate('/ai-assistant')}
              className={styles.chatButton}
              title="Trợ lý AI"
            >
              🤖
            </button>
            <button
              onClick={() => navigate('/chat')}
              className={styles.chatButton}
              title="Tin nhắn"
            >
              💬
            </button>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default MainLayout;
