import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Project } from '../../types/project.types';
import * as projectService from '../../services/api/project.service';
import { useAuth } from '../../contexts/AuthContext';
import { exportStudentsList } from '../../utils/exportUtils';
import styles from './Supervisor.module.css';

const TeacherStudentList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [students, setStudents] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) loadStudents();
    }, [user]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const allProjects = await projectService.getAllProjects();
            // Filter projects where supervisorId matches current user's ID
            // Note: Project type has supervisor: { id, name }
            const myStudents = allProjects.filter(p => p.supervisor?.id === user?.uid);
            setStudents(myStudents);
        } catch (error) {
            console.error('Failed to load students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (projectId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn duyệt sinh viên này?')) return;
        try {
            await projectService.updateProject(projectId, { status: 'in_progress' });
            await loadStudents();
        } catch (error) {
            console.error('Failed to approve project:', error);
            alert('Lỗi khi duyệt đề tài');
        }
    };

    const handleReject = async (projectId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn từ chối sinh viên này?')) return;
        try {
            await projectService.updateProject(projectId, { status: 'failed' });
            await loadStudents();
        } catch (error) {
            console.error('Failed to reject project:', error);
            alert('Lỗi khi từ chối đề tài');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'registered': return <span className={`${styles.badge} ${styles.badgeInfo}`}>Đã đăng ký</span>;
            case 'in_progress': return <span className={`${styles.badge} ${styles.badgeWarning}`}>Đang thực hiện</span>;
            case 'submitted': return <span className={`${styles.badge} ${styles.badgeWarning}`}>Đã nộp</span>;
            case 'graded': return <span className={`${styles.badge} ${styles.badgeWarning}`}>Đã chấm điểm</span>;
            case 'completed': return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Hoàn thành</span>;
            case 'failed': return <span className={`${styles.badge} ${styles.badgeError}`}>Không đạt</span>;
            default: return <span className={`${styles.badge} ${styles.badgeWarning}`}>{status}</span>;
        }
    };

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
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                color: '#64748b'
                            }}
                            title="Quay lại Dashboard"
                        >
                            ⬅️
                        </button>
                        <div style={{ flex: 1 }}>
                            <h1 className={styles.title}>Quản Lý Sinh Viên</h1>
                            <p className={styles.subtitle}>Danh sách sinh viên đang hướng dẫn</p>
                        </div>
                        <button
                            onClick={() => exportStudentsList(students)}
                            disabled={students.length === 0}
                            style={{
                                padding: '0.625rem 1.25rem',
                                backgroundColor: students.length === 0 ? '#94a3b8' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: students.length === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            title={students.length === 0 ? 'Chưa có sinh viên để export' : 'Export danh sách ra Excel'}
                        >
                            📥 Export Excel
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Mã SV</th>
                                    <th>Họ Tên</th>
                                    <th>Tên Đề Tài</th>
                                    <th>Điểm GVHD</th>
                                    <th>Điểm Phản Biện</th>
                                    <th>Trạng Thái</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className={styles.emptyCell}>Chưa có sinh viên nào đăng ký đề tài của bạn.</td>
                                    </tr>
                                ) : (
                                    students.map(project => (
                                        <tr key={project.id}>
                                            <td>
                                                {/* Project doesn't store display ID (e.g. SV001) directly, only UUID. 
                                                    We might need to fetch student details or just show email for now. 
                                                    Or assuming studentName includes ID if formatted that way elsewhere. 
                                                */}
                                                <div className={styles.topicMeta}>{project.studentEmail}</div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{project.studentName}</td>
                                            <td>
                                                <div className={styles.topicTitle}>{project.title}</div>
                                            </td>
                                            <td style={{ fontWeight: 600, color: '#3b82f6' }}>
                                                {project.supervisorScore != null ? Number(project.supervisorScore).toFixed(2) : '—'}
                                            </td>
                                            <td style={{ fontWeight: 600, color: '#8b5cf6' }}>
                                                {project.reviewerScore != null ? Number(project.reviewerScore).toFixed(2) : '—'}
                                            </td>
                                            <td>{getStatusBadge(project.status)}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button
                                                        className={styles.iconButton}
                                                        title="Xem chi tiết"
                                                        onClick={() => navigate(`/teacher/projects/${project.id}`)}
                                                    >
                                                        👁️
                                                    </button>
                                                    {project.status === 'registered' && (
                                                        <>
                                                            <button
                                                                className={styles.iconButton}
                                                                title="Duyệt đề tài"
                                                                onClick={() => handleApprove(project.id)}
                                                                style={{ color: '#16a34a' }}
                                                            >
                                                                ✅
                                                            </button>
                                                            <button
                                                                className={styles.iconButton}
                                                                title="Từ chối"
                                                                onClick={() => handleReject(project.id)}
                                                                style={{ color: '#dc2626' }}
                                                            >
                                                                ❌
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default TeacherStudentList;
