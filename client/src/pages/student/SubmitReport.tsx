import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import * as projectService from '../../services/api/project.service';
import styles from './Student.module.css';
import { auth } from '../../services/firebase/config';

const SubmitReport: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        weekNumber: 1,
        title: '',
        content: '',
        attachments: null as File | null
    });

    useEffect(() => {
        loadProject();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!project) {
            alert('Bạn chưa có đồ án để nộp báo cáo!');
            return;
        }

        if (!formData.title.trim() || !formData.content.trim()) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        if (!auth.currentUser) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return;
        }

        if (!window.confirm('Bạn có chắc chắn muốn nộp báo cáo này?')) return;

        setSubmitting(true);
        try {
            // Get Firebase auth token
            const token = await auth.currentUser.getIdToken();

            // Create FormData for file upload
            const submitData = new FormData();
            submitData.append('projectId', project.id);
            submitData.append('reportTitle', formData.title);
            submitData.append('weekNumber', formData.weekNumber.toString());
            submitData.append('content', formData.content);

            if (formData.attachments) {
                // Thêm kiểm tra kích thước file (100MB = 100 * 1024 * 1024 bytes)
                if (formData.attachments.size > 100 * 1024 * 1024) {
                    alert('Kích thước file quá lón, vui lòng tải lên file dưới 100MB!');
                    setSubmitting(false);
                    return;
                }
                submitData.append('file', formData.attachments);
            }

            // Call backend API
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/progress-reports`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type, browser will set it with boundary for FormData
                },
                body: submitData
            });

            const data = await response.json();

            if (data.success) {
                alert('Nộp báo cáo thành công!');
                navigate('/student/reports');
            } else {
                throw new Error(data.message || 'Nộp báo cáo thất bại');
            }
        } catch (error) {
            console.error('Failed to submit report:', error);
            alert('Nộp báo cáo thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <MainLayout><div style={{ padding: '2rem' }}>Đang tải...</div></MainLayout>;
    }

    if (!project) {
        return (
            <MainLayout>
                <div className={styles.container}>
                    <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</p>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Chưa có đồ án</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            Bạn cần đăng ký đề tài trước khi nộp báo cáo
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

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/student/reports')}
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
                            <h1 className={styles.title}>📝 Nộp Báo Cáo Tiến Độ</h1>
                            <p className={styles.subtitle}>Báo cáo tiến độ tuần của bạn</p>
                        </div>
                    </div>
                </div>

                {/* Project Info */}
                <div
                    style={{
                        background: '#f8fafc',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        borderLeft: '4px solid #3b82f6'
                    }}
                >
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        Đồ án của bạn:
                    </div>
                    <div style={{ fontWeight: 600 }}>{project.title}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                        GVHD: {project.supervisor.name}
                    </div>
                </div>

                {/* Form */}
                <div className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                📅 Tuần thứ <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={formData.weekNumber}
                                onChange={(e) => setFormData({ ...formData, weekNumber: parseInt(e.target.value) })}
                                className={styles.formInput}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                📝 Tiêu đề báo cáo <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="VD: Hoàn thành module đăng nhập"
                                className={styles.formInput}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                📄 Nội dung chi tiết <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Mô tả chi tiết công việc đã làm trong tuần..."
                                className={styles.formTextarea}
                                rows={10}
                                required
                            />
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                {formData.content.length} ký tự (tối thiểu 100 ký tự)
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                📎 Tập tin đính kèm (không bắt buộc)
                            </label>
                            <input
                                type="file"
                                onChange={(e) => setFormData({ ...formData, attachments: e.target.files?.[0] || null })}
                                className={styles.formInput}
                                accept=".pdf,.doc,.docx,.zip"
                            />
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                Chấp nhận: PDF, DOC, DOCX, ZIP (tối đa 100MB)
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                type="submit"
                                disabled={submitting || formData.content.length < 100}
                                className={styles.button}
                                style={{
                                    flex: 1,
                                    background: (submitting || formData.content.length < 100) ? '#94a3b8' : '#10b981',
                                    color: 'white',
                                    padding: '0.875rem',
                                    fontSize: '1rem'
                                }}
                            >
                                {submitting ? '⏳ Đang nộp...' : '✅ Nộp báo cáo'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/student/reports')}
                                disabled={submitting}
                                className={styles.button}
                                style={{
                                    background: '#f1f5f9',
                                    color: '#475569'
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default SubmitReport;
