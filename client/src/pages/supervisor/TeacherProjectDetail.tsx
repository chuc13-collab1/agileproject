import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import TeacherGradingPanel from '../../components/teacher/TeacherGradingPanel';
import { Project } from '../../types/project.types';
import * as projectService from '../../services/api/project.service';
import styles from './Supervisor.module.css';

const TeacherProjectDetail: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth(); // Get current user
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        if (projectId) loadProject();
    }, [projectId]);

    const loadProject = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await projectService.getProjectById(projectId);
            setProject(data);
            if (data) {
                setFeedback(data.supervisorComment || '');
            }
        } catch (error) {
            console.error('Failed to load project:', error);
            alert('Không thể tải thông tin đồ án');
        } finally {
            setLoading(false);
        }
    };

    const handleFeedback = async () => {
        if (!project) return;
        try {
            await projectService.updateProject(project.id, { supervisorComment: feedback });
            alert('Đã gửi nhận xét thành công!');
        } catch (error) {
            console.error('Failed to send feedback:', error);
            alert('Lỗi khi gửi nhận xét');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'registered': return <span className={`${styles.badge} ${styles.badgeInfo}`}>📋 Đã đăng ký</span>;
            case 'in_progress': return <span className={`${styles.badge} ${styles.badgeWarning}`}>⚡ Đang thực hiện</span>;
            case 'submitted': return <span className={`${styles.badge} ${styles.badgeWarning}`}>📤 Đã nộp</span>;
            case 'graded': return <span className={`${styles.badge} ${styles.badgeInfo}`}>📊 Đã chấm điểm</span>;
            case 'completed': return <span className={`${styles.badge} ${styles.badgeSuccess}`}>✅ Hoàn thành</span>;
            case 'failed': return <span className={`${styles.badge} ${styles.badgeError}`}>❌ Không đạt</span>;
            default: return <span className={`${styles.badge} ${styles.badgeWarning}`}>⏳ {status}</span>;
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div style={{ padding: '4rem', textAlign: 'center', fontSize: '1.125rem', color: '#64748b' }}>
                    <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>⏳</div>
                    Đang tải thông tin đồ án...
                </div>
            </MainLayout>
        );
    }

    if (!project) {
        return (
            <MainLayout>
                <div style={{ padding: '4rem', textAlign: 'center', fontSize: '1.125rem', color: '#ef4444' }}>
                    <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>❌</div>
                    Không tìm thấy đồ án
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className={styles.container}>
                {/* Header with Gradient Background */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                }}>
                    <button
                        onClick={() => navigate('/teacher/students')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            marginBottom: '1rem',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    >
                        ⬅️ Quay lại
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                            <h1 style={{ margin: '0 0 0.75rem 0', fontSize: '2rem', fontWeight: '800' }}>
                                {project.title}
                            </h1>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                {getStatusBadge(project.status)}
                                <span style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                    📚 {project.field}
                                </span>
                                <span style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                    📅 {project.academicYear} - HK{project.semester}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* Student Info Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.3s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.15)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.75rem'
                            }}>
                                👤
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: '#1e293b' }}>
                                Thông Tin Sinh Viên
                            </h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>HỌ TÊN</div>
                                <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '600' }}>{project.studentName}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>EMAIL</div>
                                <div style={{ fontSize: '0.875rem', color: '#475569' }}>{project.studentEmail}</div>
                            </div>
                        </div>
                    </div>

                    {/* Project Info Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.3s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.15)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.75rem'
                            }}>
                                📊
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: '#1e293b' }}>
                                Thông Tin Đồ Án
                            </h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>LĨNH VỰC</div>
                                <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '600' }}>{project.field}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>NĂM HỌC</div>
                                    <div style={{ fontSize: '0.875rem', color: '#475569' }}>{project.academicYear}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.25rem' }}>HỌC KỲ</div>
                                    <div style={{ fontSize: '0.875rem', color: '#475569' }}>Học kỳ {project.semester}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                {project.description && (
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📝 Mô tả đồ án
                        </h3>
                        <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.75' }}>
                            {project.description}
                        </div>
                    </div>
                )}

                {/* Feedback Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💬 Nhận xét của GVHD
                    </h3>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Nhập nhận xét, góp ý cho sinh viên..."
                        rows={5}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            border: '2px solid #e2e8f0',
                            borderRadius: '0.75rem',
                            fontSize: '0.95rem',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            marginBottom: '1rem',
                            transition: 'all 0.2s'
                        }}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                    <button
                        onClick={handleFeedback}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 2rem',
                            borderRadius: '0.75rem',
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        }}
                    >
                        💾 Lưu Nhận Xét
                    </button>
                </div>

                {/* Documents Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📁 Tài liệu đã nộp
                    </h3>

                    {project.documents && project.documents.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {project.documents.map((doc: any, index: number) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    background: '#f8fafc',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e2e8f0',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ fontSize: '1.5rem' }}>📄</div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{doc.document_type || 'Tài liệu'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                Nộp lúc: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString('vi-VN') : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    <button style={{
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        onClick={() => doc.url && window.open(doc.url, '_blank')}
                                    >
                                        Tải xuống
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: '#94a3b8',
                            background: '#f8fafc',
                            borderRadius: '0.5rem',
                            border: '2px dashed #cbd5e1'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</div>
                            <div style={{ fontSize: '0.95rem' }}>Sinh viên chưa nộp tài liệu nào</div>
                        </div>
                    )}
                </div>

                {/* Progress Reports Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📊 Báo cáo tiến độ
                    </h3>

                    {project.progressReports && project.progressReports.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {project.progressReports.map((report: any, index: number) => (
                                <div key={index} style={{
                                    padding: '1.25rem',
                                    background: '#f8fafc',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                                                Tuần {report.week_number}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                Nộp: {report.submitted_at ? new Date(report.submitted_at).toLocaleString('vi-VN') : 'Chưa nộp'}
                                            </div>
                                        </div>
                                        {report.status && (
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: report.status === 'approved' ? '#dcfce7' : '#fef9c3',
                                                color: report.status === 'approved' ? '#166534' : '#854d0e'
                                            }}>
                                                {report.status === 'approved' ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
                                            </span>
                                        )}
                                    </div>
                                    {report.content && (
                                        <div style={{
                                            padding: '0.75rem',
                                            background: 'white',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            color: '#475569',
                                            lineHeight: '1.6'
                                        }}>
                                            {report.content}
                                        </div>
                                    )}
                                    {report.teacher_comment && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            padding: '0.75rem',
                                            background: '#fffbeb',
                                            border: '1px solid #fde68a',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem'
                                        }}>
                                            <strong style={{ color: '#92400e' }}>💬 Nhận xét:</strong> {report.teacher_comment}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: '#94a3b8',
                            background: '#f8fafc',
                            borderRadius: '0.5rem',
                            border: '2px dashed #cbd5e1'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📋</div>
                            <div style={{ fontSize: '0.95rem' }}>Chưa có báo cáo tiến độ nào</div>
                        </div>
                    )}
                </div>

                {/* Grading Panels based on Role */}
                {user && project.supervisor && user.uid === project.supervisor.id && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                            👨‍🏫 Chấm điểm (Vai trò: GV Hướng Dẫn)
                        </h3>
                        <TeacherGradingPanel
                            projectId={project.id}
                            currentEvaluation={project.evaluations?.find((e: any) => e.evaluator_type === 'supervisor')}
                            evaluatorRole="supervisor"
                            onSubmitSuccess={loadProject}
                        />
                    </div>
                )}

                {user && project.reviewer && user.uid === project.reviewer.id && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                            👨‍⚖️ Chấm điểm (Vai trò: GV Phản Biện)
                        </h3>
                        <TeacherGradingPanel
                            projectId={project.id}
                            currentEvaluation={project.evaluations?.find((e: any) => e.evaluator_type === 'reviewer')}
                            evaluatorRole="reviewer"
                            onSubmitSuccess={loadProject}
                        />
                    </div>
                )}

                {/* Show if neither (e.g. Admin or just viewing) */}
                {(!user || ((!project.supervisor || user.uid !== project.supervisor.id) && (!project.reviewer || user.uid !== project.reviewer.id))) && (
                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                        <p style={{ color: '#64748b' }}>Bạn không có quyền chấm điểm đồ án này.</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default TeacherProjectDetail;
