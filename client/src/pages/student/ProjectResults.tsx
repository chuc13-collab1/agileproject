import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import * as projectService from '../../services/api/project.service';
import { Project } from '../../types/project.types';
import styles from './Student.module.css';

interface Evaluation {
    evaluatorName: string;
    evaluatorRole: 'supervisor' | 'reviewer' | 'council';
    score: number;
    comment: string;
    evaluatedAt: Date;
}

const ProjectResults: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const allProjects = await projectService.getAllProjects();
            const myProject = allProjects.find(p => p.studentId === user?.uid);
            setProject(myProject || null);

            if (myProject) {
                // Map evaluations from project data
                if (myProject.evaluations && myProject.evaluations.length > 0) {
                    const mappedEvals: Evaluation[] = myProject.evaluations.map((e: any) => ({
                        evaluatorName: e.evaluator_name || 'Giảng viên',
                        evaluatorRole: e.evaluator_type,
                        score: parseFloat(e.total_score),
                        comment: e.comments || '',
                        evaluatedAt: new Date(e.created_at)
                    }));
                    setEvaluations(mappedEvals);
                }
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateFinalScore = () => {
        if (!project) return 0;

        // Weighted average: Supervisor 40%, Reviewer 30%, Council 30%
        let total = 0;
        let weights = 0;

        if (project.supervisorScore) {
            total += project.supervisorScore * 0.4;
            weights += 0.4;
        }

        if (project.reviewerScore) {
            total += project.reviewerScore * 0.3;
            weights += 0.3;
        }

        if (project.score) {
            // If final score is set, use it directly
            return project.score;
        }

        return weights > 0 ? total / weights * 10 : 0; // Normalize to 10
    };

    const getGradeClassification = (score: number) => {
        if (score >= 8.5) return { grade: 'A', label: 'Xuất sắc', color: '#10b981' };
        if (score >= 7.0) return { grade: 'B', label: 'Giỏi', color: '#3b82f6' };
        if (score >= 5.5) return { grade: 'C', label: 'Khá', color: '#f59e0b' };
        if (score >= 4.0) return { grade: 'D', label: 'Trung bình', color: '#f97316' };
        return { grade: 'F', label: 'Yếu', color: '#ef4444' };
    };

    const getRoleLabel = (role: string) => {
        const labels: { [key: string]: string } = {
            'supervisor': 'Giảng viên hướng dẫn',
            'reviewer': 'Giảng viên phản biện',
            'council': 'Hội đồng'
        };
        return labels[role] || role;
    };

    const getRoleIcon = (role: string) => {
        const icons: { [key: string]: string } = {
            'supervisor': '👨‍🏫',
            'reviewer': '👨‍💼',
            'council': '👥'
        };
        return icons[role] || '📝';
    };

    if (loading) {
        return <MainLayout><div style={{ padding: '2rem' }}>Đang tải...</div></MainLayout>;
    }

    if (!project) {
        return (
            <MainLayout>
                <div className={styles.container}>
                    <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</p>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Chưa có đồ án</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            Bạn cần đăng ký đề tài để xem kết quả
                        </p>
                        <button
                            onClick={() => navigate('/student/topics')}
                            className={styles.button}
                            style={{ background: '#3b82f6', color: 'white' }}
                        >
                            Đăng ký đề tài ngay
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const finalScore = calculateFinalScore();
    const gradeInfo = getGradeClassification(finalScore);
    const hasScores = evaluations.length > 0;

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/student/my-project')}
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
                            <h1 className={styles.title}>⭐ Kết Quả Đồ Án</h1>
                            <p className={styles.subtitle}>Điểm số và đánh giá</p>
                        </div>
                    </div>
                </div>

                {/* Project Info */}
                <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        {project.title}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Sinh viên: {project.studentName}
                    </p>
                </div>

                {!hasScores ? (
                    <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</p>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Chưa có điểm</h2>
                        <p style={{ color: '#64748b' }}>
                            Đồ án của bạn đang được đánh giá. Vui lòng quay lại sau.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Final Score */}
                        <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
                            <h3 className={styles.sectionTitle}>🎯 Điểm Cuối Cùng</h3>
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div
                                    style={{
                                        fontSize: '4rem',
                                        fontWeight: 700,
                                        color: gradeInfo.color,
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    {finalScore.toFixed(2)}
                                </div>
                                <div
                                    style={{
                                        fontSize: '2rem',
                                        fontWeight: 600,
                                        color: gradeInfo.color,
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    {gradeInfo.grade}
                                </div>
                                <div style={{ fontSize: '1.125rem', color: '#64748b' }}>
                                    {gradeInfo.label}
                                </div>
                            </div>

                            {/* Score Breakdown */}
                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                                    Chi tiết điểm:
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {project.supervisorScore && (
                                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                                Điểm GVHD
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>
                                                {project.supervisorScore.toFixed(2)}
                                            </div>
                                        </div>
                                    )}

                                    {project.reviewerScore && (
                                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                                Điểm phản biện
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6' }}>
                                                {project.reviewerScore.toFixed(2)}
                                            </div>
                                        </div>
                                    )}

                                    {project.score && (
                                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                                Điểm hội đồng
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10b981' }}>
                                                {project.score.toFixed(2)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Evaluations */}
                        <div className={styles.card}>
                            <h3 className={styles.sectionTitle}>💬 Đánh Giá Chi Tiết</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {evaluations.map((evaluation, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            background: '#f8fafc',
                                            padding: '1.5rem',
                                            borderRadius: '0.5rem',
                                            borderLeft: '4px solid #3b82f6'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <div>
                                                <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                                    {getRoleIcon(evaluation.evaluatorRole)} {evaluation.evaluatorName}
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                                    {getRoleLabel(evaluation.evaluatorRole)}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>
                                                    {evaluation.score.toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {new Date(evaluation.evaluatedAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ color: '#475569', lineHeight: 1.6 }}>
                                            {evaluation.comment}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default ProjectResults;
