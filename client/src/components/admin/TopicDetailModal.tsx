import { useState } from 'react';
import { Topic, STATUS_LABELS, SEMESTER_LABELS } from '../../types/topic.types';
import styles from './ProjectModal.module.css';

interface TopicDetailModalProps {
  topic: Topic;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

function TopicDetailModal({ topic, onClose, onApprove, onReject }: TopicDetailModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    onReject(topic.id, rejectionReason);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className={styles.modalHeader}>
          <h2>Chi Tiết Đề Tài</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          {/* Status Badge */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                background:
                  topic.status === 'approved' ? '#d1fae5' :
                    topic.status === 'pending' ? '#fef3c7' :
                      '#fee2e2',
                color:
                  topic.status === 'approved' ? '#065f46' :
                    topic.status === 'pending' ? '#92400e' :
                      '#991b1b',
              }}
            >
              {STATUS_LABELS[topic.status]}
            </span>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a202c', marginBottom: '0.5rem' }}>
              {topic.title}
            </h3>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {SEMESTER_LABELS[topic.semester]} {topic.academicYear}
            </div>
            {topic.proposedBy === 'student' && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#e0f2fe', borderRadius: '4px', color: '#0369a1', fontSize: '0.9rem', display: 'inline-block' }}>
                🎓 Đề xuất bởi sinh viên: <strong>{topic.proposalStudentName}</strong> ({topic.proposalStudentCode})
              </div>
            )}
          </div>

          {/* Supervisor Info */}
          <div style={{
            background: '#f7fafc',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Giáo viên hướng dẫn:</div>
            <div style={{ color: '#4a5568' }}>
              👨‍🏫 {topic.supervisorName} - {topic.supervisorDepartment}
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                Mô tả đề tài:
              </div>
              <div style={{ color: '#4a5568', lineHeight: '1.6' }}>
                {topic.description}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                Yêu cầu với sinh viên:
              </div>
              <div style={{ color: '#4a5568', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {topic.requirements}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
                Kết quả dự kiến:
              </div>
              <div style={{ color: '#4a5568', lineHeight: '1.6' }}>
                {topic.expectedResults}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              padding: '1rem',
              background: '#f7fafc',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  Lĩnh vực
                </div>
                <div style={{ fontWeight: 600, color: '#667eea' }}>
                  {topic.field}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  Số lượng sinh viên
                </div>
                <div style={{ fontWeight: 600 }}>
                  {topic.currentStudents}/{topic.maxStudents}
                </div>
              </div>
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {topic.status === 'rejected' && topic.rejectionReason && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '1rem',
              borderRadius: '8px',
              borderLeft: '4px solid #ef4444',
              marginTop: '1.5rem'
            }}>
              <strong>Lý do từ chối:</strong><br />
              {topic.rejectionReason}
            </div>
          )}

          {/* Approval Info (if approved) */}
          {topic.status === 'approved' && topic.approvedAt && (
            <div style={{
              background: '#d1fae5',
              color: '#065f46',
              padding: '1rem',
              borderRadius: '8px',
              borderLeft: '4px solid #10b981',
              marginTop: '1.5rem'
            }}>
              <strong>Đã phê duyệt:</strong><br />
              Ngày: {topic.approvedAt.toLocaleDateString('vi-VN')}<br />
              Bởi: {topic.approvedBy}
            </div>
          )}

          {/* Rejection Form (if pending) */}
          {topic.status === 'pending' && (
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Lý do từ chối (nếu có):
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối đề tài..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {topic.status === 'pending' && (
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleReject}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ✗ Từ chối
            </button>
            <button
              type="button"
              onClick={() => {
                onApprove(topic.id);
                onClose();
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ✓ Phê duyệt
            </button>
          </div>
        )}

        {topic.status !== 'pending' && (
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicDetailModal;
