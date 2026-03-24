import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import * as projectService from '../../services/api/project.service';
import { Project } from '../../types/project.types';
import styles from './Student.module.css';

const MyProject: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [submittingProject, setSubmittingProject] = useState(false);

    useEffect(() => {
        if (user) loadProject();
    }, [user]);

    const loadProject = async () => {
        setLoading(true);
        try {
            const allProjects = await projectService.getAllProjects();
            const myProject = allProjects.find(p => p.studentId === user?.uid);
            setProject(myProject || null);
        } catch (error) {
            console.error('Failed to load project:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitProject = async () => {
        if (!project) return;
        if (!window.confirm('Bạn có chắc chắn muốn nộp đồ án cuối kỳ? Sau khi nộp, bạn sẽ không thể thao tác thêm ở Sprints và chờ Giảng viên đánh giá.')) {
            return;
        }

        try {
            setSubmittingProject(true);
            await projectService.updateProject(project.id, { status: 'submitted' });
            alert('Nộp đồ án lên Giảng viên thành công! Vui lòng theo dõi lịch bảo vệ sắp tới.');
            loadProject();
        } catch (error) {
            console.error('Lỗi khi nộp đồ án:', error);
            alert('Có lỗi xảy ra khi nộp đồ án.');
        } finally {
            setSubmittingProject(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: { text: string; className: string } } = {
            'registered': { text: 'Đã đăng ký', className: styles.badgeInfo },
            'in_progress': { text: 'Đang thực hiện', className: styles.badgeInfo },
            'submitted': { text: 'Đã nộp', className: styles.badgeWarning },
            'graded': { text: 'Đã chấm điểm', className: styles.badgeWarning },
            'completed': { text: 'Hoàn thành', className: styles.badgeSuccess },
            'failed': { text: 'Không đạt', className: styles.badgeError }
        };

        const statusInfo = statusMap[status] || { text: status, className: styles.badgeWarning };
        return <span className={`${styles.badge} ${statusInfo.className}`}>{statusInfo.text}</span>;
    };

    if (loading) {
        return <MainLayout><div style={{ padding: '2rem' }}>Đang tải...</div></MainLayout>;
    }

    if (!project) {
        return (
            <MainLayout>
                <div className={styles.container}>
                    <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</p>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Chưa có đồ án</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            Bạn chưa đăng ký đề tài nào
                        </p>
                        <button
                            onClick={() => navigate('/student/topics')}
                            className={styles.button}
                            style={{ background: '#3b82f6', color: 'white' }}
                        >
                            📝 Đăng ký đề tài ngay
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '0.5rem'
                            }}
                        >
                            ⬅️
                        </button>
                        <div style={{ flex: 1 }}>
                            <h1 className={styles.title}>📋 Đồ Án Của Tôi</h1>
                            <p className={styles.subtitle}>Thông tin chi tiết về đồ án</p>
                        </div>
                        {getStatusBadge(project.status)}
                    </div>
                </div>

                {/* Project Info Card */}
                <div className={styles.card}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                        {project.title}
                    </h2>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>📄 Mô tả</h3>
                        <p style={{ color: '#64748b', lineHeight: 1.6 }}>{project.description}</p>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>ℹ️ Thông tin</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>👨‍🏫 Giảng viên hướng dẫn</span>
                                <span className={styles.infoValue}>{project.supervisor.name}</span>
                            </div>

                            {project.reviewer && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>👨‍🏫 Giảng viên phản biện</span>
                                    <span className={styles.infoValue}>{project.reviewer.name}</span>
                                </div>
                            )}

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>📚 Lĩnh vực</span>
                                <span className={styles.infoValue}>{project.field}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>📅 Học kỳ</span>
                                <span className={styles.infoValue}>{project.semester} - {project.academicYear}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>📅 Ngày đăng ký</span>
                                <span className={styles.infoValue}>
                                    {new Date(project.registrationDate).toLocaleDateString('vi-VN')}
                                </span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>⏰ Deadline</span>
                                <span className={styles.infoValue}>
                                    {new Date(project.reportDeadline).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Supervisor Feedback */}
                    {project.supervisorComment && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>💬 Nhận xét từ GVHD</h3>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
                                <p style={{ color: '#475569', lineHeight: 1.6 }}>{project.supervisorComment}</p>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className={styles.quickActions}>
                        <button
                            onClick={() => navigate('/student/reports')}
                            className={styles.actionButton}
                        >
                            📊 Xem Báo Cáo Tiến Độ
                        </button>
                        <button
                            onClick={() => navigate('/student/reports/submit')}
                            className={styles.actionButton}
                            style={{ background: '#10b981' }}
                        >
                            ➕ Nộp Báo Cáo Mới
                        </button>
                        <button
                            onClick={() => navigate('/student/documents')}
                            className={styles.actionButton}
                            style={{ background: '#8b5cf6' }}
                        >
                            📁 Quản Lý Tài Liệu
                        </button>
                    </div>

                    {/* Submit Final Project */}
                    {project.status === 'in_progress' && (
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fcd34d', textAlign: 'center' }}>
                            <h3 style={{ color: '#b45309', marginBottom: '0.5rem' }}>🎯 Hoàn Thành Đồ Án</h3>
                            <p style={{ color: '#92400e', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                Khi nhóm bạn đã hoàn tất 100% các Sprints và Nộp đầy đủ Source code, Slide Báo cáo, hãy bấm nút dưới đây để kết thúc thực hiện đồ án, chuyển trạng thái cho Giảng viên hướng dẫn duyệt chốt bảo vệ.
                            </p>
                            <button
                                onClick={handleSubmitProject}
                                disabled={submittingProject}
                                className={styles.button}
                                style={{ background: '#f59e0b', color: 'white', fontWeight: 'bold', padding: '0.75rem 2rem' }}
                            >
                                {submittingProject ? '⏳ Đang xử lý...' : '🏁 NỘP ĐỒ ÁN CUỐI KỲ'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Project Score (if available) */}
                {(project.supervisorScore || project.reviewerScore || project.score) && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>⭐ Điểm số</h3>
                        <div className={styles.infoGrid}>
                            {project.supervisorScore && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Điểm GVHD</span>
                                    <span className={styles.infoValue} style={{ color: '#3b82f6', fontSize: '1.5rem' }}>
                                        {Number(project.supervisorScore).toFixed(2)}
                                    </span>
                                </div>
                            )}

                            {project.reviewerScore && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Điểm phản biện</span>
                                    <span className={styles.infoValue} style={{ color: '#8b5cf6', fontSize: '1.5rem' }}>
                                        {Number(project.reviewerScore).toFixed(2)}
                                    </span>
                                </div>
                            )}

                            {project.score && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Điểm cuối cùng</span>
                                    <span className={styles.infoValue} style={{ color: '#10b981', fontSize: '1.5rem' }}>
                                        {Number(project.score).toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/student/results')}
                            className={styles.button}
                            style={{ background: '#3b82f6', color: 'white', marginTop: '1rem' }}
                        >
                            Xem chi tiết điểm →
                        </button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default MyProject;
