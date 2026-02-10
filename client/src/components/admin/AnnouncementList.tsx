// Announcement List Component
import React from 'react';
import { Announcement } from '../../types/announcement.types';
import styles from './AnnouncementList.module.css';

interface AnnouncementListProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onPublish: (id: string) => void;
  onClose: (id: string) => void;
  onExtend: (id: string, newDate: Date) => void;
  onSendNotification: (id: string) => void;
  searchTerm: string;
  statusFilter: string;
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({
  announcements,
  onEdit,
  onPublish,
  onClose,
  onSendNotification,
  searchTerm,
  statusFilter,
}) => {
  const getStatusBadge = (status: string, isOpen: boolean) => {
    if (status === 'draft') {
      return { label: 'Bản nháp', color: '#999' };
    }
    if (status === 'closed') {
      return { label: 'Đã đóng', color: '#666' };
    }
    if (isOpen) {
      return { label: 'Đang mở', color: '#4CAF50' };
    }
    return { label: 'Đã đóng đăng ký', color: '#ff9800' };
  };

  const getSemesterLabel = (semester: string) => {
    const map: Record<string, string> = {
      '1': 'Học kỳ 1',
      '2': 'Học kỳ 2',
      '3': 'Học kỳ Hè',
    };
    return map[semester] || semester;
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      searchTerm === '' ||
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || announcement.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (filteredAnnouncements.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📢</div>
        <h3>Chưa có thông báo nào</h3>
        <p>Nhấn nút "Tạo thông báo mới" để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {filteredAnnouncements.map((announcement) => {
        const today = new Date();
        const regEnd = new Date(announcement.registrationEnd);
        const isOpen = announcement.status === 'published' && today >= new Date(announcement.registrationStart) && today <= regEnd;
        const statusInfo = getStatusBadge(announcement.status, isOpen);
        const daysRemaining = Math.ceil((regEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return (
          <div key={announcement.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.titleSection}>
                <h3 className={styles.title}>{announcement.title}</h3>
                <div className={styles.meta}>
                  <span className={styles.semester}>
                    {getSemesterLabel(announcement.semester)} - {announcement.academicYear}
                  </span>
                  <span
                    className={styles.status}
                    style={{ backgroundColor: statusInfo.color }}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              </div>
              <div className={styles.actions}>
                {announcement.status === 'draft' && (
                  <button
                    className={styles.actionButton}
                    onClick={() => onPublish(announcement.id)}
                    title="Công bố"
                  >
                    📤 Công bố
                  </button>
                )}
                {announcement.status === 'published' && isOpen && (
                  <button
                    className={styles.actionButton}
                    onClick={() => onClose(announcement.id)}
                    title="Đóng đăng ký"
                  >
                    🔒 Đóng đăng ký
                  </button>
                )}
                {announcement.status === 'published' && (
                  <button
                    className={styles.actionButton}
                    onClick={() => onSendNotification(announcement.id)}
                    title="Gửi thông báo"
                  >
                    📨 Gửi thông báo
                  </button>
                )}
                <button
                  className={styles.actionButton}
                  onClick={() => onEdit(announcement)}
                  title="Chỉnh sửa"
                >
                  ✏️
                </button>
              </div>
            </div>

            <div className={styles.content}>
              <p className={styles.description}>
                {announcement.content.substring(0, 200)}
                {announcement.content.length > 200 && '...'}
              </p>
            </div>

            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineLabel}>Đăng ký</div>
                <div className={styles.timelineValue}>
                  {new Date(announcement.registrationStart).toLocaleDateString('vi-VN')}
                  {' - '}
                  {new Date(announcement.registrationEnd).toLocaleDateString('vi-VN')}
                </div>
                {isOpen && daysRemaining > 0 && (
                  <div className={styles.timelineNote}>
                    Còn {daysRemaining} ngày
                  </div>
                )}
              </div>

              <div className={styles.timelineItem}>
                <div className={styles.timelineLabel}>Hạn nộp báo cáo</div>
                <div className={styles.timelineValue}>
                  {announcement.reportDeadline && new Date(announcement.reportDeadline).toLocaleDateString('vi-VN')}
                </div>
              </div>

              {announcement.defenseDate && (
                <div className={styles.timelineItem}>
                  <div className={styles.timelineLabel}>Ngày bảo vệ</div>
                  <div className={styles.timelineValue}>
                    {new Date(announcement.defenseDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              )}
            </div>

            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className={styles.attachments}>
                <span className={styles.attachmentLabel}>📎 Tài liệu đính kèm:</span>
                {announcement.attachments.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    className={styles.attachmentLink}
                    download
                  >
                    {file.name}
                  </a>
                ))}
              </div>
            )}

            <div className={styles.footer}>
              <span className={styles.createdAt}>
                Tạo ngày: {new Date(announcement.createdAt).toLocaleString('vi-VN')}
              </span>
              {announcement.publishedAt && (
                <span className={styles.publishedAt}>
                  Công bố: {new Date(announcement.publishedAt).toLocaleString('vi-VN')}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementList;
