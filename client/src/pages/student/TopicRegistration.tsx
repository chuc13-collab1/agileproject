import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import * as topicService from '../../services/api/topic.service';
import * as projectService from '../../services/api/project.service';
import { Topic } from '../../types/topic.types';
import styles from './Student.module.css';

const TopicRegistration: React.FC = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [topic, setTopic] = useState<Topic | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (topicId) loadTopic();
    }, [topicId]);

    const loadTopic = async () => {
        if (!topicId) return;
        setLoading(true);
        try {
            const data = await topicService.getTopicById(topicId);
            setTopic(data);
        } catch (error) {
            console.error('Failed to load topic:', error);
            alert('Không thể tải thông tin đề tài');
            navigate('/student/topics');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!topic || !user) return;

        if (!window.confirm('Bạn có chắc chắn muốn đăng ký đề tài này?')) return;

        setSubmitting(true);
        try {
            await projectService.createProject({
                topicId: topicId!,
                studentId: user.uid,
                studentEmail: user.email,
                studentName: user.fullName,
                supervisorId: topic.supervisorId
            });

            if (topic.supervisorId) {
                alert('Đăng ký đề tài thành công! Vui lòng chờ giảng viên duyệt.');
            } else {
                alert('Đăng ký đề tài thành công! Vui lòng chờ Admin phân công giảng viên.');
            }
            navigate('/student/my-project');
        } catch (error: any) {
            console.error('Failed to register:', error);
            // Show detailed error message from backend
            const errorMsg = error.response?.data?.message || error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            alert('❌ ' + errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <MainLayout><div style={{ padding: '2rem' }}>Đang tải...</div></MainLayout>;
    }

    if (!topic) {
        return <MainLayout><div style={{ padding: '2rem' }}>Không tìm thấy đề tài</div></MainLayout>;
    }

    const availableSlots = (topic.maxStudents || 0) - (topic.currentStudents || 0);
    const isFull = availableSlots <= 0;

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/student/topics')}
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
                            <h1 className={styles.title}>📝 Đăng Ký Đề Tài</h1>
                            <p className={styles.subtitle}>Xác nhận thông tin và đăng ký</p>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                        {topic.title}
                    </h2>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>📄 Mô tả đề tài</h3>
                        <p style={{ color: '#64748b', lineHeight: 1.6 }}>{topic.description}</p>
                        {topic.requirements && (
                            <>
                                <h4 style={{ marginTop: '1rem', fontWeight: 600 }}>Yêu cầu:</h4>
                                <p style={{ color: '#64748b', lineHeight: 1.6 }}>{topic.requirements}</p>
                            </>
                        )}
                        {topic.expectedResults && (
                            <>
                                <h4 style={{ marginTop: '1rem', fontWeight: 600 }}>Kết quả dự kiến:</h4>
                                <p style={{ color: '#64748b', lineHeight: 1.6 }}>{topic.expectedResults}</p>
                            </>
                        )}
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>ℹ️ Thông tin chi tiết</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>👨‍🏫 Giảng viên hướng dẫn</span>
                                <span className={styles.infoValue}>{topic.supervisorName || 'Chưa phân công'}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>📚 Lĩnh vực</span>
                                <span className={styles.infoValue}>{topic.field || 'Chung'}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>📅 Học kỳ</span>
                                <span className={styles.infoValue}>{topic.semester} - {topic.academicYear}</span>
                            </div>

                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>👥 Slot còn lại</span>
                                <span className={styles.infoValue} style={{ color: isFull ? '#dc2626' : '#16a34a' }}>
                                    {availableSlots}/{topic.maxStudents || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isFull ? (
                        <div
                            style={{
                                background: '#fee2e2',
                                border: '1px solid #fca5a5',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                marginTop: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>❌</span>
                            <div>
                                <div style={{ fontWeight: 600, color: '#991b1b' }}>Đề tài đã đủ sinh viên</div>
                                <div style={{ fontSize: '0.9rem', color: '#991b1b' }}>
                                    Vui lòng chọn đề tài khác
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>✅ Xác nhận đăng ký</h3>
                            <div
                                style={{
                                    background: '#f8fafc',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1rem'
                                }}
                            >
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    Bạn đang đăng ký:
                                </p>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{topic.title}</p>
                                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    Giảng viên: {topic.supervisorName}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className={styles.button}
                                    style={{
                                        flex: 1,
                                        background: submitting ? '#94a3b8' : '#3b82f6',
                                        color: 'white',
                                        padding: '0.875rem',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {submitting ? '⏳ Đang xử lý...' : '✅ Xác nhận đăng ký'}
                                </button>

                                <button
                                    onClick={() => navigate('/student/topics')}
                                    disabled={submitting}
                                    className={styles.button}
                                    style={{
                                        background: '#f1f5f9',
                                        color: '#475569'
                                    }}
                                >
                                    ← Quay lại
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default TopicRegistration;
