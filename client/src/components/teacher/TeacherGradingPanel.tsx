import React, { useState } from 'react';
import { auth } from '../../services/firebase/config';
import styles from '../../pages/supervisor/Supervisor.module.css';

interface GradingPanelProps {
    projectId: string;
    currentEvaluation?: any;
    evaluatorRole?: 'supervisor' | 'reviewer' | 'council';
    onSubmitSuccess?: () => void;
}

const TeacherGradingPanel: React.FC<GradingPanelProps> = ({
    projectId,
    currentEvaluation,
    evaluatorRole = 'supervisor',
    onSubmitSuccess
}) => {
    const [criteria, setCriteria] = useState({
        content: currentEvaluation?.criteria_score?.content || 8.0,
        technical: currentEvaluation?.criteria_score?.technical || 8.0,
        presentation: currentEvaluation?.criteria_score?.presentation || 8.0,
        defense: currentEvaluation?.criteria_score?.defense || 8.0
    });

    const [formData, setFormData] = useState({
        comments: currentEvaluation?.comments || '',
        strengths: currentEvaluation?.strengths || '',
        weaknesses: currentEvaluation?.weaknesses || '',
        suggestions: currentEvaluation?.suggestions || ''
    });

    const [submitting, setSubmitting] = useState(false);

    // Calculate total score with weights
    const calculateTotal = () => {
        const weights = {
            content: 0.4,
            technical: 0.3,
            presentation: 0.2,
            defense: 0.1
        };

        const total =
            criteria.content * weights.content +
            criteria.technical * weights.technical +
            criteria.presentation * weights.presentation +
            criteria.defense * weights.defense;

        return parseFloat(total.toFixed(2));
    };

    const totalScore = calculateTotal();

    const getGrade = (score: number) => {
        if (score >= 9.0) return { grade: 'A', color: '#22c55e' };
        if (score >= 8.5) return { grade: 'B+', color: '#84cc16' };
        if (score >= 8.0) return { grade: 'B', color: '#eab308' };
        if (score >= 7.5) return { grade: 'C+', color: '#f97316' };
        if (score >= 7.0) return { grade: 'C', color: '#f59e0b' };
        if (score >= 6.5) return { grade: 'D+', color: '#ef4444' };
        if (score >= 6.0) return { grade: 'D', color: '#dc2626' };
        return { grade: 'F', color: '#991b1b' };
    };

    const gradeInfo = getGrade(totalScore);

    const handleCriteriaChange = (criterion: keyof typeof criteria, value: number) => {
        setCriteria(prev => ({
            ...prev,
            [criterion]: value
        }));
    };

    const handleFormChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            // Get Firebase token
            const user = auth.currentUser; // Assuming you have user in global scope
            const token = await user?.getIdToken();

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/projects/${projectId}/evaluate`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        evaluatorType: evaluatorRole,
                        criteriaScore: criteria,
                        ...formData
                    })
                }
            );

            const data = await response.json();

            if (data.success) {
                alert(`✅ Đánh giá thành công!\nĐiểm tổng: ${data.data.totalScore}\nXếp loại: ${getGrade(data.data.totalScore).grade}`);
                if (onSubmitSuccess) onSubmitSuccess();
            } else {
                alert('❌ Lỗi: ' + data.message);
            }
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            alert('Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.gradingPanel}>
            <div className={styles.gradingHeader}>
                <h2>💯 Chấm Điểm & Đánh Giá</h2>
                <div className={styles.scoreDisplay}>
                    <div className={styles.totalScore}>
                        <span className={styles.scoreLabel}>Điểm tổng:</span>
                        <span className={styles.scoreValue}>{totalScore}</span>
                    </div>
                    <div className={styles.gradeDisplay} style={{ backgroundColor: gradeInfo.color }}>
                        {gradeInfo.grade}
                    </div>
                </div>
            </div>

            {/* Criteria Sliders */}
            <div className={styles.criteriaSection}>
                <h3>Tiêu chí đánh giá</h3>

                {/* Content - 40% */}
                <div className={styles.criteriaItem}>
                    <div className={styles.criteriaHeader}>
                        <label>📄 Nội dung (40%)</label>
                        <span className={styles.criteriaScore}>{criteria.content.toFixed(1)}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={criteria.content}
                        onChange={(e) => handleCriteriaChange('content', parseFloat(e.target.value))}
                        className={styles.slider}
                    />
                    <div className={styles.sliderLabels}>
                        <span>0</span>
                        <span>5</span>
                        <span>10</span>
                    </div>
                </div>

                {/* Technical - 30% */}
                <div className={styles.criteriaItem}>
                    <div className={styles.criteriaHeader}>
                        <label>⚙️ Kỹ thuật (30%)</label>
                        <span className={styles.criteriaScore}>{criteria.technical.toFixed(1)}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={criteria.technical}
                        onChange={(e) => handleCriteriaChange('technical', parseFloat(e.target.value))}
                        className={styles.slider}
                    />
                    <div className={styles.sliderLabels}>
                        <span>0</span>
                        <span>5</span>
                        <span>10</span>
                    </div>
                </div>

                {/* Presentation - 20% */}
                <div className={styles.criteriaItem}>
                    <div className={styles.criteriaHeader}>
                        <label>📊 Trình bày (20%)</label>
                        <span className={styles.criteriaScore}>{criteria.presentation.toFixed(1)}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={criteria.presentation}
                        onChange={(e) => handleCriteriaChange('presentation', parseFloat(e.target.value))}
                        className={styles.slider}
                    />
                    <div className={styles.sliderLabels}>
                        <span>0</span>
                        <span>5</span>
                        <span>10</span>
                    </div>
                </div>

                {/* Defense - 10% */}
                <div className={styles.criteriaItem}>
                    <div className={styles.criteriaHeader}>
                        <label>💬 Bảo vệ (10%)</label>
                        <span className={styles.criteriaScore}>{criteria.defense.toFixed(1)}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={criteria.defense}
                        onChange={(e) => handleCriteriaChange('defense', parseFloat(e.target.value))}
                        className={styles.slider}
                    />
                    <div className={styles.sliderLabels}>
                        <span>0</span>
                        <span>5</span>
                        <span>10</span>
                    </div>
                </div>
            </div>

            {/* Feedback Forms */}
            <div className={styles.feedbackSection}>
                <div className={styles.formGroup}>
                    <label>💬 Nhận xét chung</label>
                    <textarea
                        value={formData.comments}
                        onChange={(e) => handleFormChange('comments', e.target.value)}
                        placeholder="Nhận xét chung về đồ án..."
                        rows={4}
                        className={styles.textarea}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>✅ Điểm mạnh</label>
                    <textarea
                        value={formData.strengths}
                        onChange={(e) => handleFormChange('strengths', e.target.value)}
                        placeholder="Những điểm làm tốt..."
                        rows={3}
                        className={styles.textarea}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>⚠️ Điểm cần cải thiện</label>
                    <textarea
                        value={formData.weaknesses}
                        onChange={(e) => handleFormChange('weaknesses', e.target.value)}
                        placeholder="Những điểm cần cải thiện..."
                        rows={3}
                        className={styles.textarea}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>💡 Đề xuất</label>
                    <textarea
                        value={formData.suggestions}
                        onChange={(e) => handleFormChange('suggestions', e.target.value)}
                        placeholder="Đề xuất cho sinh viên..."
                        rows={3}
                        className={styles.textarea}
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className={styles.gradingActions}>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={styles.btnPrimary}
                >
                    {submitting ? 'Đang gửi...' : '✅ Hoàn tất đánh giá'}
                </button>
            </div>

            {/* Grading Info */}
            <div className={styles.gradingInfo}>
                <h4>ℹ️ Thang điểm</h4>
                <div className={styles.gradeTable}>
                    <div>A: 9.0-10.0 | B+: 8.5-8.9 | B: 8.0-8.4</div>
                    <div>C+: 7.5-7.9 | C: 7.0-7.4 | D+: 6.5-6.9</div>
                    <div>D: 6.0-6.4 | F: &lt;6.0</div>
                </div>
            </div>
        </div>
    );
};

export default TeacherGradingPanel;
