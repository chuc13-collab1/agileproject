# Biểu Đồ Luồng Dữ Liệu (DFD) — Hệ Thống Quản Lý Đồ Án

Tài liệu mô tả **Data Flow Diagram (DFD)** qua 3 mức: **Mức 0** (Ngữ cảnh), **Mức 1** (Đỉnh), **Mức 2** (Dưới đỉnh) cho từng tiến trình.

> **Quy ước ký hiệu:**
> - `(( ))` = Thực thể ngoài (External Entity)
> - `((" "))` = Tiến trình (Process) — hình tròn
> - `[( )]` = Kho dữ liệu (Data Store) — hình trụ
> - `-->` = Luồng dữ liệu (Data Flow)
> - `-.->` = Luồng dữ liệu phụ / tham chiếu

---

## Danh Sách Kho Dữ Liệu (Data Stores)

Ánh xạ trực tiếp từ 16 bảng trong CSDL MySQL:

| Ký hiệu | Bảng (Table) | Mô tả |
|----------|-------------|-------|
| D1 | `users` | Thông tin tài khoản chung (id, uid, email, role, is_active) |
| D2 | `students` | Thông tin sinh viên (student_id, class_name, major) |
| D3 | `teachers` | Thông tin giáo viên (teacher_id, department, max_students, can_supervise, can_review) |
| D4 | `admins` | Thông tin quản trị viên |
| D5 | `admin_permissions` | Quyền hạn chi tiết của admin |
| D6 | `classes` | Danh sách lớp học (class_code, major, advisor_teacher_id) |
| D7 | `topics` | Đề tài đồ án (title, supervisor_id, reviewer_id, status, semester, field) |
| D8 | `topic_proposals` | Đề xuất đề tài từ sinh viên |
| D9 | `projects` | Đồ án (topic_id, student_id, supervisor_id, reviewer_id, status, scores, grade) |
| D10 | `sprints` | Sprint trong đồ án (sprint_number, goals, status, actual_progress) |
| D11 | `sprint_comments` | Nhận xét sprint (author_uid, content, author_role) |
| D12 | `progress_reports` | Báo cáo tiến độ (report_title, week_number, content, file_path, status) |
| D13 | `comments` | Nhận xét của GV về báo cáo (content, rating 1-5) |
| D14 | `notifications` | Thông báo hệ thống (title, message, type, is_read) |
| D15 | `announcements` | Thông báo kỳ đồ án (semester, registration_start/end, status) |
| D16 | `meeting_slots` | Lịch hẹn GV (start_time, end_time, location) |
| D17 | `bookings` | Đặt lịch hẹn SV (slot_id, student_id, status) |
| D18 | `project_archive` | Lưu trữ đồ án hoàn thành (final_score, grade, archived_at) |
| D19 | `teacher_specializations` | Chuyên môn giáo viên (specialization) |

---

## 1. DFD MỨC 0 — Biểu Đồ Ngữ Cảnh (Context Diagram)

Toàn bộ hệ thống được biểu diễn như **một tiến trình duy nhất** tương tác với các thực thể ngoài.

