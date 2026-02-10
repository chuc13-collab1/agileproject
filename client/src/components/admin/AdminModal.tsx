import { useState } from 'react';
import { AdminFormData, AdminPermission } from '../../types/user.types';
import styles from './ProjectModal.module.css';

interface AdminModalProps {
  admin: any | null;
  onClose: () => void;
  onSave: (data: AdminFormData) => void;
}

const PERMISSION_OPTIONS: { value: AdminPermission; label: string }[] = [
  { value: 'manage_users', label: 'Quản lý người dùng' },
  { value: 'manage_projects', label: 'Quản lý đồ án' },
  { value: 'manage_topics', label: 'Quản lý đề tài' },
  { value: 'manage_grades', label: 'Quản lý điểm' },
  { value: 'manage_system', label: 'Cấu hình hệ thống' },
  { value: 'view_reports', label: 'Xem báo cáo' },
];

function AdminModal({ admin, onClose, onSave }: AdminModalProps) {
  const [formData, setFormData] = useState<AdminFormData>({
    email: admin?.email || '',
    displayName: admin?.displayName || '',
    adminId: admin?.adminId || '',
    permissions: admin?.permissions || [],
    password: '',
  });

  const handleTogglePermission = (permission: AdminPermission) => {
    if (formData.permissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permission)
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permission]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{admin ? 'Chỉnh sửa admin' : 'Thêm admin mới'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Mã admin *</label>
              <input
                type="text"
                required
                value={formData.adminId}
                onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
                placeholder="ADMIN001"
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
                placeholder="admin@edu.vn"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Mật khẩu {!admin && '*'}</label>
              <input
                type="password"
                required={!admin}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={admin ? 'Để trống nếu không đổi' : 'Mật khẩu'}
              />
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
            <label style={{ marginBottom: '1rem', display: 'block', fontSize: '1rem', fontWeight: 600 }}>
              Quyền hạn *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {PERMISSION_OPTIONS.map(option => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: formData.permissions.includes(option.value) ? '#f0f9ff' : 'white',
                    borderColor: formData.permissions.includes(option.value) ? '#667eea' : '#e2e8f0'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(option.value)}
                    onChange={() => handleTogglePermission(option.value)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: 500 }}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.saveButton}>
              {admin ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminModal;
