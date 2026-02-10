# Sequence Diagrams - Hệ Thống Quản Lý Đồ Án

## 1. Sequence Diagram: Đăng Ký Đồ Án

### Mô tả
Sinh viên xem và đăng ký đề tài đồ án sau khi nhà trường công bố thông báo

### Mermaid Diagram
```mermaid
sequenceDiagram
    actor SV as Sinh Viên
    participant UI as Web Interface
    participant API as API Server
    participant Auth as Authentication
    participant DB as Database
    participant Notif as Notification Service
    actor GV as Giáo Viên

    SV->>UI: Đăng nhập
    UI->>Auth: Xác thực (username, password)
    Auth->>DB: Kiểm tra credentials
    DB-->>Auth: User data
    Auth-->>UI: Token + User info
    
    SV->>UI: Chọn "Đăng ký đồ án"
    UI->>API: GET /announcements/current
    API->>DB: SELECT * FROM Announcement WHERE status='published'
    DB-->>API: Announcement data
    API-->>UI: Hiển thị thông báo
    
    SV->>UI: Xem danh sách đề tài
    UI->>API: GET /topics?announcement_id={id}
    API->>DB: SELECT * FROM Topic WHERE status='approved'
    DB-->>API: List of Topics
    API-->>UI: Hiển thị danh sách đề tài
    
    SV->>UI: Chọn đề tài
    UI->>API: GET /topics/{topic_id}
    API->>DB: SELECT Topic details + Teacher info
    DB-->>API: Topic details
    API-->>UI: Hiển thị chi tiết đề tài
    
    SV->>UI: Xác nhận đăng ký
    UI->>API: POST /projects (topic_id, student_id)
    
    API->>DB: Kiểm tra điều kiện
    Note over API,DB: - Sinh viên chưa có đồ án trong kỳ<br/>- Đề tài còn slot<br/>- Trong thời gian đăng ký
    
    alt Điều kiện hợp lệ
        API->>DB: BEGIN TRANSACTION
        API->>DB: INSERT INTO Project
        API->>DB: UPDATE Topic slot count
        API->>DB: COMMIT
        DB-->>API: Project created
        
        API->>Notif: Gửi thông báo đến GV
        Notif->>DB: INSERT INTO Notification (user_id=teacher_id)
        Notif-->>GV: Email/Push notification
        
        API-->>UI: Success (project_id)
        UI-->>SV: "Đăng ký thành công!"
        
    else Điều kiện không hợp lệ
        API->>DB: ROLLBACK
        API-->>UI: Error message
        UI-->>SV: Hiển thị lỗi (đề tài hết slot/đã đăng ký)
    end
```

### PlantUML Format
```plantuml
@startuml
actor "Sinh Viên" as SV
participant "Web UI" as UI
participant "API Server" as API
database "Database" as DB
participant "Notification" as Notif
actor "Giáo Viên" as GV

SV -> UI: Đăng nhập
UI -> API: POST /auth/login
API -> DB: Xác thực user
DB --> API: User data
API --> UI: JWT Token

SV -> UI: Xem danh sách đề tài
UI -> API: GET /topics
API -> DB: SELECT topics WHERE status='approved'
DB --> API: List topics
API --> UI: JSON response

SV -> UI: Chọn đề tài và đăng ký
UI -> API: POST /projects
API -> DB: Validate conditions
alt Hợp lệ
    API -> DB: INSERT Project
    API -> Notif: Send to teacher
    Notif -> GV: Email notification
    API --> UI: Success
    UI --> SV: Thông báo thành công
else Không hợp lệ
    API --> UI: Error
    UI --> SV: Thông báo lỗi
end

@enduml
```

---

## 2. Sequence Diagram: Đề Xuất và Phê Duyệt Đề Tài

### Mô tả
Giáo viên đề xuất đề tài mới và Admin phê duyệt

