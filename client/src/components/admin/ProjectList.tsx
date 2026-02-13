// Project List Component
import React from 'react';
import { Project } from '../../types/project.types';
import styles from './ProjectList.module.css';

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  searchTerm: string;
  statusFilter: string;
  onDelete?: (project: Project) => void;
  onApprove?: (project: Project) => void;
  onReject?: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onEdit,
  searchTerm,
  statusFilter,
  onDelete,
  onApprove,
  onReject
}) => {
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      registered: { label: 'Đã đăng ký', color: '#ffa500' },
      in_progress: { label: 'Đang thực hiện', color: '#2196F3' },
      submitted: { label: 'Đã nộp', color: '#9C27B0' },
      graded: { label: 'Đã chấm điểm', color: '#FF9800' },
      completed: { label: 'Hoàn thành', color: '#4CAF50' },
      failed: { label: 'Không đạt/Từ chối', color: '#F44336' },
    };
    return statusMap[status] || { label: status, color: '#999' };
  };

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (days: number) => {
    if (days < 0) return '#999'; // Quá hạn
    if (days <= 3) return '#f44336'; // Gấp
    if (days <= 7) return '#ff9800'; // Cảnh báo
    return '#4CAF50'; // Bình thường
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchTerm === '' ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (filteredProjects.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <h3>Chưa có đồ án nào</h3>
        <p>Nhấn nút "Tạo đồ án mới" để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã ĐA</th>
              <th>Tên đồ án</th>
              <th>Sinh viên</th>
              <th>Giảng viên HD</th>
              <th>Trạng thái</th>
              <th>Học kỳ</th>
              <th>Thời hạn</th>
              <th>Điểm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => {
              const statusInfo = getStatusLabel(project.status);
              const daysRemaining = getDaysRemaining(project.reportDeadline);
              const deadlineColor = getDeadlineColor(daysRemaining);

              return (
                <tr key={project.id}>
                  <td className={styles.projectId}>#{project.id.slice(0, 8)}</td>
                  <td className={styles.projectTitle}>{project.title}</td>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userName}>{project.studentName}</div>
                      <div className={styles.userEmail}>{project.studentEmail}</div>
                    </div>
                  </td>
                  <td>{project.supervisor?.name || <span style={{ color: '#999', fontStyle: 'italic' }}>Chưa phân công</span>}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: statusInfo.color }}
                    >
                      {statusInfo.label}
                    </span>
                  </td>
                  <td>
                    {project.semester} - {project.academicYear}
                  </td>
                  <td>
                    <div className={styles.deadlineCell}>
                      <span
                        className={styles.deadlineBadge}
                        style={{ color: deadlineColor, borderColor: deadlineColor }}
                      >
                        {daysRemaining < 0
                          ? `Quá hạn ${Math.abs(daysRemaining)} ngày`
                          : daysRemaining === 0
                            ? 'Hôm nay'
                            : `Còn ${daysRemaining} ngày`
                        }
                      </span>
                      <div className={styles.deadlineDate}>
                        {new Date(project.reportDeadline).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </td>
                  <td className={styles.score}>
                    {project.score ? `${project.score}/10` : '-'}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionButton}
                        onClick={() => onEdit(project)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      {project.status === 'registered' && (
                        <>
                          <button
                            className={styles.actionButton}
                            onClick={() => onApprove && onApprove(project)}
                            title="Duyệt"
                            style={{ color: '#4CAF50' }}
                          >
                            ✓
                          </button>
                          <button
                            className={styles.actionButton}
                            onClick={() => onReject && onReject(project)}
                            title="Từ chối"
                            style={{ color: '#F44336' }}
                          >
                            ✗
                          </button>
                        </>
                      )}
                      <button
                        className={styles.actionButton}
                        onClick={() => onEdit(project)}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => onDelete && onDelete(project)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectList;
