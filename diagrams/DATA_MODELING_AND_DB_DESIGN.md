# MÔ HÌNH HÓA DỮ LIỆU VÀ THIẾT KẾ CSDL
## Hệ thống Quản lý Đồ án Tốt nghiệp theo mô hình Agile

---

## 1. Tổng quan Kiến trúc Dữ liệu
Hệ thống sử dụng **Cơ sở dữ liệu Quan hệ (MySQL)** để lưu trữ các thực thể cốt lõi về Đồ án, Người dùng, Sprint và Điểm số. Cấu trúc được chuẩn hóa để đảm bảo toàn vẹn dữ liệu (Data Integrity) và tránh N+1 Queries khi truy vấn Dashboard tiến độ.

Mô hình dữ liệu được chia làm **4 nhóm Module chính**:
1.  **Module Người dùng & Phân quyền**: `users`, `admins`, `teachers`, `students`, `admin_permissions`
2.  **Module Quản lý Tổng quan**: `classes`, `topics`, `topic_proposals`
3.  **Module Quản lý Agile (Core)**: `projects`, `sprints`, `progress_reports`, `sprint_comments`
4.  **Module Hỗ trợ & Vận hành**: `meeting_slots`, `bookings`, `notifications`, `announcements`, `evaluations`

---

## 2. Thiết kế Cơ sở Dữ liệu Vật lý (PDM)

Dưới đây là đặc tả chi tiết các bảng giữ vai trò trung tâm của luồng nghiệp vụ Agile:

### 📄 2.1. Bảng `users` (Danh sách tài khoản)
*   **Mô tả**: Lưu thông tin đăng nhập và phân Role cơ bản.
*   **Chi tiết mở rộng**: Các bảng `students`, `teachers`, `admins` sẽ nối khóa ngoại `1 - 1` với `users(id)` để bổ sung thông tin hồ sơ riêng (VD: MSSV, Chuyên ngành).

| Tên trường (Column) | Kiểu dữ liệu | Kiểm soát (Constraint) | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | **PK**, NOT NULL | ID duy nhất (UUID) |
| `email` | VARCHAR(255) | NOT NULL, **UNIQUE** | Email đăng nhập |
| `password_hash` | VARCHAR(255) | NOT NULL | Mật khẩu hash |
| `role` | ENUM | NOT NULL | 'admin', 'teacher', 'student' |
| `full_name` | VARCHAR(100) | NOT NULL | Họ và tên |

---

### 📄 2.2. Bảng `projects` (Danh sách Đồ án)
*   **Mô tả**: Lưu trữ thể hiện cụ thể của một đồ án mà nhóm Sinh viên đang thực hiện (`status='active'`).

| Tên trường (Column) | Kiểu dữ liệu | Kiểm soát (Constraint) | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | **PK**, NOT NULL | ID Đồ án |
| `name` | VARCHAR(200) | NOT NULL | Tên dự án |
| `topic_id` | VARCHAR(36) | **FK**, NOT NULL | Trỏ đến `topics(id)` |
| `class_id` | VARCHAR(36) | **FK**, NOT NULL | Trỏ đến `classes(id)` |
| `status` | ENUM | DEFAULT 'planning' | `planning`, `active`, `completed` |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Ngày tạo dự án |

---

### 📄 2.3. Bảng `sprints` (Giai đoạn lặp Agile)
*   **Mô tả**: Quản lý vòng lặp thời gian chu kỳ review (1-2 tuần) của một đồ án.

| Tên trường (Column) | Kiểu dữ liệu | Kiểm soát (Constraint) | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | **PK**, NOT NULL | ID Sprint |
| `project_id` | VARCHAR(36) | **FK**, NOT NULL | Trỏ đến `projects(id)` |
| `sprint_number` | INT | NOT NULL, CHECK(>0) | Số thứ tự Sprint (1, 2, 3...) |
| `start_date` | DATE | NOT NULL | Ngày bắt đầu |
| `end_date` | DATE | NOT NULL | Ngày kết thúc |
| `status` | ENUM | DEFAULT 'not_started' | `not_started`, `active`, `completed` |

---

### 📄 2.4. Bảng `progress_reports` (Báo cáo tiến độ)
*   **Mô tả**: Biên bản nộp tài liệu/link kết quả của Sinh viên tại điểm cuối Sprint.

| Tên trường (Column) | Kiểu dữ liệu | Kiểm soát (Constraint) | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(36) | **PK**, NOT NULL | ID báo cáo |
| `sprint_id` | VARCHAR(36) | **FK**, NOT NULL | Nối lên `sprints(id)` |
| `submitter_id`| VARCHAR(36) | **FK**, NOT NULL | Người nộp `users(id)` |
| `file_url` | VARCHAR(500)| NULL | Link đính kèm file nộp bài |
| `grade` | DECIMAL(4,2)| CHECK (>=0 & <=10) | Điểm đánh giá (Hệ 10) |
| `submitted_at`| TIMESTAMP | DEFAULT NOW() | Thời điểm click nộp |

---

## 3. Bản đồ Mối quan hệ chính (Data Relationships)

Hệ thống được thiết kế theo các **luồng luân chuyển 1 - Nhiều (1-n)** chặt chẽ:

1.  **Lớp học & Người dùng**:
    *   1 `Class` có **N** `Students`.
2.  **Đề tài & Đồ án**:
    *   1 `Teacher` đề xuất **N** `Topics` (Đề tài).
    *   1 `Topic` khả dụng có thể ánh xạ sang **1** `Project` hoạt động chính thức.
3.  **Vòng đời Agile (Core)**:
    *   1 `Project` có **N** `Sprints` tuần tự.
    *   1 `Sprint` kết thúc gắn với **1** `ProgressReport` chính.
    *   1 `Sprint` có **N** `SprintComments` feedback (trao đổi giữa GVHD và SV).

---

## 4. Ràng buộc & Toàn vẹn (Constraints)
*   **Tham chiếu Cascade**: Khi một `Project` bị hủy, các `Sprints` và `Reports` phụ thuộc sẽ tự động được thu hồi (`ON DELETE CASCADE`) để dọn rác database ảo.
*   **Check logic**: Ngày nộp bài (`submitted_at`) buộc phải nằm trong phạm vi thời hạn của Sprint, hỗ trợ tính toán Overdue (Trễ hạn) chính xác trên BI chart.