```mermaid
flowchart LR
    SV((Sinh viên))
    GVHD((GV Hướng dẫn))
    GVPB((GV Phản biện))
    AD((Admin))
    FA((Firebase Auth))
    AI((Gemini AI))

    HT(("0\nHỆ THỐNG\nQUẢN LÝ ĐỒ ÁN"))

    %% ═══ Sinh viên ═══
    SV -->|"Thông tin đăng nhập\nHồ sơ cá nhân"| HT
    SV -->|"Đăng ký đề tài\nĐề xuất đề tài"| HT
    SV -->|"Nộp báo cáo tiến độ\nCập nhật sprint\nUpload tài liệu"| HT
    SV -->|"Tin nhắn chat\nĐặt lịch hẹn"| HT

    HT -->|"Kết quả xác thực\nThông tin cá nhân"| SV
    HT -->|"DS đề tài, Trạng thái đăng ký\nThông báo kỳ đồ án"| SV
    HT -->|"Nhận xét GV, Rating\nTiến độ sprint"| SV
    HT -->|"Điểm số, Xếp loại\nThông báo hệ thống"| SV

    %% ═══ GV Hướng dẫn ═══
    GVHD -->|"Thông tin đăng nhập"| HT
    GVHD -->|"Đề xuất đề tài mới\nDuyệt đăng ký SV"| HT
    GVHD -->|"Nhận xét báo cáo\nRating (1-5 sao)\nComment sprint"| HT
    GVHD -->|"Điểm hướng dẫn (40%)\nNhận xét tổng quan"| HT
    GVHD -->|"Tin nhắn chat\nTạo lịch hẹn"| HT

    HT -->|"Kết quả xác thực"| GVHD
    HT -->|"DS SV hướng dẫn\nBáo cáo tiến độ SV"| GVHD
    HT -->|"Thông báo hệ thống\nDashboard thống kê"| GVHD

    %% ═══ GV Phản biện ═══
    GVPB -->|"Thông tin đăng nhập"| HT
    GVPB -->|"Điểm phản biện (20%)\nCâu hỏi phản biện\nNhận xét"| HT

    HT -->|"Kết quả xác thực"| GVPB
    HT -->|"DS đồ án phân công\nTài liệu đồ án"| GVPB
    HT -->|"Thông báo phân công"| GVPB

    %% ═══ Admin ═══
    AD -->|"Thông tin đăng nhập"| HT
    AD -->|"Quản lý User (SV, GV)\nQuản lý Lớp\nImport Excel"| HT
    AD -->|"Phê duyệt/Từ chối đề tài\nPhân công GV phản biện"| HT
    AD -->|"Tạo thông báo kỳ đồ án\nCấu hình hệ thống"| HT
    AD -->|"Tổng hợp điểm\nLệnh Archive"| HT

    HT -->|"Kết quả xác thực"| AD
    HT -->|"Dashboard tổng quan\nBáo cáo thống kê (PDF/Excel)"| AD

    %% ═══ External Systems ═══
    HT -->|"Email/Password\nFirebase UID"| FA
    FA -->|"JWT Token\nUser Profile"| HT

    HT -->|"Prompt (Chat / Gợi ý PB)"| AI
    AI -->|"Câu trả lời AI\nGợi ý phân công"| HT
```

---

## 2. DFD MỨC 1 — Biểu Đồ Mức Đỉnh

Phân rã hệ thống thành **8 tiến trình** chính (tương ứng 8 nhóm chức năng BFD).

