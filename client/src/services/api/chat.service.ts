// Chat Service - Firebase Realtime Database + Storage
import {
    ref,
    push,
    onValue,
    off,
    query,
    orderByChild,
    set,
    update,
    get,
    remove,
} from 'firebase/database';
import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage';
import { realtimeDb } from '../firebase/config';
import { storage } from '../firebase/config';
import { ChatMessage, Conversation, ParticipantInfo } from '../../types/chat.types';

const CONVERSATIONS_REF = 'conversations';
const MESSAGES_REF = 'messages';
const PRESENCE_REF = 'presence';

// ============================================================
// Conversations
// ============================================================

export const createOrGetConversation = async (
    projectId: string,
    projectTitle: string,
    participants: Record<string, ParticipantInfo>
): Promise<void> => {
    const convRef = ref(realtimeDb, `${CONVERSATIONS_REF}/${projectId}`);
    const snapshot = await get(convRef);

    if (!snapshot.exists()) {
        await set(convRef, {
            projectTitle,
            participants,
            createdAt: Date.now(),
        });
    }
};

export const subscribeToConversations = (
    userId: string,
    callback: (conversations: Conversation[]) => void
): (() => void) => {
    const convsRef = ref(realtimeDb, CONVERSATIONS_REF);

    const listener = onValue(convsRef, (snapshot) => {
        const conversations: Conversation[] = [];
        snapshot.forEach((child) => {
            const data = child.val();
            if (data.participants && data.participants[userId]) {
                conversations.push({
                    id: child.key!,
                    projectTitle: data.projectTitle,
                    participants: data.participants,
                    lastMessage: data.lastMessage || undefined,
                    typing: data.typing || undefined,
                });
            }
        });

        conversations.sort((a, b) => {
            const timeA = a.lastMessage?.timestamp || 0;
            const timeB = b.lastMessage?.timestamp || 0;
            return timeB - timeA;
        });

        callback(conversations);
    }, (error) => {
        console.error('[Chat] Subscription error:', error);
    });

    return () => off(convsRef);
};

// ============================================================
// Messages
// ============================================================

export const sendMessage = async (
    projectId: string,
    senderId: string,
    senderName: string,
    senderRole: string,
    text: string,
    attachment?: { url: string; name: string; type: 'image' | 'file'; size: number },
    replyTo?: { id: string; text: string; senderName: string }
): Promise<void> => {
    const trimmedText = text.trim();
    if (!trimmedText && !attachment) return;

    const messagesRef = ref(realtimeDb, `${MESSAGES_REF}/${projectId}`);
    const newMessageRef = push(messagesRef);

    const message: Record<string, any> = {
        senderId,
        senderName,
        senderRole,
        text: trimmedText,
        timestamp: Date.now(),
        read: false,
    };

    if (attachment) {
        message.attachment = attachment;
    }

    if (replyTo) {
        message.replyTo = replyTo;
    }

    await set(newMessageRef, message);

    // Update last message in conversation
    const displayText = attachment
        ? (attachment.type === 'image' ? '📷 Hình ảnh' : `📎 ${attachment.name}`)
        : trimmedText;

    const convRef = ref(realtimeDb, `${CONVERSATIONS_REF}/${projectId}/lastMessage`);
    await set(convRef, {
        text: displayText.length > 100 ? displayText.substring(0, 100) + '...' : displayText,
        senderId,
        senderName,
        timestamp: Date.now(),
    });

    // Clear typing indicator
    await clearTyping(projectId, senderId);
};

export const subscribeToMessages = (
    projectId: string,
    callback: (messages: ChatMessage[]) => void
): (() => void) => {
    const messagesRef = query(
        ref(realtimeDb, `${MESSAGES_REF}/${projectId}`),
        orderByChild('timestamp')
    );

    const listener = onValue(messagesRef, (snapshot) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((child) => {
            messages.push({
                id: child.key!,
                ...child.val(),
            });
        });
        callback(messages);
    });

    return () => off(messagesRef);
};

// ============================================================
// File Upload
// ============================================================

export const uploadChatFile = async (
    projectId: string,
    file: File
): Promise<{ url: string; name: string; type: 'image' | 'file'; size: number }> => {
    const isImage = file.type.startsWith('image/');
    const folder = isImage ? 'images' : 'files';
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, `chat/${projectId}/${folder}/${fileName}`);

    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    return {
        url,
        name: file.name,
        type: isImage ? 'image' : 'file',
        size: file.size,
    };
};

// ============================================================
// Reactions
// ============================================================

