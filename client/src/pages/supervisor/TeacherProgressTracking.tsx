import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import styles from './Supervisor.module.css';
import { auth } from '../../services/firebase/config';

interface ProgressReport {
    id: string;
    project_id: string;
    report_title: string;
    week_number: number;
    content: string;
    status: 'submitted' | 'reviewed' | 'approved' | 'revision_needed';
    submitted_date: string;
    student_name: string;
    student_code: string;
    topic_title: string;
    file_path?: string;
    file_name?: string;
}

const TeacherProgressTracking: React.FC = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<ProgressReport[]>([]);
    const [filter, setFilter] = useState<'all' | 'submitted' | 'reviewed'>('all');
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null);
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState(5);
    const [newStatus, setNewStatus] = useState<'approved' | 'revision_needed'>('approved');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [filter, user?.uid]);

    const fetchReports = async () => {
        if (!user?.uid || !auth.currentUser) return;

        try {
            setLoading(true);
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(
                `http://localhost:3001/api/progress-reports/teachers/${user.uid}/progress-reports?status=${filter}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();
            if (data.success) {
                setReports(data.data.reports);
                setUnreadCount(data.data.unreviewed_count);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewReport = (report: ProgressReport) => {
        setSelectedReport(report);
        setCommentText('');
        setRating(5);
        setNewStatus('approved');
    };

    const handleSubmitComment = async () => {
        if (!selectedReport || !commentText.trim()) {
            alert('Vui lòng nhập nhận xét');
            return;
        }

        if (!auth.currentUser) {
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return;
        }

        try {
            setSubmitting(true);
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(
                `http://localhost:3001/api/progress-reports/${selectedReport.id}/comments`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        content: commentText,
                        rating: rating,
                        status: newStatus
                    })
                }
            );

            const data = await response.json();
            if (data.success) {
                alert('Nhận xét đã được gửi thành công!');
                setSelectedReport(null);
                fetchReports(); // Refresh list
            } else {
                alert('Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Có lỗi xảy ra khi gửi nhận xét');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: { [key: string]: { text: string; style: any } } = {
            submitted: {
                text: '🔵 Chờ xem xét',
                style: { background: '#dbeafe', color: '#1e40af' }
            },
            reviewed: {
                text: '🟢 Đã xem',
                style: { background: '#d1fae5', color: '#065f46' }
            },
            approved: {
                text: '✅ Đã duyệt',
                style: { background: '#dcfce7', color: '#166534' }
            },
            revision_needed: {
                text: '🟡 Cần sửa',
                style: { background: '#fef9c3', color: '#854d0e' }
            }
        };
        const badge = badges[status] || { text: status, style: {} };
        return (
            <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                ...badge.style
            }}>
                {badge.text}
            </span>
        );
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                {/* Header with Gradient */}
                <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                }}>
                    <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '800' }}>
                        📊 Theo Dõi Tiến Độ
                    </h1>
                    <p style={{ margin: 0, opacity: 0.9 }}>Xem và nhận xét báo cáo tiến độ của sinh viên</p>
                </div>

                {/* Filter Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: filter === 'all' ? 'none' : '2px solid #e2e8f0',
                            background: filter === 'all'
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'white',
                            color: filter === 'all' ? 'white' : '#64748b',
                            borderRadius: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: filter === 'all' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                        }}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => setFilter('submitted')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: filter === 'submitted' ? 'none' : '2px solid #e2e8f0',
                            background: filter === 'submitted'
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'white',
                            color: filter === 'submitted' ? 'white' : '#64748b',
                            borderRadius: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: filter === 'submitted' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        Chưa xem
                        {unreadCount > 0 && (
                            <span style={{
                                background: '#ef4444',
                                color: 'white',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setFilter('reviewed')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: filter === 'reviewed' ? 'none' : '2px solid #e2e8f0',
                            background: filter === 'reviewed'
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'white',
                            color: filter === 'reviewed' ? 'white' : '#64748b',
                            borderRadius: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: filter === 'reviewed' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                        }}
                    >
                        Đã xem
                    </button>
                </div>

                {/* Reports Table */}
                {loading ? (
                    <div style={{
                        padding: '4rem',
                        textAlign: 'center',
                        background: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                        <div style={{ fontSize: '1.125rem', color: '#64748b' }}>Đang tải báo cáo...</div>
                    </div>
                ) : reports.length === 0 ? (
                    <div style={{
                        padding: '4rem',
                        textAlign: 'center',
                        background: 'white',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '2px dashed #cbd5e1'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                        <div style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: '600' }}>
                            Không có báo cáo nào
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                            {filter === 'submitted' ? 'Chưa có báo cáo mới chờ xem xét' :
                                filter === 'reviewed' ? 'Chưa có báo cáo đã xem' :
                                    'Sinh viên chưa nộp báo cáo tiến độ'}
                        </div>
                    </div>
                ) : (
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Tuần</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Sinh viên</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Tiêu đề</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Ngày nộp</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Trạng thái</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id} style={{
                                        borderBottom: '1px solid #f1f5f9',
                                        transition: 'background 0.2s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    >
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#0f172a' }}>
                                            Tuần {report.week_number}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{report.student_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{report.student_code}</div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#334155' }}>{report.report_title}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                                            {new Date(report.submitted_date).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <button
                                                onClick={() => handleViewReport(report)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.4)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)';
                                                }}
                                            >
                                                👁️ Xem & Nhận xét
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Comment Modal */}
                {selectedReport && (
                    <div className={styles.modal} onClick={() => setSelectedReport(null)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>📝 Báo cáo tiến độ - Tuần {selectedReport.week_number}</h2>
                                <button onClick={() => setSelectedReport(null)}>✕</button>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.reportInfo}>
                                    <p><strong>Sinh viên:</strong> {selectedReport.student_name} ({selectedReport.student_code})</p>
                                    <p><strong>Đề tài:</strong> {selectedReport.topic_title}</p>
                                    <p><strong>Ngày nộp:</strong> {new Date(selectedReport.submitted_date).toLocaleString('vi-VN')}</p>
                                </div>

                                <div className={styles.reportContent}>
                                    <h3>{selectedReport.report_title}</h3>
                                    <p>{selectedReport.content}</p>

                                    {selectedReport.file_path && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>📎</span>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
                                                    {selectedReport.file_name || 'Tài liệu đính kèm'}
                                                </div>
                                                <a
                                                    href={`http://localhost:3001/uploads/progress-reports/${selectedReport.file_path.split(/[/\\]/).pop()}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}
                                                >
                                                    Tải xuống
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.commentForm}>
                                    <h3>💬 Nhận xét</h3>

                                    <div className={styles.ratingSection}>
                                        <label>Đánh giá: </label>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
                                                onClick={() => setRating(star)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>

                                    <textarea
                                        className={styles.commentTextarea}
                                        placeholder="Nhập nhận xét của bạn..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        rows={6}
                                    />

                                    <div className={styles.statusSelect}>
                                        <label>Trạng thái: </label>
                                        <select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value as 'approved' | 'revision_needed')}
                                        >
                                            <option value="approved">✅ Đã duyệt</option>
                                            <option value="revision_needed">🟡 Cần sửa</option>
                                        </select>
                                    </div>

                                    <button
                                        className={styles.submitBtn}
                                        onClick={handleSubmitComment}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Đang gửi...' : '💾 Gửi nhận xét'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default TeacherProgressTracking;
