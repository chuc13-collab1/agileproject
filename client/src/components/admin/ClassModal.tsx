import { useState } from 'react';
import { Class, ClassFormData } from '../../types/class.types';
import { Teacher } from '../../types/user.types';
import styles from './ProjectModal.module.css';

interface ClassModalProps {
    cls?: Class;
    teachers: Teacher[];
    onClose: () => void;
    onSave: (data: ClassFormData) => Promise<void>;
}

function ClassModal({ cls, teachers, onClose, onSave }: ClassModalProps) {
    const [formData, setFormData] = useState<ClassFormData>({
        classCode: cls?.classCode || '',
        className: cls?.className || '',
        academicYear: cls?.academicYear || '2024-2028',
        advisorTeacherId: cls?.advisorTeacher?.id || '',
        maxStudents: cls?.maxStudents || 40,
        major: cls?.major || '',
        description: cls?.description || '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.classCode || !formData.academicYear) {
            setError('Mã lớp và năm học là bắt buộc');
            return;
        }

        setSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Không thể lưu lớp học');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{cls ? '✏️ Sửa Lớp Học' : '➕ Thêm Lớp Học Mới'}</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalBody}>
                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: '#fee2e2',
                            border: '1px solid #ef4444',
                            borderRadius: '6px',
                            color: '#991b1b',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Mã lớp *</label>
                            <input
                                type="text"
                                required
                                disabled={!!cls}
                                value={formData.classCode}
                                onChange={(e) => setFormData({ ...formData, classCode: e.target.value.toUpperCase() })}
                                placeholder="DH22TIN01"
                            />
                            {cls && <small style={{ color: '#64748b' }}>Không thể thay đổi mã lớp</small>}
                        </div>

                        <div className={styles.formGroup}>
                            <label>Tên lớp</label>
                            <input
                                type="text"
                                value={formData.className}
                                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                                placeholder="Công nghệ thông tin K22 - Lớp 1"
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Năm học *</label>
                            <input
                                type="text"
                                required
                                value={formData.academicYear}
                                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                placeholder="2022-2026"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Chuyên ngành</label>
                            <input
                                type="text"
                                value={formData.major}
                                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                                placeholder="Công nghệ thông tin"
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Giảng viên chủ nhiệm</label>
                            <select
                                value={formData.advisorTeacherId}
                                onChange={(e) => setFormData({ ...formData, advisorTeacherId: e.target.value })}
                            >
                                <option value="">-- Chưa gán GVCN --</option>
                                {teachers.map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.displayName} ({teacher.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Sĩ số tối đa</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={formData.maxStudents}
                                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 40 })}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mô tả</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Thông tin bổ sung về lớp học..."
                        />
                    </div>

                    <div className={styles.modalFooter}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={submitting}
                        >
                            {submitting ? '⏳ Đang lưu...' : '✅ Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ClassModal;