export const toggleReaction = async (
    projectId: string,
    messageId: string,
    userId: string,
    emoji: string
): Promise<void> => {
    const reactionRef = ref(realtimeDb, `${MESSAGES_REF}/${projectId}/${messageId}/reactions/${emoji}`);
    const snapshot = await get(reactionRef);

    const currentUsers: string[] = snapshot.exists() ? snapshot.val() : [];

    if (currentUsers.includes(userId)) {
        // Remove reaction
        const updated = currentUsers.filter((uid: string) => uid !== userId);
        if (updated.length === 0) {
            await remove(reactionRef);
        } else {
            await set(reactionRef, updated);
        }
    } else {
        // Add reaction
        await set(reactionRef, [...currentUsers, userId]);
    }
};

// ============================================================
// Typing Indicator
// ============================================================

export const setTyping = async (
    projectId: string,
    userId: string
): Promise<void> => {
    const typingRef = ref(realtimeDb, `${CONVERSATIONS_REF}/${projectId}/typing/${userId}`);
    await set(typingRef, Date.now());
};

export const clearTyping = async (
    projectId: string,
    userId: string
): Promise<void> => {
    const typingRef = ref(realtimeDb, `${CONVERSATIONS_REF}/${projectId}/typing/${userId}`);
    await remove(typingRef);
};

export const subscribeToTyping = (
    projectId: string,
    currentUserId: string,
    callback: (typingUsers: string[]) => void
): (() => void) => {
    const typingRef = ref(realtimeDb, `${CONVERSATIONS_REF}/${projectId}/typing`);

    const listener = onValue(typingRef, (snapshot) => {
        const typingUsers: string[] = [];
        if (snapshot.exists()) {
            const data = snapshot.val();
            const now = Date.now();
            Object.entries(data).forEach(([uid, timestamp]) => {
                // Only show typing if timestamp is within last 5 seconds and not current user
                if (uid !== currentUserId && now - (timestamp as number) < 5000) {
                    typingUsers.push(uid);
                }
            });
        }
        callback(typingUsers);
    });

    return () => off(typingRef);
};

// ============================================================
// Read Status
// ============================================================

export const markMessagesAsRead = async (
    projectId: string,
    currentUserId: string
): Promise<void> => {
    const messagesRef = ref(realtimeDb, `${MESSAGES_REF}/${projectId}`);
    const snapshot = await get(messagesRef);

    if (!snapshot.exists()) return;

    const updates: Record<string, boolean> = {};
    snapshot.forEach((child) => {
        const msg = child.val();
        if (msg.senderId !== currentUserId && !msg.read) {
            updates[`${MESSAGES_REF}/${projectId}/${child.key}/read`] = true;
        }
    });

    if (Object.keys(updates).length > 0) {
        await update(ref(realtimeDb), updates);
    }
};

export const subscribeToUnreadCount = (
    projectId: string,
    currentUserId: string,
    callback: (count: number) => void
): (() => void) => {
    const messagesRef = ref(realtimeDb, `${MESSAGES_REF}/${projectId}`);

    const listener = onValue(messagesRef, (snapshot) => {
        let count = 0;
        snapshot.forEach((child) => {
            const msg = child.val();
            if (msg.senderId !== currentUserId && !msg.read) {
                count++;
            }
        });
        callback(count);
    });

    return () => off(messagesRef);
};

// ============================================================
// Online Presence
// ============================================================

export const setUserOnline = async (userId: string): Promise<void> => {
    try {
        const presenceRef = ref(realtimeDb, `${PRESENCE_REF}/${userId}`);
        await set(presenceRef, { online: true, lastSeen: Date.now() });
    } catch (error) {
        // Silently fail if presence rules not configured
    }
};

export const setUserOffline = async (userId: string): Promise<void> => {
    try {
        const presenceRef = ref(realtimeDb, `${PRESENCE_REF}/${userId}`);
        await set(presenceRef, { online: false, lastSeen: Date.now() });
    } catch (error) {
        // Silently fail if presence rules not configured
    }
};

export const subscribeToPresence = (
    userIds: string[],
    callback: (presence: Record<string, { online: boolean; lastSeen: number }>) => void
): (() => void) => {
    const unsubscribes: (() => void)[] = [];
    const presenceData: Record<string, { online: boolean; lastSeen: number }> = {};

    userIds.forEach((uid) => {
        const presRef = ref(realtimeDb, `${PRESENCE_REF}/${uid}`);
        const listener = onValue(presRef, (snapshot) => {
            if (snapshot.exists()) {
                presenceData[uid] = snapshot.val();
            } else {
                presenceData[uid] = { online: false, lastSeen: 0 };
            }
            callback({ ...presenceData });
        });
        unsubscribes.push(() => off(presRef));
    });

    return () => unsubscribes.forEach((unsub) => unsub());
};

export default {
    createOrGetConversation,
    sendMessage,
    subscribeToMessages,
    subscribeToConversations,
    markMessagesAsRead,
    subscribeToUnreadCount,
    uploadChatFile,
    toggleReaction,
    setTyping,
    clearTyping,
    subscribeToTyping,
    setUserOnline,
    setUserOffline,
    subscribeToPresence,
};
