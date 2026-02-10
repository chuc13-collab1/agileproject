import { Admin } from '../../types/user.types';
import styles from './StudentList.module.css';

interface AdminListProps {
  admins: Admin[];
  searchTerm: string;
  filterActive: 'all' | 'active' | 'inactive';
  onEdit: (admin: Admin) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onResetPassword: (id: string) => void;
  onDelete: (id: string) => void;
}

function AdminList({
  admins,
  searchTerm,
  filterActive,
  onEdit,
  onToggleActive,
  onResetPassword,
  onDelete,
}: AdminListProps) {
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch =
      admin.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.adminId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && admin.isActive) ||
      (filterActive === 'inactive' && !admin.isActive);

    return matchesSearch && matchesFilter;
  });

  const permissionLabels: Record<string, string> = {
    manage_users: 'Người dùng',
    manage_projects: 'Đồ án',
    manage_topics: 'Đề tài',
    manage_grades: 'Điểm',
    manage_system: 'Hệ thống',
    view_reports: 'Báo cáo',
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Mã Admin</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Quyền hạn</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdmins.map(admin => (
            <tr key={admin.id}>
              <td className={styles.studentId}>{admin.adminId}</td>
              <td>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {admin.photoURL ? (
                      <img src={admin.photoURL} alt={admin.displayName} />
                    ) : (
                      admin.displayName?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <span>{admin.displayName}</span>
                </div>
              </td>
              <td className={styles.email}>{admin.email}</td>
              <td>
                <div style={{ fontSize: '0.75rem', lineHeight: '1.5' }}>
                  {admin.permissions.map(p => permissionLabels[p]).join(', ')}
                </div>
              </td>
              <td style={{ fontSize: '0.875rem', color: '#64748b' }}>
                {admin.createdAt.toLocaleDateString('vi-VN')}
              </td>
              <td>
                <span className={`${styles.statusBadge} ${admin.isActive ? styles.statusActive : styles.statusInactive}`}>
                  {admin.isActive ? '✓ Hoạt động' : '✗ Vô hiệu'}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => onEdit(admin)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                  <button
                    className={`${styles.actionButton} ${admin.isActive ? styles.actionDeactivate : styles.actionActivate}`}
                    onClick={() => onToggleActive(admin.id, admin.isActive)}
                    title={admin.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  >
                    {admin.isActive ? '🔒' : '🔓'}
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => onResetPassword(admin.id)}
                    title="Reset mật khẩu"
                  >
                    🔑
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.actionDelete}`}
                    onClick={() => onDelete(admin.id)}
                    title="Xóa"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredAdmins.length === 0 && (
        <div className={styles.emptyState}>
          <p>Không tìm thấy admin nào</p>
        </div>
      )}
    </div>
  );
}

export default AdminList;