```mermaid
flowchart TD
    %% ═══ External Entities ═══
    SV((Sinh viên))
    GV((Giáo viên))
    AD((Admin))
    FA((Firebase Auth))
    AI((Gemini AI))

    %% ═══ Processes ═══
    P1(("1.0\nQuản lý\nNgười dùng"))
    P2(("2.0\nQuản lý\nĐề tài"))
    P3(("3.0\nQuản lý\nĐồ án"))
    P4(("4.0\nTheo dõi\nTiến độ"))
    P5(("5.0\nChấm điểm\n& Đánh giá"))
    P6(("6.0\nThông báo\n& Truyền thông"))
    P7(("7.0\nThống kê\n& Báo cáo"))
    P8(("8.0\nHệ thống\n& Hỗ trợ"))

    %% ═══ Data Stores ═══
    D1[(D1. users)]
    D2[(D2. students)]
    D3[(D3. teachers)]
    D4[(D4. admins)]
    D6[(D6. classes)]
    D7[(D7. topics)]
    D8[(D8. topic_proposals)]
    D9[(D9. projects)]
    D10[(D10. sprints)]
    D11[(D11. sprint_comments)]
    D12[(D12. progress_reports)]
    D13[(D13. comments)]
    D14[(D14. notifications)]
    D15[(D15. announcements)]
    D16[(D16. meeting_slots)]
    D17[(D17. bookings)]
    D18[(D18. project_archive)]
    D19[(D19. teacher_specializations)]

    %% ═══ 1.0 Quản lý Người dùng ═══
    SV & GV & AD -->|"Thông tin đăng nhập"| P1
    P1 -->|"Xác thực, Phân quyền"| SV & GV & AD
    P1 <-->|"CRUD User"| D1
    P1 <-->|"Thông tin SV"| D2
    P1 <-->|"Thông tin GV"| D3
    P1 <-->|"Thông tin Admin"| D4
    P1 -->|"Firebase UID"| FA
    FA -->|"JWT Token"| P1
    AD -->|"Import SV Excel"| P1

    %% ═══ 2.0 Quản lý Đề tài ═══
    GV -->|"Đề xuất đề tài"| P2
    SV -->|"Đề xuất đề tài SV"| P2
    AD -->|"Phê duyệt / Từ chối"| P2
    SV -->|"Đăng ký đề tài"| P2
    P2 -->|"DS đề tài, Trạng thái"| SV
    P2 <-->|"CRUD Đề tài"| D7
    P2 <-->|"Đề xuất SV"| D8
    D2 -.->|"Thông tin SV"| P2
    D3 -.->|"Thông tin GV"| P2

    %% ═══ 3.0 Quản lý Đồ án ═══
    D7 -.->|"Đề tài đã duyệt"| P3
    AD -->|"Phân công GV PB\nLập lịch bảo vệ"| P3
    P3 -->|"Thông tin Đồ án"| SV & GV
    P3 <-->|"CRUD Đồ án"| D9
    P3 <-->|"CRUD Sprint"| D10
    P3 <-->|"Comment Sprint"| D11
    P3 <-->|"Lưu trữ"| D18
    D3 -.->|"GV khả dụng"| P3
    D19 -.->|"Chuyên môn GV"| P3
    AI -.->|"Gợi ý phân công PB"| P3

    %% ═══ 4.0 Theo dõi Tiến độ ═══
    SV -->|"Nộp Báo cáo\nUpload file"| P4
    GV -->|"Nhận xét, Rating\nDuyệt Báo cáo"| P4
    SV & GV -->|"Tin nhắn Chat"| P4
    P4 -->|"Trạng thái tiến độ\nNhận xét GV"| SV
    P4 -->|"DS Báo cáo chưa duyệt"| GV
    P4 <-->|"CRUD Báo cáo"| D12
    P4 <-->|"CRUD Nhận xét"| D13
    D9 -.->|"Thông tin Đồ án"| P4

    %% ═══ 5.0 Chấm điểm ═══
    GV -->|"Điểm HD (40%)\nĐiểm PB (20%)\nNhận xét"| P5
    AD -->|"Điểm HĐ (40%)\nLệnh Tổng hợp"| P5
    P5 -->|"Điểm cuối, Xếp loại"| SV
    P5 <-->|"Cập nhật Score"| D9
    D9 -.->|"Đồ án cần chấm"| P5

    %% ═══ 6.0 Thông báo ═══
    AD -->|"Tạo Thông báo kỳ\nGửi hàng loạt"| P6
    P6 -->|"Thông báo"| SV & GV
    P6 <-->|"CRUD Thông báo"| D14
    P6 <-->|"CRUD Kỳ đồ án"| D15

    %% ═══ 7.0 Thống kê ═══
    AD & GV -->|"Yêu cầu Báo cáo"| P7
    P7 -->|"Dashboard, PDF/Excel"| AD & GV
    D9 -.->|"Dữ liệu Đồ án"| P7
    D7 -.->|"Dữ liệu Đề tài"| P7
    D2 -.->|"Dữ liệu SV"| P7
    GV -->|"Chat AI"| P7
    P7 -->|"Prompt"| AI
    AI -->|"Trả lời"| P7
    P7 -->|"Câu trả lời AI"| GV

    %% ═══ 8.0 Hệ thống ═══
    AD -->|"Quản lý Lớp\nCấu hình"| P8
    P8 <-->|"CRUD Lớp"| D6
    P8 <-->|"CRUD Lịch hẹn"| D16
    P8 <-->|"CRUD Đặt lịch"| D17
    P8 <-->|"Chuyên môn GV"| D19
    GV -->|"Tạo lịch hẹn"| P8
    SV -->|"Đặt lịch hẹn"| P8
    P8 -->|"Xác nhận lịch"| SV & GV
```

