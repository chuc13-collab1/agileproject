import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import TeacherTopicModal from '../../components/supervisor/TeacherTopicModal';
import { Topic, TopicFormData } from '../../types/topic.types';
import * as topicService from '../../services/api/topic.service';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Supervisor.module.css';

const TeacherTopicList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    useEffect(() => {
        if (user) loadTopics();
    }, [user]);

    const loadTopics = async () => {
        setLoading(true);
        try {
            // In a real app, this should filter by supervisorId=user.uid on the backend
            // For now we filter on client side if API doesn't support it directly
            const allTopics = await topicService.getAllTopics();
            const myTopics = allTopics.filter(t => t.supervisorId === user?.uid);
            setTopics(myTopics);
        } catch (error) {
            console.error('Failed to load topics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: TopicFormData) => {
        try {
            await topicService.createTopic(data);
            await loadTopics();
            setShowModal(false);
        } catch (error) {
            console.error('Failed to create topic:', error);
            alert('Không thể tạo đề tài');
        }
    };

    const handleUpdate = async (data: TopicFormData) => {
        if (!selectedTopic) return;
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { attachments, ...updates } = data;
            await topicService.updateTopic(selectedTopic.id, updates);
            await loadTopics();
            setShowModal(false);
            setSelectedTopic(null);
        } catch (error) {
            console.error('Failed to update topic:', error);
            alert('Không thể cập nhật đề tài');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đề tài này?')) return;
        try {
            await topicService.deleteTopic(id);
            await loadTopics();
        } catch (error) {
            console.error('Failed to delete topic:', error);
            alert('Không thể xóa đề tài');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Đã duyệt</span>;
            case 'rejected': return <span className={`${styles.badge} ${styles.badgeError}`}>Từ chối</span>;
            default: return <span className={`${styles.badge} ${styles.badgeWarning}`}>Chờ duyệt</span>;
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
                        <div>
                            <h1 className={styles.title}>Quản Lý Đề Tài</h1>
                            <p className={styles.subtitle}>Danh sách các đề tài bạn đã đề xuất</p>
                        </div>
                    </div>
                    <button className={styles.createButton} onClick={() => { setSelectedTopic(null); setShowModal(true); }}>
                        + Đề xuất mới
                    </button>
                </div>

                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Tên Đề Tài</th>
                                    <th>Lĩnh Vực</th>
                                    <th>Trạng Thái</th>
                                    <th>Sinh Viên</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topics.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={styles.emptyCell}>Chưa có đề tài nào. Hãy tạo đề tài mới!</td>
                                    </tr>
                                ) : (
                                    topics.map(topic => (
                                        <tr key={topic.id}>
                                            <td>
                                                <div className={styles.topicTitle}>{topic.title}</div>
                                                <div className={styles.topicMeta}>{topic.academicYear} - HK{topic.semester}</div>
                                            </td>
                                            <td>{topic.field}</td>
                                            <td>{getStatusBadge(topic.status)}</td>
                                            <td>{topic.currentStudents}/{topic.maxStudents}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    {topic.status === 'pending' && (
                                                        <>
                                                            <button
                                                                className={styles.iconButton}
                                                                onClick={() => { setSelectedTopic(topic); setShowModal(true); }}
                                                                title="Chỉnh sửa"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                className={styles.iconButton}
                                                                onClick={() => handleDelete(topic.id)}
                                                                title="Xóa"
                                                                style={{ color: '#ef4444' }}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </>
                                                    )}
                                                    {topic.status !== 'pending' && (
                                                        <span className={styles.readOnlyText}>Chỉ xem</span>
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

                {showModal && (
                    <TeacherTopicModal
                        topic={selectedTopic}
                        onClose={() => { setShowModal(false); setSelectedTopic(null); }}
                        onSave={selectedTopic ? handleUpdate : handleCreate}
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default TeacherTopicList;
