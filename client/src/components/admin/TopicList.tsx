import { Topic, STATUS_LABELS, SEMESTER_LABELS } from '../../types/topic.types';
import styles from './TopicList.module.css';

interface TopicListProps {
  topics: Topic[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onEdit: (id: string, updates: Partial<Topic>) => void;
  onDelete: (id: string) => void;
  onViewDetail: (topic: Topic) => void;
}

function TopicList({ topics, onApprove, onReject, onViewDetail }: TopicListProps) {
  const handleReject = (topicId: string) => {
    const reason = prompt('Lý do từ chối:');
    if (reason) {
      onReject(topicId, reason);
    }
  };

  return (
    <div className={styles.container}>
      {topics.map(topic => (
        <div key={topic.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.title}>{topic.title}</h3>
              <div className={styles.meta}>
                <span className={styles.supervisor}>
                  👨‍🏫 {topic.supervisorName}
                </span>
                <span className={styles.department}>
                  {topic.supervisorDepartment}
                </span>
              </div>
            </div>
            <div className={styles.badges}>
              {topic.proposedBy === 'student' && (
                <span className={styles.statusBadge} style={{ backgroundColor: '#e0f2fe', color: '#0369a1', marginRight: '0.5rem' }}>
                  🎓 SV Đề Xuất
                </span>
              )}
              <span className={`${styles.statusBadge} ${styles[`status${topic.status}`]}`}>
                {STATUS_LABELS[topic.status]}
              </span>
            </div>
          </div>

          <div className={styles.cardBody}>
            <p className={styles.description}>{topic.description}</p>

            <div className={styles.info}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Lĩnh vực:</span>
                <span className={styles.fieldBadge}>{topic.field}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Học kỳ:</span>
                <span>{SEMESTER_LABELS[topic.semester]} {topic.academicYear}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Sinh viên:</span>
                <span>{topic.currentStudents}/{topic.maxStudents}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Ngày đề xuất:</span>
                <span>{topic.createdAt.toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {topic.status === 'rejected' && topic.rejectionReason && (
              <div className={styles.rejectionReason}>
                <strong>Lý do từ chối:</strong> {topic.rejectionReason}
              </div>
            )}

            {topic.status === 'approved' && topic.approvedAt && (
              <div className={styles.approvedInfo}>
                <strong>Đã duyệt:</strong> {topic.approvedAt.toLocaleDateString('vi-VN')} bởi {topic.approvedBy}
              </div>
            )}
          </div>

          <div className={styles.cardFooter}>
            <button
              className={styles.detailButton}
              onClick={() => onViewDetail(topic)}
            >
              📄 Xem chi tiết
            </button>
            {topic.status === 'pending' && (
              <>
                <button
                  className={styles.approveButton}
                  onClick={() => onApprove(topic.id)}
                >
                  ✓ Phê duyệt
                </button>
                <button
                  className={styles.rejectButton}
                  onClick={() => handleReject(topic.id)}
                >
                  ✗ Từ chối
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {topics.length === 0 && (
        <div className={styles.emptyState}>
          <p>Không tìm thấy đề tài nào</p>
        </div>
      )}
    </div>
  );
}

export default TopicList;
