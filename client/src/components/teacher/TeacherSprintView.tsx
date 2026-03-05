import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase/config';

interface Sprint {
    id: string;
    sprint_number: number;
    title: string;
    goals: string;
    start_week: number;
    end_week: number;
    weight_percent: number;
    status: 'not_started' | 'in_progress' | 'completed';
    actual_progress: number;
}

interface SprintComment {
    id: string;
    sprint_id: string;
    author_name: string;
    author_role: string;
    content: string;
    created_at: string;
}

interface BurndownData {
    planned: { week: number; remaining: number }[];
    actual: { week: number; remaining: number }[];
    totalWeeks: number;
}

interface TeacherSprintViewProps {
    projectId: string;
}

const TeacherSprintView: React.FC<TeacherSprintViewProps> = ({ projectId }) => {
    const { user } = useAuth();
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [comments, setComments] = useState<SprintComment[]>([]);
    const [burndown, setBurndown] = useState<BurndownData | null>(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [selectedSprintId, setSelectedSprintId] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [projectId]);

    const getAuthHeaders = async (): Promise<HeadersInit> => {
        const token = await auth.currentUser?.getIdToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const headers = await getAuthHeaders();

            const [sprintsRes, burndownRes, commentsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/sprints/${projectId}`, { headers }),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/sprints/${projectId}/burndown`, { headers }),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/sprints/${projectId}/comments`, { headers }),
            ]);

            const sprintsData = await sprintsRes.json();
            const burndownData = await burndownRes.json();
            const commentsData = await commentsRes.json();

            if (sprintsData.success) setSprints(sprintsData.data);
            if (burndownData.success) setBurndown(burndownData.data);
            if (commentsData.success) setComments(commentsData.data);
        } catch (error) {
            console.error('Failed to load sprint data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !selectedSprintId) return;
        setSubmitting(true);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/sprints/${selectedSprintId}/comments`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    projectId,
                    authorUid: user?.uid,
                    authorName: user?.fullName || 'Giảng viên',
                    authorRole: 'teacher',
                    content: newComment.trim(),
                }),
            });

            const result = await response.json();
            if (result.success) {
                setComments(prev => [result.data, ...prev]);
                setNewComment('');
                setSelectedSprintId('');
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
            alert('Không thể gửi nhận xét');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return { bg: '#dcfce7', color: '#166534', text: '✅ Hoàn thành' };
            case 'in_progress': return { bg: '#dbeafe', color: '#1e40af', text: '⚡ Đang thực hiện' };
            default: return { bg: '#f1f5f9', color: '#64748b', text: '⏳ Chưa bắt đầu' };
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return '#10b981';
        if (progress >= 50) return '#f59e0b';
        if (progress >= 25) return '#f97316';
        return '#ef4444';
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                ⏳ Đang tải thông tin Sprint...
            </div>
        );
    }

    if (sprints.length === 0) {
        return (
            <div style={{
                padding: '3rem', textAlign: 'center', color: '#94a3b8',
                background: '#f8fafc', borderRadius: '0.75rem', border: '2px dashed #cbd5e1'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏃</div>
                <div style={{ fontSize: '0.95rem' }}>Sinh viên chưa tạo Sprint nào</div>
            </div>
        );
    }

    const totalProgress = sprints.reduce((sum, s) => sum + (s.actual_progress / 100) * s.weight_percent, 0);

    return (
        <div>
            {/* Overall Progress */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', color: 'white',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>📊 Tiến độ tổng thể</h3>
                    <span style={{ fontSize: '2rem', fontWeight: '800' }}>{Math.round(totalProgress)}%</span>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.2)', borderRadius: '999px', height: '10px', overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${Math.min(totalProgress, 100)}%`, height: '100%',
                        background: 'rgba(255,255,255,0.9)', borderRadius: '999px',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.875rem', opacity: 0.9 }}>
                    <span>🏃 {sprints.filter(s => s.status === 'in_progress').length} đang chạy</span>
                    <span>✅ {sprints.filter(s => s.status === 'completed').length} hoàn thành</span>
                    <span>⏳ {sprints.filter(s => s.status === 'not_started').length} chưa bắt đầu</span>
                </div>
            </div>

            {/* Burndown Chart (Simple Text-Based) */}
            {burndown && burndown.planned.length > 0 && (
                <div style={{
                    background: 'white', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '700', color: '#1e293b' }}>
                        📈 Burndown Chart
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {burndown.planned.map((p, i) => {
                            const actual = burndown.actual[i];
                            const maxHeight = 120;
                            const plannedHeight = (p.remaining / 100) * maxHeight;
                            const actualHeight = actual ? (actual.remaining / 100) * maxHeight : 0;

                            return (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px' }}>
                                    <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: `${maxHeight}px` }}>
                                        <div style={{
                                            width: '16px', height: `${plannedHeight}px`,
                                            background: 'linear-gradient(180deg, #94a3b8, #cbd5e1)',
                                            borderRadius: '3px 3px 0 0', transition: 'height 0.3s'
                                        }} title={`Kế hoạch: ${p.remaining}%`} />
                                        <div style={{
                                            width: '16px', height: `${actualHeight}px`,
                                            background: actualHeight > plannedHeight
                                                ? 'linear-gradient(180deg, #ef4444, #fca5a5)'
                                                : 'linear-gradient(180deg, #10b981, #6ee7b7)',
                                            borderRadius: '3px 3px 0 0', transition: 'height 0.3s'
                                        }} title={`Thực tế: ${actual?.remaining || 0}%`} />
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>T{p.week}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                        <span>▓ Kế hoạch</span>
                        <span style={{ color: '#10b981' }}>▓ Thực tế (tốt)</span>
                        <span style={{ color: '#ef4444' }}>▓ Thực tế (trễ)</span>
                    </div>
                </div>
            )}

            {/* Sprint Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {sprints.map(sprint => {
                    const statusInfo = getStatusStyle(sprint.status);
                    const sprintComments = comments.filter(c => c.sprint_id === sprint.id);

                    return (
                        <div key={sprint.id} style={{
                            background: 'white', borderRadius: '1rem', padding: '1.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0',
                            transition: 'all 0.3s'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                                        Sprint {sprint.sprint_number}: {sprint.title}
                                    </h4>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        Tuần {sprint.start_week} → {sprint.end_week} • Trọng số: {sprint.weight_percent}%
                                    </div>
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600',
                                    background: statusInfo.bg, color: statusInfo.color
                                }}>
                                    {statusInfo.text}
                                </span>
                            </div>

                            {sprint.goals && (
                                <div style={{
                                    fontSize: '0.875rem', color: '#475569', marginBottom: '1rem',
                                    padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', lineHeight: '1.6'
                                }}>
                                    🎯 {sprint.goals}
                                </div>
                            )}

                            {/* Progress bar */}
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                    <span style={{ color: '#64748b' }}>Tiến độ thực tế</span>
                                    <span style={{ fontWeight: '700', color: getProgressColor(sprint.actual_progress) }}>
                                        {sprint.actual_progress}%
                                    </span>
                                </div>
                                <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${sprint.actual_progress}%`, height: '100%',
                                        background: getProgressColor(sprint.actual_progress),
                                        borderRadius: '999px', transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>

                            {/* Sprint Comments */}
                            {sprintComments.length > 0 && (
                                <div style={{ marginTop: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
                                        💬 Nhận xét ({sprintComments.length})
                                    </div>
                                    {sprintComments.map(c => (
                                        <div key={c.id} style={{
                                            padding: '0.5rem 0.75rem', background: c.author_role === 'teacher' ? '#fffbeb' : '#f0fdf4',
                                            borderRadius: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem',
                                            border: `1px solid ${c.author_role === 'teacher' ? '#fde68a' : '#bbf7d0'}`
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <strong style={{ color: c.author_role === 'teacher' ? '#92400e' : '#166534' }}>
                                                    {c.author_role === 'teacher' ? '👨‍🏫' : '👤'} {c.author_name}
                                                </strong>
                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                    {new Date(c.created_at).toLocaleString('vi-VN')}
                                                </span>
                                            </div>
                                            <div style={{ color: '#475569' }}>{c.content}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Comment Section */}
            <div style={{
                background: 'white', borderRadius: '1rem', padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0'
            }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '700', color: '#1e293b' }}>
                    ✍️ Gửi nhận xét Sprint
                </h3>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>
                        Chọn Sprint
                    </label>
                    <select
                        value={selectedSprintId}
                        onChange={e => setSelectedSprintId(e.target.value)}
                        style={{
                            width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0',
                            borderRadius: '0.75rem', fontSize: '0.875rem', background: 'white'
                        }}
                    >
                        <option value="">-- Chọn Sprint --</option>
                        {sprints.map(s => (
                            <option key={s.id} value={s.id}>Sprint {s.sprint_number}: {s.title}</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' }}>
                        Nội dung nhận xét
                    </label>
                    <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Nhập nhận xét về Sprint này..."
                        rows={3}
                        style={{
                            width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0',
                            borderRadius: '0.75rem', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical'
                        }}
                    />
                </div>
                <button
                    onClick={handleAddComment}
                    disabled={submitting || !newComment.trim() || !selectedSprintId}
                    style={{
                        background: (!newComment.trim() || !selectedSprintId)
                            ? '#cbd5e1' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white', border: 'none', padding: '0.75rem 2rem',
                        borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: '700',
                        cursor: (!newComment.trim() || !selectedSprintId) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    {submitting ? '⏳ Đang gửi...' : '💬 Gửi Nhận Xét'}
                </button>
            </div>
        </div>
    );
};

export default TeacherSprintView;
