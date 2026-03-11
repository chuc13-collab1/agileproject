### 4.3.6 Thiết lập Ràng buộc và Index
Trong quá trình triển khai CSDL mức vật lý, hệ thống "Quản lý Đồ án Agile" áp dụng các ràng buộc (Constraint) và chỉ mục (Index) sau để bảo toàn tính toàn vẹn dữ liệu và tối ưu hóa hiệu suất truy vấn.

**a. Ràng buộc toàn vẹn (Constraints)**
1.  **PRIMARY KEY (PK):** Bắt buộc trên tất cả các bảng. Sử dụng `VARCHAR(36)` để lưu UUID v4, đảm bảo các bản ghi không bị trùng lặp xuyên suốt các môi trường.
2.  **FOREIGN KEY (FK):** Được áp dụng `ON DELETE CASCADE` hoặc `ON DELETE RESTRICT` tùy nghiệp vụ.
    *   Ví dụ: Bảng `projects` có cột `topic_id`. Nếu một `topic` bị xóa, thay vì lỗi mồ côi (orphan), các projects phụ thuộc sẽ tự động chuyển `topic_id` thành `NULL` (ON DELETE SET NULL) hoặc bị cảnh báo (RESTRICT).
3.  **UNIQUE:** Đảm bảo tính duy nhất.
    *   Cột `email` trong bảng `users` được gán UNIQUE để không có 2 sinh viên trùng tài khoản đăng nhập.
4.  **CHECK:** Ràng buộc miền giá trị hợp lệ.
    *   Cột `grade` (điểm số) trong bảng `progress_reports` buộc phải nằm trong khoảng: `CHECK(grade >= 0.00 AND grade <= 10.00)`.

**b. Đánh chỉ mục (Indexing)**
*   Mặc định các cột PK và cột có UNIQUE đều được hệ quản trị CSDL cấp B-Tree Index.
*   Bổ sung Index phụ trợ (Secondary Indexes) cho các cột thường dùng trong mệnh đề `WHERE` để tăng tốc độ tìm kiếm:
    *   `CREATE INDEX idx_user_role ON users(role);`
    *   `CREATE INDEX idx_project_status ON projects(status);`

---

### 4.3.7 Sơ đồ CSDL vật lý (Database Diagram)
*(Placeholder: Dưới đây là sơ đồ được chụp trực tiếp từ hệ quản trị Cơ sở dữ liệu MySQL (MySQL Workbench) minh chứng cấu trúc lưu trữ được thiết lập ở file vật lý).*

*(Sinh viên tự sinh sơ đồ này bằng cách mờ MySQL Workbench > Database > Reverse Engineer và chèn ảnh vào đây).*

---

### 4.3.8 Trích đoạn Script SQL khởi tạo
Dưới đây là một vài đoạn mã lệnh Data Definition Language (DDL) minh họa việc tạo bảng có kèm kiểu dữ liệu, khóa chính và ràng buộc (Toàn bộ mã nguồn SQL khởi tạo hệ thống đầy đủ được đính kèm ở phần Phụ lục đồ án).

```sql
-- Đoạn 1: Lệnh tạo bảng người dùng (Users)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Đoạn 2: Lệnh tạo bảng chứa chi tiết Đồ Án (Projects) tham chiếu khóa ngoại
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    topic_id VARCHAR(36) NOT NULL,
    class_id VARCHAR(36) NOT NULL,
    status ENUM('planning', 'active', 'completed') DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Khai báo báo Foreign Key Constraints
    CONSTRAINT fk_project_topic 
        FOREIGN KEY (topic_id) REFERENCES topics(id) 
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_project_class 
        FOREIGN KEY (class_id) REFERENCES classes(id) 
        ON DELETE CASCADE
);

-- Đoạn 3: Lệnh khởi tạo Index Tối ưu
CREATE INDEX idx_project_status ON projects(status);
CREATE INDEX idx_user_email ON users(email);
```
