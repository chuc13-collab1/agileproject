import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase/config';
import styles from './AiAssistant.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type Tab = 'chat' | 'summarize' | 'suggest';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

const AiAssistant: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('chat');
    const [loading, setLoading] = useState(false);

    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState('');

    // Summarize state
    const [reportContent, setReportContent] = useState('');
    const [reportTitle, setReportTitle] = useState('');
    const [summary, setSummary] = useState('');

    // Suggest state
    const [interests, setInterests] = useState('');
    const [field, setField] = useState('');
    const [suggestions, setSuggestions] = useState('');

    const getToken = async () => {
        if (!auth.currentUser) throw new Error('Not authenticated');
        return auth.currentUser.getIdToken();
    };

    const handleChat = async () => {
        if (!chatInput.trim() || loading) return;
        const userMsg = chatInput.trim();
        setChatInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: userMsg }),
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, { role: 'ai', content: data.data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: '❌ ' + (data.message || 'Lỗi không xác định') }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'ai', content: '❌ Không thể kết nối AI. Kiểm tra API Key.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSummarize = async () => {
        if (!reportContent.trim() || loading) return;
        setLoading(true);
        setSummary('');
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/ai/summarize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ content: reportContent, reportTitle }),
            });
            const data = await res.json();
            setSummary(data.success ? data.data.summary : '❌ ' + data.message);
        } catch {
            setSummary('❌ Không thể kết nối AI.');
        } finally {
            setLoading(false);
        }
    };

    const handleSuggest = async () => {
        if (!interests.trim() || loading) return;
        setLoading(true);
        setSuggestions('');
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/ai/suggest-topics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ interests, field }),
            });
            const data = await res.json();
            setSuggestions(data.success ? data.data.suggestions : '❌ ' + data.message);
        } catch {
            setSuggestions('❌ Không thể kết nối AI.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>🤖 Trợ Lý AI</h1>
                    <p className={styles.subtitle}>Hỗ trợ quản lý đồ án bằng AI Gemini</p>
                </div>

                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeTab === 'chat' ? styles.active : ''}`} onClick={() => setActiveTab('chat')}>
                        💬 Hỏi đáp
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'summarize' ? styles.active : ''}`} onClick={() => setActiveTab('summarize')}>
                        📋 Tóm tắt báo cáo
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'suggest' ? styles.active : ''}`} onClick={() => setActiveTab('suggest')}>
                        💡 Gợi ý đề tài
                    </button>
                </div>

                <div className={styles.content}>
                    {activeTab === 'chat' && (
                        <div className={styles.chatContainer}>
                            <div className={styles.messageList}>
                                {messages.length === 0 && (
                                    <div className={styles.emptyChat}>
                                        <p style={{ fontSize: '3rem' }}>🤖</p>
                                        <p>Xin chào! Tôi là trợ lý AI quản lý đồ án.</p>
                                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                            Hỏi tôi về quy trình đồ án, cách viết báo cáo, hoặc bất kỳ thắc mắc nào liên quan.
                                        </p>
                                    </div>
                                )}
                                {messages.map((msg, i) => (
                                    <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                                        <div className={styles.messageAvatar}>
                                            {msg.role === 'user' ? '👤' : '🤖'}
                                        </div>
                                        <div className={styles.messageBubble}>
                                            <pre className={styles.messageText}>{msg.content}</pre>
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className={`${styles.message} ${styles.ai}`}>
                                        <div className={styles.messageAvatar}>🤖</div>
                                        <div className={styles.messageBubble}>
                                            <div className={styles.typing}>
                                                <span></span><span></span><span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={styles.chatInput}>
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Nhập câu hỏi..."
                                    disabled={loading}
                                />
                                <button onClick={handleChat} disabled={loading || !chatInput.trim()}>
                                    {loading ? '⏳' : '📤'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'summarize' && (
                        <div className={styles.formSection}>
                            <div className={styles.formGroup}>
                                <label>📝 Tiêu đề báo cáo</label>
                                <input
                                    type="text"
                                    value={reportTitle}
                                    onChange={e => setReportTitle(e.target.value)}
                                    placeholder="VD: Báo cáo tuần 3"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>📄 Nội dung báo cáo <span style={{ color: '#dc2626' }}>*</span></label>
                                <textarea
                                    value={reportContent}
                                    onChange={e => setReportContent(e.target.value)}
                                    placeholder="Paste nội dung báo cáo vào đây..."
                                    rows={10}
                                />
                            </div>
                            <button className={styles.actionBtn} onClick={handleSummarize} disabled={loading || !reportContent.trim()}>
                                {loading ? '⏳ Đang xử lý...' : '🤖 Tóm tắt bằng AI'}
                            </button>
                            {summary && (
                                <div className={styles.resultBox}>
                                    <h3>📋 Kết quả tóm tắt</h3>
                                    <pre className={styles.resultText}>{summary}</pre>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'suggest' && (
                        <div className={styles.formSection}>
                            <div className={styles.formGroup}>
                                <label>🎯 Sở thích / Kỹ năng <span style={{ color: '#dc2626' }}>*</span></label>
                                <input
                                    type="text"
                                    value={interests}
                                    onChange={e => setInterests(e.target.value)}
                                    placeholder="VD: Web, React, AI, Mobile..."
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>📂 Lĩnh vực mong muốn</label>
                                <input
                                    type="text"
                                    value={field}
                                    onChange={e => setField(e.target.value)}
                                    placeholder="VD: Công nghệ phần mềm, Trí tuệ nhân tạo..."
                                />
                            </div>
                            <button className={styles.actionBtn} onClick={handleSuggest} disabled={loading || !interests.trim()}>
                                {loading ? '⏳ Đang xử lý...' : '💡 Gợi ý đề tài'}
                            </button>
                            {suggestions && (
                                <div className={styles.resultBox}>
                                    <h3>💡 Đề tài gợi ý</h3>
                                    <pre className={styles.resultText}>{suggestions}</pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default AiAssistant;
