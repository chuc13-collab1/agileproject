import React, { useState, useEffect } from 'react';
import { Topic, TopicFormData } from '../../types/topic.types';
import styles from '../../pages/supervisor/Supervisor.module.css';

interface TeacherTopicModalProps {
    topic?: Topic | null;
    onClose: () => void;
    onSave: (data: TopicFormData) => void;
}

const TeacherTopicModal: React.FC<TeacherTopicModalProps> = ({ topic, onClose, onSave }) => {
    const [formData, setFormData] = useState<TopicFormData>({
        title: '',
        description: '',
        requirements: '',
        expectedResults: '',
        field: 'Web Development',
        maxStudents: 2,
        semester: '1',
        academicYear: '2025-2026',
    });

    useEffect(() => {
        if (topic) {
            setFormData({
                title: topic.title,
                description: topic.description,
                requirements: topic.requirements || '',
                expectedResults: topic.expectedResults || '',
                field: topic.field,
                maxStudents: topic.maxStudents,
                semester: topic.semester,
                academicYear: topic.academicYear,
            });
        }
    }, [topic]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'maxStudents' ? parseInt(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>{topic ? 'Cập Nhật Đề Tài' : 'Đề Xuất Đề Tài Mới'}</h2>
                    <button className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Tên đề tài <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Nhập tên đề tài..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mô tả chi tiết <span className={styles.required}>*</span></label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            placeholder="Mô tả nội dung, mục tiêu của đề tài..."
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Yêu cầu kiến thức</label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Các kiến thức, kỹ năng cần có..."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Kết quả dự kiến</label>
                            <textarea
                                name="expectedResults"
                                value={formData.expectedResults}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Sản phẩm, báo cáo mong đợi..."
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Lĩnh vực <span className={styles.required}>*</span></label>
                            <select name="field" value={formData.field} onChange={handleChange}>
                                <option value="Web Development">Web Development</option>
                                <option value="Mobile Development">Mobile Development</option>
                                <option value="AI & Machine Learning">AI & Machine Learning</option>
                                <option value="Data Science">Data Science</option>
                                <option value="IoT">IoT</option>
                                <option value="Blockchain">Blockchain</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Số lượng sinh viên tối đa</label>
                            <input
                                type="number"
                                name="maxStudents"
                                value={formData.maxStudents}
                                onChange={handleChange}
                                min={1}
                                max={5}
                            />
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Hủy</button>
                        <button type="submit" className={styles.submitButton}>
                            {topic ? 'Lưu Thay Đổi' : 'Gửi Đề Xuất'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherTopicModal;