```mermaid
sequenceDiagram
    actor GV as Giáo Viên
    participant UI as Web Interface
    participant API as API Server
    participant DB as Database
    participant Notif as Notification Service
    actor Admin as Quản Trị Viên

    GV->>UI: Đăng nhập
    GV->>UI: Chọn "Đề xuất đề tài"
    
    UI->>API: GET /announcements/active
    API->>DB: SELECT active announcements
    DB-->>API: Announcement list
    API-->>UI: Hiển thị các kỳ có thể đề xuất
    
    GV->>UI: Chọn kỳ và nhập thông tin đề tài
    Note over GV,UI: - Tên đề tài<br/>- Mô tả<br/>- Yêu cầu<br/>- Số lượng SV<br/>- Lĩnh vực
    
    GV->>UI: Upload tài liệu mô tả (optional)
    UI->>API: POST /topics (form data + files)
    
    API->>DB: BEGIN TRANSACTION
    API->>DB: INSERT INTO Topic (status='pending')
    API->>DB: INSERT INTO Document (if files)
    API->>DB: COMMIT
    DB-->>API: Topic created
    
    API->>Notif: Thông báo đến Admin
    Notif->>DB: INSERT Notification (user_id=admin)
    Notif-->>Admin: Email: "Đề tài mới cần duyệt"
    
    API-->>UI: Success
    UI-->>GV: "Đề xuất đã được gửi, chờ phê duyệt"
    
    Admin->>UI: Đăng nhập Admin panel
    Admin->>UI: Xem danh sách đề tài chờ duyệt
    
    UI->>API: GET /topics?status=pending
    API->>DB: SELECT topics with teacher info
    DB-->>API: Pending topics
    API-->>UI: Hiển thị danh sách
    
    Admin->>UI: Xem chi tiết đề tài
    Admin->>UI: Quyết định (Duyệt/Từ chối)
    
    alt Phê duyệt
        Admin->>UI: Click "Phê duyệt"
        UI->>API: PUT /topics/{id}/approve
        API->>DB: UPDATE Topic SET status='approved'
        DB-->>API: Updated
        
        API->>Notif: Thông báo GV
        Notif-->>GV: "Đề tài đã được duyệt"
        
    else Từ chối
        Admin->>UI: Nhập lý do từ chối
        UI->>API: PUT /topics/{id}/reject (reason)
        API->>DB: UPDATE Topic SET status='rejected'
        API->>DB: INSERT Comment (reason)
        
        API->>Notif: Thông báo GV
        Notif-->>GV: "Đề tài bị từ chối: {reason}"
    end
    
    API-->>UI: Success
    UI-->>Admin: "Đã cập nhật trạng thái"
```

---

## 3. Sequence Diagram: Nộp và Nhận Xét Báo Cáo Tiến Độ

### Mô tả
Sinh viên nộp báo cáo tiến độ, Giáo viên hướng dẫn xem và nhận xét

```mermaid
sequenceDiagram
    actor SV as Sinh Viên
    participant UI as Web Interface
    participant API as API Server
    participant Storage as File Storage
    participant DB as Database
    participant Notif as Notification Service
    actor GV as Giáo Viên

    SV->>UI: Vào trang "Đồ án của tôi"
    UI->>API: GET /students/{id}/projects
    API->>DB: SELECT current projects
    DB-->>API: Project info
    API-->>UI: Hiển thị thông tin đồ án
    
    SV->>UI: Chọn "Nộp báo cáo tiến độ"
    UI->>API: GET /projects/{id}/reports
    API->>DB: SELECT progress reports
    DB-->>API: Report history
    API-->>UI: Hiển thị lịch sử báo cáo
    
    SV->>UI: Click "Tạo báo cáo mới"
    SV->>UI: Nhập nội dung báo cáo
    Note over SV,UI: - Tuần thứ (auto)<br/>- Tiêu đề<br/>- Công việc đã làm<br/>- Kết quả<br/>- Khó khăn<br/>- Kế hoạch tiếp theo
    
    SV->>UI: Upload file đính kèm
    UI->>API: POST /progress-reports (multipart/form-data)
    
    API->>Storage: Upload files
    Storage-->>API: File URLs
    
    API->>DB: BEGIN TRANSACTION
    API->>DB: INSERT Progress_Report
    API->>DB: INSERT Document (file info)
    API->>DB: COMMIT
    DB-->>API: Report created
    
    API->>Notif: Thông báo GV hướng dẫn
    Notif->>DB: INSERT Notification
    Notif-->>GV: "Sinh viên {name} đã nộp báo cáo tuần {week}"
    
    API-->>UI: Success
    UI-->>SV: "Báo cáo đã được gửi"
    
    rect rgb(200, 220, 250)
        Note over GV: Giáo viên xem và nhận xét
        
        GV->>UI: Đăng nhập
        GV->>UI: Xem "Sinh viên hướng dẫn"
        
        UI->>API: GET /teachers/{id}/students
        API->>DB: SELECT students with pending reports
        DB-->>API: Student list
        API-->>UI: Hiển thị danh sách + badge (báo cáo chưa xem)
        
        GV->>UI: Chọn sinh viên
        UI->>API: GET /projects/{id}/reports?status=submitted
        API->>DB: SELECT unreviewed reports
        DB-->>API: Reports
        API-->>UI: Hiển thị báo cáo
        
        GV->>UI: Xem chi tiết báo cáo
        GV->>UI: Nhập nhận xét và rating
        GV->>UI: Chọn status (Approved/Revision needed)
        
        GV->>UI: Gửi nhận xét
        UI->>API: POST /reports/{id}/comments
        
        API->>DB: BEGIN TRANSACTION
        API->>DB: INSERT Comment
        API->>DB: UPDATE Progress_Report.status
        API->>DB: COMMIT
        
        API->>Notif: Thông báo sinh viên
        Notif-->>SV: "GV đã nhận xét báo cáo tuần {week}"
        
        API-->>UI: Success
        UI-->>GV: "Nhận xét đã được gửi"
    end
    
    SV->>UI: Xem nhận xét mới
    UI->>API: GET /reports/{id}/comments
    API->>DB: SELECT comments
    DB-->>API: Comments
    API-->>UI: Hiển thị nhận xét
```

