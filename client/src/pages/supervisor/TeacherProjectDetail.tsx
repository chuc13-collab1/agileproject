import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import TeacherGradingPanel from '../../components/teacher/TeacherGradingPanel';
import { Project } from '../../types/project.types';
import * as projectService from '../../services/api/project.service';
import styles from './Supervisor.module.css';

const TeacherProjectDetail: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
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
            case 'completed': return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Hoàn thành</span>;
            case 'in-progress': return <span className={`${styles.badge} ${styles.badgeWarning}`}>Đang thực hiện</span>;
            case 'rejected': return <span className={`${styles.badge} ${styles.badgeError}`}>Bị hủy/Từ chối</span>;
            case 'pending': return <span className={`${styles.badge} ${styles.badgeWarning}`}>Chờ duyệt</span>;
            default: return <span className={`${styles.badge} ${styles.badgeWarning}`}>{status}</span>;
        }
    };

    if (loading) return <MainLayout><div>Đang tải...</div></MainLayout>;
    if (!project) return <MainLayout><div>Không tìm thấy đồ án</div></MainLayout>;

    return (
        <MainLayout>
            <div className={styles.container}>
                <button onClick={() => navigate('/teacher/students')} className={styles.backButton}>
                    ⬅️ Quay lại
                </button>

                <div className={styles.detailCard}>
                    <div className={styles.header}>
                        <div>
                            <h1>{project.title}</h1>
                            {getStatusBadge(project.status)}
                        </div>
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.section}>
                            <h3>👤 Thông Tin Sinh Viên</h3>
                            <p><strong>Họ tên:</strong> {project.studentName}</p>
                            <p><strong>Email:</strong> {project.studentEmail}</p>
                            {/* Placeholder for extra info until backend supports it */}
                            <p><strong>Lớp:</strong> ---</p>
                            <p><strong>SĐT:</strong> ---</p>
                        </div>

                        <div className={styles.section}>
                            <h3>📚 Thông Tin Đồ Án</h3>
                            <p><strong>Lĩnh vực:</strong> {project.field}</p>
                            <p><strong>Năm học:</strong> {project.academicYear}</p>
                            <p><strong>Học kỳ:</strong> {project.semester}</p>
                        </div>
                    </div>

                    <div className={styles.description}>
                        <h3>Mô tả</h3>
                        <p>{project.description}</p>
                    </div>

                    <div className={styles.feedbackSection}>
                        <h3>💬 Nhận xét của GVHD</h3>
                        <textarea
                            className={styles.feedbackInput}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Nhập nhận xét, góp ý cho sinh viên..."
                            rows={4}
                        />
                        <button className={styles.saveButton} onClick={handleFeedback}>
                            Lưu Nhận Xét
                        </button>
                    </div>

                    {/* Enhanced Grading Panel */}
                    <TeacherGradingPanel
                        projectId={project.id}
                        currentEvaluation={null}
                        onSubmitSuccess={loadProject}
                    />
                </div>
            </div>
        </MainLayout>
    );
};

export default TeacherProjectDetail;
