### 4.3.4 Thiết kế LDM (Logical Data Model)

Dựa trên kết quả chuẩn hóa ở bước 4.3.3, lược đồ quan hệ đựợc hình thành để làm cơ sở cho việc thiết lập CSDL vật lý. Dưới đây là danh sách các lược đồ quan hệ trong mô hình LDM (Khóa chính được đánh dấu **PK**, Khóa ngoại đánh dấu **FK**):

**1. Nhóm Quản trị Người Dùng và Lớp Học**
*   **users**(<u>id (PK)</u>, email, password_hash, role, full_name, created_at)
*   **classes**(<u>id (PK)</u>, code, name, teacher_id (FK), created_at)
*   **user_classes**(<u>class_id (PK, FK)</u>, <u>student_id (PK, FK)</u>, joined_at)

**2. Nhóm Quản trị Đề Tài và Đồ Án**
*   **topics**(<u>id (PK)</u>, title, description, max_members, teacher_id (FK), is_active)
*   **topic_proposals**(<u>id (PK)</u>, title, description, student_id (FK), requested_supervisor_id (FK), status)
*   **projects**(<u>id (PK)</u>, name, topic_id (FK), class_id (FK), created_at, status)
*   **project_students**(<u>project_id (PK, FK)</u>, <u>student_id (PK, FK)</u>, role)

**3. Nhóm Quản trị Tiến Độ (Agile/Sprint)**
*   **sprints**(<u>id (PK)</u>, project_id (FK), sprint_number, start_date, end_date, status)
*   **progress_reports**(<u>id (PK)</u>, sprint_id (FK), submitter_id (FK), content, file_url, submitted_at, grade, feedback)
*   **sprint_comments**(<u>id (PK)</u>, sprint_id (FK), user_id (FK), comment_text, created_at)

**4. Nhóm Trợ Giúp và Lịch Hẹn**
*   **appointments**(<u>id (PK)</u>, student_id (FK), teacher_id (FK), meeting_date, location, status)

*(Chi tiết về mô hình trực quan bao gồm các mối quan hệ Crow's foot 1-N, N-N nối giữa các bảng này, vui lòng xem trên sơ đồ LDM đính kèm).*
