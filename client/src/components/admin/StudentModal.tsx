import { useState } from 'react';
import { StudentFormData } from '../../types/user.types';
import { Class } from '../../types/class.types';
import styles from './ProjectModal.module.css';

interface StudentModalProps {
  student: any | null;
  classes: Class[];
  onClose: () => void;
  onSave: (data: StudentFormData) => void;
}

function StudentModal({ student, classes, onClose, onSave }: StudentModalProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    email: student?.email || '',
    displayName: student?.displayName || '',
    studentId: student?.studentId || '',
    className: student?.className || '',
    phone: student?.phone || '',
    major: student?.major || '',
    academicYear: student?.academicYear || '2024-2028',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{student ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Mã sinh viên *</label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                placeholder="2021001"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Họ và tên *</label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@edu.vn"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Mật khẩu {!student && '*'}</label>
              <input
                type="password"
                required={!student}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={student ? 'Để trống nếu không đổi' : 'Mật khẩu'}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Lớp *</label>
              <select
                required
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              >
                <option value="">-- Chọn lớp --</option>
                {classes.filter(c => c.isActive).map(cls => (
                  <option key={cls.id} value={cls.classCode}>
                    {cls.classCode} {cls.className ? `- ${cls.className}` : ''} ({cls.currentStudents}/{cls.maxStudents})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Ngành</label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                placeholder="Công nghệ thông tin"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Năm học *</label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="2024-2028"
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

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.saveButton}>
              {student ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentModal;
