// Conversation List Component — Modern Design
import React, { useEffect, useState } from 'react';
import { Conversation } from '../../types/chat.types';
import { subscribeToUnreadCount } from '../../services/api/chat.service';
import styles from '../../pages/shared/Chat.module.css';

interface ConversationListProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    currentUserId: string;
    onSelectConversation: (conversation: Conversation) => void;
}

const AVATAR_COLORS = [
    'linear-gradient(135deg, #0084ff 0%, #00c6ff 100%)',
    'linear-gradient(135deg, #f2709c 0%, #ff9472 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
];

const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    activeConversationId,
    currentUserId,
    onSelectConversation,
}) => {
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const unsubscribes: (() => void)[] = [];

        conversations.forEach((conv) => {
            const unsub = subscribeToUnreadCount(conv.id, currentUserId, (count) => {
                setUnreadCounts((prev) => ({ ...prev, [conv.id]: count }));
            });
            unsubscribes.push(unsub);
        });

        return () => unsubscribes.forEach((unsub) => unsub());
    }, [conversations.length, currentUserId]);

    const getOtherParticipantName = (conv: Conversation) => {
        const others = Object.entries(conv.participants)
            .filter(([uid]) => uid !== currentUserId)
            .map(([, info]) => info.name);
        return others.join(', ') || 'Người tham gia';
    };

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Hôm qua';
        }

        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    if (conversations.length === 0) {
        return (
            <div className={styles.emptyList}>
                <div className={styles.emptyListIcon}>💬</div>
                <p className={styles.emptyListText}>Chưa có hội thoại nào</p>
                <p className={styles.emptyListSubtext}>
                    Hội thoại sẽ xuất hiện khi bạn có đồ án được phân công
                </p>
            </div>
        );
    }

    return (
        <div>
            {conversations.map((conv) => {
                const isActive = activeConversationId === conv.id;
                const unread = unreadCounts[conv.id] || 0;
                const name = getOtherParticipantName(conv);

                return (
                    <div
                        key={conv.id}
                        onClick={() => onSelectConversation(conv)}
                        className={`${styles.convItem} ${isActive ? styles.convItemActive : ''}`}
                    >
                        {/* Avatar */}
                        <div
                            className={`${styles.convAvatar} ${styles.convAvatarOnline}`}
                            style={{ background: getAvatarColor(name) }}
                        >
                            {name.charAt(0).toUpperCase()}
                        </div>

                        {/* Content */}
                        <div className={styles.convContent}>
                            <div className={`${styles.convName} ${unread > 0 ? styles.convNameUnread : ''}`}>
                                {name}
                            </div>
                            <div className={`${styles.convPreview} ${unread > 0 ? styles.convPreviewUnread : ''}`}>
                                {conv.lastMessage
                                    ? conv.lastMessage.text
                                    : `📋 ${conv.projectTitle}`
                                }
                            </div>
                        </div>

                        {/* Meta */}
                        <div className={styles.convMeta}>
                            <span className={`${styles.convTime} ${unread > 0 ? styles.convTimeUnread : ''}`}>
                                {formatTime(conv.lastMessage?.timestamp)}
                            </span>
                            {unread > 0 && (
                                <span className={styles.convBadge}>
                                    {unread > 99 ? '99+' : unread}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ConversationList;
