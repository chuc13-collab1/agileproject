import { useState } from 'react';
import { Class } from '../../types/class.types';
import styles from './ProjectModal.module.css';

interface BatchClassModalProps {
    classes: Class[];
    count: number;
    onClose: () => void;
    onSave: (classCode: string, academicYear: string) => void;
}

function BatchClassModal({ classes, count, onClose, onSave }: BatchClassModalProps) {
    const [selectedClassCode, setSelectedClassCode] = useState('');

    const handleSave = () => {
        if (!selectedClassCode) return alert('Vui lòng chọn lớp');
        const cls = classes.find(c => c.classCode === selectedClassCode);
        if (cls) {
            onSave(cls.classCode, cls.academicYear);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className={styles.modalHeader}>
                    <h2>✏️ Chuyển lớp cho {count} sinh viên</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Chọn lớp mới *</label>
                            <select
                                value={selectedClassCode}
                                onChange={e => setSelectedClassCode(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            >
                                <option value="">-- Chọn lớp --</option>
                                {classes.filter(c => c.isActive).map(c => (
                                    <option key={c.id} value={c.classCode}>{c.classCode} - {c.className}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                        * Lưu ý: Tất cả sinh viên được chọn sẽ được chuyển sang lớp này và cập nhật Năm học theo lớp mới.
                    </p>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.cancelButton} onClick={onClose}>Hủy</button>
                    <button className={styles.saveButton} onClick={handleSave}>Lưu thay đổi</button>
                </div>
            </div>
        </div>
    );
}
export default BatchClassModal;
