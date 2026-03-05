import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase/config';
import styles from './AiAssistant.module.css';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}`;

type Tab = 'chat' | 'summarize' | 'suggest' | 'suggest-tasks' | 'grammar' | 'assess';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

const AiAssistant: React.FC = () => {
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher' || user?.role === 'supervisor';
    const isStudent = user?.role === 'student';

    const [activeTab, setActiveTab] = useState<Tab>('chat');
    const [loading, setLoading] = useState(false);

    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState('');

    // Summarize state
    const [reportContent, setReportContent] = useState('');
    const [reportTitle, setReportTitle] = useState('');
    const [summary, setSummary] = useState('');

    // Suggest topics state
    const [interests, setInterests] = useState('');
    const [field, setField] = useState('');
    const [suggestions, setSuggestions] = useState('');

    // Suggest tasks state (NEW)
    const [sprintTitle, setSprintTitle] = useState('');
    const [sprintGoals, setSprintGoals] = useState('');
    const [projectTitle, setProjectTitle] = useState('');
    const [taskSuggestions, setTaskSuggestions] = useState('');

    // Grammar state (NEW)
    const [grammarText, setGrammarText] = useState('');
    const [grammarResult, setGrammarResult] = useState('');

    // Assess state (Teacher)
    const [assessProjectId, setAssessProjectId] = useState('');
    const [assessResult, setAssessResult] = useState('');

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
                body: JSON.stringify({ message: userMsg, role: isTeacher ? 'teacher' : 'student' }),
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

    const handleSuggestTasks = async () => {
        if (!sprintTitle.trim() || loading) return;
        setLoading(true);
        setTaskSuggestions('');
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/ai/suggest-tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ sprintTitle, sprintGoals, projectTitle }),
            });
            const data = await res.json();
            setTaskSuggestions(data.success ? data.data.suggestions : '❌ ' + data.message);
        } catch {
            setTaskSuggestions('❌ Không thể kết nối AI.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckGrammar = async () => {
        if (!grammarText.trim() || loading) return;
        setLoading(true);
        setGrammarResult('');
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/ai/check-grammar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ text: grammarText }),
            });
            const data = await res.json();
            setGrammarResult(data.success ? data.data.result : '❌ ' + data.message);
        } catch {
            setGrammarResult('❌ Không thể kết nối AI.');
        } finally {
            setLoading(false);
        }
    };

    const handleAssess = async () => {
        if (!assessProjectId.trim() || loading) return;
        setLoading(true);
        setAssessResult('');
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/ai/assess-progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ projectId: assessProjectId }),
            });
            const data = await res.json();
            if (data.success) {
                const info = data.data;
                setAssessResult(`📊 ${info.projectTitle} — ${info.studentName}\nSprints: ${info.totalSprints} | Báo cáo: ${info.totalReports} | Tiến độ: ${info.totalProgress}%\n\n${info.assessment}`);
            } else {
                setAssessResult('❌ ' + data.message);
            }
        } catch {
            setAssessResult('❌ Không thể kết nối AI.');
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

    // Define tabs based on user role
    const tabs: { key: Tab; label: string; roles: string[] }[] = [
        { key: 'chat', label: '💬 Hỏi đáp', roles: ['all'] },
        { key: 'summarize', label: '📋 Tóm tắt', roles: ['student', 'teacher'] },
        { key: 'suggest', label: '💡 Gợi ý đề tài', roles: ['student'] },
        { key: 'suggest-tasks', label: '📝 Gợi ý Task', roles: ['student'] },
        { key: 'grammar', label: '🔤 Ngữ pháp EN', roles: ['student'] },
        { key: 'assess', label: '📊 Đánh giá tiến độ', roles: ['teacher'] },
    ];

    const visibleTabs = tabs.filter(t =>
        t.roles.includes('all') ||
        (isTeacher && t.roles.includes('teacher')) ||
        (isStudent && t.roles.includes('student'))
    );

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>🤖 Trợ Lý AI</h1>
                    <p className={styles.subtitle}>
                        {isTeacher ? 'Hỗ trợ giảng viên quản lý & đánh giá đồ án' : 'Hỗ trợ sinh viên thực hiện đồ án'}
                    </p>
                </div>

                <div className={styles.tabs}>
                    {visibleTabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={styles.content}>
                    {activeTab === 'chat' && (
                        <div className={styles.chatContainer}>
                            <div className={styles.messageList}>
                                {messages.length === 0 && (
                                    <div className={styles.emptyChat}>
                                        <p style={{ fontSize: '3rem' }}>🤖</p>
                                        <p>Xin chào{isTeacher ? ' thầy/cô' : ''}! Tôi là trợ lý AI quản lý đồ án.</p>
                                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                            {isTeacher
                                                ? 'Hỏi tôi về tiến độ sinh viên, đánh giá Sprint, hoặc gợi ý phản hồi.'
                                                : 'Hỏi tôi về quy trình đồ án, cách viết báo cáo, hoặc bất kỳ thắc mắc nào.'}
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
                                <input type="text" value={reportTitle} onChange={e => setReportTitle(e.target.value)} placeholder="VD: Báo cáo tuần 3" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>📄 Nội dung báo cáo <span style={{ color: '#dc2626' }}>*</span></label>
                                <textarea value={reportContent} onChange={e => setReportContent(e.target.value)} placeholder="Paste nội dung báo cáo vào đây..." rows={10} />
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
                                <input type="text" value={interests} onChange={e => setInterests(e.target.value)} placeholder="VD: Web, React, AI, Mobile..." />
                            </div>
                            <div className={styles.formGroup}>
                                <label>📂 Lĩnh vực mong muốn</label>
                                <input type="text" value={field} onChange={e => setField(e.target.value)} placeholder="VD: Công nghệ phần mềm, Trí tuệ nhân tạo..." />
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

                    {activeTab === 'suggest-tasks' && (
                        <div className={styles.formSection}>
                            <div className={styles.formGroup}>
                                <label>🏃 Tên Sprint <span style={{ color: '#dc2626' }}>*</span></label>
                                <input type="text" value={sprintTitle} onChange={e => setSprintTitle(e.target.value)} placeholder="VD: Sprint 2 - Phát triển Backend" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>🎯 Mục tiêu Sprint</label>
                                <input type="text" value={sprintGoals} onChange={e => setSprintGoals(e.target.value)} placeholder="VD: Hoàn thành API CRUD, tích hợp cơ sở dữ liệu" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>📚 Tên đồ án</label>
                                <input type="text" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="VD: Hệ thống quản lý thư viện" />
                            </div>
                            <button className={styles.actionBtn} onClick={handleSuggestTasks} disabled={loading || !sprintTitle.trim()}>
                                {loading ? '⏳ Đang xử lý...' : '📝 Gợi ý Task'}
                            </button>
                            {taskSuggestions && (
                                <div className={styles.resultBox}>
                                    <h3>📝 Task gợi ý</h3>
                                    <pre className={styles.resultText}>{taskSuggestions}</pre>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'grammar' && (
                        <div className={styles.formSection}>
                            <div className={styles.formGroup}>
                                <label>🔤 Đoạn văn tiếng Anh <span style={{ color: '#dc2626' }}>*</span></label>
                                <textarea
                                    value={grammarText}
                                    onChange={e => setGrammarText(e.target.value)}
                                    placeholder="Paste đoạn văn tiếng Anh cần kiểm tra vào đây..."
                                    rows={8}
                                />
                            </div>
                            <button className={styles.actionBtn} onClick={handleCheckGrammar} disabled={loading || !grammarText.trim()}>
                                {loading ? '⏳ Đang kiểm tra...' : '🔤 Kiểm tra ngữ pháp'}
                            </button>
                            {grammarResult && (
                                <div className={styles.resultBox}>
                                    <h3>🔤 Kết quả kiểm tra</h3>
                                    <pre className={styles.resultText}>{grammarResult}</pre>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'assess' && (
                        <div className={styles.formSection}>
                            <div className={styles.formGroup}>
                                <label>🆔 Project ID <span style={{ color: '#dc2626' }}>*</span></label>
                                <input
                                    type="text"
                                    value={assessProjectId}
                                    onChange={e => setAssessProjectId(e.target.value)}
                                    placeholder="Nhập ID đồ án cần đánh giá..."
                                />
                            </div>
                            <button className={styles.actionBtn} onClick={handleAssess} disabled={loading || !assessProjectId.trim()}>
                                {loading ? '⏳ Đang đánh giá...' : '📊 Đánh giá tiến độ'}
                            </button>
                            {assessResult && (
                                <div className={styles.resultBox}>
                                    <h3>📊 Kết quả đánh giá</h3>
                                    <pre className={styles.resultText}>{assessResult}</pre>
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
