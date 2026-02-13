// Chat Window Component — Full Featured
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '../../types/chat.types';
import {
    sendMessage,
    subscribeToMessages,
    markMessagesAsRead,
    uploadChatFile,
    setTyping,
    clearTyping,
    subscribeToTyping,
    subscribeToPresence,
} from '../../services/api/chat.service';
import MessageBubble from './MessageBubble';
import EmojiPicker from './EmojiPicker';
import styles from '../../pages/shared/Chat.module.css';

interface ChatWindowProps {
    projectId: string;
    projectTitle: string;
    currentUserId: string;
    currentUserName: string;
    currentUserRole: string;
    otherParticipantName: string;
    otherParticipantId?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    projectId,
    projectTitle,
    currentUserId,
    currentUserName,
    currentUserRole,
    otherParticipantName,
    otherParticipantId,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [uploading, setUploading] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [isOtherOnline, setIsOtherOnline] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Subscribe to messages
    useEffect(() => {
        const unsubscribe = subscribeToMessages(projectId, (msgs) => {
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [projectId]);

    // Subscribe to typing
    useEffect(() => {
        const unsubscribe = subscribeToTyping(projectId, currentUserId, (users) => {
            setTypingUsers(users);
        });
        return () => unsubscribe();
    }, [projectId, currentUserId]);

    // Subscribe to online presence
    useEffect(() => {
        if (!otherParticipantId) return;
        const unsubscribe = subscribeToPresence([otherParticipantId], (presence) => {
            setIsOtherOnline(presence[otherParticipantId]?.online || false);
        });
        return () => unsubscribe();
    }, [otherParticipantId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark as read
    useEffect(() => {
        if (messages.length > 0) {
            markMessagesAsRead(projectId, currentUserId);
        }
    }, [messages, projectId, currentUserId]);

    // Focus input
    useEffect(() => {
        inputRef.current?.focus();
    }, [projectId]);

    // Cleanup typing on unmount
    useEffect(() => {
        return () => {
            clearTyping(projectId, currentUserId);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [projectId, currentUserId]);

    const handleTyping = useCallback(() => {
        setTyping(projectId, currentUserId);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            clearTyping(projectId, currentUserId);
        }, 3000);
    }, [projectId, currentUserId]);

    const handleSend = async () => {
        if ((!newMessage.trim() && !uploading) || sending) return;

        try {
            setSending(true);
            const reply = replyTo
                ? { id: replyTo.id, text: replyTo.text.substring(0, 100), senderName: replyTo.senderName }
                : undefined;

            await sendMessage(projectId, currentUserId, currentUserName, currentUserRole, newMessage, undefined, reply);
            setNewMessage('');
            setReplyTo(null);
            inputRef.current?.focus();
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File quá lớn. Tối đa 10MB.');
            return;
        }

        try {
            setUploading(true);
            const attachment = await uploadChatFile(projectId, file);
            await sendMessage(
                projectId, currentUserId, currentUserName, currentUserRole,
                '', attachment
            );
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Upload thất bại. Vui lòng thử lại.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleReply = (msg: ChatMessage) => {
        setReplyTo(msg);
        inputRef.current?.focus();
    };

    const handleEmojiSelect = (emoji: string) => {
        setNewMessage((prev) => prev + emoji);
        setShowEmoji(false);
        inputRef.current?.focus();
    };

    const AVATAR_COLORS = [
        'linear-gradient(135deg, #0084ff 0%, #00c6ff 100%)',
        'linear-gradient(135deg, #f2709c 0%, #ff9472 100%)',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        'linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)',
    ];

    const getAvatarColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div className={styles.chatHeader}>
                <div
                    className={styles.chatHeaderAvatar}
                    style={{ background: getAvatarColor(otherParticipantName) }}
                >
                    {otherParticipantName.charAt(0).toUpperCase()}
                    {isOtherOnline && <span className={styles.onlineDotSmall} />}
                </div>
                <div className={styles.chatHeaderInfo}>
                    <div className={styles.chatHeaderName}>
                        {otherParticipantName}
                    </div>
                    <div className={styles.chatHeaderProject}>
                        {isOtherOnline ? (
                            <>
                                <span className={styles.chatHeaderDot} />
                                <span style={{ color: '#31a24c' }}>Đang hoạt động</span>
                                <span style={{ margin: '0 4px', color: '#bcc0c4' }}>·</span>
                            </>
                        ) : null}
                        {projectTitle}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesArea}>
                {messages.length === 0 ? (
                    <div className={styles.emptyChat}>
                        <div className={styles.emptyChatIcon}>👋</div>
                        <h3>Bắt đầu trò chuyện</h3>
                        <p>
                            Gửi tin nhắn đầu tiên để trao đổi về đồ án với {otherParticipantName}
                        </p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isOwn = msg.senderId === currentUserId;
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const showSender = !isOwn && (!prevMsg || prevMsg.senderId !== msg.senderId);

                        return (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isOwnMessage={isOwn}
                                showSender={showSender}
                                projectId={projectId}
                                currentUserId={currentUserId}
                                onReply={handleReply}
                            />
                        );
                    })
                )}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                    <div className={styles.typingIndicator}>
                        <div className={styles.typingDots}>
                            <span />
                            <span />
                            <span />
                        </div>
                        <span className={styles.typingText}>
                            {otherParticipantName} đang nhập...
                        </span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyTo && (
                <div className={styles.replyPreview}>
                    <div className={styles.replyPreviewContent}>
                        <span className={styles.replyPreviewLabel}>Đang trả lời {replyTo.senderName}</span>
                        <span className={styles.replyPreviewText}>{replyTo.text}</span>
                    </div>
                    <button
                        className={styles.replyPreviewClose}
                        onClick={() => setReplyTo(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Upload Progress */}
            {uploading && (
                <div className={styles.uploadProgress}>
                    <div className={styles.uploadProgressBar} />
                    <span>Đang tải file lên...</span>
                </div>
            )}

            {/* Input Area */}
            <div className={styles.inputArea}>
                {/* File Upload */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <button
                    className={styles.inputActionBtn}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Đính kèm file"
                >
                    📎
                </button>

                {/* Emoji */}
                <div style={{ position: 'relative' }}>
                    <button
                        className={styles.inputActionBtn}
                        onClick={() => setShowEmoji(!showEmoji)}
                        title="Chọn emoji"
                    >
                        😊
                    </button>
                    {showEmoji && (
                        <div className={styles.emojiPickerContainer}>
                            <EmojiPicker
                                onSelect={handleEmojiSelect}
                                onClose={() => setShowEmoji(false)}
                            />
                        </div>
                    )}
                </div>

                {/* Text input */}
                <input
                    ref={inputRef}
                    type="text"
                    className={styles.messageInput}
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Aa"
                    disabled={sending || uploading}
                />

                {/* Send */}
                <button
                    onClick={handleSend}
                    disabled={(!newMessage.trim() && !uploading) || sending}
                    className={`${styles.sendBtn} ${newMessage.trim() ? styles.sendBtnActive : ''}`}
                    title="Gửi"
                >
                    {sending ? '⏳' : '➤'}
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
