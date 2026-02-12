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
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxWidth: '90%',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: actionType === 'reject' ? '#dc2626' : '#ea580c' }}>
                                {actionType === 'reject' ? 'Từ chối đề xuất' : 'Yêu cầu sửa đổi'}
                            </h3>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Lý do / Phản hồi <span style={{ color: 'red' }}>*</span>:
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows={4}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                    placeholder={actionType === 'reject' ? "Nhập lý do từ chối..." : "Nhập nội dung cần chỉnh sửa..."}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={submitAction}
                                    disabled={!!processingId}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: actionType === 'reject' ? '#dc2626' : '#ea580c',
                                        color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
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