---

## 3. DFD MỨC 2 — Phân Rã Chi Tiết Từng Tiến Trình

### 3.1 Phân rã 1.0 — Quản lý Người Dùng

```mermaid
flowchart TD
    SV((Sinh viên))
    GV((Giáo viên))
    AD((Admin))
    FA((Firebase Auth))

    P11(("1.1\nXác thực\nĐăng nhập"))
    P12(("1.2\nQuản lý\nSinh viên"))
    P13(("1.3\nQuản lý\nGiáo viên"))
    P14(("1.4\nQuản lý\nAdmin"))
    P15(("1.5\nCập nhật\nHồ sơ cá nhân"))

    D1[(D1. users)]
    D2[(D2. students)]
    D3[(D3. teachers)]
    D4[(D4. admins)]
    D5[(D5. admin_permissions)]
    D6[(D6. classes)]

    %% Xác thực
    SV & GV & AD -->|"Email / Password"| P11
    P11 -->|"Firebase UID"| FA
    FA -->|"JWT Token, User info"| P11
    P11 <-->|"Kiểm tra / Tạo User"| D1
    P11 -->|"Trạng thái xác thực\nRole, Token"| SV & GV & AD

    %% Quản lý SV
    AD -->|"Thêm SV đơn lẻ\nImport Excel\nKích hoạt/Vô hiệu"| P12
    P12 <-->|"CRUD"| D2
    P12 <-->|"Tạo tài khoản User"| D1
    P12 -.->|"Gán SV vào lớp"| D6
    P12 -->|"DS Sinh viên"| AD

    %% Quản lý GV
    AD -->|"Thêm GV\nPhân quyền HD/PB\nCấu hình max SV"| P13
    P13 <-->|"CRUD"| D3
    P13 <-->|"Tạo tài khoản User"| D1
    P13 -->|"DS Giáo viên"| AD

    %% Quản lý Admin
    AD -->|"Thêm/Xóa Admin\nPhân quyền"| P14
    P14 <-->|"CRUD"| D4
    P14 <-->|"Gán quyền"| D5

    %% Cập nhật Hồ sơ
    SV & GV -->|"Cập nhật phone\navatar, display_name"| P15
    P15 <-->|"Update"| D1
    P15 -->|"Thông tin mới"| SV & GV
```

---

### 3.2 Phân rã 2.0 — Quản lý Đề Tài

```mermaid
flowchart TD
    GV((GV Hướng dẫn))
    SV((Sinh viên))
    AD((Admin))

    P21(("2.1\nĐề xuất\nĐề tài (GV)"))
    P22(("2.2\nĐề xuất\nĐề tài (SV)"))
    P23(("2.3\nPhê duyệt\nĐề tài"))
    P24(("2.4\nĐăng ký\nĐề tài"))
    P25(("2.5\nQuản lý\nThông tin Đề tài"))

    D7[(D7. topics)]
    D8[(D8. topic_proposals)]
    D9[(D9. projects)]
    D15[(D15. announcements)]

    %% GV đề xuất
    GV -->|"Tiêu đề, Mô tả\nLĩnh vực, Yêu cầu\nKết quả mong đợi"| P21
    P21 -->|"Lưu (status=pending)"| D7
    P21 -->|"Trạng thái đề xuất"| GV

    %% SV đề xuất
    SV -->|"Tiêu đề đề tài\nMô tả, Yêu cầu\nGV mong muốn"| P22
    P22 -->|"Lưu đề xuất SV"| D8
    P22 -->|"Trạng thái đề xuất"| SV
    D8 -.->|"Đề xuất SV được duyệt"| P21

    %% Admin phê duyệt
    D7 -->|"DS đề tài Pending"| P23
    AD -->|"Duyệt / Từ chối\nGhi lý do từ chối"| P23
    P23 -->|"Cập nhật status\n(approved/rejected)\nrejection_reason"| D7
    P23 -->|"Kết quả phê duyệt"| GV

    %% SV đăng ký
    D15 -.->|"Thời gian đăng ký"| P24
    D7 -->|"DS đề tài Approved"| P24
    P24 -->|"Hiển thị DS + Bộ lọc\n(field, semester)"| SV
    SV -->|"Chọn đề tài\nĐăng ký"| P24
    P24 -->|"Tăng current_students"| D7
    P24 -->|"Tạo Project mới\n(status=registered)"| D9
    P24 -->|"Trạng thái đăng ký"| SV

    %% Quản lý thông tin
    AD & GV -->|"Xem / Sửa / Xóa"| P25
    P25 <-->|"CRUD"| D7
    P25 -->|"Chi tiết đề tài,\nThống kê theo kỳ"| AD & GV
```

