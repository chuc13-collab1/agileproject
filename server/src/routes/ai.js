import express from 'express';
import db from '../config/database.js';

const router = express.Router();

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// Role-based system prompts
const STUDENT_PROMPT = `Bạn là trợ lý AI cho SINH VIÊN trong Hệ Thống Quản Lý Đồ Án tốt nghiệp.

ĐƯỢC PHÉP:
- Tóm tắt báo cáo tiến độ
- Gợi ý đề tài dựa trên lĩnh vực và sở thích
- Hướng dẫn viết báo cáo, cấu trúc đồ án
- Giải đáp thắc mắc về quy trình làm đồ án
- Gợi ý phân chia task cho Sprint
- Kiểm tra ngữ pháp tiếng Anh
- Trả lời bằng tiếng Việt

KHÔNG ĐƯỢC:
- Viết code hoặc bài báo cáo thay sinh viên
- Trả lời câu hỏi không liên quan đến đồ án/học tập
- Đưa ra điểm số cụ thể

Hãy trả lời ngắn gọn, rõ ràng, hữu ích.`;

const TEACHER_PROMPT = `Bạn là trợ lý AI cho GIẢNG VIÊN trong Hệ Thống Quản Lý Đồ Án tốt nghiệp.

ĐƯỢC PHÉP:
- Đánh giá tiến độ sinh viên (nhanh/chậm/đúng kế hoạch)
- Tóm tắt tổng quan tiến độ nhóm
- So sánh tiến độ giữa các nhóm
- Gợi ý phản hồi cho sinh viên
- Phân tích Sprint planning của sinh viên
- Trả lời bằng tiếng Việt

KHÔNG ĐƯỢC:
- Đưa ra điểm số cụ thể hoặc chấm điểm thay giảng viên
- Trả lời câu hỏi không liên quan đến quản lý đồ án

Hãy trả lời chuyên nghiệp, ngắn gọn, hữu ích.`;

// Generic fallback prompt
const SYSTEM_PROMPT = `Bạn là trợ lý AI của Hệ Thống Quản Lý Đồ Án tốt nghiệp.
Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng, hữu ích.
Không viết code, không đưa điểm số, không trả lời ngoài phạm vi đồ án/học tập.`;

// Call Groq API
const callGroq = async (prompt, systemPrompt = SYSTEM_PROMPT, maxTokens = 600, temperature = 0.5) => {
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
                { role: 'system', content: systemPrompt },
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
 * POST /api/ai/summarize (Student)
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

        const summary = await callGroq(prompt, STUDENT_PROMPT, 500, 0.3);
        res.json({ success: true, data: { summary } });
    } catch (error) {
        handleAIError(error, res);
    }
});

/**
 * POST /api/ai/assess-progress (Teacher) — Enhanced with Sprint data
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
        const [sprints] = await db.query('SELECT sprint_number, title, goals, start_week, end_week, weight_percent, status, actual_progress FROM sprints WHERE project_id = ? ORDER BY sprint_number ASC', [projectId]).catch(() => [[]]);

        const project = projects[0];

        // Calculate overall progress
        const totalProgress = sprints.reduce((sum, s) => sum + (s.actual_progress / 100) * s.weight_percent, 0);
        const completedSprints = sprints.filter(s => s.status === 'completed').length;
        const inProgressSprints = sprints.filter(s => s.status === 'in_progress').length;

        const prompt = `Đánh giá chi tiết tiến độ đồ án:

ĐỒ ÁN: ${project.topic_title}
SINH VIÊN: ${project.student_name}
TRẠNG THÁI: ${project.status}

SPRINT PLANNING (${sprints.length} sprints, tiến độ tổng: ${Math.round(totalProgress)}%):
${sprints.length > 0 ? sprints.map(s => `- Sprint ${s.sprint_number}: "${s.title}" (tuần ${s.start_week}-${s.end_week}, ${s.weight_percent}%) → Thực tế: ${s.actual_progress}% [${s.status}]${s.goals ? ` | Mục tiêu: ${s.goals}` : ''}`).join('\n') : 'Chưa có Sprint nào.'}

Hoàn thành: ${completedSprints}/${sprints.length} sprints | Đang chạy: ${inProgressSprints}

BÁO CÁO TUẦN (${reports.length} bài):
${reports.length > 0 ? reports.map(r => `- Tuần ${r.week_number}: ${r.report_title} [${r.status}]`).join('\n') : 'Chưa có báo cáo.'}

Đánh giá:
1) Tiến độ tổng thể so với kế hoạch Sprint
2) Điểm mạnh trong quá trình thực hiện  
3) Rủi ro hoặc vấn đề cần lưu ý
4) Đề xuất cụ thể cho giai đoạn tiếp theo`;

        const assessment = await callGroq(prompt, TEACHER_PROMPT, 1000, 0.4);
        res.json({
            success: true,
            data: {
                assessment,
                projectTitle: project.topic_title,
                studentName: project.student_name,
                totalReports: reports.length,
                totalSprints: sprints.length,
                totalProgress: Math.round(totalProgress)
            }
        });
    } catch (error) {
        handleAIError(error, res);
    }
});

/**
 * POST /api/ai/suggest-topics (Student)
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

        const suggestions = await callGroq(prompt, STUDENT_PROMPT, 1000, 0.7);
        res.json({ success: true, data: { suggestions } });
    } catch (error) {
        handleAIError(error, res);
    }
});

/**
 * POST /api/ai/generate-topic (Teacher) — AI tạo nhiều đề tài cùng lúc
 */
