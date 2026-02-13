// Emoji Picker Component
import React, { useState, useRef, useEffect } from 'react';
import styles from '../../pages/shared/Chat.module.css';

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const EMOJI_CATEGORIES = [
    {
        name: 'Mặt cười',
        emojis: ['😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😉', '😎', '🤩', '😅', '😇', '🙂', '😋', '😜', '🤪', '😝', '🤗', '🤔', '😏', '😌', '😴', '🥱', '😷', '🤧'],
    },
    {
        name: 'Cử chỉ',
        emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤝', '👏', '🙌', '💪', '🙏', '✍️', '🤙', '👋', '🖐️', '☝️'],
    },
    {
        name: 'Tim & Cảm xúc',
        emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '💕', '💖', '💗', '💘', '💝', '🔥', '⭐', '✨', '💯', '💢', '💫'],
    },
    {
        name: 'Đồ vật',
        emojis: ['📚', '📝', '📋', '📎', '📌', '✏️', '📖', '💻', '🖥️', '📱', '⌨️', '🎓', '🏆', '📊', '📈'],
    },
    {
        name: 'Biểu tượng',
        emojis: ['✅', '❌', '⚠️', '❓', '❗', '💡', '🔔', '🎯', '🚀', '🎉', '🎊', '👀', '💬', '🔗', '⏰'],
    },
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
    const [activeCategory, setActiveCategory] = useState(0);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div className={styles.emojiPicker} ref={pickerRef}>
            {/* Category tabs */}
            <div className={styles.emojiTabs}>
                {EMOJI_CATEGORIES.map((cat, i) => (
                    <button
                        key={cat.name}
                        className={`${styles.emojiTab} ${i === activeCategory ? styles.emojiTabActive : ''}`}
                        onClick={() => setActiveCategory(i)}
                        title={cat.name}
                    >
                        {cat.emojis[0]}
                    </button>
                ))}
            </div>
            {/* Category label */}
            <div className={styles.emojiCategoryLabel}>
                {EMOJI_CATEGORIES[activeCategory].name}
            </div>
            {/* Emoji grid */}
            <div className={styles.emojiGrid}>
                {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
                    <button
                        key={emoji}
                        className={styles.emojiBtn}
                        onClick={() => {
                            onSelect(emoji);
                            onClose();
                        }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Reaction Picker (small, quick reactions)
export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface ReactionPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect, onClose }) => {
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div className={styles.reactionPicker} ref={pickerRef}>
            {QUICK_REACTIONS.map((emoji) => (
                <button
                    key={emoji}
                    className={styles.reactionBtn}
                    onClick={() => {
                        onSelect(emoji);
                        onClose();
                    }}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

export default EmojiPicker;