---

### 3.3 Phân rã 3.0 — Quản lý Đồ Án

```mermaid
flowchart TD
    SV((Sinh viên))
    GV((Giáo viên))
    AD((Admin))
    AI((Gemini AI))

    P31(("3.1\nKhởi tạo\nĐồ án"))
    P32(("3.2\nPhân công\nGV Phản biện"))
    P33(("3.3\nQuản lý\nSprint"))
    P34(("3.4\nQuản lý\nTài liệu"))
    P35(("3.5\nLập lịch\nBảo vệ"))
    P36(("3.6\nLưu trữ\n(Archive)"))

    D7[(D7. topics)]
    D9[(D9. projects)]
    D10[(D10. sprints)]
    D11[(D11. sprint_comments)]
    D3[(D3. teachers)]
    D18[(D18. project_archive)]
    D19[(D19. teacher_specializations)]

    %% Khởi tạo
    D7 -.->|"Đề tài đã duyệt,\nSV đã đăng ký"| P31
    AD -->|"Xác nhận tạo Đồ án"| P31
    P31 -->|"Tạo Project\n(status=in_progress)\nGán supervisor_id"| D9
    P31 -->|"Thông tin Đồ án"| SV & GV

    %% Phân công PB
    AD -->|"Phân công thủ công\nPhân công hàng loạt"| P32
    D9 -->|"DS Đồ án chưa có PB"| P32
    D3 -->|"DS GV khả dụng\n(can_review=1)"| P32
    D19 -.->|"Chuyên môn GV"| P32
    P32 -->|"Prompt gợi ý"| AI
    AI -->|"Kết quả gợi ý PB"| P32
    P32 -->|"Cập nhật reviewer_id"| D9
    P32 -->|"Thông báo phân công"| GV

    %% Sprint
    SV -->|"Tạo Sprint\n(title, goals,\nstart_week, end_week)"| P33
    SV -->|"Cập nhật tiến độ\n(actual_progress, status)"| P33
    GV -->|"Comment sprint"| P33
    SV -->|"Comment sprint"| P33
    P33 <-->|"CRUD Sprint"| D10
    P33 <-->|"CRUD Comment"| D11
    P33 -->|"Sprint hiện tại"| SV & GV

    %% Tài liệu
    SV & GV -->|"Upload tài liệu\n(PDF, DOCX, ZIP)"| P34
    SV & GV -->|"Download tài liệu"| P34
    P34 -->|"Lưu file_path\nvào Server /uploads"| D9

    %% Lập lịch
    AD -->|"Tạo lịch bảo vệ\nPhân vào hội đồng"| P35
    P35 -->|"Cập nhật defense_date"| D9
    P35 -->|"Lịch bảo vệ"| SV & GV

    %% Archive
    AD -->|"Lệnh Archive\n(đơn lẻ / hàng loạt)"| P36
    D9 -->|"Đồ án completed"| P36
    P36 -->|"Snapshot dữ liệu:\ntopic_title, student_name\nsupervisor, scores"| D18
    P36 -->|"Cập nhật archived_at"| D9
```

---

### 3.4 Phân rã 4.0 — Theo Dõi Tiến Độ

