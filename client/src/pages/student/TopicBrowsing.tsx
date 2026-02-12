import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import TopicCard from '../../components/student/TopicCard';
import { useAuth } from '../../contexts/AuthContext';
import * as topicService from '../../services/api/topic.service';
import * as projectService from '../../services/api/project.service';
import { Topic } from '../../types/topic.types';
import styles from './Student.module.css';

const TopicBrowsing: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [fieldFilter, setFieldFilter] = useState('all');
    const [myProject, setMyProject] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [user]);

    useEffect(() => {
        filterTopics();
    }, [topics, searchTerm, fieldFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allTopics, allProjects] = await Promise.all([
                topicService.getAllTopics(),
                projectService.getAllProjects()
            ]);

            // Filter only approved topics
            const approvedTopics = allTopics.filter(t => t.status === 'approved');
            setTopics(approvedTopics);

            // Check if student already has a project
            const studentProject = allProjects.find(p => p.studentId === user?.uid);
            setMyProject(studentProject);
        } catch (error) {
            console.error('Failed to load topics:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTopics = () => {
        let filtered = [...topics];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.supervisorName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by field
        if (fieldFilter !== 'all') {
            filtered = filtered.filter(t => t.field === fieldFilter);
        }

        setFilteredTopics(filtered);
    };

    const handleRegister = (topicId: string) => {
        if (myProject) {
            alert('Bạn đã đăng ký đồ án rồi!');
            return;
        }
        navigate(`/student/topics/register/${topicId}`);
    };

    // Get unique fields for filter
    const fields = Array.from(new Set(topics.map(t => t.field).filter(Boolean)));

    if (loading) {
        return <MainLayout><div style={{ padding: '2rem' }}>Đang tải danh sách đề tài...</div></MainLayout>;
    }

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                                <h1 className={styles.title}>📚 Danh Sách Đề Tài</h1>
                                <p className={styles.subtitle}>Chọn đề tài phù hợp với bạn</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/student/propose-topic')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                        >
                            ✨ Đề xuất đề tài mới
                        </button>
                    </div>
                </div>

                {/* Alert if already registered */}
                {myProject && (
                    <div
                        style={{
                            background: '#fef3c7',
                            border: '1px solid #fde047',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Bạn đã đăng ký đồ án</div>
                            <div style={{ fontSize: '0.9rem', color: '#854d0e' }}>
                                Đề tài: {myProject.title}
                                <button
                                    onClick={() => navigate('/student/my-project')}
                                    style={{
                                        marginLeft: '0.5rem',
                                        color: '#3b82f6',
                                        textDecoration: 'underline',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Xem chi tiết →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                                🔍 Tìm kiếm
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm theo tên đề tài, giảng viên..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                                📂 Lĩnh vực
                            </label>
                            <select
                                value={fieldFilter}
                                onChange={(e) => setFieldFilter(e.target.value)}
                                style={{
                                    padding: '0.75rem 2rem 0.75rem 0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.9rem',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">Tất cả</option>
                                {fields.map(field => (
                                    <option key={field} value={field}>{field}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                        Tìm thấy <strong>{filteredTopics.length}</strong> đề tài
                    </div>
                </div>

                {/* Topics Grid */}
                {filteredTopics.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '0.75rem' }}>
                        <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
                        <p style={{ color: '#64748b', fontSize: '1.125rem' }}>Không tìm thấy đề tài phù hợp</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {filteredTopics.map(topic => (
                            <TopicCard
                                key={topic.id}
                                topic={topic}
                                onRegister={handleRegister}
                                isRegistered={!!myProject}
                            />
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default TopicBrowsing;
