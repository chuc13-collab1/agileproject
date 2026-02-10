import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import styles from './Supervisor.module.css';

const TeacherTopicProposal: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        field: 'Web Development',
        maxStudents: 2,
        semester: '1',
        academicYear: '2024-2025'
    });

    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'maxStudents' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            setSubmitting(true);
            const token = await (user as any)?.getIdToken();

            const response = await fetch('http://localhost:3001/api/topics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    supervisorId: user?.uid,
                    status: 'pending' // Admin will approve
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Đề xuất đề tài thành công! Chờ Admin phê duyệt.');
                navigate('/teacher/topics');
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Error submitting topic:', error);
            alert('Có lỗi xảy ra khi đề xuất đề tài');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>📝 Đề Xuất Đề Tài Mới</h1>
                    <p>Tạo đề tài mới cho sinh viên đăng ký</p>
                </div>

                <div className={styles.formCard}>
                    <form onSubmit={handleSubmit}>
                        {/* Title */}
                        <div className={styles.formGroup}>
                            <label htmlFor="title">
                                Tiêu đề đề tài <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="VD: Xây dựng hệ thống quản lý đồ án tốt nghiệp"
                                className={styles.input}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className={styles.formGroup}>
                            <label htmlFor="description">
                                Mô tả chi tiết <span className={styles.required}>*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Mô tả chi tiết về đề tài, mục tiêu, phạm vi..."
                                className={styles.textarea}
                                rows={6}
                                required
                            />
                        </div>

                        {/* Requirements */}
                        <div className={styles.formGroup}>
                            <label htmlFor="requirements">Yêu cầu sinh viên</label>
                            <textarea
                                id="requirements"
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                placeholder="VD: Có kiến thức về React, Node.js, MySQL..."
                                className={styles.textarea}
                                rows={4}
                            />
                        </div>

                        {/* Grid for smaller fields */}
                        <div className={styles.formGrid}>
                            {/* Field */}
                            <div className={styles.formGroup}>
                                <label htmlFor="field">Lĩnh vực</label>
                                <select
                                    id="field"
                                    name="field"
                                    value={formData.field}
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="Web Development">Web Development</option>
                                    <option value="Mobile App">Mobile App</option>
                                    <option value="AI/ML">AI/Machine Learning</option>
                                    <option value="IoT">IoT</option>
                                    <option value="Data Science">Data Science</option>
                                    <option value="Game Development">Game Development</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Max Students */}
                            <div className={styles.formGroup}>
                                <label htmlFor="maxStudents">Số lượng SV tối đa</label>
                                <input
                                    type="number"
                                    id="maxStudents"
                                    name="maxStudents"
                                    value={formData.maxStudents}
                                    onChange={handleChange}
                                    min="1"
                                    max="5"
                                    className={styles.input}
                                />
                            </div>

                            {/* Semester */}
                            <div className={styles.formGroup}>
                                <label htmlFor="semester">Học kỳ</label>
                                <select
                                    id="semester"
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="1">Học kỳ 1</option>
                                    <option value="2">Học kỳ 2</option>
                                    <option value="summer">Học kỳ hè</option>
                                </select>
                            </div>

                            {/* Academic Year */}
                            <div className={styles.formGroup}>
                                <label htmlFor="academicYear">Năm học</label>
                                <input
                                    type="text"
                                    id="academicYear"
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleChange}
                                    placeholder="2024-2025"
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.formActions}>
                            <button
                                type="button"
                                onClick={() => navigate('/teacher/topics')}
                                className={styles.btnSecondary}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={styles.btnPrimary}
                            >
                                {submitting ? 'Đang gửi...' : 'Đề xuất đề tài'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className={styles.infoBox}>
                    <h3>ℹ️ Lưu ý</h3>
                    <ul>
                        <li>Đề tài sẽ được gửi đến Admin để phê duyệt</li>
                        <li>Sau khi được duyệt, sinh viên có thể đăng ký đề tài</li>
                        <li>Bạn có thể chỉnh sửa đề tài trong trạng thái "Chờ duyệt"</li>
                    </ul>
                </div>
            </div>
        </MainLayout>
    );
};

export default TeacherTopicProposal;
