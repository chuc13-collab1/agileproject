// Floating Chat Widget — Fixed bottom-right, expands into full chat UI
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Conversation } from '../../types/chat.types';
import {
    subscribeToConversations,
    createOrGetConversation,
    setUserOnline,
    setUserOffline,
    subscribeToUnreadCount,
} from '../../services/api/chat.service';
import { auth } from '../../services/firebase/config';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import styles from './FloatingChat.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('No token');
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
};

type PanelState = 'closed' | 'list' | 'window';

const FloatingChat: React.FC = () => {
    const { user } = useAuth();
    const [panel, setPanel] = useState<PanelState>('closed');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [totalUnread, setTotalUnread] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // ---------- Init conversations ----------
    useEffect(() => {
        if (!user) return;

        const init = async () => {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch(`${API_URL}/projects`, { headers });
                const result = await res.json();
                const allProjects: any[] = Array.isArray(result) ? result : (result.data || []);

                const myProjects = allProjects.filter(
                    (p: any) =>
                        p.studentId === user.uid ||
                        (p.supervisor && p.supervisor.id === user.uid)
                );

                for (const project of myProjects) {
                    if (!project.supervisor || !project.studentId) continue;
                    const participants: Record<string, { name: string; role: 'student' | 'teacher' }> = {};
                    participants[project.studentId] = { name: project.studentName || 'Sinh viên', role: 'student' };
                    participants[project.supervisor.id] = { name: project.supervisor.name || 'Giảng viên', role: 'teacher' };
                    await createOrGetConversation(project.id, project.title || 'Đồ án', participants);
                }
            } catch { /* noop */ } finally {
                setLoading(false);
            }
        };

        init();
    }, [user]);

    // ---------- Presence ----------
    useEffect(() => {
        if (!user?.uid) return;
        setUserOnline(user.uid);
        const handler = () => setUserOffline(user.uid);
        window.addEventListener('beforeunload', handler);
        return () => { setUserOffline(user.uid); window.removeEventListener('beforeunload', handler); };
    }, [user?.uid]);

    // ---------- Subscribe conversations ----------
    useEffect(() => {
        if (!user?.uid) return;
        const unsub = subscribeToConversations(user.uid, (convs) => {
            setConversations(convs);
            setLoading(false);
        });
        return () => unsub();
    }, [user?.uid]);

    // ---------- Total unread badge ----------
    useEffect(() => {
        if (!user?.uid || conversations.length === 0) return;
        const unsubs: (() => void)[] = [];
        const counts: Record<string, number> = {};

        conversations.forEach((conv) => {
            const unsub = subscribeToUnreadCount(conv.id, user.uid, (count) => {
                counts[conv.id] = count;
                setTotalUnread(Object.values(counts).reduce((a, b) => a + b, 0));
            });
            unsubs.push(unsub);
        });

        return () => unsubs.forEach((u) => u());
    }, [user?.uid, conversations.length]);

    const getOtherParticipant = (conv: Conversation) => {
        const others = Object.entries(conv.participants).filter(([uid]) => uid !== user?.uid);
        return {
            name: others.map(([, info]) => info.name).join(', ') || 'Người tham gia',
            id: others[0]?.[0] || '',
        };
    };

    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            getOtherParticipant(conv).name.toLowerCase().includes(q) ||
            (conv.projectTitle || '').toLowerCase().includes(q)
        );
    });

    const handleToggle = () => {
        setPanel((prev) => (prev === 'closed' ? 'list' : 'closed'));
        setActiveConversation(null);
    };

    const handleSelectConversation = (conv: Conversation) => {
        setActiveConversation(conv);
        setPanel('window');
    };

    const handleBackToList = () => {
        setActiveConversation(null);
        setPanel('list');
    };

    const isOpen = panel !== 'closed';

    return (
        <div className={styles.wrapper}>
            {/* Panel */}
            {isOpen && (
                <div className={`${styles.panel} ${panel === 'window' ? styles.panelWindow : ''}`}>
                    {panel === 'list' && (
                        <>
                            <div className={styles.panelHeader}>
                                <div className={styles.panelHeaderLeft}>
                                    <span className={styles.panelHeaderIcon}>💬</span>
                                    <div>
                                        <h3>Tin nhắn</h3>
                                        <span>{conversations.length} hội thoại</span>
                                    </div>
                                </div>
                                <button className={styles.panelClose} onClick={handleToggle}>✕</button>
                            </div>

                            <div className={styles.searchBox}>
                                <input
                                    type="text"
                                    placeholder="🔍 Tìm kiếm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>

                            <div className={styles.conversationList}>
                                {loading ? (
                                    <div className={styles.loadingState}>
                                        <div className={styles.spinner} />
                                        <span>Đang tải...</span>
                                    </div>
                                ) : (
                                    <ConversationList
                                        conversations={filteredConversations}
                                        activeConversationId={null}
                                        currentUserId={user?.uid || ''}
                                        onSelectConversation={handleSelectConversation}
                                    />
                                )}
                            </div>
                        </>
                    )}

                    {panel === 'window' && activeConversation && (
                        <>
                            <div className={styles.panelHeader}>
                                <div className={styles.panelHeaderLeft}>
                                    <button className={styles.backBtn} onClick={handleBackToList}>←</button>
                                    <div>
                                        <h3>{getOtherParticipant(activeConversation).name}</h3>
                                        <span>{activeConversation.projectTitle}</span>
                                    </div>
                                </div>
                                <button className={styles.panelClose} onClick={handleToggle}>✕</button>
                            </div>

                            <div className={styles.chatWindowWrapper}>
                                <ChatWindow
                                    projectId={activeConversation.id}
                                    projectTitle={activeConversation.projectTitle}
                                    currentUserId={user?.uid || ''}
                                    currentUserName={user?.fullName || ''}
                                    currentUserRole={user?.role || 'student'}
                                    otherParticipantName={getOtherParticipant(activeConversation).name}
                                    otherParticipantId={getOtherParticipant(activeConversation).id}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Floating Button */}
            <button
                className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
                onClick={handleToggle}
                title="Tin nhắn"
            >
                <span className={styles.fabIcon}>{isOpen ? '✕' : '💬'}</span>
                {!isOpen && totalUnread > 0 && (
                    <span className={styles.fabBadge}>{totalUnread > 99 ? '99+' : totalUnread}</span>
                )}
            </button>
        </div>
    );
};

export default FloatingChat;
