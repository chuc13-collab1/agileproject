import { useState } from 'react';
import { Student } from '../../types/user.types';
import styles from './StudentList.module.css';

interface StudentListProps {
  students: Student[];
  searchTerm: string;
  filterActive: 'all' | 'active' | 'inactive';
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onEdit: (student: Student) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onResetPassword: (id: string) => void;
  onDelete: (id: string) => void;
}

function StudentList({
  students,
  searchTerm,
  filterActive,
  selectedIds,
  onSelectionChange,
  onEdit,
  onToggleActive,
  onResetPassword,
  onDelete,
}: StudentListProps) {
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && student.isActive) ||
      (filterActive === 'inactive' && !student.isActive);

    return matchesSearch && matchesFilter;
  });

  // Handle Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(filteredStudents.map(s => s.id));
      onSelectionChange(allIds);
    } else {
      onSelectionChange(new Set());
    }
  };

  // Handle Select One
  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  // Check if all filtered students are selected
  const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.id));
  const isIndeterminate = selectedIds.size > 0 && !isAllSelected;

  // Group students by class
  const studentsByClass = filteredStudents.reduce((acc, student) => {
    const className = student.className || 'Chưa phân lớp';
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  // Sort classes alphabetically
  const sortedClasses = Object.keys(studentsByClass).sort();

  // Toggle class group logic...
  const toggleClass = (className: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(className)) {
      newExpanded.delete(className);
    } else {
      newExpanded.add(className);
    }
    setExpandedClasses(newExpanded);
  };

  const toggleAllClasses = () => {
    if (expandedClasses.size === sortedClasses.length) {
      setExpandedClasses(new Set());
    } else {
      setExpandedClasses(new Set(sortedClasses));
    }
  };

  return (
    <div className={styles.groupViewContainer}>
      <div className={styles.groupViewHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className={styles.expandAllButton}
            onClick={toggleAllClasses}
          >
            {expandedClasses.size === sortedClasses.length ? '− Thu gọn tất cả' : '+ Mở rộng tất cả'}
          </button>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={input => { if (input) input.indeterminate = isIndeterminate; }}
              onChange={handleSelectAll}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Chọn tất cả ({filteredStudents.length})
          </label>
        </div>

        <span className={styles.totalCount}>
          {sortedClasses.length} lớp · {filteredStudents.length} sinh viên
        </span>
      </div>

      {sortedClasses.map(className => {
        const classStudents = studentsByClass[className];
        const isExpanded = expandedClasses.has(className);

        return (
          <div key={className} className={styles.classGroup}>
            <div
              className={styles.classHeader}
              onClick={() => toggleClass(className)}
            >
              <span className={styles.expandIcon}>
                {isExpanded ? '▼' : '▶'}
              </span>
              <span className={styles.className}>📁 {className}</span>
              <span className={styles.classCount}>
                ({classStudents.length} sinh viên)
              </span>
            </div>

            {isExpanded && (
              <div className={styles.classContent}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Mã SV</th>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>Năm học</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map(student => (
                      <tr key={student.id} className={selectedIds.has(student.id) ? styles.selectedRow : ''} style={{ background: selectedIds.has(student.id) ? '#eff6ff' : '' }}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(student.id)}
                            onChange={() => handleSelectOne(student.id)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                        </td>
                        <td className={styles.studentId}>{student.studentId}</td>
                        <td>
                          <div className={styles.userInfo}>
                            <div className={styles.avatar}>
                              {student.photoURL ? (
                                <img src={student.photoURL} alt={student.displayName} />
                              ) : (
                                <span>{student.displayName?.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <span>{student.displayName}</span>
                          </div>
                        </td>
                        <td className={styles.email}>{student.email}</td>
                        <td>{student.academicYear}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${student.isActive ? styles.statusActive : styles.statusInactive}`}>
                            {student.isActive ? 'Hoạt động' : 'Vô hiệu'}
                          </span>
                        </td>
                        <td className={styles.actions}>
                          <button
                            className={styles.editButton}
                            onClick={() => onEdit(student)}
                            title="Chỉnh sửa"
                          >
                            ✏️
                          </button>
                          <button
                            className={styles.toggleButton}
                            onClick={() => onToggleActive(student.id, student.isActive)}
                            title={student.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            {student.isActive ? '🔒' : '🔓'}
                          </button>
                          <button
                            className={styles.resetButton}
                            onClick={() => onResetPassword(student.id)}
                            title="Reset mật khẩu"
                          >
                            🔑
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc muốn xóa sinh viên ${student.displayName}?`)) {
                                onDelete(student.id);
                              }
                            }}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {sortedClasses.length === 0 && (
        <div className={styles.emptyState}>
          Không tìm thấy sinh viên nào
        </div>
      )}
    </div>
  );
}

export default StudentList;
