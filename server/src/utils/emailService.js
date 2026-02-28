import nodemailer from 'nodemailer';
import pool from '../config/database.js';

// ============================================
// Gmail SMTP Transporter
// ============================================
const createTransporter = () => {
    const { EMAIL_USER, EMAIL_APP_PASSWORD } = process.env;

    if (!EMAIL_USER || !EMAIL_APP_PASSWORD) {
        console.warn('⚠️  Email config missing: EMAIL_USER or EMAIL_APP_PASSWORD not set in .env');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_APP_PASSWORD,
        },
    });
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
const buildAnnouncementEmail = (announcement) => {
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

    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:30px 24px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">📋 Hệ thống Quản lý Đồ án</h1>
          <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">Thông báo mới</p>
        </div>

        <!-- Body -->
        <div style="padding:24px;">
          <h2 style="color:#1e293b;font-size:18px;margin:0 0 16px;">${title}</h2>
          
          <!-- Info badges -->
          <div style="margin-bottom:16px;">
            <span style="display:inline-block;background:#e0f2fe;color:#0369a1;padding:4px 12px;border-radius:99px;font-size:13px;font-weight:600;margin-right:8px;">
              ${semester} / ${academicYear}
            </span>
          </div>

          <!-- Registration period -->
          <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:16px;border-left:4px solid #3b82f6;">
            <p style="margin:0 0 8px;color:#64748b;font-size:13px;font-weight:600;">📅 Thời gian đăng ký</p>
            <p style="margin:0;color:#1e293b;font-size:14px;">
              <strong>Bắt đầu:</strong> ${formatDate(registrationStart)}<br>
              <strong>Kết thúc:</strong> ${formatDate(registrationEnd)}
            </p>
          </div>

          <!-- Content -->
          ${content ? `
          <div style="margin-bottom:16px;">
            <p style="color:#64748b;font-size:13px;font-weight:600;margin:0 0 8px;">📝 Nội dung</p>
            <p style="color:#334155;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">${content}</p>
          </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            Email này được gửi tự động từ Hệ thống Quản lý Đồ án.<br>
            Vui lòng không trả lời email này.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ============================================
// Send bulk email (async, non-blocking)
// ============================================
export const sendAnnouncementEmail = async (announcement) => {
    const transporter = createTransporter();
    if (!transporter) {
        console.error('❌ Email transporter not configured. Skipping email send.');
        return { success: false, error: 'Email not configured' };
    }

    try {
        const students = await getStudentEmails();
        if (students.length === 0) {
            console.log('ℹ️  No active students found. No emails to send.');
            return { success: true, sent: 0 };
        }

        const emailList = students.map(s => s.email);
        const fromName = process.env.EMAIL_FROM_NAME || 'Hệ thống Quản lý Đồ án';
        const htmlContent = buildAnnouncementEmail(announcement);

        const subject = `[Thông báo] ${announcement.title}`;

        // Send using BCC for bulk (hide recipient list)
        const mailOptions = {
            from: `"${fromName}" <${process.env.EMAIL_USER}>`,
            bcc: emailList,
            subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`✅ Email sent successfully to ${emailList.length} students`);
        console.log(`   Message ID: ${info.messageId}`);

        return { success: true, sent: emailList.length, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        return { success: false, error: error.message };
    }
};
