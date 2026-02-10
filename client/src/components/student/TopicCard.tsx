import React from 'react';
import { Topic } from '../../types/topic.types';

interface TopicCardProps {
    topic: Topic;
    onRegister: (topicId: string) => void;
    isRegistered?: boolean;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onRegister, isRegistered = false }) => {
    const availableSlots = (topic.maxStudents || 0) - (topic.registeredStudents || 0);
    const isFull = availableSlots <= 0;

    return (
        <div
            style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#e2e8f0';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                    {topic.title}
                </h3>
                {topic.status && (
                    <span
                        style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            background: topic.status === 'approved' ? '#dcfce7' : '#fef3c7',
                            color: topic.status === 'approved' ? '#166534' : '#854d0e'
                        }}
                    >
                        {topic.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                )}
            </div>

            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                {topic.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>👨‍🏫</span>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Giảng viên</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{topic.supervisorName || 'N/A'}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📚</span>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Lĩnh vực</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{topic.field || 'Chung'}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>👥</span>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Slot còn lại</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: isFull ? '#dc2626' : '#16a34a' }}>
                            {availableSlots}/{topic.maxStudents || 0}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📅</span>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Học kỳ</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            {topic.semester} - {topic.academicYear}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onRegister(topic.id)}
                disabled={isFull || isRegistered}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: isFull || isRegistered ? '#94a3b8' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: isFull || isRegistered ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    if (!isFull && !isRegistered) {
                        e.currentTarget.style.background = '#2563eb';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isFull && !isRegistered) {
                        e.currentTarget.style.background = '#3b82f6';
                    }
                }}
            >
                {isRegistered ? '✅ Đã đăng ký' : isFull ? '❌ Đã đủ sinh viên' : '📝 Đăng ký đề tài'}
            </button>
        </div>
    );
};

export default TopicCard;
