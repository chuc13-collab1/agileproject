// Main Layout Component with Header and Logout
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import ArchiveModal from './ArchiveModal';
import FloatingChat from '../chat/FloatingChat';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [archiveOpen, setArchiveOpen] = useState(false);

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
      case 'admin': return 'Quản trị viên';
      case 'teacher': return 'Giảng viên';
      case 'student': return 'Sinh viên';
      case 'supervisor': return 'Giáo viên hướng dẫn';
      case 'reviewer': return 'Giảng viên phản biện';
      default: return role;
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Logo */}
          <div className={styles.logo} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/logo.jpg" alt="Logo" style={{ height: '40px', borderRadius: '6px', marginRight: '10px' }} />
            <h1>Hệ Thống Quản Lý Đồ Án</h1>
          </div>

          {/* Right side */}
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.fullName}</span>
              <span className={styles.userRole}>{getRoleLabel(user?.role || '')}</span>
            </div>

            {/* Archive Library button — opens modal */}
            <button
              onClick={() => setArchiveOpen(true)}
              className={styles.headerBtn}
              title="Thư viện đồ án"
            >
              <span>📚</span>
              <span className={styles.headerBtnLabel}>Thư viện</span>
            </button>

            {/* AI Assistant */}
            <button
              onClick={() => navigate('/ai-assistant')}
              className={styles.headerBtn}
              title="Trợ lý AI"
            >
              <span>🤖</span>
              <span className={styles.headerBtnLabel}>AI</span>
            </button>

            <NotificationBell />

            <button onClick={handleLogout} className={styles.logoutButton}>
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      {/* Archive Modal */}
      <ArchiveModal isOpen={archiveOpen} onClose={() => setArchiveOpen(false)} />

      {/* Floating Chat Widget */}
      <FloatingChat />
    </div>
  );
};

export default MainLayout;