```mermaid
flowchart TD
    SV((Sinh viên))
    GV((GV Hướng dẫn))

    P41(("4.1\nNộp\nBáo cáo"))
    P42(("4.2\nNhận xét\n& Duyệt Báo cáo"))
    P43(("4.3\nChat\nRealtime"))
    P44(("4.4\nĐặt lịch\nhẹn GV"))

    D9[(D9. projects)]
    D12[(D12. progress_reports)]
    D13[(D13. comments)]
    D16[(D16. meeting_slots)]
    D17[(D17. bookings)]

    %% Nộp Báo cáo
    SV -->|"Tiêu đề, Nội dung\nTuần (week_number)\nThành tựu, Khó khăn\nKế hoạch tiếp theo"| P41
    SV -->|"Upload file báo cáo\n(PDF, DOCX, ZIP)"| P41
    D9 -.->|"project_id"| P41
    P41 -->|"Lưu (status=submitted)\nfile_path, file_name, file_size"| D12
    P41 -->|"Xác nhận nộp"| SV

    %% Nhận xét
    D12 -->|"DS Báo cáo submitted"| P42
    P42 -->|"Hiển thị Báo cáo\nchưa duyệt"| GV
    GV -->|"Nội dung nhận xét\nRating (1-5 sao)\nDuyệt / Yêu cầu sửa"| P42
    P42 -->|"Lưu nhận xét"| D13
    P42 -->|"Cập nhật status:\napproved / revision_needed\nreviewed_date"| D12
    P42 -->|"Phản hồi, Rating,\nNhận xét GV"| SV

    %% Chat
    SV <-->|"Gửi / Nhận\nTin nhắn"| P43
    GV <-->|"Gửi / Nhận\nTin nhắn"| P43
    P43 -->|"Lưu / Đọc Message\n(qua Firebase Firestore)"| D9

    %% Đặt lịch hẹn
    GV -->|"Tạo slot\n(start, end, location)"| P44
    P44 <-->|"CRUD Slot"| D16
    P44 -->|"DS slot khả dụng"| SV
    SV -->|"Chọn slot\nĐặt lịch"| P44
    P44 -->|"Lưu booking\n(status=pending)"| D17
    P44 -->|"Xác nhận lịch hẹn"| SV & GV
```

---

### 3.5 Phân rã 5.0 — Chấm Điểm & Đánh Giá

```mermaid
flowchart TD
    GVHD((GV Hướng dẫn))
    GVPB((GV Phản biện))
    AD((Admin))
    SV((Sinh viên))

    P51(("5.1\nChấm điểm\nHướng dẫn"))
    P52(("5.2\nChấm điểm\nPhản biện"))
    P53(("5.3\nChấm điểm\nHội đồng"))
    P54(("5.4\nTổng hợp\n& Công bố"))

    D9[(D9. projects)]

    %% Điểm HD
    D9 -->|"Đồ án có\nsupervisor_id = GV"| P51
    GVHD -->|"supervisor_score\n(thang 10)\nNhận xét HD"| P51
    P51 -->|"Cập nhật\nsupervisor_score"| D9

    %% Điểm PB
    D9 -->|"Đồ án có\nreviewer_id = GV"| P52
    GVPB -->|"reviewer_score\n(thang 10)\nCâu hỏi phản biện\nNhận xét PB"| P52
    P52 -->|"Cập nhật\nreviewer_score"| D9

    %% Điểm HĐ
    AD -->|"council_score\n(thang 10)"| P53
    P53 -->|"Cập nhật\ncouncil_score"| D9

    %% Tổng hợp
    D9 -->|"supervisor_score\nreviewer_score\ncouncil_score"| P54
    AD -->|"Lệnh Tổng hợp\nLệnh Công bố"| P54
    P54 -->|"Tính:\nfinal_score = HD×40% + PB×20% + HĐ×40%\nXếp loại grade (A→F)\nCập nhật final_score, grade\nstatus = completed"| D9
    P54 -->|"Bảng điểm\nXếp loại"| SV
    P54 -->|"Export PDF/Excel"| AD
```

---

### 3.6 Phân rã 6.0 — Thông Báo & Truyền Thông

