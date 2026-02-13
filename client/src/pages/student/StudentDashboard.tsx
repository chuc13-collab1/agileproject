// Student Dashboard Page
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import * as progressReportService from '../../services/api/progressReport.service';
import * as projectService from '../../services/api/project.service';
import { Project } from '../../types/project.types';
import styles from './Dashboard.module.css';

// ... (inside component)



const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    hasProject: false,
    projectStatus: '',
    projectTitle: '',
    supervisorName: '',
    pendingReports: 0,
    completedReports: 0
  });
  const [myProject, setMyProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const allProjects = await projectService.getAllProjects();
      const project = allProjects.find(p => p.studentId === user?.uid);

      if (project) {
        setMyProject(project);

        // Fetch reports
        try {
          const reports = await progressReportService.getStudentReports(user?.uid || '');
          const completedCount = reports.filter((r: any) => r.status === 'submitted' || r.status === 'reviewed').length;

          // Calculate pending reports
          let pendingCount = 0;
          if (project.registrationDate) {
            const startDate = new Date(project.registrationDate);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - startDate.getTime());
            const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
            // Pending = Weeks Passed - Completed. Minimum 0.
            pendingCount = Math.max(0, diffWeeks - completedCount);
          }

          setStats({
            hasProject: true,
            projectStatus: project.status,
            projectTitle: project.title,
            supervisorName: project.supervisor?.name || 'Chưa phân công',
            pendingReports: pendingCount,
            completedReports: completedCount
          });
        } catch (reportError) {
          console.error("Failed to load reports", reportError);
          setStats({
            hasProject: true,
            projectStatus: project.status,
            projectTitle: project.title,
            supervisorName: project.supervisor?.name || 'Chưa phân công',
            pendingReports: 0,
            completedReports: 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
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
        {/* Gradient Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          color: 'white',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '800' }}>
            Xin chào, {user?.fullName}! 👋
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '1.05rem' }}>
            {stats.hasProject
              ? `Đồ án: ${stats.projectTitle}`
              : 'Chào mừng bạn đến với hệ thống quản lý đồ án'}
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Project Status Card */}
          <div
            onClick={() => stats.hasProject && navigate('/student/my-project')}
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              cursor: stats.hasProject ? 'pointer' : 'default',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              if (stats.hasProject) {
                e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
              Đồ Án Của Tôi
            </h3>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700', color: '#0f172a' }}>
              {stats.hasProject ? '1' : '0'}
            </p>
            <div>
              {stats.hasProject ? (
                getStatusBadge(stats.projectStatus)
              ) : (
                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Chưa đăng ký</span>
              )}
            </div>
          </div>

          {/* Reports Completed */}
          <div
            onClick={() => navigate('/student/reports')}
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
              Báo Cáo Tiến Độ
            </h3>
            <p style={{ margin: '0', fontSize: '2rem', fontWeight: '700', color: '#0f172a' }}>
              {stats.completedReports}
            </p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>Đã nộp</p>
          </div>

          {/* Pending Tasks */}
          <div
            style={{
              background: stats.pendingReports > 0
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                : 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: stats.pendingReports > 0 ? 'none' : '1px solid #e2e8f0',
              transition: 'all 0.3s',
              color: stats.pendingReports > 0 ? 'white' : '#0f172a'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⏰</div>
            <h3 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '0.875rem',
              color: stats.pendingReports > 0 ? 'rgba(255,255,255,0.9)' : '#64748b',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Cần Làm
            </h3>
            <p style={{ margin: '0', fontSize: '2rem', fontWeight: '700' }}>
              {stats.pendingReports}
            </p>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.875rem',
              color: stats.pendingReports > 0 ? 'rgba(255,255,255,0.8)' : '#64748b'
            }}>
              Báo cáo cần nộp
            </p>
          </div>

          {/* Supervisor */}
          <div
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👨‍🏫</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
              Giảng Viên GVHD
            </h3>
            <p style={{ margin: '0', fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>
              {stats.supervisorName}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>
            🚀 Thao tác nhanh
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {!stats.hasProject ? (
              <button
                onClick={() => navigate('/student/topics')}
                style={{
                  padding: '0.875rem 1.5rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                📚 Xem Danh Sách Đề Tài
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/student/my-project')}
                  style={{
                    padding: '0.875rem 1.5rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  📋 Xem Đồ Án
                </button>
                <button
                  onClick={() => navigate('/student/reports/submit')}
                  style={{
                    padding: '0.875rem 1.5rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  ➕ Nộp Báo Cáo Tiến Độ
                </button>
                <button
                  onClick={() => navigate('/student/documents')}
                  style={{
                    padding: '0.875rem 1.5rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                  }}
                >
                  📁 Quản Lý Tài Liệu
                </button>
                <button
                  onClick={() => navigate('/student/book-meeting')}
                  style={{
                    padding: '0.875rem 1.5rem',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                  }}
                >
                  📅 Đặt Lịch Hẹn GV
                </button>
              </>
            )}
          </div>
        </div>

        {/* Project Preview (if has project) */}
        {stats.hasProject && myProject && (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                📋 Thông Tin Đồ Án
              </h3>
              <button
                onClick={() => navigate('/student/my-project')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Xem chi tiết →
              </button>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                  Tên đồ án
                </div>
                <div style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: '600' }}>
                  {myProject.title}
                </div>
              </div>
              {myProject.description && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                    Mô tả
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>
                    {myProject.description.substring(0, 200)}
                    {myProject.description.length > 200 && '...'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{
            padding: '4rem',
            textAlign: 'center',
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <div style={{ fontSize: '1.125rem', color: '#64748b' }}>Đang tải dữ liệu...</div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentDashboard;
