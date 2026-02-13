import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import * as projectService from '../../services/api/project.service';
import * as topicService from '../../services/api/topic.service';
import styles from './Supervisor.module.css';

interface Stats {
    totalProjects: number;
    completedProjects: number;
    inProgressProjects: number;
    averageScore: number;
    totalTopics: number;
    approvedTopics: number;
    scoreDistribution: { [key: string]: number };
}

const TeacherStatistics: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalProjects: 0,
        completedProjects: 0,
        inProgressProjects: 0,
        averageScore: 0,
        totalTopics: 0,
        approvedTopics: 0,
        scoreDistribution: {}
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadStats();
    }, [user]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const [allProjects, allTopics] = await Promise.all([
                projectService.getAllProjects(),
                topicService.getAllTopics()
            ]);

            // Filter by current teacher
            const myProjects = allProjects.filter(p => p.supervisor.id === user?.uid);
            const myTopics = allTopics.filter(t => t.supervisorId === user?.uid);

            // Calculate statistics
            const completed = myProjects.filter(p => p.status === 'completed');
            const inProgress = myProjects.filter(p => p.status === 'in_progress');

            // Calculate average score
            const scoredProjects = myProjects.filter(p => p.supervisorScore);
            const avgScore = scoredProjects.length > 0
                ? scoredProjects.reduce((sum, p) => sum + (p.supervisorScore || 0), 0) / scoredProjects.length
                : 0;

            // Calculate score distribution
            const distribution: { [key: string]: number } = {
                'A (9-10)': 0,
                'B (8-8.9)': 0,
                'C (7-7.9)': 0,
                'D (6-6.9)': 0,
                'F (<6)': 0
            };

            scoredProjects.forEach(p => {
                const score = p.supervisorScore || 0;
                if (score >= 9) distribution['A (9-10)']++;
                else if (score >= 8) distribution['B (8-8.9)']++;
                else if (score >= 7) distribution['C (7-7.9)']++;
                else if (score >= 6) distribution['D (6-6.9)']++;
                else distribution['F (<6)']++;
            });

            setStats({
                totalProjects: myProjects.length,
                completedProjects: completed.length,
                inProgressProjects: inProgress.length,
                averageScore: avgScore,
                totalTopics: myTopics.length,
                approvedTopics: myTopics.filter(t => t.status === 'approved').length,
                scoreDistribution: distribution
            });
        } catch (error) {
            console.error('Failed to load statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <MainLayout><div style={{ padding: '2rem' }}>Đang tải thống kê...</div></MainLayout>;
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
                        <div>
                            <h1 className={styles.title}>📊 Thống Kê Cá Nhân</h1>
                            <p className={styles.subtitle}>Tổng quan về hoạt động hướng dẫn</p>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.totalTopics}</div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Tổng đề tài</div>
                        <div style={{ fontSize: '0.85rem', color: '#16a34a', marginTop: '0.25rem' }}>
                            {stats.approvedTopics} đã duyệt
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.totalProjects}</div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Tổng sinh viên</div>
                        <div style={{ fontSize: '0.85rem', color: '#16a34a', marginTop: '0.25rem' }}>
                            {stats.inProgressProjects} đang thực hiện
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.completedProjects}</div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Đã hoàn thành</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                            {stats.totalProjects > 0 ? ((stats.completedProjects / stats.totalProjects) * 100).toFixed(1) : 0}% tỷ lệ
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                            {stats.averageScore > 0 ? stats.averageScore.toFixed(2) : 'N/A'}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Điểm trung bình</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                            Của sinh viên đã chấm
                        </div>
                    </div>
                </div>

                {/* Score Distribution Chart */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Phân Bố Điểm</h2>

                    {Object.keys(stats.scoreDistribution).length === 0 || Object.values(stats.scoreDistribution).every(v => v === 0) ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            Chưa có dữ liệu điểm
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {Object.entries(stats.scoreDistribution).map(([grade, count]) => {
                                const maxCount = Math.max(...Object.values(stats.scoreDistribution));
                                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                                return (
                                    <div key={grade} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '100px', fontSize: '0.9rem', fontWeight: 500 }}>{grade}</div>
                                        <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '0.5rem', height: '2rem', position: 'relative', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    width: `${percentage}%`,
                                                    height: '100%',
                                                    background: getGradeColor(grade),
                                                    borderRadius: '0.5rem',
                                                    transition: 'width 0.3s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    paddingLeft: '0.75rem'
                                                }}
                                            >
                                                <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{count}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/teacher/students')}
                        style={{
                            padding: '1rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 500
                        }}
                    >
                        👥 Xem Danh Sách Sinh Viên
                    </button>
                    <button
                        onClick={() => navigate('/teacher/topics')}
                        style={{
                            padding: '1rem',
                            background: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 500
                        }}
                    >
                        📚 Quản Lý Đề Tài
                    </button>
                    <button
                        onClick={() => navigate('/teacher/progress-tracking')}
                        style={{
                            padding: '1rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 500
                        }}
                    >
                        📊 Theo Dõi Tiến Độ
                    </button>
                </div>
            </div>
        </MainLayout>
    );
};

// Helper function to get color based on grade
const getGradeColor = (grade: string): string => {
    if (grade.includes('A')) return '#10b981'; // Green
    if (grade.includes('B')) return '#3b82f6'; // Blue
    if (grade.includes('C')) return '#f59e0b'; // Orange
    if (grade.includes('D')) return '#ef4444'; // Red
    return '#6b7280'; // Gray for F
};

export default TeacherStatistics;
