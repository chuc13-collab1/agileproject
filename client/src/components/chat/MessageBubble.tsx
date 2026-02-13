// Message Bubble Component — Full Featured
import React, { useState } from 'react';
import { ChatMessage } from '../../types/chat.types';
import { toggleReaction } from '../../services/api/chat.service';
import { ReactionPicker } from './EmojiPicker';
import styles from '../../pages/shared/Chat.module.css';

interface MessageBubbleProps {
    message: ChatMessage;
    isOwnMessage: boolean;
    showSender?: boolean;
    projectId: string;
    currentUserId: string;
    onReply?: (message: ChatMessage) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isOwnMessage,
    showSender = true,
    projectId,
    currentUserId,
    onReply,
}) => {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showActions, setShowActions] = useState(false);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }

        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'teacher': return 'GV';
            case 'student': return 'SV';
            case 'admin': return 'Admin';
            default: return role;
        }
    };

    const roleClass = message.senderRole === 'teacher'
        ? styles.messageRoleTeacher
        : styles.messageRoleStudent;

    const handleReaction = async (emoji: string) => {
        try {
            await toggleReaction(projectId, message.id, currentUserId, emoji);
        } catch (error) {
            console.error('Failed to toggle reaction:', error);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    // Collect all reactions grouped
    const reactionEntries = message.reactions
        ? Object.entries(message.reactions).filter(([, users]) => users.length > 0)
        : [];

    return (
        <div
            className={`${styles.messageRow} ${isOwnMessage ? styles.messageRowOwn : styles.messageRowOther}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => { setShowActions(false); setShowReactionPicker(false); }}
        >
            <div className={styles.messageGroup}>
                {/* Sender Info */}
                {!isOwnMessage && showSender && (
                    <div className={styles.messageSenderInfo}>
                        <span className={styles.messageSenderName}>{message.senderName}</span>
                        <span className={`${styles.messageRoleBadge} ${roleClass}`}>
                            {getRoleBadge(message.senderRole)}
                        </span>
                    </div>
                )}

                {/* Message content wrapper with action buttons */}
                <div className={styles.messageContentWrapper}>
                    {/* Action buttons (appear on hover) */}
                    {showActions && (
                        <div className={`${styles.messageActions} ${isOwnMessage ? styles.messageActionsOwn : ''}`}>
                            <button
                                className={styles.actionBtn}
                                onClick={() => setShowReactionPicker(!showReactionPicker)}
                                title="Thả cảm xúc"
                            >
                                😊
                            </button>
                            {onReply && (
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => onReply(message)}
                                    title="Trả lời"
                                >
                                    ↩️
                                </button>
                            )}
                        </div>
                    )}

                    {/* Reaction Picker */}
                    {showReactionPicker && (
                        <div className={isOwnMessage ? styles.reactionPickerOwn : styles.reactionPickerOther}>
                            <ReactionPicker
                                onSelect={handleReaction}
                                onClose={() => setShowReactionPicker(false)}
                            />
                        </div>
                    )}

                    {/* Reply Quote */}
                    {message.replyTo && (
                        <div className={`${styles.replyQuote} ${isOwnMessage ? styles.replyQuoteOwn : ''}`}>
                            <div className={styles.replyQuoteName}>{message.replyTo.senderName}</div>
                            <div className={styles.replyQuoteText}>{message.replyTo.text}</div>
                        </div>
                    )}

                    {/* Bubble */}
                    <div className={isOwnMessage ? styles.bubbleOwn : styles.bubbleOther}>
                        {/* Attachment */}
                        {message.attachment && (
                            <div className={styles.attachment}>
                                {message.attachment.type === 'image' ? (
                                    <a href={message.attachment.url} target="_blank" rel="noreferrer">
                                        <img
                                            src={message.attachment.url}
                                            alt={message.attachment.name}
                                            className={styles.attachmentImage}
                                        />
                                    </a>
                                ) : (
                                    <a
                                        href={message.attachment.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={styles.attachmentFile}
                                    >
                                        <span className={styles.attachmentFileIcon}>📄</span>
                                        <div className={styles.attachmentFileInfo}>
                                            <span className={styles.attachmentFileName}>{message.attachment.name}</span>
                                            <span className={styles.attachmentFileSize}>
                                                {formatFileSize(message.attachment.size)}
                                            </span>
                                        </div>
                                        <span className={styles.attachmentDownload}>⬇️</span>
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Text */}
                        {message.text && <span>{message.text}</span>}
                    </div>

                    {/* Reactions display */}
                    {reactionEntries.length > 0 && (
                        <div className={`${styles.reactionsDisplay} ${isOwnMessage ? styles.reactionsDisplayOwn : ''}`}>
                            {reactionEntries.map(([emoji, users]) => (
                                <button
                                    key={emoji}
                                    className={`${styles.reactionChip} ${users.includes(currentUserId) ? styles.reactionChipActive : ''
                                        }`}
                                    onClick={() => handleReaction(emoji)}
                                    title={`${users.length} người`}
                                >
                                    {emoji} {users.length > 1 && <span>{users.length}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Time + Read status */}
                <div className={`${styles.messageMeta} ${isOwnMessage ? styles.messageMetaOwn : styles.messageMetaOther}`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {isOwnMessage && (
                        <span className={message.read ? styles.messageReadIcon : styles.messageUnreadIcon}>
                            {message.read ? '✓✓' : '✓'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