```mermaid
flowchart TD
    AD((Admin))
    SV((Sinh viên))
    GV((Giáo viên))

    P61(("6.1\nQuản lý\nThông báo Kỳ"))
    P62(("6.2\nGửi\nThông báo HT"))
    P63(("6.3\nXem & Đánh dấu\nThông báo"))

    D14[(D14. notifications)]
    D15[(D15. announcements)]

    %% Thông báo kỳ
    AD -->|"Tạo kỳ đồ án mới:\ntitle, semester, academic_year\nregistration_start / end\nproposal_deadline"| P61
    AD -->|"Đóng / Gia hạn\nstatus: draft→published→closed"| P61
    P61 <-->|"CRUD"| D15
    P61 -->|"Thông báo kỳ mới"| SV & GV

    %% Gửi thông báo HT
    AD -->|"Gửi thông báo\n(đơn lẻ / hàng loạt)\ntitle, message, type"| P62
    P62 -->|"Tạo notification\ncho từng user_uid"| D14
    P62 -->|"Thông báo đẩy"| SV & GV

    %% Xem thông báo
    SV & GV -->|"Xem DS thông báo"| P63
    D14 -->|"DS notifications\n(user_uid, is_read)"| P63
    SV & GV -->|"Đánh dấu đã đọc"| P63
    P63 -->|"Cập nhật is_read=1"| D14
    P63 -->|"DS thông báo"| SV & GV
```

---

### 3.7 Phân rã 7.0 — Thống Kê & Báo Cáo

```mermaid
flowchart TD
    AD((Admin))
    GV((Giáo viên))
    SV((Sinh viên))
    AI((Gemini AI))

    P71(("7.1\nDashboard\nTổng quan"))
    P72(("7.2\nThống kê\nĐăng ký"))
    P73(("7.3\nThống kê\nKết quả"))
    P74(("7.4\nExport\nBáo cáo"))
    P75(("7.5\nAI\nAssistant"))

    D2[(D2. students)]
    D3[(D3. teachers)]
    D7[(D7. topics)]
    D9[(D9. projects)]
    D12[(D12. progress_reports)]

    %% Dashboard
    AD -->|"Xem tổng quan"| P71
    GV -->|"Xem SV mình quản lý"| P71
    SV -->|"Xem đồ án cá nhân"| P71
    D9 & D7 & D2 & D3 -.->|"Dữ liệu tổng hợp"| P71
    P71 -->|"Số liệu Dashboard:\nTổng SV, GV, Đề tài\nĐồ án theo trạng thái"| AD & GV & SV

    %% Thống kê Đăng ký
    AD -->|"Xem thống kê đăng ký"| P72
    D7 -.->|"Đề tài theo semester,\nfield, status"| P72
    D9 -.->|"Đồ án theo status"| P72
    P72 -->|"Tỷ lệ đăng ký\nĐề tài còn trống\nThống kê theo GV"| AD

    %% Thống kê Kết quả
    AD -->|"Xem kết quả"| P73
    D9 -.->|"final_score, grade\nstatus=completed"| P73
    P73 -->|"Phân bố điểm\nTỷ lệ đạt/trượt\nSo sánh giữa kỳ"| AD

    %% Export
    AD -->|"Yêu cầu Export"| P74
    D9 & D7 & D2 -.->|"Dữ liệu"| P74
    P74 -->|"File PDF / Excel"| AD

    %% AI
    GV & AD -->|"Nhập prompt Chat"| P75
    P75 -->|"Prompt + Context"| AI
    AI -->|"Câu trả lời"| P75
    P75 -->|"Phản hồi AI"| GV & AD
    D12 -.->|"Tiến độ SV (cho AI)"| P75
    D9 -.->|"Đồ án (cho AI)"| P75
```

---

### 3.8 Phân rã 8.0 — Hệ Thống & Hỗ Trợ

