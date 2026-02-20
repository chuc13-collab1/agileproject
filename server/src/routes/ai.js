import express from 'express';
import db from '../config/database.js';

const router = express.Router();

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `Bạn là trợ lý AI của Hệ Thống Quản Lý Đồ Án tốt nghiệp.

ĐƯỢC PHÉP:
- Tóm tắt báo cáo tiến độ
- Đánh giá tiến độ sinh viên (nhanh/chậm/đúng kế hoạch)
- Gợi ý đề tài dựa trên lĩnh vực và sở thích
- Hướng dẫn viết báo cáo, cấu trúc đồ án
- Giải đáp thắc mắc về quy trình làm đồ án
- Trả lời bằng tiếng Việt

KHÔNG ĐƯỢC:
- Viết code hoặc bài báo cáo thay sinh viên
- Trả lời câu hỏi không liên quan đến đồ án/học tập
- Đưa ra điểm số cụ thể

Hãy trả lời ngắn gọn, rõ ràng, hữu ích.`;

// Call Groq API
const callGroq = async (prompt, maxTokens = 600, temperature = 0.5) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY chưa được cấu hình trong file .env');
    }

    const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt },
            ],
            max_tokens: maxTokens,
            temperature,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        const msg = data.error?.message || 'Lỗi Groq API';
        const err = new Error(msg);
        err.status = response.status;
        throw err;
    }

    return data.choices[0]?.message?.content || '';
};

// Friendly error handler
const handleAIError = (error, res) => {
    console.error('AI error:', error.message || error);

    if (error.message?.includes('GROQ_API_KEY')) {
        return res.status(500).json({ success: false, message: error.message });
    }
    if (error.status === 429) {
        return res.status(429).json({ success: false, message: 'AI đang bận. Vui lòng thử lại sau vài giây.' });
    }
    return res.status(500).json({ success: false, message: 'Lỗi AI: ' + (error.message || 'Không xác định').substring(0, 150) });
};

/**
 * POST /api/ai/summarize
 */
router.post('/summarize', async (req, res) => {
    try {
        const { content, reportTitle } = req.body;
        if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

        const prompt = `Hãy tóm tắt báo cáo tiến độ sau thành 3-5 dòng ngắn gọn, nêu rõ:
1. Công việc đã hoàn thành
2. Vấn đề gặp phải (nếu có)
3. Kế hoạch tiếp theo

Tiêu đề: ${reportTitle || 'Không có'}
Nội dung:
${content}`;

        const summary = await callGroq(prompt, 500, 0.3);
        res.json({ success: true, data: { summary } });
    } catch (error) {
        handleAIError(error, res);
    }
});

/**
 * POST /api/ai/assess-progress
 */
router.post('/assess-progress', async (req, res) => {
    try {
        const { projectId } = req.body;
        if (!projectId) return res.status(400).json({ success: false, message: 'Project ID is required' });

        const [projects] = await db.query(`
            SELECT p.*, t.title as topic_title, t.description as topic_desc, u.display_name as student_name
            FROM projects p
            INNER JOIN topics t ON p.topic_id = t.id
            INNER JOIN students s ON p.student_id = s.id
            INNER JOIN users u ON s.user_id = u.id
            WHERE p.id = ?
        `, [projectId]);

        if (projects.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });

        const [reports] = await db.query('SELECT report_title, week_number, status, created_at FROM progress_reports WHERE project_id = ? ORDER BY week_number ASC', [projectId]);
        const [sprints] = await db.query('SELECT sprint_number, title, weight_percent, status, actual_progress FROM sprints WHERE project_id = ? ORDER BY sprint_number ASC', [projectId]).catch(() => [[]]);

        const project = projects[0];
        const prompt = `Đánh giá tiến độ đồ án:
ĐỒ ÁN: ${project.topic_title}
SINH VIÊN: ${project.student_name}
TRẠNG THÁI: ${project.status}
${sprints.length > 0 ? `SPRINT: ${sprints.map(s => `Sprint ${s.sprint_number}: ${s.title} (${s.weight_percent}%) - ${s.actual_progress || 0}%`).join('; ')}` : ''}
BÁO CÁO: ${reports.length > 0 ? reports.map(r => `Tuần ${r.week_number}: ${r.report_title} - ${r.status}`).join('; ') : 'Chưa có'}

Đánh giá: 1) Tiến độ chung 2) Điểm mạnh 3) Cần cải thiện 4) Đề xuất tiếp theo`;

        const assessment = await callGroq(prompt, 800, 0.4);
        res.json({
            success: true,
            data: { assessment, projectTitle: project.topic_title, studentName: project.student_name, totalReports: reports.length, totalSprints: sprints.length }
        });
    } catch (error) {
        handleAIError(error, res);
    }
});

/**
 * POST /api/ai/suggest-topics
 */
router.post('/suggest-topics', async (req, res) => {
    try {
        const { interests, field } = req.body;
        if (!interests) return res.status(400).json({ success: false, message: 'Interests are required' });

        const [existingTopics] = await db.query('SELECT title, field FROM topics ORDER BY created_at DESC LIMIT 20');

        const prompt = `Sinh viên thích: ${interests}
${field ? `Lĩnh vực: ${field}` : ''}
Đề tài đã có: ${existingTopics.map(t => t.title).join(', ')}

Gợi ý 5 đề tài đồ án (không trùng). Mỗi đề tài gồm: tên, mô tả ngắn, công nghệ, độ khó.`;

        const suggestions = await callGroq(prompt, 1000, 0.7);
        res.json({ success: true, data: { suggestions } });
    } catch (error) {
        handleAIError(error, res);
    }
});

/**
 * POST /api/ai/chat
 */
router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        const reply = await callGroq(message, 600, 0.5);
        res.json({ success: true, data: { reply } });
    } catch (error) {
        handleAIError(error, res);
    }
});

export default router;
