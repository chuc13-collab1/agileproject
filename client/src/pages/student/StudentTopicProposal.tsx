import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { topicProposalService, TopicProposal } from '../../services/api/topicProposal.service';
import * as userService from '../../services/api/user.service';
import { Teacher } from '../../types/user.types';
import styles from './Student.module.css';

const StudentTopicProposal: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [myProposals, setMyProposals] = useState<TopicProposal[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        expectedResults: '',
        requestedSupervisorId: ''
    });

    useEffect(() => {
        fetchTeachers();
        fetchMyProposals();
    }, []);

    const fetchTeachers = async () => {
        try {
            const data = await userService.getAllTeachers();
            setTeachers(data);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    };

    const fetchMyProposals = async () => {
        try {
            const response = await topicProposalService.getMyProposals();
            setMyProposals(response.data);
        } catch (error) {
            console.error('Failed to fetch proposals:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.requestedSupervisorId) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc (kể cả GVHD)!');
            return;
        }

        setLoading(true);
        try {
            await topicProposalService.create(formData);
            alert('✅ Đề xuất đề tài thành công! Vui lòng chờ GVHD phản hồi.');
            // Reset form & reload list
            setFormData({
                title: '',
                description: '',
                requirements: '',
                expectedResults: '',
                requestedSupervisorId: ''
            });
            fetchMyProposals();
        } catch (error: any) {
            console.error('Failed to create proposal:', error);
            alert('❌ Lỗi: ' + (error.response?.data?.message || 'Không thể tạo đề xuất'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đề xuất này?')) return;
        try {
            await topicProposalService.deleteProposal(id);
            fetchMyProposals(); // Reload
        } catch (error: any) {
            alert('Không thể xóa: ' + (error.response?.data?.message || 'Lỗi hệ thống'));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>Chờ duyệt</span>;
            case 'approved': return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>Được chấp nhận</span>;
            case 'rejected': return <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>Bị từ chối</span>;
            case 'revision_requested': return <span style={{ background: '#ffedd5', color: '#ea580c', padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>Yêu cầu sửa đổi</span>;
            default: return <span>{status}</span>;
        }
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/student/topics')}
                            style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem' }}
                        >
                            ⬅️
                        </button>
                        <div>
                            <h1 className={styles.title}>✨ Đề Xuất Đề Tài Mới</h1>
                            <p className={styles.subtitle}>Gửi ý tưởng của bạn để giảng viên xem xét</p>
                        </div>
                    </div>
                </div>

                <div className={styles.gridContainer} style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
                    {/* Form Component */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
                            📝 Form Đề Xuất
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {/* Tên đề tài */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                                    Tên đề tài <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="VD: Xây dựng hệ thống quản lý..."
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                />
                            </div>

                            {/* GVHD */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                                    Giảng viên hướng dẫn mong muốn <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                    name="requestedSupervisorId"
                                    value={formData.requestedSupervisorId}
                                    onChange={handleChange}
                                    required
                                    aria-label="Giảng viên hướng dẫn mong muốn"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: 'white' }}
                                >
                                    <option value="">-- Chọn Giảng Viên --</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.displayName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Mô tả */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                                    Mô tả chi tiết <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    placeholder="Mô tả về mục tiêu, phạm vi và công nghệ dự kiến..."
                                    aria-label="Mô tả chi tiết"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                                        Yêu cầu kiến thức (Optional)
                                    </label>
                                    <textarea
                                        name="requirements"
                                        value={formData.requirements}
                                        onChange={handleChange}
                                        rows={3}
                                        aria-label="Yêu cầu kiến thức"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', resize: 'vertical' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                                        Kết quả dự kiến (Optional)
                                    </label>
                                    <textarea
                                        name="expectedResults"
                                        value={formData.expectedResults}
                                        onChange={handleChange}
                                        rows={3}
                                        aria-label="Kết quả dự kiến"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', resize: 'vertical' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ padding: '0.75rem 2rem', border: 'none', borderRadius: '0.5rem', background: '#2563eb', color: 'white', fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}
                                >
                                    {loading ? 'Đang gửi...' : 'Gửi Đề Xuất'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar: Danh sách đề xuất */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>
                                🗂️ Đề xuất của tôi
                            </h3>

                            {myProposals.length === 0 ? (
                                <p style={{ color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic' }}>Bạn chưa có đề xuất nào.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {myProposals.map(proposal => (
                                        <div key={proposal.id} style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#0f172a' }}>{proposal.title}</h4>
                                                {getStatusBadge(proposal.status)}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
                                                GVHD: <strong>{proposal.supervisor_name || '...'}</strong>
                                            </div>
                                            {proposal.teacher_feedback && (
                                                <div style={{ background: '#fffbeb', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', color: '#b45309', marginBottom: '0.5rem' }}>
                                                    💬 PV: {proposal.teacher_feedback}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                                                <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                                                {proposal.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleDelete(proposal.id)}
                                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                                    >
                                                        Hủy
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bfdbfe', fontSize: '0.875rem', color: '#1e40af' }}>
                            <strong>Quy trình:</strong><br />
                            1. Sinh viên gửi đề xuất.<br />
                            2. Giảng viên xem xét (Duyệt/Từ chối/Yêu cầu sửa).<br />
                            3. Nếu được duyệt, đề xuất sẽ chuyển thành Đề tài chính thức và bạn sẽ được gán vào dự án ngay lập tức.<br />
                            4. Chờ Admin phê duyệt lần cuối.
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default StudentTopicProposal;
