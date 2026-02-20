import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase/config';
import BurndownChart from '../../components/charts/BurndownChart';
import * as projectService from '../../services/api/project.service';
import styles from './Student.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Sprint {
    id?: string;
    sprintNumber: number;
    title: string;
    goals: string;
    startWeek: number;
    endWeek: number;
    weightPercent: number;
    status: 'not_started' | 'in_progress' | 'completed';
    actualProgress: number;
}

const defaultSprints: Sprint[] = [
    { sprintNumber: 1, title: 'Phân tích & Thiết kế', goals: 'Phân tích yêu cầu, thiết kế cơ sở dữ liệu, wireframe UI', startWeek: 1, endWeek: 3, weightPercent: 20, status: 'not_started', actualProgress: 0 },
    { sprintNumber: 2, title: 'Phát triển Backend', goals: 'Xây dựng API, logic nghiệp vụ, tích hợp database', startWeek: 4, endWeek: 7, weightPercent: 30, status: 'not_started', actualProgress: 0 },
    { sprintNumber: 3, title: 'Phát triển Frontend', goals: 'Xây dựng giao diện, tích hợp API, responsive design', startWeek: 8, endWeek: 11, weightPercent: 30, status: 'not_started', actualProgress: 0 },
    { sprintNumber: 4, title: 'Test & Hoàn thiện', goals: 'Kiểm thử, sửa lỗi, viết báo cáo, chuẩn bị bảo vệ', startWeek: 12, endWeek: 15, weightPercent: 20, status: 'not_started', actualProgress: 0 },
];