---

## 4. Sequence Diagram: Phân Công Giáo Viên Phản Biện

### Mô tả
Admin phân công giáo viên phản biện cho các đồ án đã hoàn thành

```mermaid
sequenceDiagram
    actor Admin as Quản Trị Viên
    participant UI as Web Interface
    participant API as API Server
    participant ML as Matching Algorithm
    participant DB as Database
    participant Notif as Notification Service
    actor GV as Giáo Viên Phản Biện
    actor SV as Sinh Viên

    Admin->>UI: Vào "Phân công phản biện"
    UI->>API: GET /projects?status=submitted&reviewer_id=null
    API->>DB: SELECT projects cần phản biện
    DB-->>API: Project list
    API-->>UI: Hiển thị danh sách đồ án
    
    Admin->>UI: Chọn đồ án
    UI-->>Admin: Hiển thị thông tin:
    Note over UI,Admin: - Sinh viên<br/>- Đề tài<br/>- GV hướng dẫn<br/>- Lĩnh vực<br/>- Gợi ý GV phản biện
    
    alt Phân công tự động
        Admin->>UI: Click "Gợi ý tự động"
        UI->>API: GET /projects/{id}/suggested-reviewers
        
        API->>DB: SELECT teachers WHERE specialization matches
        DB-->>API: Matching teachers
        
        API->>ML: Calculate best match
        Note over API,ML: Tính toán dựa trên:<br/>- Chuyên môn phù hợp<br/>- Số lượng đồ án đang phản biện<br/>- Không trùng GV hướng dẫn<br/>- Khoa/Bộ môn
        
        ML-->>API: Ranked teacher list
        API-->>UI: Hiển thị top 5 gợi ý
        
        Admin->>UI: Chọn GV từ danh sách gợi ý
        
    else Phân công thủ công
        Admin->>UI: Click "Chọn thủ công"
        UI->>API: GET /teachers?active=true
        API->>DB: SELECT all teachers
        DB-->>API: Teacher list
        API-->>UI: Hiển thị dropdown GV
        
        Admin->>UI: Search và chọn GV
    end
    
    Admin->>UI: Xác nhận phân công
    UI->>API: PUT /projects/{id}/assign-reviewer
    
    API->>DB: Validate (reviewer != supervisor)
    
    alt Valid assignment
        API->>DB: BEGIN TRANSACTION
        API->>DB: UPDATE Project SET reviewer_id={teacher_id}
        API->>DB: INSERT Notification (for reviewer)
        API->>DB: INSERT Notification (for student)
        API->>DB: COMMIT
        
        API->>Notif: Send notifications
        
        par Parallel notifications
            Notif-->>GV: "Bạn được phân công phản biện đồ án: {topic}"
        and
            Notif-->>SV: "GV phản biện: {teacher_name} đã được phân công"
        end
        
        API-->>UI: Success
        UI-->>Admin: "Phân công thành công"
        
    else Invalid (Same as supervisor)
        API-->>UI: Error "GV phản biện trùng GV hướng dẫn"
        UI-->>Admin: Hiển thị lỗi
    end
```

