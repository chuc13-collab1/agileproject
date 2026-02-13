// Project Modal Component
import React, { useState, useEffect } from 'react';
import { Project, ProjectFormData } from '../../types/project.types';
import { Student, Teacher } from '../../types/user.types';
import styles from './ProjectModal.module.css';

interface ProjectModalProps {
  project: Project | null;
  students: Student[];
  teachers: Teacher[];
  topics: any[]; // Using any[] for now to avoid circular dependency or import issues, ideally Topic[]
  onClose: () => void;
  onSave: (data: ProjectFormData) => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, students, teachers, topics, onClose, onSave }) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    studentId: '',
    supervisorId: '',
    reviewerId: '',
    semester: '1',
    academicYear: '2025-2026',
    category: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        studentId: project.studentId,
        supervisorId: project.supervisor ? project.supervisor.id : '', // Keep supervisorId as per ProjectFormData type
        reviewerId: project.reviewer?.id || '',
        semester: project.semester,
        academicYear: project.academicYear,
        category: project.field,
        startDate: project.registrationDate ? new Date(project.registrationDate).toISOString().split('T')[0] : '',
        endDate: project.reportDeadline ? new Date(project.reportDeadline).toISOString().split('T')[0] : '',
      });
    }
  }, [project]);

  // Auto-fill logic
  useEffect(() => {
    console.log('Auto-fill trigger check:', {
      studentId: formData.studentId,
      hasProjects: !!project,
      topicsCount: topics.length
    });

    if (formData.studentId && topics.length > 0) {
      // Relaxed matching logic
      const matchedTopic = topics.find(t => {
        // Check identifying info
        // assignedStudentId comes from API. studentId is legacy/typo check.
        // We check if the topic is assigned to this student (via ID)
        // OR if it was proposed by this student (via Student Code)
        const isStudentMatch =
          t.assignedStudentId === formData.studentId ||
          (t.proposedBy === 'student' && students.find(s => s.id === formData.studentId)?.studentId === t.proposalStudentCode);

        // Allow if approved OR if it matches perfectly (even if waiting mechanism differs)
        return (t.status === 'approved' || t.status === 'admin_approved') && isStudentMatch;
      });

      console.log('Matched topic:', matchedTopic);

      if (matchedTopic) {
        // Only auto-fill if:
        // 1. It's a new project (!project)
        // 2. The selected student matches the topic's student
        // 3. Or if title/description are empty
        const shouldFill = !project ||
          project.studentId !== formData.studentId ||
          (!formData.title && !formData.description);

        console.log('Should fill?', shouldFill);

        if (shouldFill) {
          setFormData(prev => ({
            ...prev,
            title: matchedTopic.title || prev.title,
            description: matchedTopic.description || prev.description,
            supervisorId: matchedTopic.supervisorId || prev.supervisorId,
            category: matchedTopic.field || prev.category,
          }));
        }
      }
    }
  }, [formData.studentId, project, topics, students]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{project ? 'Chỉnh sửa đồ án' : 'Tạo đồ án mới'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Tên đồ án *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tên đồ án"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về đồ án"
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Sinh viên *</label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                aria-label="Chọn sinh viên"
              >
                <option value="">Chọn sinh viên</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.displayName} ({student.studentId})</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Giảng viên hướng dẫn</label>
              <select
                name="supervisorId"
                value={formData.supervisorId}
                onChange={handleChange}
                aria-label="Chọn giảng viên hướng dẫn"
              >
                <option value="">Chọn giảng viên</option>
                {teachers.filter(t => t.canSupervise).map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.displayName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Giảng viên phản biện</label>
              <select
                name="reviewerId"
                value={formData.reviewerId}
                onChange={handleChange}
                aria-label="Chọn giảng viên phản biện"
              >
                <option value="">Chọn giảng viên</option>
                {teachers.filter(t => t.canReview).map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.displayName}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Danh mục *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                aria-label="Chọn danh mục"
              >
                <option value="">Chọn danh mục</option>
                <option value="web">Phát triển Web</option>
                <option value="mobile">Ứng dụng Mobile</option>
                <option value="ai">Trí tuệ nhân tạo</option>
                <option value="data">Khoa học dữ liệu</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Học kỳ *</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
                aria-label="Chọn học kỳ"
              >
                <option value="1">Học kỳ 1</option>
                <option value="2">Học kỳ 2</option>
                <option value="3">Học kỳ 3</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Năm học *</label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
                aria-label="Chọn năm học"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Ngày bắt đầu *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                aria-label="Ngày bắt đầu"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Ngày kết thúc *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                aria-label="Ngày kết thúc"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Hủy
            </button>
            <button type="submit" className={styles.saveButton}>
              {project ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