const SprintPlanning: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [sprints, setSprints] = useState<Sprint[]>(defaultSprints);
    const [burndownData, setBurndownData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [hasExisting, setHasExisting] = useState(false);

    const getToken = async () => {
        if (!auth.currentUser) throw new Error('Not authenticated');
        return auth.currentUser.getIdToken();
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const allProjects = await projectService.getAllProjects();
            const myProject = allProjects.find((p: any) => p.studentId === user?.uid);
            setProject(myProject || null);

            if (myProject) {
                const token = await getToken();
                // Load existing sprints
                const sprintRes = await fetch(`${API_URL}/sprints/${myProject.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const sprintData = await sprintRes.json();
                if (sprintData.success && sprintData.data.length > 0) {
                    setSprints(sprintData.data.map((s: any) => ({
                        id: s.id,
                        sprintNumber: s.sprint_number,
                        title: s.title,
                        goals: s.goals,
                        startWeek: s.start_week,
                        endWeek: s.end_week,
                        weightPercent: s.weight_percent,
                        status: s.status,
                        actualProgress: s.actual_progress,
                    })));
                    setHasExisting(true);
                }

                // Load burndown data
                const burndownRes = await fetch(`${API_URL}/sprints/${myProject.id}/burndown`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const burndown = await burndownRes.json();
                if (burndown.success) {
                    setBurndownData(burndown.data);
                }
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!project) return;
        const totalWeight = sprints.reduce((sum, s) => sum + s.weightPercent, 0);
        if (totalWeight !== 100) {
            alert(`Tổng trọng số phải bằng 100% (hiện tại: ${totalWeight}%)`);
            return;
        }
        setSaving(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/sprints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ projectId: project.id, sprints }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Lưu kế hoạch Sprint thành công!');
                setEditing(false);
                setHasExisting(true);
                loadData();
            } else {
                alert(data.message || 'Lỗi khi lưu');
            }
        } catch {
            alert('Lỗi kết nối server');
        } finally {
            setSaving(false);
        }
    };

    const updateSprint = (index: number, field: keyof Sprint, value: any) => {
        setSprints(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };

    const handleUpdateProgress = async (sprint: Sprint) => {
        const progress = prompt(`Nhập % hoàn thành cho Sprint ${sprint.sprintNumber} (0-100):`, String(sprint.actualProgress));
        if (progress === null) return;
        const val = Math.min(100, Math.max(0, parseInt(progress) || 0));

        try {
            const token = await getToken();
            await fetch(`${API_URL}/sprints/${sprint.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    actualProgress: val,
                    status: val >= 100 ? 'completed' : val > 0 ? 'in_progress' : 'not_started',
                }),
            });
            loadData();
        } catch {
            alert('Lỗi cập nhật');
        }
    };

    const totalWeight = sprints.reduce((sum, s) => sum + s.weightPercent, 0);

    if (loading) {
        return <MainLayout><div style={{ padding: '2rem' }}>Đang tải...</div></MainLayout>;
    }

    if (!project) {
        return (
            <MainLayout>
                <div className={styles.container}>
                    <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '4rem' }}>📋</p>
                        <h2>Chưa có đồ án</h2>
                        <p style={{ color: '#64748b' }}>Bạn cần đăng ký đề tài trước khi lên kế hoạch Sprint.</p>
                        <button onClick={() => navigate('/student/topics')} className={styles.button} style={{ background: '#3b82f6', color: 'white', marginTop: '1rem' }}>
                            Đăng ký đề tài
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>📋 Sprint Planning</h1>
                        <p className={styles.subtitle}>Lên kế hoạch Agile cho đồ án: <strong>{project.title}</strong></p>
                    </div>
                </div>

                {/* Burndown Chart */}
                {burndownData && burndownData.planned.length > 0 && (
                    <div className={styles.card} style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1e293b' }}>📉 Burndown Chart</h2>
                        <BurndownChart data={burndownData} />
                    </div>
                )}

                {/* Sprint List */}
                <div className={styles.card} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#1e293b' }}>🏃 Danh sách Sprint</h2>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{
                                fontSize: '0.8rem',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                background: totalWeight === 100 ? '#dcfce7' : '#fef3c7',
                                color: totalWeight === 100 ? '#166534' : '#92400e',
                                fontWeight: 600
                            }}>
                                Tổng: {totalWeight}%
                            </span>
                            {!editing && hasExisting ? (
                                <button onClick={() => setEditing(true)} className={styles.button}
                                    style={{ background: '#f59e0b', color: 'white', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                    ✏️ Chỉnh sửa
                                </button>
                            ) : (
                                <button onClick={handleSave} disabled={saving || totalWeight !== 100} className={styles.button}
                                    style={{ background: totalWeight === 100 ? '#10b981' : '#94a3b8', color: 'white', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                    {saving ? '⏳ Đang lưu...' : '💾 Lưu kế hoạch'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {sprints.map((sprint, index) => (
                            <div key={index} style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                background: sprint.status === 'completed' ? '#f0fdf4' : sprint.status === 'in_progress' ? '#eff6ff' : '#fff',
                                position: 'relative',
                            }}>
                                {/* Progress bar */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                                    borderRadius: '12px 12px 0 0', overflow: 'hidden', background: '#e2e8f0',
                                }}>
                                    <div style={{
                                        height: '100%', width: `${sprint.actualProgress}%`,
                                        background: sprint.actualProgress >= 100 ? '#10b981' : '#3b82f6',
                                        transition: 'width 0.3s',
                                    }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <span style={{
                                                background: sprint.status === 'completed' ? '#10b981' : sprint.status === 'in_progress' ? '#3b82f6' : '#94a3b8',
                                                color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600
                                            }}>
                                                Sprint {sprint.sprintNumber}
                                            </span>
                                            {editing || !hasExisting ? (
                                                <input
                                                    value={sprint.title}
                                                    onChange={e => updateSprint(index, 'title', e.target.value)}
                                                    style={{ flex: 1, padding: '0.3rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600 }}
                                                />
                                            ) : (
                                                <strong style={{ fontSize: '0.95rem' }}>{sprint.title}</strong>
                                            )}
                                        </div>

                                        {editing || !hasExisting ? (
                                            <textarea
                                                value={sprint.goals}
                                                onChange={e => updateSprint(index, 'goals', e.target.value)}
                                                rows={2}
                                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
                                                placeholder="Mục tiêu sprint..."
                                            />
                                        ) : (
                                            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0' }}>{sprint.goals}</p>
                                        )}

                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                                            {editing || !hasExisting ? (
                                                <>
                                                    <span>Tuần: <input type="number" value={sprint.startWeek} onChange={e => updateSprint(index, 'startWeek', parseInt(e.target.value) || 1)} style={{ width: '40px', padding: '2px 4px', border: '1px solid #e2e8f0', borderRadius: '4px' }} /> - <input type="number" value={sprint.endWeek} onChange={e => updateSprint(index, 'endWeek', parseInt(e.target.value) || 1)} style={{ width: '40px', padding: '2px 4px', border: '1px solid #e2e8f0', borderRadius: '4px' }} /></span>
                                                    <span>Trọng số: <input type="number" value={sprint.weightPercent} onChange={e => updateSprint(index, 'weightPercent', parseInt(e.target.value) || 0)} style={{ width: '45px', padding: '2px 4px', border: '1px solid #e2e8f0', borderRadius: '4px' }} />%</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>📅 Tuần {sprint.startWeek} - {sprint.endWeek}</span>
                                                    <span>⚖️ Trọng số: {sprint.weightPercent}%</span>
                                                    <span>📊 Hoàn thành: {sprint.actualProgress}%</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {hasExisting && !editing && (
                                        <button
                                            onClick={() => handleUpdateProgress(sprint)}
                                            className={styles.button}
                                            style={{ background: '#3b82f6', color: 'white', fontSize: '0.8rem', padding: '0.4rem 0.8rem', whiteSpace: 'nowrap' }}
                                        >
                                            📊 Cập nhật
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {(editing || !hasExisting) && (
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setSprints(prev => [...prev, {
                                    sprintNumber: prev.length + 1,
                                    title: `Sprint ${prev.length + 1}`,
                                    goals: '',
                                    startWeek: (prev[prev.length - 1]?.endWeek || 0) + 1,
                                    endWeek: (prev[prev.length - 1]?.endWeek || 0) + 3,
                                    weightPercent: 0,
                                    status: 'not_started',
                                    actualProgress: 0,
                                }])}
                                className={styles.button}
                                style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.85rem' }}
                            >
                                ➕ Thêm Sprint
                            </button>
                            {sprints.length > 1 && (
                                <button
                                    onClick={() => setSprints(prev => prev.slice(0, -1))}
                                    className={styles.button}
                                    style={{ background: '#fef2f2', color: '#dc2626', fontSize: '0.85rem' }}
                                >
                                    🗑️ Xóa Sprint cuối
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default SprintPlanning;