router.post('/generate-topic', async (req, res) => {
    try {
        const { field, keyword, semester, academicYear, count = 3 } = req.body;
        if (!field) return res.status(400).json({ success: false, message: 'Lĩnh vực (field) là bắt buộc' });

        const numTopics = Math.min(Math.max(parseInt(count) || 3, 1), 5);

        // Get existing topics to avoid duplication
        const [existingTopics] = await db.query('SELECT title FROM topics ORDER BY created_at DESC LIMIT 30');
        const existingList = existingTopics.map(t => t.title).join(', ');

        const prompt = `Bạn là giảng viên đại học, hãy đề xuất ${numTopics} đề tài đồ án tốt nghiệp KHÁC NHAU.

LĨNH VỰC: ${field}
${keyword ? `GỢI Ý/TỪ KHÓA: ${keyword}` : ''}
${semester ? `HỌC KỲ: ${semester}` : ''}
${academicYear ? `NĂM HỌC: ${academicYear}` : ''}

ĐỀ TÀI ĐÃ CÓ (tránh trùng): ${existingList || 'Chưa có'}

Trả về ĐÚNG format JSON array (KHÔNG markdown, KHÔNG \`\`\`json, chỉ JSON thuần):
[
  {
    "title": "Tên đề tài 1",
    "description": "Mô tả chi tiết 3-5 câu",
    "requirements": "Yêu cầu sinh viên 2-3 dòng"
  },
  {
    "title": "Tên đề tài 2",
    "description": "Mô tả chi tiết 3-5 câu",
    "requirements": "Yêu cầu sinh viên 2-3 dòng"
  }
]

Các đề tài phải đa dạng, thực tế, có tính ứng dụng cao.`;

        const result = await callGroq(prompt, TEACHER_PROMPT, 2000, 0.8);

        // Parse JSON array from AI response
        try {
            const jsonMatch = result.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return res.json({ success: true, data: { topics: parsed } });
                }
            }
            // Fallback: try single object
            const objMatch = result.match(/\{[\s\S]*\}/);
            if (objMatch) {
                const parsed = JSON.parse(objMatch[0]);
                return res.json({ success: true, data: { topics: [parsed] } });
            }
        } catch (parseErr) {
            // If parsing fails, return raw text
        }

        res.json({ success: true, data: { raw: result } });
    } catch (error) {
        handleAIError(error, res);
    }
});

/**
 * POST /api/ai/suggest-tasks (Student) — NEW: Gợi ý task cho Sprint
 */
router.post('/suggest-tasks', async (req, res) => {
    try {
        const { sprintTitle, sprintGoals, projectTitle, projectDescription } = req.body;
        if (!sprintTitle) return res.status(400).json({ success: false, message: 'Sprint title is required' });

        const prompt = `Sinh viên cần phân chia công việc cho Sprint.

ĐỒ ÁN: ${projectTitle || 'Không có'}
${projectDescription ? `MÔ TẢ: ${projectDescription}` : ''}
SPRINT: ${sprintTitle}
${sprintGoals ? `MỤC TIÊU SPRINT: ${sprintGoals}` : ''}

Gợi ý 5-8 task cụ thể, mỗi task gồm:
1. Tên task (ngắn gọn)
2. Mô tả chi tiết (1-2 dòng)
3. Ước tính thời gian (giờ)
4. Ưu tiên (Cao/Trung/Thấp)

Sắp xếp theo thứ tự ưu tiên.`;

        const suggestions = await callGroq(prompt, STUDENT_PROMPT, 800, 0.6);
        res.json({ success: true, data: { suggestions } });
    } catch (error) {
        handleAIError(error, res);
    }
});

/**
 * POST /api/ai/check-grammar (Student) — NEW: Kiểm tra ngữ pháp tiếng Anh
 */
router.post('/check-grammar', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

        const prompt = `Kiểm tra ngữ pháp tiếng Anh cho đoạn văn sau. Trả lời bằng tiếng Việt.

Đoạn văn:
"${text}"

Hãy:
1. Liệt kê từng lỗi ngữ pháp (nếu có) và cách sửa
2. Đề xuất cách viết lại tốt hơn (nếu cần)
3. Đánh giá tổng thể chất lượng ngữ pháp (Tốt/Khá/Cần cải thiện)`;

        const result = await callGroq(prompt, STUDENT_PROMPT, 800, 0.3);
        res.json({ success: true, data: { result } });
    } catch (error) {
        handleAIError(error, res);
    }
});

/**
 * POST /api/ai/chat (All roles)
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, role } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        // Pick system prompt based on caller role
        const systemPrompt = role === 'teacher' ? TEACHER_PROMPT
            : role === 'student' ? STUDENT_PROMPT
                : SYSTEM_PROMPT;

        const reply = await callGroq(message, systemPrompt, 600, 0.5);
        res.json({ success: true, data: { reply } });
    } catch (error) {
        handleAIError(error, res);
    }
});

export default router;
