import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { getActiveAnnouncements } from '../../services/api/announcement.service';
import { Announcement } from '../../types/announcement.types';
import styles from '../student/Dashboard.module.css';

const AnnouncementsPage: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await getActiveAnnouncements();
                setAnnouncements(data);
            } catch (error) {
                console.error('Failed to load announcements:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <MainLayout>
            <div className={styles.dashboard}>
                <div style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                    borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(14, 165, 233, 0.3)'
                }}>
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '800' }}>
                        📢 Bảng Tin Thông Báo
                    </h2>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '1.05rem' }}>
                        Cập nhật các thông báo mới nhất từ Ban Quản Lý Đồ Án
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                        Đang lấy danh sách thông báo...
                    </div>
                ) : announcements.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Chưa có thông báo nào</h3>
                        <p style={{ color: '#64748b', margin: 0 }}>Vui lòng quay lại sau.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {announcements.map((ann) => (
                            <div key={ann.id} style={{
                                background: 'white',
                                borderRadius: '1rem',
                                padding: '1.5rem 2rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e2e8f0',
                                borderLeft: '4px solid #3b82f6'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>
                                        {ann.title}
                                    </h3>
                                    <span style={{
                                        background: '#f1f5f9', color: '#475569', fontSize: '0.85rem',
                                        padding: '0.4rem 0.8rem', borderRadius: '9999px', fontWeight: '600'
                                    }}>
                                        📅 {formatDateTime(ann.createdAt)}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                    <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.3rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>
                                        Học kỳ {ann.semester} - Năm {ann.academicYear}
                                    </span>
                                    <span style={{ background: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>
                                        Đăng ký đề tài: {new Date(ann.registrationStart).toLocaleDateString("vi-VN")} → {new Date(ann.registrationEnd).toLocaleDateString("vi-VN")}
                                    </span>
                                </div>

                                <div style={{
                                    background: '#f8fafc',
                                    padding: '1.5rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    color: '#334155',
                                    lineHeight: '1.8',
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '0.95rem'
                                }}>
                                    {ann.content || <i>(Không có nội dung chi tiết)</i>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default AnnouncementsPage;
