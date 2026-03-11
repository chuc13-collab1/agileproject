import nodemailer from 'nodemailer';
import pool from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGO_PATH = path.resolve(__dirname, '../assets/logo.jpg');

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
    <body style="margin:0;padding:0;background-color:#eef2f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;-webkit-font-smoothing:antialiased;">
      <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
        
        <!-- Main card -->
        <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1);">
          
          <!-- Header - Dark gradient -->
          <div style="background:linear-gradient(160deg,#0f172a 0%,#1e3a5f 40%,#1e40af 100%);padding:48px 40px;text-align:center;position:relative;">
            <!-- Decorative dots -->
            <div style="position:absolute;top:20px;right:30px;opacity:0.1;">
              <span style="color:white;font-size:60px;">✦</span>
            </div>
            <div style="display:inline-block;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:10px;margin-bottom:16px;">
              <img src="cid:logo" alt="Logo" style="height:60px;border-radius:10px;" />
            </div>
            <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px;">HỆ THỐNG QUẢN LÝ ĐỒ ÁN</h1>
            <div style="width:60px;height:3px;background:linear-gradient(to right,#60a5fa,#38bdf8);margin:12px auto;border-radius:2px;"></div>
            <p style="color:rgba(255,255,255,0.6);margin:0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;">Agile Project Management System</p>
          </div>

          <!-- Notification type bar -->
          <div style="background:linear-gradient(to right,#1e40af,#3b82f6);padding:12px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">📢 THÔNG BÁO MỚI</span>
          </div>

          <!-- Body -->
          <div style="padding:36px 40px;">
            
            <!-- Title -->
            <h2 style="color:#0f172a;font-size:24px;font-weight:800;margin:0 0 24px;line-height:1.4;">${title}</h2>
            
            <!-- Semester badge -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1px solid #a7f3d0;padding:10px 20px;border-radius:10px;">
                  <span style="color:#065f46;font-size:14px;font-weight:700;">📚 ${semester} — Năm học ${academicYear}</span>
                </td>
              </tr>
            </table>

            <!-- Divider with icon -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
              <tr>
                <td style="height:1px;background:linear-gradient(to right,transparent,#cbd5e1,transparent);"></td>
              </tr>
            </table>

            <!-- Registration period card -->
            <div style="background:#f8fafc;border-radius:16px;padding:24px;margin-bottom:28px;border:1px solid #e2e8f0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom:16px;">
                    <span style="font-size:18px;">📅</span>
                    <span style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;vertical-align:middle;margin-left:6px;">Thời gian đăng ký</span>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0 8px;">
                <tr>
                  <td style="padding:14px 20px;background:#ffffff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width:8px;">
                          <div style="width:8px;height:8px;background:#22c55e;border-radius:50%;"></div>
                        </td>
                        <td style="padding-left:12px;">
                          <span style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">BẮT ĐẦU</span><br>
                          <span style="color:#0f172a;font-size:15px;font-weight:600;">${formatDate(registrationStart)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;background:#ffffff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width:8px;">
                          <div style="width:8px;height:8px;background:#ef4444;border-radius:50%;"></div>
                        </td>
                        <td style="padding-left:12px;">
                          <span style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">KẾT THÚC</span><br>
                          <span style="color:#0f172a;font-size:15px;font-weight:600;">${formatDate(registrationEnd)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Content -->
            ${content ? `
            <div style="margin-bottom:32px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom:12px;">
                    <span style="font-size:18px;">📝</span>
                    <span style="color:#0f172a;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;vertical-align:middle;margin-left:6px;">Nội dung chi tiết</span>
                  </td>
                </tr>
              </table>
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

        <p style="text-align:center;color:#94a3b8;font-size:10px;margin-top:16px;">
          Bạn nhận được email này vì bạn là thành viên của hệ thống.
        </p>
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
      attachments: [
        {
          filename: 'logo.jpg',
          path: LOGO_PATH,
          cid: 'logo',
        },
      ],
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
