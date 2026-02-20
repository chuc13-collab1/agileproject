// Notifications Full Page
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase/config';
import styles from './Notification.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Notification {
    id: string;
    user_uid: string;
    title: string;
    message: string;
    type: string;
    link: string | null;
    is_read: number;
    created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
    info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌',
    project: '📋', report: '📝', chat: '💬', system: '🔔',
};

const TYPE_STYLES: Record<string, string> = {
    info: styles.notifIconInfo, success: styles.notifIconSuccess,
    warning: styles.notifIconWarning, error: styles.notifIconError,
    project: styles.notifIconProject, report: styles.notifIconReport,
    chat: styles.notifIconChat, system: styles.notifIconSystem,
};

const NotificationsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [loading, setLoading] = useState(true);

    const getHeaders = async () => {
        const token = await auth.currentUser?.getIdToken();
        return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    };

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const headers = await getHeaders();
            const unread = filter === 'unread' ? '&unread=true' : '';
            const res = await fetch(`${API_URL}/notifications?limit=50${unread}`, { headers });
            const data = await res.json();
            if (data.success) setNotifications(data.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [user, filter]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const handleMarkAllRead = async () => {
        try {
            const headers = await getHeaders();
            await fetch(`${API_URL}/notifications/read-all`, { method: 'PATCH', headers });
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        } catch (err) { console.error(err); }
    };

    const handleClick = async (notif: Notification) => {
        if (!notif.is_read) {
            try {
                const headers = await getHeaders();
                await fetch(`${API_URL}/notifications/${notif.id}/read`, { method: 'PATCH', headers });
                setNotifications((prev) =>
                    prev.map((n) => n.id === notif.id ? { ...n, is_read: 1 } : n)
                );
            } catch { /* noop */ }
        }
        if (notif.link) navigate(notif.link);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const headers = await getHeaders();
            await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE', headers });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) { console.error(err); }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className={styles.notifPage}>
            <div className={styles.notifPageHeader}>
                <h1>🔔 Thông báo</h1>
                {unreadCount > 0 && (
                    <button className={styles.notifActionBtn} onClick={handleMarkAllRead}>
                        Đọc tất cả ({unreadCount})
                    </button>
                )}
            </div>

            <div className={styles.notifPageFilters}>
                <button
                    className={`${styles.notifFilterBtn} ${filter === 'all' ? styles.notifFilterBtnActive : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Tất cả
                </button>
                <button
                    className={`${styles.notifFilterBtn} ${filter === 'unread' ? styles.notifFilterBtnActive : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Chưa đọc
                </button>
            </div>

            <div className={styles.notifPageList}>
                {loading ? (
                    <div className={styles.notifEmpty}><p>Đang tải...</p></div>
                ) : notifications.length === 0 ? (
                    <div className={styles.notifEmpty}>
                        <div className={styles.notifEmptyIcon}>🔔</div>
                        <p className={styles.notifEmptyText}>Không có thông báo</p>
                        <p className={styles.notifEmptySubtext}>
                            {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Thông báo sẽ xuất hiện khi có cập nhật mới'}
                        </p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`${styles.notifItem} ${!notif.is_read ? styles.notifItemUnread : ''}`}
                            onClick={() => handleClick(notif)}
                        >
                            <div className={`${styles.notifIcon} ${TYPE_STYLES[notif.type] || ''}`}>
                                {TYPE_ICONS[notif.type] || '🔔'}
                            </div>
                            <div className={styles.notifContent}>
                                <div className={styles.notifTitle}>{notif.title}</div>
                                <div className={styles.notifMessage}>{notif.message}</div>
                                <div className={styles.notifTime}>{formatTime(notif.created_at)}</div>
                            </div>
                            {!notif.is_read && <div className={styles.notifUnreadDot} />}
                            <button
                                className={styles.notifDeleteBtn}
                                onClick={(e) => handleDelete(e, notif.id)}
                                title="Xóa"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
