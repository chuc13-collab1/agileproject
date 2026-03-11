### 4.3.5 Thiết kế PDM (Physical Data Model)

Dựa trên LDM, mô hình dữ liệu vật lý (PDM) được xây dựng sát với ngôn ngữ SQL của hệ quản trị CSDL MySQL. Dưới đây là thiết kế vật lý chi tiết của **4 bảng tiêu biểu nhất** (Các bảng còn lại được liệt kê ở Phụ lục theo quy định).

#### Bảng 1: Bảng `users` (Danh sách người dùng hệ thống)
*   **Mô tả:** Lưu trữ thông tin đăng nhập và hồ sơ cá nhân của Giảng viên, Sinh viên, Admin.

| Tên trường (Column) | Kiểu dữ liệu | Length / Size | Ràng buộc (Constraint) | Mô tả ý nghĩa |
| :--- | :--- | :--- | :--- | :--- |
| `id` | VARCHAR | 36 | **PK**, NOT NULL | Khóa chính (UUID v4) |
| `email` | VARCHAR | 255 | NOT NULL, **UNIQUE** | Email đăng nhập |
| `password_hash` | VARCHAR | 255 | NOT NULL | Mật khẩu đã mã hóa bcrypt |
| `role` | ENUM | | NOT NULL | Giá trị: 'admin', 'teacher', 'student' |
| `full_name` | VARCHAR | 100 | NOT NULL | Họ và tên người dùng |
| `created_at` | TIMESTAMP | | DEFAULT CURRENT_TIMESTAMP | Ngày tạo tài khoản |

#### Bảng 2: Bảng `projects` (Danh sách đồ án phát triển)
*   **Mô tả:** Lưu trữ thể hiện cụ thể của một đồ án mà nhóm Sinh viên đang thực hiện.

| Tên trường (Column) | Kiểu dữ liệu | Length / Size | Ràng buộc (Constraint) | Mô tả ý nghĩa |
| :--- | :--- | :--- | :--- | :--- |
| `id` | VARCHAR | 36 | **PK**, NOT NULL | Khóa chính Đồ án (UUID) |
| `name` | VARCHAR | 200 | NOT NULL | Tên dự án |
| `topic_id` | VARCHAR | 36 | **FK**, NOT NULL | Khóa ngoại chỉ đến `topics(id)` |
| `class_id` | VARCHAR | 36 | **FK**, NOT NULL | Khóa ngoại chỉ đến `classes(id)` |
| `status` | ENUM | | DEFAULT 'planning' | Trạng thái: planning, active, completed |
| `created_at` | TIMESTAMP | | DEFAULT CURRENT_TIMESTAMP | Ngày khởi tạo |

#### Bảng 3: Bảng `sprints` (Giai đoạn lặp chu trình Agile)
*   **Mô tả:** Quản lý các giai đoạn (Sprint) thuộc về một đồ án.

| Tên trường (Column) | Kiểu dữ liệu | Length / Size | Ràng buộc (Constraint) | Mô tả ý nghĩa |
| :--- | :--- | :--- | :--- | :--- |
| `id` | VARCHAR | 36 | **PK**, NOT NULL | Khóa chính vòng lặp Sprint |
| `project_id` | VARCHAR | 36 | **FK**, NOT NULL | Khóa ngoại nối `projects(id)` |
| `sprint_number` | INT | | NOT NULL, CHECK(>0) | Thứ tự Sprint (1, 2, 3...) |
| `start_date` | DATE | | NOT NULL | Ngày bắt đầu Sprint |
| `end_date` | DATE | | NOT NULL | Ngày kết thúc Sprint |
| `status` | ENUM | | DEFAULT 'not_started' | Trạng thái: not_started, active, completed |

#### Bảng 4: Bảng `progress_reports` (Báo cáo thực hiện đồ án)
*   **Mô tả:** Lưu trữ kết quả/tài liệu được sinh viên nộp lên khi kết thúc một Sprint.

| Tên trường (Column) | Kiểu dữ liệu | Length / Size | Ràng buộc (Constraint) | Mô tả ý nghĩa |
| :--- | :--- | :--- | :--- | :--- |
| `id` | VARCHAR | 36 | **PK**, NOT NULL | Khóa chính biên bản |
| `sprint_id` | VARCHAR | 36 | **FK**, NOT NULL | Khóa ngoại lên bảng `sprints(id)` |
| `submitter_id`| VARCHAR | 36 | **FK**, NOT NULL | Khóa ngoại người nộp `users(id)` |
| `content` | TEXT | | NULL | Ghi chú văn bản nội dung báo cáo |
| `file_url` | VARCHAR | 500 | NULL | Đường dẫn (URL) trỏ đến Firebase Storage nếu có đính kèm file |
| `grade` | DECIMAL | (4,2) | CHECK (grade >=0 & <=10) | Điểm số đánh giá (0-10) |
| `submitted_at`| TIMESTAMP | | DEFAULT CURRENT_TIMESTAMP | Thời gian bấm nút Nộp Bài |
