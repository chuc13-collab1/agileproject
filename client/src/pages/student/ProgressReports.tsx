import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';

import styles from './Student.module.css';
import { auth } from '../../services/firebase/config';

interface ProgressReport {
    id: string;
    project_id: string;
    report_title: string;
    week_number: number;
    content: string;
    status: 'submitted' | 'reviewed' | 'approved' | 'revision_needed';
    submitted_date: string;
    supervisor_comment?: string;
    rating?: number;
}

const ProgressReports: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [reports, setReports] = useState<ProgressReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadReports();
    }, [user]);

    const loadReports = async () => {
        if (!user?.uid || !auth.currentUser) {
            console.log('No authenticated user');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/progress-reports/students/${user.uid}/reports`;
            console.log('Fetching reports from:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Reports data:', data);

                if (data.success) {
                    setReports(data.data || []);
                } else {
                    console.error('API returned success=false:', data.message);
                }
            } else {
                console.error('HTTP error:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: { text: string; className: string } } = {
            'submitted': { text: 'Đã nộp', className: styles.badgeWarning },
            'reviewed': { text: 'Đã xem', className: styles.badgeInfo },
            'approved': { text: 'Đã duyệt', className: styles.badgeSuccess },
            'revision_needed': { text: 'Cần sửa', className: styles.badgeError }
        };

        const statusInfo = statusMap[status] || { text: status, className: styles.badgeWarning };
        return <span className={`${styles.badge} ${statusInfo.className}`}>{statusInfo.text}</span>;
    };

    const filteredReports = filter === 'all'
        ? reports
        : reports.filter(r => r.status === filter);

    if (loading) {
        return <MainLayout><div style={{ padding: '2rem' }}>Đang tải...</div></MainLayout>;
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
                        <div style={{ flex: 1 }}>
                            <h1 className={styles.title}>📊 Báo Cáo Tiến Độ</h1>
                            <p className={styles.subtitle}>Danh sách báo cáo đã nộp</p>
                        </div>
                        <button
                            onClick={() => navigate('/student/reports/submit')}
                            className={styles.button}
                            style={{ background: '#10b981', color: 'white' }}
                        >
                            ➕ Nộp báo cáo mới
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'submitted', label: 'Đã nộp' },
                        { value: 'reviewed', label: 'Đã xem' },
                        { value: 'approved', label: 'Đã duyệt' },
                        { value: 'revision_needed', label: 'Cần sửa' }
                    ].map(item => (
                        <button
                            key={item.value}
                            onClick={() => setFilter(item.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                border: 'none',
                                borderRadius: '0.5rem',
                                background: filter === item.value ? '#3b82f6' : '#f1f5f9',
                                color: filter === item.value ? 'white' : '#475569',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Reports List */}
                {filteredReports.length === 0 ? (
                    <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</p>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Chưa có báo cáo nào</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            Bạn chưa nộp báo cáo tiến độ nào
                        </p>
                        <button
                            onClick={() => navigate('/student/reports/submit')}
                            className={styles.button}
                            style={{ background: '#10b981', color: 'white' }}
                        >
                            ➕ Nộp báo cáo đầu tiên
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredReports.map(report => (
                            <div key={report.id} className={styles.card}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                            Tuần {report.week_number}: {report.report_title}
                                        </h3>
                                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                            Nộp ngày: {new Date(report.submitted_date).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    {getStatusBadge(report.status)}
                                </div>

                                <p style={{ color: '#64748b', marginBottom: '1rem', lineHeight: 1.6 }}>
                                    {report.content.substring(0, 200)}...
                                </p>

                                {report.supervisor_comment && (
                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6', marginTop: '1rem' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>
                                            💬 Nhận xét từ GVHD:
                                        </div>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{report.supervisor_comment}</p>
                                        {report.rating && (
                                            <div style={{ marginTop: '0.5rem', color: '#f59e0b' }}>
                                                {'⭐'.repeat(report.rating)}
                                            </div>
                                        )}
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

export default ProgressReports;