---

## 5. Sequence Diagram: Chấm Điểm Đồ Án

### Mô tả
Giáo viên hướng dẫn và phản biện chấm điểm, hệ thống tính điểm cuối

```mermaid
sequenceDiagram
    actor GV as Giáo Viên
    participant UI as Web Interface
    participant API as API Server
    participant DB as Database
    participant Calc as Score Calculator
    participant Notif as Notification Service
    actor SV as Sinh Viên

    GV->>UI: Đăng nhập
    GV->>UI: Vào "Đồ án cần chấm"
    
    UI->>API: GET /teachers/{id}/projects-to-grade
    API->>DB: SELECT projects WHERE status='submitted'
    Note over API,DB: Lọc theo:<br/>- supervisor_id hoặc reviewer_id<br/>- Chưa chấm điểm
    DB-->>API: Projects list
    API-->>UI: Hiển thị danh sách
    
    GV->>UI: Chọn đồ án
    UI->>API: GET /projects/{id}/full-details
    
    API->>DB: SELECT với JOIN nhiều bảng
    Note over API,DB: - Project info<br/>- Student info<br/>- Progress reports<br/>- Documents<br/>- Topic details
    DB-->>API: Complete data
    API-->>UI: Hiển thị đầy đủ thông tin
    
    GV->>UI: Tải xuống tài liệu
    GV->>UI: Xem lịch sử báo cáo tiến độ
    
    rect rgb(255, 240, 200)
        Note over GV: Chấm điểm theo tiêu chí
        
        GV->>UI: Nhập điểm các tiêu chí
        Note over GV,UI: Tiêu chí chấm:<br/>1. Nội dung (40%): 0-10<br/>2. Kỹ thuật (30%): 0-10<br/>3. Trình bày báo cáo (15%): 0-10<br/>4. Thuyết trình (15%): 0-10
        
        UI->>UI: Auto calculate tổng điểm
        Note over UI: Total = Σ(điểm × trọng số)
        
        GV->>UI: Nhập nhận xét tổng quát
        GV->>UI: Click "Gửi điểm"
        
        UI->>API: POST /evaluations
        
        API->>DB: BEGIN TRANSACTION
        API->>DB: INSERT Evaluation
        
        alt Giáo viên hướng dẫn
            API->>DB: UPDATE Project SET supervisor_score={score}
            
        else Giáo viên phản biện
            API->>DB: UPDATE Project SET reviewer_score={score}
        end
        
        API->>DB: SELECT Project (supervisor_score, reviewer_score)
        DB-->>API: Current scores
        
        alt Đã có đủ cả 3 điểm (Hướng dẫn, Phản biện, Hội đồng)
            API->>Calc: Calculate final score
            Note over API,Calc: final_score = <br/>supervisor_score × 0.4 +<br/>reviewer_score × 0.2 +<br/>council_score × 0.4
            Calc-->>API: final_score
            
            API->>Calc: Determine grade
            Note over API,Calc: A: 9.0-10<br/>B+: 8.5-8.9<br/>B: 8.0-8.4<br/>C+: 7.5-7.9<br/>C: 7.0-7.4<br/>D+: 6.5-6.9<br/>D: 6.0-6.4<br/>F: < 6.0
            Calc-->>API: grade
            
            API->>DB: UPDATE Project SET final_score, grade, status='completed'
            
            API->>Notif: Gửi thông báo có điểm
            Notif->>DB: INSERT Notification
            Notif-->>SV: "Điểm đồ án đã được công bố"
            
        else Chưa đủ điểm
            API->>Notif: Thông báo sinh viên
            Notif-->>SV: "GV {role} đã chấm thêm điểm"
            Note over Notif,SV: Chưa hiển thị điểm cuối
        end
        
        API->>DB: COMMIT
        DB-->>API: Success
        
        API-->>UI: Success response
        UI-->>GV: "Đã gửi điểm thành công"
    end
    
    rect rgb(200, 255, 200)
        Note over SV: Sinh viên xem điểm
        
        SV->>UI: Vào "Kết quả đồ án"
        UI->>API: GET /students/{id}/project-results
        API->>DB: SELECT projects with scores
        DB-->>API: Results
        
        alt Đã có điểm cuối
            API-->>UI: Full results
            UI-->>SV: Hiển thị:<br/>- Điểm hướng dẫn<br/>- Điểm phản biện<br/>- Điểm cuối<br/>- Xếp loại<br/>- Nhận xét
        else Chưa đủ điểm
            API-->>UI: Partial results
            UI-->>SV: "Đang chờ chấm điểm"
        end
    end
```

