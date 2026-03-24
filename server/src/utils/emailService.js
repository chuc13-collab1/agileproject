import { Resend } from 'resend';
import pool from '../config/database.js';

// ============================================
// Resend Client (HTTP API - works on Railway)
// ============================================
const getResendClient = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not set in environment variables');
    }
    return new Resend(apiKey);
};

// ============================================
// Get student emails from DB
// ============================================
export const getStudentEmails = async () => {
    const [rows] = await pool.query(
        `SELECT u.email, u.display_name 
         FROM users u 
         INNER JOIN students s ON s.user_id = u.id 
         WHERE u.is_active = TRUE AND u.email IS NOT NULL`
    );
    return rows;
};

// ============================================
// Get all active user emails (students + teachers)
// ============================================
export const getAllActiveEmails = async () => {
    const [rows] = await pool.query(
        `SELECT email, display_name, role 
         FROM users 
         WHERE is_active = TRUE AND email IS NOT NULL`
    );
    return rows;
};

// ============================================
// Build HTML email template
// ============================================
const buildAnnouncementEmail = (announcement, recipientName = '') => {
    const { title, content, semester, academicYear, registrationStart, registrationEnd } = announcement;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const greeting = recipientName ? `<p style="color:#334155;font-size:15px;margin:0 0 20px;">Kính gửi <strong>${recipientName}</strong>,</p>` : '';

    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#eef2f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
        
        <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background:linear-gradient(160deg,#0f172a 0%,#1e3a5f 40%,#1e40af 100%);padding:48px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">HỆ THỐNG QUẢN LÝ ĐỒ ÁN</h1>
            <div style="width:60px;height:3px;background:linear-gradient(to right,#60a5fa,#38bdf8);margin:12px auto;border-radius:2px;"></div>
            <p style="color:rgba(255,255,255,0.6);margin:0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">Agile Project Management System</p>
          </div>

          <!-- Notification bar -->
          <div style="background:linear-gradient(to right,#1e40af,#3b82f6);padding:12px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">📢 THÔNG BÁO MỚI</span>
          </div>

          <!-- Body -->
          <div style="padding:36px 40px;">
            ${greeting}
            
            <h2 style="color:#0f172a;font-size:24px;font-weight:800;margin:0 0 24px;line-height:1.4;">${title}</h2>
            
            <!-- Semester badge -->
            <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1px solid #a7f3d0;padding:10px 20px;border-radius:10px;margin-bottom:28px;display:inline-block;">
              <span style="color:#065f46;font-size:14px;font-weight:700;">📚 ${semester} — Năm học ${academicYear}</span>
            </div>

            <!-- Registration period -->
            <div style="background:#f8fafc;border-radius:16px;padding:24px;margin-bottom:28px;border:1px solid #e2e8f0;">
              <p style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;margin:0 0 16px;">📅 Thời gian đăng ký</p>
              <div style="background:#ffffff;border-radius:10px;padding:14px 20px;margin-bottom:8px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <span style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;">BẮT ĐẦU</span><br>
                <span style="color:#0f172a;font-size:15px;font-weight:600;">${formatDate(registrationStart)}</span>
              </div>
              <div style="background:#ffffff;border-radius:10px;padding:14px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <span style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;">KẾT THÚC</span><br>
                <span style="color:#0f172a;font-size:15px;font-weight:600;">${formatDate(registrationEnd)}</span>
              </div>
            </div>

            ${content ? `
            <div style="margin-bottom:32px;">
              <p style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;margin:0 0 12px;">📝 Nội dung chi tiết</p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #3b82f6;border-radius:0 12px 12px 0;padding:20px 24px;">
                <p style="color:#334155;font-size:15px;line-height:1.8;margin:0;white-space:pre-wrap;">${content}</p>
              </div>
            </div>
            ` : ''}

          </div>

          <!-- Footer -->
          <div style="background:linear-gradient(135deg,#f1f5f9,#e2e8f0);padding:28px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#475569;font-size:13px;font-weight:600;margin:0 0 4px;">🎓 Hệ thống Quản lý Đồ án</p>
            <p style="color:#94a3b8;font-size:11px;margin:0;line-height:1.7;">
              Email này được gửi tự động — Vui lòng không trả lời<br>
              © ${new Date().getFullYear()} Agile Project Management System
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ============================================
// Send bulk email via Resend (HTTP API)
// ============================================
export const sendAnnouncementEmail = async (announcement) => {
    let resend;
    try {
        resend = getResendClient();
    } catch (err) {
        console.error('❌ Failed to initialize Resend client:', err.message);
        return { success: false, error: err.message };
    }

    try {
        const students = await getStudentEmails();
        if (students.length === 0) {
            console.log('ℹ️  No active students found. No emails to send.');
            return { success: true, sent: 0 };
        }

        const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        const fromName = process.env.EMAIL_FROM_NAME || 'Hệ thống Quản lý Đồ án';
        const subject = `[Thông báo] ${announcement.title}`;

        // Resend supports batch up to 100 emails per request
        const BATCH_SIZE = 100;
        let totalSent = 0;
        let errors = [];

        for (let i = 0; i < students.length; i += BATCH_SIZE) {
            const batch = students.slice(i, i + BATCH_SIZE);
            const emailBatch = batch.map(student => ({
                from: `${fromName} <${fromAddress}>`,
                to: student.email,
                subject,
                html: buildAnnouncementEmail(announcement, student.display_name),
            }));

            try {
                const { data, error } = await resend.batch.send(emailBatch);
                if (error) {
                    console.error(`❌ Batch ${i / BATCH_SIZE + 1} error:`, error);
                    errors.push(error);
                } else {
                    totalSent += batch.length;
                    console.log(`✅ Batch ${i / BATCH_SIZE + 1} sent: ${batch.length} emails`);
                }
            } catch (batchErr) {
                console.error(`❌ Batch ${i / BATCH_SIZE + 1} failed:`, batchErr.message);
                errors.push(batchErr.message);
            }
        }

        console.log(`✅ Email broadcast complete: ${totalSent}/${students.length} sent`);
        return {
            success: errors.length === 0,
            sent: totalSent,
            total: students.length,
            errors: errors.length > 0 ? errors : null,
        };
    } catch (error) {
        console.error('❌ Failed to send emails:', error.message);
        return { success: false, error: error.message };
    }
};
