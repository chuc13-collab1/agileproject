import { Teacher } from '../../types/user.types';
import styles from './StudentList.module.css';

interface TeacherListProps {
  teachers: Teacher[];
  searchTerm: string;
  filterActive: 'all' | 'active' | 'inactive';
  onEdit: (teacher: Teacher) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onResetPassword: (id: string) => void;
  onDelete: (id: string) => void;
}

function TeacherList({
  teachers,
  searchTerm,
  filterActive,
  onEdit,
  onToggleActive,
  onResetPassword,
  onDelete,
}: TeacherListProps) {
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch =
      teacher.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && teacher.isActive) ||
      (filterActive === 'inactive' && !teacher.isActive);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Mã GV</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Khoa/Bộ môn</th>
            <th>Chuyên môn</th>
            <th>SV hiện tại</th>
            <th>Quyền</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredTeachers.map(teacher => (
            <tr key={teacher.id}>
              <td className={styles.studentId}>{teacher.teacherId}</td>
              <td>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {teacher.photoURL ? (
                      <img src={teacher.photoURL} alt={teacher.displayName} />
                    ) : (
                      teacher.displayName?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <span>{teacher.displayName}</span>
                </div>
              </td>
              <td className={styles.email}>{teacher.email}</td>
              <td>{teacher.department}</td>
              <td>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {teacher.specialization.slice(0, 2).join(', ')}
                  {teacher.specialization.length > 2 && ` +${teacher.specialization.length - 2}`}
                </div>
              </td>
              <td className={styles.gpa}>
                {teacher.currentStudents}/{teacher.maxStudents}
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.25rem', fontSize: '0.75rem' }}>
                  {teacher.canSupervise && (
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      HD
                    </span>
                  )}
                  {teacher.canReview && (
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      PB
                    </span>
                  )}
                </div>
              </td>
              <td>
                <span className={`${styles.statusBadge} ${teacher.isActive ? styles.statusActive : styles.statusInactive}`}>
                  {teacher.isActive ? '✓ Hoạt động' : '✗ Vô hiệu'}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => onEdit(teacher)}
                    title="Chỉnh sửa"
                  >
                    ✏️
                  </button>
                  <button
                    className={`${styles.actionButton} ${teacher.isActive ? styles.actionDeactivate : styles.actionActivate}`}
                    onClick={() => onToggleActive(teacher.id, teacher.isActive)}
                    title={teacher.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  >
                    {teacher.isActive ? '🔒' : '🔓'}
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => onResetPassword(teacher.id)}
                    title="Reset mật khẩu"
                  >
                    🔑
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.actionDelete}`}
                    onClick={() => onDelete(teacher.id)}
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
      {filteredTeachers.length === 0 && (
        <div className={styles.emptyState}>
          <p>Không tìm thấy giáo viên nào</p>
        </div>
      )}
    </div>
  );
}

export default TeacherList;
