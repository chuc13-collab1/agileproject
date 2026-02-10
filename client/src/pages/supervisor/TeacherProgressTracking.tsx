import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Supervisor.module.css';

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
        if (!user?.uid) return;

        try {
            setLoading(true);
            const token = await (user as any).getIdToken();
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

        try {
            setSubmitting(true);
            const token = await (user as any)?.getIdToken();
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
        const badges: { [key: string]: string } = {
            submitted: '🔵 Chờ xem xét',
            reviewed: '🟢 Đã xem',
            approved: '✅ Đã duyệt',
            revision_needed: '🟡 Cần sửa'
        };
        return badges[status] || status;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>📊 Theo Dõi Tiến Độ</h1>
                <p>Xem và nhận xét báo cáo tiến độ của sinh viên</p>
            </div>

            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Tất cả
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'submitted' ? styles.active : ''}`}
                    onClick={() => setFilter('submitted')}
                >
                    Chưa xem {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'reviewed' ? styles.active : ''}`}
                    onClick={() => setFilter('reviewed')}
                >
                    Đã xem
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Đang tải...</div>
            ) : reports.length === 0 ? (
                <div className={styles.empty}>Không có báo cáo nào</div>
            ) : (
                <div className={styles.reportsTable}>
                    <table>
                        <thead>
                            <tr>
                                <th>Tuần</th>
                                <th>Sinh viên</th>
                                <th>Tiêu đề</th>
                                <th>Ngày nộp</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.id}>
                                    <td>Tuần {report.week_number}</td>
                                    <td>
                                        <div>
                                            <strong>{report.student_name}</strong>
                                            <br />
                                            <small>{report.student_code}</small>
                                        </div>
                                    </td>
                                    <td>{report.report_title}</td>
                                    <td>{new Date(report.submitted_date).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <span className={styles.statusBadge}>
                                            {getStatusBadge(report.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={styles.viewBtn}
                                            onClick={() => handleViewReport(report)}
                                        >
                                            Xem & Nhận xét
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
                            <h2>Báo cáo tiến độ - Tuần {selectedReport.week_number}</h2>
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
                            </div>

                            <div className={styles.commentForm}>
                                <h3>Nhận xét</h3>

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
                                    {submitting ? 'Đang gửi...' : 'Gửi nhận xét'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherProgressTracking;
