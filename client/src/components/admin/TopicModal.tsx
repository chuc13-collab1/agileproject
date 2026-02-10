import React, { useState, useEffect } from 'react';
import styles from './TopicModal.module.css';
import { Topic, TopicFormData, FIELD_OPTIONS, SEMESTER_LABELS } from '../../types/topic.types';


interface TopicModalProps {
    topic?: Topic | null;
    onClose: () => void;
    onSave: (data: TopicFormData) => Promise<void>;
}

const TopicModal: React.FC<TopicModalProps> = ({ topic, onClose, onSave }) => {

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TopicFormData>({
        title: '',
        description: '',
        requirements: '',
        expectedResults: '',
        field: FIELD_OPTIONS[0],
        maxStudents: 2,
        semester: '1',
        academicYear: '2024-2025',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'maxStudents' ? Number(value) : value
        }));
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{topic ? 'Cập Nhật Đề Tài' : 'Thêm Đề Tài Mới'}</h2>
                    <button className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.content}>
                        <div className={styles.formGrid}>

                            {/* Basic Info */}
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Tên đề tài</label>
                                <input
                                    type="text"
                                    name="title"
                                    className={styles.input}
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ví dụ: Xây dựng hệ thống quản lý kho..."
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Lĩnh vực</label>
                                <select
                                    name="field"
                                    className={styles.select}
                                    value={formData.field}
                                    onChange={handleChange}
                                >
                                    {FIELD_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Số lượng sinh viên tối đa</label>
                                <select
                                    name="maxStudents"
                                    className={styles.select}
                                    value={formData.maxStudents}
                                    onChange={handleChange}
                                >
                                    <option value="1">1 Sinh viên</option>
                                    <option value="2">2 Sinh viên</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Học kỳ</label>
                                <select
                                    name="semester"
                                    className={styles.select}
                                    value={formData.semester}
                                    onChange={handleChange}
                                >
                                    {Object.entries(SEMESTER_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Năm học</label>
                                <input
                                    type="text"
                                    name="academicYear"
                                    className={styles.input}
                                    value={formData.academicYear}
                                    onChange={handleChange}
                                    placeholder="2024-2025"
                                />
                            </div>

                            {/* Detailed Content */}
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Mô tả chi tiết</label>
                                <textarea
                                    name="description"
                                    className={styles.textarea}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Mô tả mục tiêu, phạm vi của đề tài..."
                                    required
                                />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Yêu cầu đầu vào (Kiến thức/Công nghệ)</label>
                                <textarea
                                    name="requirements"
                                    className={styles.textarea}
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: React, Node.js, Có kiến thức về Blockchain..."
                                />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Kết quả dự kiến</label>
                                <textarea
                                    name="expectedResults"
                                    className={styles.textarea}
                                    value={formData.expectedResults}
                                    onChange={handleChange}
                                    placeholder="Sản phẩm, báo cáo, bài báo khoa học..."
                                />
                            </div>

                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>
                            Hủy bỏ
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Đang lưu...' : (topic ? 'Cập nhật' : 'Thêm mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TopicModal;