---

## 6. Sequence Diagram: Tạo Thông Báo Đồ Án

### Mô tả
Admin tạo và công bố thông báo đồ án cho học kỳ mới

```mermaid
sequenceDiagram
    actor Admin as Quản Trị Viên
    participant UI as Admin Panel
    participant API as API Server
    participant Valid as Validator
    participant DB as Database
    participant Notif as Notification Service
    participant Email as Email Service
    actor Users as Sinh viên & Giáo viên

    Admin->>UI: Đăng nhập Admin Panel
    Admin->>UI: Chọn "Tạo thông báo đồ án"
    
    UI->>API: GET /semesters/current
    API->>DB: SELECT current semester info
    DB-->>API: Semester data
    API-->>UI: Auto-fill học kỳ hiện tại
    
    Admin->>UI: Nhập thông tin thông báo
    Note over Admin,UI: - Tiêu đề<br/>- Nội dung<br/>- Học kỳ<br/>- Năm học<br/>- Ngày bắt đầu đăng ký<br/>- Ngày kết thúc đăng ký<br/>- Hạn nộp báo cáo<br/>- Ngày bảo vệ (dự kiến)
    
    Admin->>UI: Click "Xem trước"
    UI-->>Admin: Preview thông báo
    
    alt Lưu nháp
        Admin->>UI: Click "Lưu nháp"
        UI->>API: POST /announcements (status='draft')
        API->>DB: INSERT Announcement
        DB-->>API: Success
        API-->>UI: "Đã lưu nháp"
        
    else Công bố ngay
        Admin->>UI: Click "Công bố"
        UI->>API: POST /announcements (status='published')
        
        API->>Valid: Validate data
        Note over API,Valid: - Kiểm tra ngày hợp lệ<br/>- registration_start < registration_end<br/>- Không trùng kỳ khác<br/>- Các trường bắt buộc
        
        alt Validation passed
            Valid-->>API: Valid
            
            API->>DB: BEGIN TRANSACTION
            API->>DB: INSERT Announcement
            API->>DB: SELECT all users (students & teachers)
            DB-->>API: User list
            
            loop For each user
                API->>DB: INSERT Notification
            end
            
            API->>DB: COMMIT
            DB-->>API: Success
            
            API->>Notif: Trigger mass notification
            
            par Parallel notification
                Notif->>Email: Send email to all users
                Email-->>Users: Email: "Thông báo đồ án mới"
            and
                Notif->>DB: Log sent notifications
            and
                Notif-->>Users: Push notification (if enabled)
            end
            
            API-->>UI: Success
            UI-->>Admin: "Thông báo đã được công bố"
            
        else Validation failed
            Valid-->>API: Errors list
            API-->>UI: Validation errors
            UI-->>Admin: Hiển thị lỗi cần sửa
        end
    end
```

---

## 7. Sequence Diagram: Báo Cáo Thống Kê

### Mô tả
Admin tạo và xuất báo cáo thống kê về đồ án

