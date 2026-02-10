// Announcement Modal Component
import React, { useState, useEffect } from 'react';
import { Announcement, AnnouncementFormData } from '../../types/announcement.types';
import styles from './AnnouncementModal.module.css';

interface AnnouncementModalProps {
  announcement: Announcement | null;
  onClose: () => void;
  onSave: (data: AnnouncementFormData, isDraft: boolean) => void;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  announcement,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    semester: '1',
    academicYear: '2025-2026',
    registrationStart: '',
    registrationEnd: '',
    reportDeadline: '',
    defenseDate: '',
    status: 'draft',
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        semester: announcement.semester,
        academicYear: announcement.academicYear,
        registrationStart: announcement.registrationStart.toISOString().split('T')[0],
        registrationEnd: announcement.registrationEnd.toISOString().split('T')[0],
        reportDeadline: announcement.reportDeadline?.toISOString().split('T')[0] || '',
        defenseDate: announcement.defenseDate?.toISOString().split('T')[0] || '',
        status: announcement.status,
      });
    }
  }, [announcement]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (isDraft: boolean) => {
    onSave(formData, isDraft);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{announcement ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label>Tiêu đề *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Thông báo đăng ký đồ án học kỳ..."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Nội dung chi tiết *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Nhập nội dung thông báo chi tiết..."
              rows={8}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Học kỳ *</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
              >
                <option value="1">Học kỳ 1</option>
                <option value="2">Học kỳ 2</option>
                <option value="3">Học kỳ Hè</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Năm học *</label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>
          </div>

          <div className={styles.section}>
            <h3>📅 Thời gian quan trọng</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Bắt đầu đăng ký *</label>
                <input
                  type="date"
                  name="registrationStart"
                  value={formData.registrationStart}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Kết thúc đăng ký *</label>
                <input
                  type="date"
                  name="registrationEnd"
                  value={formData.registrationEnd}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Hạn nộp báo cáo cuối kỳ *</label>
                <input
                  type="date"
                  name="reportDeadline"
                  value={formData.reportDeadline}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Ngày bảo vệ dự kiến</label>
                <input
                  type="date"
                  name="defenseDate"
                  value={formData.defenseDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3>📎 Tài liệu đính kèm</h3>
            <div className={styles.uploadArea}>
              <input
                type="file"
                id="attachments"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className={styles.fileInput}
              />
              <label htmlFor="attachments" className={styles.fileLabel}>
                <span className={styles.uploadIcon}>📁</span>
                <span>Click để chọn file hoặc kéo thả vào đây</span>
                <span className={styles.fileHint}>
                  (PDF, Word, Excel - Tối đa 10MB/file)
                </span>
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className={styles.draftButton}
            >
              💾 Lưu nháp
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className={styles.publishButton}
            >
              📤 Công bố ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementModal;
