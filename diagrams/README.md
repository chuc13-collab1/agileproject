# PHÂN TÍCH & THIẾT KẾ HỆ THỐNG — UML
## Hệ thống Quản lý Đồ án Tốt nghiệp theo mô hình Agile

---

## Phương pháp phân tích: Hướng Đối tượng (OOP + UML)

Hệ thống được phân tích theo phương pháp **hướng đối tượng**, sử dụng ngôn ngữ mô hình hóa **UML** với các loại sơ đồ sau:

---

## Danh sách tài liệu

| File | Nội dung | Số sơ đồ |
|---|---|---|
| [UML_01_USECASE_TONG_QUAT.md](UML_01_USECASE_TONG_QUAT.md) | Use case tổng quát toàn hệ thống | 1 |
| [UML_02_USECASE_THEO_ACTOR.md](UML_02_USECASE_THEO_ACTOR.md) | Use case theo từng người dùng (SV, GV, Admin) | 3 |
| [UML_03_USECASE_THEO_CHUC_NANG.md](UML_03_USECASE_THEO_CHUC_NANG.md) | Use case theo 7 module chức năng | 7 |
| [UML_04_SEQUENCE_DIAGRAMS.md](UML_04_SEQUENCE_DIAGRAMS.md) | Sơ đồ tuần tự (Sequence diagrams) cho 8 luồng chính | 8 |
| [UML_05_CLASS_DIAGRAM.md](UML_05_CLASS_DIAGRAM.md) | Class diagram tổng thể + mô tả OOP | 1 |

> **Cách render:** Tất cả sơ đồ sử dụng cú pháp **PlantUML**.
> - Online: https://www.plantuml.com/plantuml/uml/
> - VS Code: Extension **PlantUML** (jebbs.plantuml)
> - IntelliJ IDEA: Plugin PlantUML Integration

---

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + TypeScript)               │
│  /admin/*  │  /teacher/*  │  /student/*  │  /chat  │  /ai   │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP (Axios) + Firebase Auth JWT
┌─────────────────────────▼───────────────────────────────────┐
│              SERVER (Node.js + Express)                      │
│  verifyToken  →  /api/topics | projects | sprints | ...      │
└──────────┬──────────────────────────────────────┬───────────┘
           │ SQL                                  │ Firebase SDK
┌──────────▼──────────┐              ┌────────────▼───────────┐
│   MySQL Database    │              │      Firebase           │
│  agile_project_mgmt │              │  Auth | Storage | RTDB  │
└─────────────────────┘              └────────────────────────┘
```

---

## Các tác nhân

| Tác nhân | Vai trò |
|---|---|
| **Sinh viên (Student)** | Đăng ký đề tài, nộp báo cáo, lập Sprint, đặt lịch |
| **Giảng viên (Teacher)** | Tạo đề tài, duyệt báo cáo, chấm điểm, quản lý lịch |
| **Quản trị viên (Admin)** | Quản lý toàn hệ thống: users, classes, topics, projects |
| **Firebase** | Xác thực, lưu file, chat realtime |
| **Google Gemini AI** | Chatbot hỗ trợ người dùng |

---

## 26 Use Cases tổng hợp

| # | Use Case | Tác nhân |
|---|---|---|
| UC01 | Đăng nhập | SV, GV, Admin |
| UC02 | Đăng ký tài khoản | SV |
| UC03 | Phân quyền theo vai trò | Hệ thống |
| UC04 | Quản lý thông báo đăng ký | Admin |
| UC05 | Quản lý lớp học | Admin |
| UC06 | Phân lớp cho sinh viên | Admin |
| UC07 | Tạo đề tài | GV, Admin |
| UC08 | Duyệt/Từ chối đề tài | Admin |
| UC09 | Đăng ký đề tài | SV |
| UC10 | Đề xuất đề tài mới | SV |
| UC11 | Quản lý đồ án | Admin, GV |
| UC12 | Lập kế hoạch Sprint | SV |
| UC13 | Theo dõi/Comment Sprint | GV |
| UC14 | Nộp báo cáo tiến độ | SV |
| UC15 | Duyệt báo cáo tiến độ | GV |
| UC16 | Quản lý tài liệu | SV |
| UC17 | Phân công GV phản biện | Admin |
| UC18 | Chấm điểm | GV (GVHD + GV PB) |
| UC19 | Xem kết quả đồ án | SV |
| UC20 | Tạo slot lịch hẹn | GV |
| UC21 | Đặt lịch hẹn (Booking) | SV |
| UC22 | Chat realtime | SV, GV |
| UC23 | Hỏi AI Chatbot | SV, GV |
| UC24 | Xem thống kê | Admin, GV |
| UC25 | Lưu trữ đồ án | Admin |
| UC26 | Gửi thông báo hệ thống | Admin |

---

## 8 Sequence Diagrams

| # | Luồng nghiệp vụ |
|---|---|
| SD01 | Đăng nhập & Phân quyền |
| SD02 | Đăng ký Đề tài (Sinh Viên) |
| SD03 | Nộp Báo cáo Tiến độ |
| SD04 | Duyệt Báo cáo (Giảng Viên) |
| SD05 | Lập kế hoạch Sprint Agile |
| SD06 | Đề xuất Đề tài mới (SV → GV) |
| SD07 | Admin Phân công GV Phản biện |
| SD08 | Chấm điểm & Tính điểm tổng |

---

## 13 Classes chính

`User` · `Student` · `Teacher` · `Admin` · `Class` · `Topic` · `TopicProposal` · `Project` · `Sprint` · `SprintComment` · `ProgressReport` · `Comment` · `MeetingSlot` · `Booking` · `Announcement` · `Notification` · `ProjectArchive`
