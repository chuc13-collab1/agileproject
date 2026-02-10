# 🚀 Hướng Dẫn Setup và Sử Dụng - MySQL Migration

## 📋 Tổng Quan

Dự án đã được chuyển đổi từ Firestore sang MySQL cho phần **Quản lý người dùng**. Trường **GPA** đã được loại bỏ hoàn toàn.

### Kiến trúc mới:
```
React Frontend → REST API → Express Backend → MySQL Database
              → Firebase Auth (authentication only)
```

---

## ⚙️ Yêu Cầu Hệ Thống

- **Node.js** >= 16.x
- **MySQL** >= 8.0
- **Firebase Project** (cho Authentication)

---

## 📦 Bước 1: Cài Đặt MySQL

### Windows:
1. Download [MySQL Installer](https://dev.mysql.com/downloads/installer/)
2. Cài đặt MySQL Server 8.0
3. Ghi nhớ root password

###Check MySQL đã cài đặt:
```bash
mysql --version
```

---

## 🗄️ Bước 2: Setup Database

### 1. Tạo database và tables

```bash
# Login MySQL
mysql -u root -p

# Hoặc chạy migration script
mysql -u root -p < server/migrations/001_create_tables.sql
```

Migration script sẽ tự động:
- Tạo database `agile_project_management`
- Tạo 6 tables: users, students, teachers, teacher_specializations, admins, admin_permissions

### 2. Verify tables đã được tạo

```sql
USE agile_project_management;
SHOW TABLES;
```

Kết quả mong muốn:
```
+--------------------------------------+
| Tables_in_agile_project_management  |
+--------------------------------------+
| admin_permissions                   |
| admins                              |
| students                            |
| teacher_specializations             |
| teachers                            |
| users                               |
+--------------------------------------+
```

---

## 🔧 Bước 3: Cấu Hình Backend

### 1. Cài đặt dependencies

```bash
cd server
npm install
```

### 2. Tạo file .env

```bash
cp .env.example .env
```

### 3. Chỉnh sửa `.env`

```env
PORT=3001
NODE_ENV=development

# MySQL configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here  # ← Thay đổi này
DB_NAME=agile_project_management

# Firebase Admin SDK (lấy từ Firebase Console)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Lấy Firebase Admin SDK credentials

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. File JSON sẽ được download, copy các giá trị vào `.env`

### 5. Khởi chạy backend server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

✅ Nếu thành công, bạn sẽ thấy:
```
✅ MySQL Database connected successfully
✅ Firebase Admin SDK initialized
🚀 Server Started Successfully
```

Server chạy tại: `http://localhost:3001`

---

## 💻 Bước 4: Cấu Hình Frontend

### 1. Cài đặt dependencies (nếu chưa)

```bash
cd ../client
npm install
```

### 2. Tạo/cập nhật file .env

Thêm dòng này vào file `.env` (hoặc tạo mới từ `.env.example`):

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Giữ nguyên Firebase config hiện tại
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# etc...
```

### 3. Khởi chạy frontend

```bash
npm run dev
```

Frontend chạy tại: `http://localhost:5173`

---

## ✅ Bước 5: Kiểm Tra

### Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# Kết quả:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-04T..."
}
```

### Test Full Flow

1. **Login** vào hệ thống với tài khoản admin
2. **Đi tới** Quản lý người dùng
3. **Thử**:
   - Xem danh sách sinh viên ✓
   - Thêm sinh viên mới ✓
   - Sửa thông tin ✓
   - Xóa sinh viên ✓
   - Import Excel ✓

---

## 🔍 Troubleshooting

### Lỗi: MySQL Connection Error

```
ER_ACCESS_DENIED_ERROR: Access denied for user 'root'
```

**Giải pháp:**
- Kiểm tra lại password MySQL trong `.env`
- Đảm bảo MySQL server đang chạy

### Lỗi: Port 3001 đã được sử dụng

```
Error: EADDRINUSE: address already in use :::3001
```

**Giải pháp:**
- Kill process đang dùng port 3001
- Hoặc đổi `PORT` trong `.env` thành port khác (ví dụ: 3002)

### Lỗi: Firebase Auth Invalid Token

```
Error: Invalid or expired token
```

**Giải pháp:**
- Kiểm tra Firebase credentials trong backend `.env`
- Đảm bảo `FIREBASE_PRIVATE_KEY` có `\n` được escape đúng

### Frontend không kết nối được Backend

**Checklist:**
- ✅ Backend server đang chạy?
- ✅ `VITE_API_URL` trong frontend `.env` đúng chưa?
- ✅ Đã restart frontend sau khi thay đổi `.env`?

---

## 📊 Thay Đổi So Với Firestore

### ✅ Những gì được GIỮ NGUYÊN:
- Firebase Authentication (login/logout)
- Toàn bộ UI components
- Routing và Authorization

### 🔄 Những gì đã THAY ĐỔI:
- **Database**: Firestore → MySQL
- **API calls**: Firebase SDK → REST API
- **Removed**: Trường GPA khỏi Student

### 📍 Files đã được sửa:
```
Frontend:
- client/src/types/user.types.ts           (bỏ GPA)
- client/src/services/api/user.service.ts  (REST API)
- client/src/components/admin/StudentModal.tsx (bỏ GPA field)
- client/src/components/admin/StudentList.tsx  (bỏ GPA column)
- client/.env.example                      (thêm API_URL)

Backend (NEW):
- server/src/index.js                      (Express server)
- server/src/routes/students.js            (Student API)
- server/src/routes/teachers.js            (Teacher API)
- server/src/routes/admins.js              (Admin API)
- server/src/config/database.js            (MySQL connection)
- server/migrations/001_create_tables.sql  (Database schema)
```

---

## 🎯 API Endpoints

### Students
```
GET    /api/students                    # Lấy danh sách
POST   /api/students                    # Tạo mới
PUT    /api/students/:id                # Cập nhật
DELETE /api/students/:id                # Xóa
PATCH  /api/students/:id/toggle-active  # Bật/tắt
POST   /api/students/batch-import       # Import Excel
```

### Teachers
```
GET    /api/teachers
POST   /api/teachers
PUT    /api/teachers/:id
DELETE /api/teachers/:id
PATCH  /api/teachers/:id/toggle-active
```

### Admins
```
GET    /api/admins
POST   /api/admmins
DELETE /api/admins/:id
PATCH  /api/admins/:id/toggle-active
```

---

## 📝 Database Schema

### Quan hệ giữa các tables:

```
users (base table)
  ├── students (1-to-1)
  ├── teachers (1-to-1)
  │     └── teacher_specializations (1-to-many)
  └── admins (1-to-1)
        └── admin_permissions (1-to-many)
```

### Student table (NO GPA):
```sql
students:
  - id (PK)
  - user_id (FK -> users.id)
  - student_id (unique)
  - class_name
  - major
  - academic_year
  -- GPA field đã bị XÓA
```

---

## 🎓 Kết Luận

Bây giờ hệ thống đã:
- ✅ Sử dụng MySQL thay vì Firestore cho user data
- ✅ Có REST API backend với Express.js
- ✅ GPA đã được loại bỏ hoàn toàn
- ✅ Vẫn giữ Firebase Auth cho authentication
- ✅ Tất cả tính năng UI vẫn hoạt động bình thường

Nếu có vấn đề, kiểm tra:
1. MySQL server đang chạy
2. Backend server đang chạy (port 3001)
3. Frontend có đúng API_URL trong .env
4. Firebase credentials đúng

---

**Happy Coding! 🚀**
