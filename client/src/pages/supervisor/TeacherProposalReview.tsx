import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { topicProposalService, TopicProposal } from '../../services/api/topicProposal.service';
import styles from './Supervisor.module.css';

const TeacherProposalReview: React.FC = () => {
    const navigate = useNavigate();
    const [proposals, setProposals] = useState<TopicProposal[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal state for Reject/Revision
    const [showModal, setShowModal] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState<TopicProposal | null>(null);
    const [actionType, setActionType] = useState<'reject' | 'request_revision' | null>(null);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        loadProposals();
    }, []);

    const loadProposals = async () => {
        setLoading(true);
        try {
            const response = await topicProposalService.getTeacherProposals();
            setProposals(response.data);
        } catch (error) {
            console.error('Failed to load proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!window.confirm('Chấp thuận đề xuất này? Nó sẽ trở thành đề tài chờ Admin duyệt.')) return;

        setProcessingId(id);
        try {
            await topicProposalService.reviewProposal(id, 'approve');
            alert('✅ Đã chấp thuận đề xuất!');
            await loadProposals();
        } catch (error: any) {
            console.error('Failed to approve:', error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể chấp thuận'));
        } finally {
            setProcessingId(null);
        }
    };

    const openActionModal = (proposal: TopicProposal, type: 'reject' | 'request_revision') => {
        setSelectedProposal(proposal);
        setActionType(type);
        setFeedback('');
        setShowModal(true);
    };

    const submitAction = async () => {
        if (!selectedProposal || !actionType) return;
        if (!feedback.trim()) {
            alert('Vui lòng nhập lý do/phản hồi');
            return;
        }

        setProcessingId(selectedProposal.id);
        try {
            await topicProposalService.reviewProposal(selectedProposal.id, actionType, feedback);
            alert('✅ Đã cập nhật trạng thái đề xuất!');
            setShowModal(false);
            await loadProposals();
        } catch (error: any) {
            console.error('Failed to update proposal:', error);
            alert('Lỗi: ' + (error.response?.data?.message || 'Có lỗi xảy ra'));
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className={`${styles.badge} ${styles.badgeWarning}`}>Chờ duyệt</span>;
            case 'approved': return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Đã chấp nhận</span>;
            case 'rejected': return <span className={`${styles.badge} ${styles.badgeError}`}>Đã từ chối</span>;
            case 'revision_requested': return <span className={`${styles.badge} ${styles.badgeWarning}`} style={{ background: '#ffedd5', color: '#c2410c' }}>Yêu cầu sửa</span>;
            case 'admin_approved': return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Admin duyệt</span>;
            case 'admin_rejected': return <span className={`${styles.badge} ${styles.badgeError}`}>Admin từ chối</span>;
            default: return <span className={styles.badge}>{status}</span>;
        }
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/teacher/dashboard')}
                            style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem' }}
                        >
                            ⬅️
                        </button>
                        <div>
                            <h1 className={styles.title}>Duyệt Đề Xuất Sinh Viên</h1>
                            <p className={styles.subtitle}>Danh sách các đề tài do sinh viên đề xuất cho bạn</p>
                        </div>
                    </div>
                    <button className={styles.createButton} onClick={loadProposals}>
                        🔄 Làm mới
                    </button>
                </div>

                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Tiêu đề</th>
                                    <th>Sinh viên</th>
                                    <th>Ngày gửi</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proposals.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={styles.emptyCell}>Không có đề xuất nào đang chờ.</td>
                                    </tr>
                                ) : (
                                    proposals.map(proposal => (
                                        <tr key={proposal.id}>
                                            <td style={{ maxWidth: '300px' }}>
                                                <div className={styles.topicTitle}>{proposal.title}</div>
                                                <div className={styles.topicMeta} style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                                    {proposal.description.substring(0, 100)}...
                                                </div>
                                            </td>
                                            <td>
                                                <strong>{proposal.student_name}</strong>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{proposal.student_email || 'Email not found'}</div>
                                            </td>
                                            <td>{new Date(proposal.created_at).toLocaleDateString()}</td>
                                            <td>
                                                {getStatusBadge(proposal.status)}
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    {proposal.status === 'pending' || proposal.status === 'revision_requested' ? (
                                                        <>
                                                            <button
                                                                className={styles.iconButton}
                                                                title="Chấp thuận"
                                                                onClick={() => handleApprove(proposal.id)}
                                                                style={{ color: '#16a34a', border: '1px solid #16a34a', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem' }}
                                                                disabled={!!processingId}
                                                            >
                                                                ✅ Duyệt
                                                            </button>
                                                            <button
                                                                className={styles.iconButton}
                                                                title="Yêu cầu sửa"
                                                                onClick={() => openActionModal(proposal, 'request_revision')}
                                                                style={{ color: '#ea580c', border: '1px solid #ea580c', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem' }}
                                                                disabled={!!processingId}
                                                            >
                                                                ✏️ Sửa
                                                            </button>
                                                            <button
                                                                className={styles.iconButton}
                                                                title="Từ chối"
                                                                onClick={() => openActionModal(proposal, 'reject')}
                                                                style={{ color: '#dc2626', border: '1px solid #dc2626', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem' }}
                                                                disabled={!!processingId}
                                                            >
                                                                ❌
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className={styles.readOnlyText}>Đã xử lý</span>
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

                {/* Feedback Modal */}
                {showModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3 style={{ margin: 0, color: actionType === 'reject' ? '#dc2626' : '#ea580c' }}>
                                    {actionType === 'reject' ? 'Từ chối đề xuất' : 'Yêu cầu sửa đổi'}
                                </h3>
                                <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                                    ✕
                                </button>
                            </div>

                            <div className={styles.form}>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>Lý do / Phản hồi <span className={styles.required}>*</span>:</label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        rows={4}
                                        placeholder={actionType === 'reject' ? "Nhập lý do từ chối..." : "Nhập nội dung cần chỉnh sửa..."}
                                    />
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className={styles.cancelButton}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={submitAction}
                                    disabled={!!processingId}
                                    className={styles.submitButton}
                                    style={{
                                        background: actionType === 'reject' ? '#dc2626' : '#ea580c',
                                        boxShadow: actionType === 'reject' ? '0 4px 12px rgba(220, 38, 38, 0.25)' : '0 4px 12px rgba(234, 88, 12, 0.25)',
                                    }}
                                >
                                    {processingId ? 'Đang xử lý...' : 'Xác nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default TeacherProposalReview;
