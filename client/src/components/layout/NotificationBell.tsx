// Notification Bell Component — Header dropdown
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase/config';
import styles from '../../pages/shared/Notification.module.css';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}`;

interface Notification {
    id: string;
    user_uid: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'project' | 'report' | 'chat' | 'system';
    link: string | null;
    is_read: number;
    created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    project: '📋',
    report: '📝',
    chat: '💬',
    system: '🔔',
};

const TYPE_STYLES: Record<string, string> = {
    info: styles.notifIconInfo,
    success: styles.notifIconSuccess,
    warning: styles.notifIconWarning,
    error: styles.notifIconError,
    project: styles.notifIconProject,
    report: styles.notifIconReport,
    chat: styles.notifIconChat,
    system: styles.notifIconSystem,
};

const NotificationBell: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const getHeaders = async () => {
        const token = await auth.currentUser?.getIdToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/notifications/unread-count`, { headers });
            const data = await res.json();
            if (data.success) setUnreadCount(data.count);
        } catch (err) {
            // Silently fail
        }
    }, [user]);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/notifications?limit=10`, { headers });
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Poll unread count every 30 seconds
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    // Fetch full list when dropdown opens
    useEffect(() => {
        if (isOpen) fetchNotifications();
    }, [isOpen, fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    const handleMarkAllRead = async () => {
        try {
            const headers = await getHeaders();
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers,
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    };

    const handleClick = async (notif: Notification) => {
        // Mark as read
        if (!notif.is_read) {
            try {
                const headers = await getHeaders();
                await fetch(`${API_URL}/notifications/${notif.id}/read`, {
                    method: 'PATCH',
                    headers,
                });
                setNotifications((prev) =>
                    prev.map((n) => n.id === notif.id ? { ...n, is_read: 1 } : n)
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch (err) {
                // Silently fail
            }
        }
        // Navigate if link exists
        if (notif.link) {
            setIsOpen(false);
            navigate(notif.link);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const headers = await getHeaders();
            await fetch(`${API_URL}/notifications/${id}`, {
                method: 'DELETE',
                headers,
            });
            const deleted = notifications.find((n) => n.id === id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            if (deleted && !deleted.is_read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
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

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                className={styles.notificationBell}
                onClick={() => setIsOpen(!isOpen)}
                title="Thông báo"
            >
                🔔
                {unreadCount > 0 && (
                    <span className={styles.bellBadge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={styles.notifDropdown}>
                    <div className={styles.notifHeader}>
                        <h3>Thông báo</h3>
                        <div className={styles.notifActions}>
                            {unreadCount > 0 && (
                                <button className={styles.notifActionBtn} onClick={handleMarkAllRead}>
                                    Đọc tất cả
                                </button>
                            )}
                            <button
                                className={styles.notifActionBtn}
                                onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                            >
                                Xem tất cả
                            </button>
                        </div>
                    </div>

                    <div className={styles.notifList}>
                        {loading ? (
                            <div className={styles.notifEmpty}>
                                <p>Đang tải...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.notifEmpty}>
                                <div className={styles.notifEmptyIcon}>🔔</div>
                                <p className={styles.notifEmptyText}>Không có thông báo</p>
                                <p className={styles.notifEmptySubtext}>
                                    Thông báo sẽ xuất hiện khi có cập nhật mới
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
            )}
        </div>
    );
};

export default NotificationBell;
