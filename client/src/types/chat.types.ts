// Chat Types

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: 'student' | 'teacher' | 'admin';
    text: string;
    timestamp: number;
    read: boolean;
    // File attachment
    attachment?: {
        url: string;
        name: string;
        type: 'image' | 'file';
        size: number;
    };
    // Reply to another message
    replyTo?: {
        id: string;
        text: string;
        senderName: string;
    };
    // Reactions: { [emoji]: [userId, userId, ...] }
    reactions?: Record<string, string[]>;
}

export interface Conversation {
    id: string; // projectId
    projectTitle: string;
    participants: Record<string, ParticipantInfo>;
    lastMessage?: {
        text: string;
        senderId: string;
        senderName: string;
        timestamp: number;
    };
    unreadCount?: number;
    // Typing status: { [userId]: timestamp }
    typing?: Record<string, number>;
}

export interface ParticipantInfo {
    name: string;
    role: 'student' | 'teacher' | 'admin';
    online?: boolean;
    lastSeen?: number;
}
