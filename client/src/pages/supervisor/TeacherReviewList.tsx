import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import * as projectService from '../../services/api/project.service';
import styles from './Supervisor.module.css';

interface ReviewProject {
    id: string;
    title: string;
    studentName: string;
    studentEmail: string;
    studentCode: string;
    className: string;
    field: string;
    status: string;
    supervisorName: string;
    reviewerScore: number | null;
    finalScore: number | null;
    grade: string | null;
    createdAt: string;
}

const TeacherReviewList: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<ReviewProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('all');

    useEffect(() => {
        if (user?.uid) loadProjects();
    }, [user]);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const data = await projectService.getReviewProjects(user!.uid);
            setProjects(data);
        } catch (error) {
            console.error('Failed to load review projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(p => {
        if (filter === 'pending') return !p.reviewerScore;
        if (filter === 'graded') return !!p.reviewerScore;
        return true;
    });

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { text: string; color: string; bg: string }> = {
            registered: { text: '📋 Đã đăng ký', color: '#1e40af', bg: '#dbeafe' },
            in_progress: { text: '⚡ Đang thực hiện', color: '#0891b2', bg: '#cffafe' },
            submitted: { text: '📤 Đã nộp', color: '#ca8a04', bg: '#fef9c3' },
            graded: { text: '📊 Đã chấm', color: '#16a34a', bg: '#dcfce7' },
            completed: { text: '✅ Hoàn thành', color: '#166534', bg: '#bbf7d0' },
        };
        const badge = badges[status] || { text: status, color: '#64748b', bg: '#f1f5f9' };
        return (
            <span style={{
                padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem',
                fontWeight: '600', color: badge.color, background: badge.bg
            }}>
                {badge.text}
            </span>
        );
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '1rem', padding: '2rem', marginBottom: '2rem', color: 'white',
                    boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)'
                }}>
                    <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: '800' }}>
                        👨‍⚖️ Đồ Án Phản Biện
                    </h1>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
                        Danh sách đồ án bạn được phân công phản biện
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Tổng đồ án', value: projects.length, icon: '📚', bg: '#eef2ff' },
                        { label: 'Chưa chấm', value: projects.filter(p => !p.reviewerScore).length, icon: '⏰', bg: '#fffbeb' },
                        { label: 'Đã chấm', value: projects.filter(p => !!p.reviewerScore).length, icon: '✅', bg: '#f0fdf4' },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: stat.bg, borderRadius: '1rem', padding: '1.25rem',
                            textAlign: 'center', border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filter */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[
                        { key: 'all' as const, label: 'Tất cả' },
                        { key: 'pending' as const, label: '⏰ Chưa chấm' },
                        { key: 'graded' as const, label: '✅ Đã chấm' },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            style={{
                                padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: '2px solid',
                                borderColor: filter === f.key ? 'transparent' : '#e2e8f0',
                                background: filter === f.key ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'white',
                                color: filter === f.key ? 'white' : '#64748b',
                                fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s'
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Project List */}
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>⏳ Đang tải...</div>
                ) : filteredProjects.length === 0 ? (
                    <div style={{
                        padding: '3rem', textAlign: 'center', color: '#94a3b8',
                        background: 'white', borderRadius: '1rem', border: '2px dashed #cbd5e1'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
                        <div>Không có đồ án phản biện nào</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredProjects.map(project => (
                            <div
                                key={project.id}
                                onClick={() => navigate(`/teacher/projects/${project.id}?role=reviewer`)}
                                style={{
                                    background: 'white', borderRadius: '1rem', padding: '1.5rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0',
                                    cursor: 'pointer', transition: 'all 0.3s'
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', flex: 1 }}>
                                        {project.title}
                                    </h3>
                                    {getStatusBadge(project.status)}
                                </div>

                                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
                                    <span>👤 {project.studentName}{project.className ? ` (${project.className})` : ''}</span>
                                    <span>📚 {project.field}</span>
                                    <span>👨‍🏫 GVHD: {project.supervisorName || 'Chưa có'}</span>
                                </div>

                                {project.reviewerScore !== null && (
                                    <div style={{
                                        marginTop: '0.75rem', padding: '0.5rem 1rem',
                                        background: '#f0fdf4', borderRadius: '0.5rem', display: 'inline-flex',
                                        alignItems: 'center', gap: '0.5rem', border: '1px solid #bbf7d0'
                                    }}>
                                        <span style={{ fontWeight: '600', color: '#166534' }}>📊 Điểm phản biện:</span>
                                        <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#166534' }}>
                                            {project.reviewerScore?.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default TeacherReviewList;
