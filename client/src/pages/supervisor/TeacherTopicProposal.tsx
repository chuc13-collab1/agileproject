import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase/config';
import MainLayout from '../../components/layout/MainLayout';
import styles from './Supervisor.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const TeacherTopicProposal: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState<'manual' | 'ai'>('manual');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        field: 'Web Development',
        maxStudents: 2,
        semester: '1',
        academicYear: '2024-2025'
    });

    const [submitting, setSubmitting] = useState(false);

    // AI states
    const [aiKeyword, setAiKeyword] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [aiTopics, setAiTopics] = useState<Array<{ title: string; description: string; requirements: string }>>([]);
    const [selectedAiIndexes, setSelectedAiIndexes] = useState<Set<number>>(new Set());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'maxStudents' ? parseInt(value) : value
        }));
    };

    const handleAiGenerate = async () => {
        setAiLoading(true);
        setAiError('');
        setAiTopics([]);
        try {
            const token = await auth.currentUser?.getIdToken();
            const response = await fetch(`${API_URL}/ai/generate-topic`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    field: formData.field,
                    keyword: aiKeyword,
                    semester: formData.semester,
                    academicYear: formData.academicYear,
                    count: 3,
                })
            });

            const data = await response.json();
            if (data.success && data.data) {
                if (data.data.topics && Array.isArray(data.data.topics)) {
                    setAiTopics(data.data.topics);
                } else if (data.data.raw) {
                    setAiError('AI trả về kết quả không đúng format. Vui lòng thử lại.');
                }
            } else {
                setAiError(data.message || 'Lỗi AI. Vui lòng thử lại.');
            }
        } catch (error: any) {
            setAiError(error.message || 'Không thể kết nối AI.');
        } finally {
            setAiLoading(false);
        }
    };

    const toggleAiSelect = (idx: number) => {
        setSelectedAiIndexes(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const handleBatchSubmit = async () => {
        if (selectedAiIndexes.size === 0) {
            alert('Vui lòng chọn ít nhất 1 đề tài');
            return;
        }
        try {
            setSubmitting(true);
            const token = await auth.currentUser?.getIdToken();
            const selected = Array.from(selectedAiIndexes).map(i => aiTopics[i]);
            let successCount = 0;

            for (const topic of selected) {
                const res = await fetch(`${API_URL}/topics`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        title: topic.title,
                        description: topic.description,
                        requirements: topic.requirements,
                        field: formData.field,
                        maxStudents: formData.maxStudents,
                        semester: formData.semester,
                        academicYear: formData.academicYear,
                    })
                });
                const data = await res.json();
                if (data.success) successCount++;
            }

            alert(`✅ Đã tạo ${successCount}/${selected.length} đề tài thành công!`);
            navigate('/teacher/topics');
        } catch (error) {
            console.error('Batch submit error:', error);
            alert('Có lỗi xảy ra khi tạo đề tài');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            setSubmitting(true);
            const token = await auth.currentUser?.getIdToken();

            const response = await fetch(`${API_URL}/topics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    supervisorId: user?.uid,
                    status: 'pending' // Admin will approve
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Tạo đề tài thành công! Sinh viên có thể đăng ký ngay.');
                navigate('/teacher/topics');
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Error submitting topic:', error);
            alert('Có lỗi xảy ra khi đề xuất đề tài');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>📝 Đề Xuất Đề Tài Mới</h1>
                    <p>Tạo đề tài mới cho sinh viên đăng ký</p>
                </div>

                {/* Mode Toggle */}
                <div style={{
                    display: 'flex', gap: '0', marginBottom: '24px',
                    background: '#f1f5f9', borderRadius: '12px', padding: '4px', maxWidth: '400px'
                }}>
                    <button
                        type="button"
                        onClick={() => setMode('manual')}
                        style={{
                            flex: 1, padding: '10px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                            fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                            background: mode === 'manual' ? '#ffffff' : 'transparent',
                            color: mode === 'manual' ? '#1e40af' : '#64748b',
                            boxShadow: mode === 'manual' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        ✍️ Tự nhập
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('ai')}
                        style={{
                            flex: 1, padding: '10px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                            fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                            background: mode === 'ai' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                            color: mode === 'ai' ? '#ffffff' : '#64748b',
                            boxShadow: mode === 'ai' ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                        }}
                    >
                        🤖 AI gợi ý
                    </button>
                </div>

                {/* AI Panel */}
                {mode === 'ai' && (
                    <div style={{
                        background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
                        border: '1px solid #c7d2fe',
                        borderRadius: '16px', padding: '24px', marginBottom: '24px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <span style={{ fontSize: '24px' }}>🤖</span>
                            <div>
                                <h3 style={{ margin: 0, color: '#3730a3', fontSize: '16px' }}>AI Gợi Ý Đề Tài</h3>
                                <p style={{ margin: 0, color: '#6366f1', fontSize: '13px' }}>
                                    Chọn lĩnh vực, nhập từ khóa (tuỳ chọn) rồi nhấn "Tạo đề tài"
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 200px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4338ca', marginBottom: '6px' }}>
                                    Lĩnh vực
                                </label>
                                <select
                                    name="field"
                                    value={formData.field}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                                        border: '1px solid #c7d2fe', fontSize: '14px', background: '#fff',
                                    }}
                                >
                                    <option value="Web Development">Web Development</option>
                                    <option value="Mobile App">Mobile App</option>
                                    <option value="AI/ML">AI/Machine Learning</option>
                                    <option value="IoT">IoT</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Game Development">Game Development</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div style={{ flex: '2 1 300px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#4338ca', marginBottom: '6px' }}>
                                    Từ khóa gợi ý (tuỳ chọn)
                                </label>
                                <input
                                    type="text"
                                    value={aiKeyword}
                                    onChange={e => setAiKeyword(e.target.value)}
                                    placeholder="VD: quản lý bán hàng, chatbot, smart home..."
                                    style={{
                                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                                        border: '1px solid #c7d2fe', fontSize: '14px',
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleAiGenerate}
                                disabled={aiLoading}
                                style={{
                                    padding: '10px 28px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                                    fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap',
                                    background: aiLoading ? '#a5b4fc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {aiLoading ? '⏳ Đang tạo...' : '✨ Tạo đề tài'}
                            </button>
                        </div>

                        {aiError && (
                            <div style={{
                                marginTop: '12px', padding: '10px 16px', borderRadius: '8px',
                                background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px'
                            }}>
                                ⚠️ {aiError}
                            </div>
                        )}

                        {/* AI Topic Cards */}
                        {aiTopics.length > 0 && (
                            <div style={{ marginTop: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <p style={{ fontSize: '13px', color: '#4338ca', fontWeight: 600, margin: 0 }}>
                                        🎯 Tick chọn đề tài muốn tạo ({selectedAiIndexes.size}/{aiTopics.length} đã chọn):
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (selectedAiIndexes.size === aiTopics.length) setSelectedAiIndexes(new Set());
                                            else setSelectedAiIndexes(new Set(aiTopics.map((_, i) => i)));
                                        }}
                                        style={{ fontSize: '12px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        {selectedAiIndexes.size === aiTopics.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {aiTopics.map((topic, idx) => {
                                        const isSelected = selectedAiIndexes.has(idx);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => toggleAiSelect(idx)}
                                                style={{
                                                    padding: '14px 18px', borderRadius: '12px', cursor: 'pointer',
                                                    border: isSelected ? '2px solid #6366f1' : '1px solid #e0e7ff',
                                                    background: isSelected ? '#eef2ff' : '#ffffff',
                                                    transition: 'all 0.2s',
                                                    boxShadow: isSelected ? '0 2px 8px rgba(99,102,241,0.15)' : 'none',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                    <div style={{
                                                        width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
                                                        border: isSelected ? 'none' : '2px solid #c7d2fe',
                                                        background: isSelected ? '#6366f1' : '#fff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#fff', fontSize: '12px', fontWeight: 700,
                                                    }}>{isSelected && '✓'}</div>
                                                    <strong style={{ color: '#1e1b4b', fontSize: '14px' }}>{topic.title}</strong>
                                                </div>
                                                <p style={{ margin: '0 0 0 30px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                                                    {topic.description.length > 150 ? topic.description.substring(0, 150) + '...' : topic.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Batch submit button */}
                                <button
                                    type="button"
                                    onClick={handleBatchSubmit}
                                    disabled={submitting || selectedAiIndexes.size === 0}
                                    style={{
                                        marginTop: '16px', width: '100%', padding: '14px', border: 'none',
                                        borderRadius: '12px', cursor: selectedAiIndexes.size === 0 ? 'not-allowed' : 'pointer',
                                        fontWeight: 700, fontSize: '15px',
                                        background: selectedAiIndexes.size === 0 ? '#e2e8f0' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                        color: selectedAiIndexes.size === 0 ? '#94a3b8' : '#fff',
                                        boxShadow: selectedAiIndexes.size > 0 ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {submitting ? '⏳ Đang tạo...' : `🚀 Tạo ${selectedAiIndexes.size} đề tài đã chọn`}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.formCard}>
                    <form onSubmit={handleSubmit}>
                        {/* Title */}
                        <div className={styles.formGroup}>
                            <label htmlFor="title">
                                Tiêu đề đề tài <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="VD: Xây dựng hệ thống quản lý đồ án tốt nghiệp"
                                className={styles.input}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className={styles.formGroup}>
                            <label htmlFor="description">
                                Mô tả chi tiết <span className={styles.required}>*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Mô tả chi tiết về đề tài, mục tiêu, phạm vi..."
                                className={styles.textarea}
                                rows={6}
                                required
                            />
                        </div>

                        {/* Requirements */}
                        <div className={styles.formGroup}>
                            <label htmlFor="requirements">Yêu cầu sinh viên</label>
                            <textarea
                                id="requirements"
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                placeholder="VD: Có kiến thức về React, Node.js, MySQL..."
                                className={styles.textarea}
                                rows={4}
                            />
                        </div>

                        {/* Grid for smaller fields */}
                        <div className={styles.formGrid}>
                            {/* Field */}
                            <div className={styles.formGroup}>
                                <label htmlFor="field">Lĩnh vực</label>
                                <select
                                    id="field"
                                    name="field"
                                    value={formData.field}
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="Web Development">Web Development</option>
                                    <option value="Mobile App">Mobile App</option>
                                    <option value="AI/ML">AI/Machine Learning</option>
                                    <option value="IoT">IoT</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Game Development">Game Development</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Max Students */}
                            <div className={styles.formGroup}>
                                <label htmlFor="maxStudents">Số lượng SV tối đa</label>
                                <input
                                    type="number"
                                    id="maxStudents"
                                    name="maxStudents"
                                    value={formData.maxStudents}
                                    onChange={handleChange}
                                    min="1"
                                    max="5"
                                    className={styles.input}
                                />
                            </div>

                            {/* Semester */}
                            <div className={styles.formGroup}>
                                <label htmlFor="semester">Học kỳ</label>
                                <select
                                    id="semester"
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="1">Học kỳ 1</option>
                                    <option value="2">Học kỳ 2</option>
                                    <option value="summer">Học kỳ hè</option>
                                </select>
                            </div>

                            {/* Academic Year */}
                            <div className={styles.formGroup}>
                                <label htmlFor="academicYear">Năm học</label>
                                <input
                                    type="text"
                                    id="academicYear"
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleChange}
                                    placeholder="2024-2025"
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.formActions}>
                            <button
                                type="button"
                                onClick={() => navigate('/teacher/topics')}
                                className={styles.btnSecondary}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={styles.btnPrimary}
                            >
                                {submitting ? 'Đang gửi...' : 'Đề xuất đề tài'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className={styles.infoBox}>
                    <h3>ℹ️ Lưu ý</h3>
                    <ul>
                        <li>Đề tài sẽ được gửi đến Admin để phê duyệt</li>
                        <li>Sau khi được duyệt, sinh viên có thể đăng ký đề tài</li>
                        <li>Bạn có thể chỉnh sửa đề tài trong trạng thái "Chờ duyệt"</li>
                        {mode === 'ai' && <li>🤖 AI chỉ gợi ý — bạn luôn có thể chỉnh sửa trước khi gửi</li>}
                    </ul>
                </div>
            </div>
        </MainLayout>
    );
};

export default TeacherTopicProposal;
