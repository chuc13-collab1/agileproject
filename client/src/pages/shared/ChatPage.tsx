// Chat Page - Shared between Student and Teacher
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Conversation } from '../../types/chat.types';
import {
    subscribeToConversations,
    createOrGetConversation,
    setUserOnline,
    setUserOffline,
} from '../../services/api/chat.service';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import styles from './Chat.module.css';

// API helper
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
import { auth } from '../../services/firebase/config';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('No authentication token');
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
};

const ChatPage: React.FC = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Load user's projects and setup conversations
    useEffect(() => {
        if (!user) return;

        const initConversations = async () => {
            try {
                setLoading(true);
                const headers = await getAuthHeaders();

                const response = await fetch(`${API_URL}/projects`, { headers });
                const result = await response.json();
                const allProjects = Array.isArray(result) ? result : (result.data || []);

                // Filter: only current user's projects (as student or supervisor)
                const myProjects = allProjects.filter((p: any) =>
                    p.studentId === user.uid ||
                    (p.supervisor && p.supervisor.id === user.uid)
                );

                for (const project of myProjects) {
                    if (!project.supervisor || !project.studentId) continue;

                    const participants: Record<string, { name: string; role: 'student' | 'teacher' }> = {};

                    participants[project.studentId] = {
                        name: project.studentName || 'Sinh viên',
                        role: 'student',
                    };

                    participants[project.supervisor.id] = {
                        name: project.supervisor.name || 'Giảng viên',
                        role: 'teacher',
                    };

                    const topicTitle = project.title || 'Đồ án';
                    await createOrGetConversation(project.id, topicTitle, participants);
                }
            } catch (err: any) {
                console.error('Error initializing conversations:', err);
            } finally {
                setLoading(false);
            }
        };

        initConversations();
    }, [user]);

    // Subscribe to conversations updates (realtime)
    // Online presence
    useEffect(() => {
        if (!user?.uid) return;
        setUserOnline(user.uid);

        const handleBeforeUnload = () => setUserOffline(user.uid);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            setUserOffline(user.uid);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [user?.uid]);

    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribe = subscribeToConversations(user.uid, (convs) => {
            setConversations(convs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    const handleSelectConversation = (conv: Conversation) => {
        setActiveConversation(conv);
    };

    const getOtherParticipant = (conv: Conversation) => {
        if (!user?.uid) return { name: '', id: '' };
        const others = Object.entries(conv.participants)
            .filter(([uid]) => uid !== user.uid);
        return {
            name: others.map(([, info]) => info.name).join(', ') || 'Người tham gia',
            id: others[0]?.[0] || '',
        };
    };

    const getOtherParticipantName = (conv: Conversation) => getOtherParticipant(conv).name;

    // Filter conversations by search
    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const name = getOtherParticipantName(conv).toLowerCase();
        const title = (conv.projectTitle || '').toLowerCase();
        return name.includes(q) || title.includes(q);
    });

    if (loading) {
        return (
            <div className={styles.chatContainer}>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <span className={styles.loadingText}>Đang tải tin nhắn...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chatContainer}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>Chat</h2>
                    <p>{conversations.length}</p>
                </div>
                <div className={styles.searchBox}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="🔍 Tìm kiếm hội thoại..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className={styles.conversationListWrapper}>
                    <ConversationList
                        conversations={filteredConversations}
                        activeConversationId={activeConversation?.id || null}
                        currentUserId={user?.uid || ''}
                        onSelectConversation={handleSelectConversation}
                    />
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={styles.mainArea}>
                {activeConversation ? (
                    <ChatWindow
                        projectId={activeConversation.id}
                        projectTitle={activeConversation.projectTitle}
                        currentUserId={user?.uid || ''}
                        currentUserName={user?.fullName || ''}
                        currentUserRole={user?.role || 'student'}
                        otherParticipantName={getOtherParticipant(activeConversation).name}
                        otherParticipantId={getOtherParticipant(activeConversation).id}
                    />
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>💬</div>
                        <h2>Tin nhắn của bạn</h2>
                        <p>
                            Chọn một cuộc hội thoại bên trái để bắt đầu trò chuyện
                            với giảng viên hoặc sinh viên về đồ án
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
