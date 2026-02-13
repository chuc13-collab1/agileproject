import { useState } from 'react';
import { TeacherFormData } from '../../types/user.types';
import styles from './ProjectModal.module.css';

interface TeacherModalProps {
  teacher: any | null;
  onClose: () => void;
  onSave: (data: TeacherFormData) => void;
}

function TeacherModal({ teacher, onClose, onSave }: TeacherModalProps) {
  const [formData, setFormData] = useState<TeacherFormData>({
    email: teacher?.email || '',
    displayName: teacher?.displayName || '',
    teacherId: teacher?.teacherId || '',
    department: teacher?.department || '',
    specialization: teacher?.specialization || [],
    maxStudents: teacher?.maxStudents || 10,
    phone: teacher?.phone || '',
    canSupervise: teacher?.canSupervise ?? true,
    canReview: teacher?.canReview ?? true,
    password: '',
  });

  const [specializationInput, setSpecializationInput] = useState('');

  const handleAddSpecialization = () => {
    if (specializationInput.trim() && !formData.specialization.includes(specializationInput.trim())) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, specializationInput.trim()]
      });
      setSpecializationInput('');
    }
  };

  const handleRemoveSpecialization = (item: string) => {
    setFormData({
      ...formData,
      specialization: formData.specialization.filter(s => s !== item)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{teacher ? 'Chỉnh sửa giáo viên' : 'Thêm giáo viên mới'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Mã giáo viên *</label>
              <input
                type="text"
                required
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                placeholder="GV001"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Họ và tên *</label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="TS. Nguyễn Văn A"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@edu.vn"
              />
            </div>

            {teacher && (
              <div className={styles.formGroup}>
                <label>Mật khẩu</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Để trống nếu không đổi"
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Khoa/Bộ môn *</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Công nghệ thông tin"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Số SV tối đa *</label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                aria-label="Số sinh viên tối đa"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0912345678"
              />
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
            <label>Chuyên môn</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                placeholder="Nhập chuyên môn và nhấn Enter"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddSpecialization}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Thêm
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.specialization.map(item => (
                <span
                  key={item}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: '#e0e7ff',
                    color: '#4338ca',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialization(item)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4338ca',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      lineHeight: 1
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.canSupervise}
                onChange={(e) => setFormData({ ...formData, canSupervise: e.target.checked })}
              />
              <span>Có thể hướng dẫn</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.canReview}
                onChange={(e) => setFormData({ ...formData, canReview: e.target.checked })}
              />
              <span>Có thể phản biện</span>
            </label>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.saveButton}>
              {teacher ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherModal;