```mermaid
flowchart TD
    AD((Admin))
    GV((Giáo viên))

    P81(("8.1\nQuản lý\nLớp học"))
    P82(("8.2\nCấu hình\nHệ thống"))
    P83(("8.3\nQuản lý\nFile Upload"))
    P84(("8.4\nQuản lý\nChuyên môn GV"))

    D3[(D3. teachers)]
    D6[(D6. classes)]
    D19[(D19. teacher_specializations)]

    %% Quản lý Lớp
    AD -->|"Tạo lớp mới:\nclass_code, class_name\nmajor, academic_year"| P81
    AD -->|"Gán GV cố vấn\n(advisor_teacher_id)"| P81
    P81 <-->|"CRUD"| D6
    D3 -.->|"DS GV (advisor)"| P81
    P81 -->|"DS Lớp, Sinh viên\ntheo lớp"| AD

    %% Cấu hình
    AD -->|"Công thức tính điểm\nSố SV tối đa/GV\nGiới hạn file upload"| P82
    P82 -->|"Cập nhật max_students"| D3
    P82 -->|"Cấu hình đã lưu"| AD

    %% File upload
    P83 -->|"Validate:\nđịnh dạng, kích thước"| P83
    P83 -->|"Lưu file vào\n/uploads (Multer)"| P83
    P83 -->|"Phục vụ tải file\nqua /uploads endpoint"| P83

    %% Chuyên môn GV
    AD & GV -->|"Thêm/Xóa chuyên môn"| P84
    P84 <-->|"CRUD"| D19
    P84 -->|"DS chuyên môn"| AD & GV
```

---

## 4. Ma Trận Luồng Dữ Liệu — Tổng Hợp

### 4.1 Ma trận Thực thể → Tiến trình

| Thực thể | P1.0 | P2.0 | P3.0 | P4.0 | P5.0 | P6.0 | P7.0 | P8.0 |
|----------|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|
| **Sinh viên** | ✅ I/O | ✅ I/O | ✅ O | ✅ I/O | ✅ O | ✅ O | ✅ O | ✅ I |
| **GV Hướng dẫn** | ✅ I/O | ✅ I | ✅ I/O | ✅ I/O | ✅ I | ✅ O | ✅ I/O | ✅ I |
| **GV Phản biện** | ✅ I/O | — | ✅ O | — | ✅ I | ✅ O | — | — |
| **Admin** | ✅ I/O | ✅ I | ✅ I | — | ✅ I | ✅ I | ✅ I/O | ✅ I |
| **Firebase Auth** | ✅ I/O | — | — | — | — | — | — | — |
| **Gemini AI** | — | — | ✅ I/O | — | — | — | ✅ I/O | — |

> **I** = Input (gửi dữ liệu vào), **O** = Output (nhận dữ liệu ra), **I/O** = Cả hai chiều

### 4.2 Ma trận Tiến trình → Kho dữ liệu

| Kho dữ liệu | P1.0 | P2.0 | P3.0 | P4.0 | P5.0 | P6.0 | P7.0 | P8.0 |
|-------------|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|
| D1. users | R/W | R | — | — | — | — | — | — |
| D2. students | R/W | R | — | — | — | — | R | — |
| D3. teachers | R/W | R | R | — | — | — | R | R/W |
| D4. admins | R/W | — | — | — | — | — | — | — |
| D5. admin_permissions | R/W | — | — | — | — | — | — | — |
| D6. classes | R | — | — | — | — | — | — | R/W |
| D7. topics | — | R/W | R | — | — | — | R | — |
| D8. topic_proposals | — | R/W | — | — | — | — | — | — |
| D9. projects | — | W | R/W | R | R/W | — | R | — |
| D10. sprints | — | — | R/W | — | — | — | — | — |
| D11. sprint_comments | — | — | R/W | — | — | — | — | — |
| D12. progress_reports | — | — | — | R/W | — | — | R | — |
| D13. comments | — | — | — | R/W | — | — | — | — |
| D14. notifications | — | — | — | — | — | R/W | — | — |
| D15. announcements | — | — | — | — | — | R/W | — | — |
| D16. meeting_slots | — | — | — | R/W | — | — | — | R/W |
| D17. bookings | — | — | — | R/W | — | — | — | R/W |
| D18. project_archive | — | — | R/W | — | — | — | — | — |
| D19. teacher_specializations | — | — | R | — | — | — | — | R/W |

> **R** = Read, **W** = Write, **R/W** = Cả đọc và ghi