```mermaid
sequenceDiagram
    actor Admin as Quản Trị Viên
    participant UI as Web Interface
    participant API as API Server
    participant DB as Database
    participant Analytics as Analytics Engine
    participant Export as Export Service

    Admin->>UI: Vào "Báo cáo & Thống kê"
    UI->>API: GET /reports/types
    API-->>UI: Danh sách loại báo cáo
    
    UI-->>Admin: Hiển thị các loại:
    Note over UI,Admin: 1. Thống kê đăng ký<br/>2. Thống kê theo GV<br/>3. Thống kê kết quả<br/>4. Thống kê tiến độ<br/>5. Phân tích lĩnh vực
    
    Admin->>UI: Chọn loại báo cáo
    Admin->>UI: Chọn bộ lọc
    Note over Admin,UI: - Học kỳ<br/>- Năm học<br/>- Khoa<br/>- Từ ngày -> Đến ngày
    
    Admin->>UI: Click "Tạo báo cáo"
    UI->>API: POST /reports/generate
    
    API->>DB: Query complex data
    Note over API,DB: Multiple JOINs:<br/>- Projects<br/>- Students<br/>- Teachers<br/>- Topics<br/>- Evaluations
    
    DB-->>API: Raw data
    
    API->>Analytics: Process data
    
    par Parallel processing
        Analytics->>Analytics: Calculate statistics
        Note over Analytics: - Tổng số<br/>- Trung bình<br/>- Phân bố<br/>- Xu hướng
    and
        Analytics->>Analytics: Generate charts data
        Note over Analytics: - Bar charts<br/>- Pie charts<br/>- Line charts<br/>- Heatmaps
    end
    
    Analytics-->>API: Processed report data
    
    API-->>UI: Report data + Chart configs
    UI-->>Admin: Hiển thị báo cáo:
    Note over UI,Admin: - Summary cards<br/>- Interactive charts<br/>- Data tables<br/>- Filters
    
    alt Xuất PDF
        Admin->>UI: Click "Xuất PDF"
        UI->>API: GET /reports/{id}/export?format=pdf
        API->>Export: Generate PDF
        Export->>Export: Convert HTML + Charts to PDF
        Export-->>API: PDF file
        API-->>UI: Download PDF
        UI-->>Admin: Tải file PDF
        
    else Xuất Excel
        Admin->>UI: Click "Xuất Excel"
        UI->>API: GET /reports/{id}/export?format=xlsx
        API->>Export: Generate Excel
        Export->>Export: Create XLSX với multiple sheets
        Export-->>API: Excel file
        API-->>UI: Download Excel
        UI-->>Admin: Tải file Excel
        
    else In trực tiếp
        Admin->>UI: Click "In báo cáo"
        UI->>UI: Open print dialog
        UI-->>Admin: Print preview
    end
```

---

## Các Thành Phần Chính

### 1. Actors (Tác Nhân)
- **Sinh Viên**: Người sử dụng chính, đăng ký và thực hiện đồ án
- **Giáo Viên Hướng Dẫn**: Đề xuất đề tài, hướng dẫn và chấm điểm
- **Giáo Viên Phản Biện**: Đánh giá và chấm điểm phản biện
- **Quản Trị Viên**: Quản lý hệ thống, phê duyệt, phân công

### 2. Systems (Hệ Thống)
- **Web Interface**: Giao diện người dùng (Frontend)
- **API Server**: Xử lý logic nghiệp vụ (Backend)
- **Database**: Lưu trữ dữ liệu
- **Authentication**: Xác thực và phân quyền
- **Notification Service**: Gửi thông báo
- **File Storage**: Lưu trữ tài liệu
- **Email Service**: Gửi email
- **Analytics Engine**: Phân tích và báo cáo

### 3. Key Patterns

#### Transaction Pattern
Sử dụng BEGIN TRANSACTION - COMMIT/ROLLBACK cho:
- Đăng ký đồ án (cập nhật nhiều bảng)
- Chấm điểm (cập nhật điểm và trạng thái)
- Phê duyệt đề tài

#### Notification Pattern
Sau các action quan trọng, gửi thông báo đến các user liên quan:
- Real-time notification (WebSocket/SSE)
- Email notification
- Push notification

#### Validation Pattern
Kiểm tra điều kiện nghiệp vụ trước khi thực hiện:
- Điều kiện thời gian
- Điều kiện quyền hạn
- Điều kiện số lượng

#### Parallel Processing
Xử lý song song khi có thể:
- Gửi thông báo đến nhiều user
- Tính toán thống kê
- Generate reports

---

## Notes về Implementation

### 1. Error Handling
Mỗi API call cần xử lý:
- Network errors
- Validation errors
- Business logic errors
- Database errors

### 2. Security
- Xác thực JWT token ở mọi request
- Kiểm tra quyền truy cập (Authorization)
- Validate input data
- Prevent SQL injection

### 3. Performance
- Caching cho data không thay đổi thường xuyên
- Pagination cho danh sách lớn
- Lazy loading cho tài liệu
- Async processing cho email/notification

### 4. Monitoring
- Log tất cả các action quan trọng
- Track error rate
- Monitor response time
- Alert khi có vấn đề
