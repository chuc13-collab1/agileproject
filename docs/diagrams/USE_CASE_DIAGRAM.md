# Biểu Đồ Use Case — Hệ Thống Quản Lý Đồ Án

---

## 1. Tổng Quan Actors

| Actor | Mô tả |
|-------|-------|
| **Student** | Sinh viên thực hiện đồ án |
| **Supervisor** | Giáo viên hướng dẫn |
| **Reviewer** | Giáo viên phản biện |
| **Admin** | Quản trị viên hệ thống |
| **Firebase Auth** | Hệ thống xác thực (External) |
| **Gemini AI** | Trợ lý AI (External) |

---

## 2. Biểu Đồ Use Case Tổng Quan

```plantuml
@startuml USE_CASE_OVERVIEW

skinparam actorStyle awesome
skinparam packageStyle rectangle
skinparam usecase {
  BackgroundColor #EEF4FF
  BorderColor #2563eb
  ArrowColor #374151
  ActorBorderColor #1e3a5f
  ActorFontColor #1e3a5f
}

left to right direction

actor "Sinh Viên\n(Student)" as SV
actor "GV Hướng Dẫn\n(Supervisor)" as GVHD
actor "GV Phản Biện\n(Reviewer)" as GVPB
actor "Quản Trị Viên\n(Admin)" as AD
actor "Firebase Auth" as FA <<system>>
actor "Gemini AI" as AI <<system>>

rectangle "HỆ THỐNG QUẢN LÝ ĐỒ ÁN" {

  package "Xác thực" {
    usecase "UC01\nĐăng nhập" as UC01
    usecase "UC02\nĐăng xuất" as UC02
    usecase "UC03\nCập nhật\nthông tin cá nhân" as UC03
  }

  package "Quản lý Đề Tài" {
    usecase "UC10\nXem thông báo\nkỳ đồ án" as UC10
    usecase "UC11\nĐề xuất đề tài" as UC11
    usecase "UC12\nPhê duyệt đề tài" as UC12
    usecase "UC13\nĐăng ký đề tài" as UC13
    usecase "UC14\nHủy đăng ký\nđề tài" as UC14
  }

  package "Quản lý Đồ Án" {
    usecase "UC20\nXem đồ án\ncủa mình" as UC20
    usecase "UC21\nQuản lý Sprint" as UC21
    usecase "UC22\nUpload tài liệu" as UC22
    usecase "UC23\nDownload tài liệu" as UC23
    usecase "UC24\nPhân công\nGV phản biện" as UC24
    usecase "UC25\nLập lịch\nbảo vệ" as UC25
    usecase "UC26\nArchive đồ án" as UC26
  }

  package "Theo Dõi Tiến Độ" {
    usecase "UC30\nNộp báo cáo\ntiến độ" as UC30
    usecase "UC31\nNhận xét\nbáo cáo" as UC31
    usecase "UC32\nChat realtime\nvới GV HD" as UC32
  }

  package "Chấm Điểm" {
    usecase "UC40\nChấm điểm\nhướng dẫn" as UC40
    usecase "UC41\nChấm điểm\nphản biện" as UC41
    usecase "UC42\nXem điểm\ncủa mình" as UC42
    usecase "UC43\nTổng hợp &\ncông bố điểm" as UC43
  }

  package "Thông Báo" {
    usecase "UC50\nTạo thông báo\nđồ án" as UC50
    usecase "UC51\nNhận thông báo\nhệ thống" as UC51
  }

  package "Thống Kê & AI" {
    usecase "UC60\nXem dashboard\nthống kê" as UC60
    usecase "UC61\nExport báo cáo\n(PDF / Excel)" as UC61
    usecase "UC62\nChat AI\ntrợ lý" as UC62
    usecase "UC63\nGợi ý phân công\nGV phản biện (AI)" as UC63
  }

  package "Quản Trị" {
    usecase "UC70\nQuản lý\nsinh viên" as UC70
    usecase "UC71\nQuản lý\ngiáo viên" as UC71
    usecase "UC72\nQuản lý lớp" as UC72
    usecase "UC73\nCấu hình\nhệ thống" as UC73
  }
}

' ── Student ──
SV --> UC01
SV --> UC02
SV --> UC03
SV --> UC10
SV --> UC13
SV --> UC14
SV --> UC20
SV --> UC21
SV --> UC22
SV --> UC23
SV --> UC30
SV --> UC32
SV --> UC42
SV --> UC51
SV --> UC60

' ── Supervisor ──
GVHD --> UC01
GVHD --> UC02
GVHD --> UC03
GVHD --> UC10
GVHD --> UC11
GVHD --> UC20
GVHD --> UC21
GVHD --> UC22
GVHD --> UC23
GVHD --> UC31
GVHD --> UC32
GVHD --> UC40
GVHD --> UC51
GVHD --> UC60
GVHD --> UC62

' ── Reviewer ──
GVPB --> UC01
GVPB --> UC02
GVPB --> UC23
GVPB --> UC41
GVPB --> UC51
GVPB --> UC60

' ── Admin ──
AD --> UC01
AD --> UC02
AD --> UC12
AD --> UC24
AD --> UC25
AD --> UC26
AD --> UC43
AD --> UC50
AD --> UC51
AD --> UC60
AD --> UC61
AD --> UC63
AD --> UC70
AD --> UC71
AD --> UC72
AD --> UC73

' ── External Systems ──
UC01 ..> FA : <<use>>
UC62 ..> AI : <<use>>
UC63 ..> AI : <<use>>

' ── include / extend ──
UC13 ..> UC10 : <<include>>
UC30 ..> UC22 : <<extend>>
UC40 ..> UC43 : <<include>>
UC41 ..> UC43 : <<include>>
UC63 ..> UC24 : <<extend>>

@enduml
```

---

## 3. Biểu Đồ Use Case Chi Tiết — Từng Actor

### 3.1 Student (Sinh viên)

```plantuml
@startuml UC_STUDENT

skinparam actorStyle awesome
left to right direction

actor "Sinh Viên" as SV

rectangle "CHỨC NĂNG SINH VIÊN" {

  package "Tài khoản" {
    usecase "UC01 Đăng nhập" as UC01
    usecase "UC02 Đăng xuất" as UC02
    usecase "UC03 Cập nhật thông tin cá nhân" as UC03
  }

  package "Đề tài & Đăng ký" {
    usecase "UC10 Xem thông báo kỳ đồ án" as UC10
    usecase "UC13 Xem danh sách đề tài đã duyệt" as UC13
    usecase "UC13a Tìm kiếm / lọc đề tài" as UC13a
    usecase "UC13b Đăng ký đề tài" as UC13b
    usecase "UC13c Đề xuất đề tài mới" as UC13c
    usecase "UC14 Xem trạng thái đăng ký" as UC14
  }

  package "Thực Hiện Đồ Án" {
    usecase "UC20 Xem thông tin đồ án" as UC20
    usecase "UC21 Xem / Cập nhật sprint" as UC21
    usecase "UC22 Upload tài liệu" as UC22
    usecase "UC23 Download tài liệu" as UC23
    usecase "UC30 Nộp báo cáo tiến độ" as UC30
    usecase "UC30a Upload file báo cáo" as UC30a
    usecase "UC31 Xem nhận xét của GV" as UC31
    usecase "UC32 Chat với GV hướng dẫn" as UC32
  }

  package "Kết Quả" {
    usecase "UC42 Xem điểm hướng dẫn" as UC42a
    usecase "UC42b Xem điểm phản biện" as UC42b
    usecase "UC42c Xem điểm cuối cùng" as UC42c
    usecase "UC42d Xem xếp loại" as UC42d
  }

  package "Thông Báo" {
    usecase "UC51 Nhận thông báo hệ thống" as UC51
    usecase "UC51a Đánh dấu đã đọc" as UC51a
  }
}

SV --> UC01
SV --> UC02
SV --> UC03
SV --> UC10
SV --> UC13
SV --> UC14
SV --> UC20
SV --> UC21
SV --> UC22
SV --> UC23
SV --> UC30
SV --> UC31
SV --> UC32
SV --> UC42a
SV --> UC42b
SV --> UC42c
SV --> UC42d
SV --> UC51

UC13 ..> UC13a : <<include>>
UC13 ..> UC13b : <<include>>
UC13 ..> UC13c : <<extend>>
UC30 ..> UC30a : <<extend>>
UC51 ..> UC51a : <<extend>>

@enduml
```

---

### 3.2 Supervisor — GV Hướng Dẫn

```plantuml
@startuml UC_SUPERVISOR

skinparam actorStyle awesome
left to right direction

actor "GV Hướng Dẫn" as GVHD

rectangle "CHỨC NĂNG GV HƯỚNG DẪN" {

  package "Đề Tài" {
    usecase "UC11 Đề xuất đề tài mới" as UC11
    usecase "UC11a Chỉnh sửa đề tài\n(chờ duyệt)" as UC11a
    usecase "UC11b Upload tài liệu\nmô tả đề tài" as UC11b
    usecase "UC11c Xem trạng thái\nphê duyệt" as UC11c
  }

  package "Quản Lý Sinh Viên" {
    usecase "UC20 Xem danh sách SV\nđang hướng dẫn" as UC20
    usecase "UC20a Duyệt đơn đăng ký\ncủa sinh viên" as UC20a
    usecase "UC20b Từ chối đơn đăng ký" as UC20b
    usecase "UC20c Xem hồ sơ\nsinh viên" as UC20c
  }

  package "Theo Dõi Tiến Độ" {
    usecase "UC31 Xem báo cáo\ntiến độ" as UC31
    usecase "UC31a Nhận xét +\nRating (1-5 sao)" as UC31a
    usecase "UC31b Duyệt / Yêu cầu\nsửa báo cáo" as UC31b
    usecase "UC31c Download file\nbáo cáo" as UC31c
    usecase "UC32 Chat với\nsinh viên" as UC32
    usecase "UC21 Xem / comment\nsprint" as UC21
  }

  package "Chấm Điểm" {
    usecase "UC40 Chấm điểm hướng dẫn" as UC40
    usecase "UC40a Nhập điểm\ntheo tiêu chí" as UC40a
    usecase "UC40b Viết nhận xét\ntổng quan" as UC40b
    usecase "UC40c Gửi điểm\ncho SV" as UC40c
  }

  package "Tài Liệu & Thống Kê" {
    usecase "UC23 Download tài liệu\nđồ án" as UC23
    usecase "UC60 Xem dashboard\ncá nhân" as UC60
    usecase "UC62 Chat AI trợ lý" as UC62
  }
}

GVHD --> UC11
GVHD --> UC20
GVHD --> UC20a
GVHD --> UC20b
GVHD --> UC20c
GVHD --> UC31
GVHD --> UC32
GVHD --> UC21
GVHD --> UC40
GVHD --> UC23
GVHD --> UC60
GVHD --> UC62

UC11 ..> UC11a : <<extend>>
UC11 ..> UC11b : <<extend>>
UC11 ..> UC11c : <<include>>
UC20a ..> UC20b : <<extend>>
UC31 ..> UC31a : <<include>>
UC31 ..> UC31b : <<include>>
UC31 ..> UC31c : <<extend>>
UC40 ..> UC40a : <<include>>
UC40 ..> UC40b : <<include>>
UC40 ..> UC40c : <<include>>

@enduml
```

---

### 3.3 Reviewer — GV Phản Biện

```plantuml
@startuml UC_REVIEWER

skinparam actorStyle awesome
left to right direction

actor "GV Phản Biện" as GVPB

rectangle "CHỨC NĂNG GV PHẢN BIỆN" {

  package "Xem Đồ Án Được Phân Công" {
    usecase "UC41a Xem danh sách\nđồ án được phân công" as UC41a
    usecase "UC41b Xem chi tiết\nđồ án" as UC41b
    usecase "UC41c Lọc theo kỳ /\ntrạng thái" as UC41c
  }

  package "Nghiên Cứu Tài Liệu" {
    usecase "UC23 Download tài liệu\nđồ án" as UC23
    usecase "UC23a Xem lịch sử tiến độ\nsinh viên" as UC23a
    usecase "UC23b Xem nhận xét\ncủa GV hướng dẫn" as UC23b
  }

  package "Chấm Điểm Phản Biện" {
    usecase "UC41 Chấm điểm phản biện" as UC41
    usecase "UC41d Nhập điểm\ntheo tiêu chí" as UC41d
    usecase "UC41e Viết câu hỏi\nphản biện" as UC41e
    usecase "UC41f Viết nhận xét\nchi tiết" as UC41f
    usecase "UC41g Gửi điểm\nphản biện" as UC41g
  }

  package "Thông Báo & Thống Kê" {
    usecase "UC51 Nhận thông báo\nphân công" as UC51
    usecase "UC60 Xem thống kê\nđã phản biện" as UC60
  }
}

GVPB --> UC41a
GVPB --> UC41b
GVPB --> UC41c
GVPB --> UC23
GVPB --> UC23a
GVPB --> UC23b
GVPB --> UC41
GVPB --> UC51
GVPB --> UC60

UC41a ..> UC41b : <<include>>
UC41b ..> UC41c : <<extend>>
UC23 ..> UC23a : <<extend>>
UC23 ..> UC23b : <<extend>>
UC41 ..> UC41d : <<include>>
UC41 ..> UC41e : <<include>>
UC41 ..> UC41f : <<include>>
UC41 ..> UC41g : <<include>>

@enduml
```

---

### 3.4 Admin — Quản Trị Viên

```plantuml
@startuml UC_ADMIN

skinparam actorStyle awesome
left to right direction

actor "Admin" as AD
actor "Gemini AI" as AI <<system>>

rectangle "CHỨC NĂNG ADMIN" {

  package "Quản Lý Người Dùng" {
    usecase "UC70 Quản lý sinh viên" as UC70
    usecase "UC70a Import SV từ Excel" as UC70a
    usecase "UC70b Kích hoạt /\nVô hiệu TK" as UC70b
    usecase "UC71 Quản lý giáo viên" as UC71
    usecase "UC71a Phân quyền\nHD / PB" as UC71a
    usecase "UC72 Quản lý lớp" as UC72
  }

  package "Quản Lý Đề Tài & Đồ Án" {
    usecase "UC12 Phê duyệt đề tài" as UC12
    usecase "UC12a Từ chối +\nghi lý do" as UC12a
    usecase "UC24 Phân công\nGV phản biện" as UC24
    usecase "UC24a Phân công\ntự động (AI)" as UC24a
    usecase "UC24b Phân công\nthủ công" as UC24b
    usecase "UC24c Phân công\nhàng loạt" as UC24c
  }

  package "Lập Lịch & Lưu Trữ" {
    usecase "UC25 Lập lịch bảo vệ" as UC25
    usecase "UC25a Tạo hội đồng\nbảo vệ" as UC25a
    usecase "UC25b Phân đồ án\nvào hội đồng" as UC25b
    usecase "UC26 Archive đồ án" as UC26
    usecase "UC26a Batch archive\nhàng loạt" as UC26a
  }

  package "Thông Báo" {
    usecase "UC50 Tạo thông báo\nkỳ đồ án" as UC50
    usecase "UC50a Gửi thông báo\nhàng loạt" as UC50a
    usecase "UC50b Gia hạn /\nĐóng đăng ký" as UC50b
  }

  package "Điểm & Báo Cáo" {
    usecase "UC43 Tổng hợp &\ncông bố điểm" as UC43
    usecase "UC61 Export báo cáo\n(PDF / Excel)" as UC61
    usecase "UC60 Xem dashboard\ntổng quan" as UC60
    usecase "UC63 AI gợi ý\nphân công PB" as UC63
  }

  package "Cấu Hình" {
    usecase "UC73 Cấu hình\nhệ thống" as UC73
    usecase "UC73a Công thức\ntính điểm" as UC73a
    usecase "UC73b Giới hạn\nfile upload" as UC73b
  }
}

AD --> UC70
AD --> UC71
AD --> UC72
AD --> UC12
AD --> UC24
AD --> UC25
AD --> UC26
AD --> UC50
AD --> UC43
AD --> UC61
AD --> UC60
AD --> UC63
AD --> UC73

UC70 ..> UC70a : <<include>>
UC70 ..> UC70b : <<include>>
UC71 ..> UC71a : <<include>>
UC12 ..> UC12a : <<extend>>
UC24 ..> UC24a : <<extend>>
UC24 ..> UC24b : <<extend>>
UC24 ..> UC24c : <<extend>>
UC24a ..> AI : <<use>>
UC63 ..> AI : <<use>>
UC25 ..> UC25a : <<include>>
UC25 ..> UC25b : <<include>>
UC26 ..> UC26a : <<extend>>
UC50 ..> UC50a : <<extend>>
UC50 ..> UC50b : <<extend>>
UC73 ..> UC73a : <<include>>
UC73 ..> UC73b : <<include>>

@enduml
```

---

## 4. Bảng Danh Sách Use Case

| ID | Tên Use Case | Actor chính | Mức độ |
|----|-------------|-------------|--------|
| UC01 | Đăng nhập | Tất cả | Cao |
| UC02 | Đăng xuất | Tất cả | Thấp |
| UC03 | Cập nhật thông tin cá nhân | Tất cả | Thấp |
| UC10 | Xem thông báo kỳ đồ án | SV, GVHD | Trung bình |
| UC11 | Đề xuất đề tài mới | GVHD, SV | Cao |
| UC12 | Phê duyệt đề tài | Admin | Cao |
| UC13 | Đăng ký đề tài | SV | Cao |
| UC14 | Xem trạng thái đăng ký | SV | Thấp |
| UC20 | Xem thông tin đồ án | SV, GVHD | Trung bình |
| UC21 | Quản lý sprint | SV, GVHD | Trung bình |
| UC22 | Upload tài liệu | SV, GVHD | Trung bình |
| UC23 | Download tài liệu | SV, GVHD, GVPB | Trung bình |
| UC24 | Phân công GV phản biện | Admin | Cao |
| UC25 | Lập lịch bảo vệ | Admin | Trung bình |
| UC26 | Archive đồ án | Admin | Thấp |
| UC30 | Nộp báo cáo tiến độ | SV | Cao |
| UC31 | Nhận xét báo cáo tiến độ | GVHD | Cao |
| UC32 | Chat realtime | SV, GVHD | Trung bình |
| UC40 | Chấm điểm hướng dẫn (40%) | GVHD | Cao |
| UC41 | Chấm điểm phản biện (20%) | GVPB | Cao |
| UC42 | Xem điểm của mình | SV | Trung bình |
| UC43 | Tổng hợp & công bố điểm | Admin | Cao |
| UC50 | Tạo thông báo kỳ đồ án | Admin | Cao |
| UC51 | Nhận thông báo hệ thống | Tất cả | Thấp |
| UC60 | Xem dashboard thống kê | Tất cả | Trung bình |
| UC61 | Export báo cáo (PDF/Excel) | Admin | Thấp |
| UC62 | Chat AI trợ lý Gemini | GVHD, Admin | Thấp |
| UC63 | AI gợi ý phân công PB | Admin | Trung bình |
| UC70 | Quản lý sinh viên | Admin | Cao |
| UC71 | Quản lý giáo viên | Admin | Cao |
| UC72 | Quản lý lớp | Admin | Trung bình |
| UC73 | Cấu hình hệ thống | Admin | Trung bình |

---

## 5. Mối Quan Hệ `<<include>>` và `<<extend>>`

```mermaid
flowchart LR
    subgraph include["<<include>> — luôn thực hiện"]
        A["UC13 Đăng ký đề tài"] -->|include| B["UC13a Tìm kiếm / lọc"]
        C["UC31 Nhận xét báo cáo"] -->|include| D["UC31a Rating 1-5 sao"]
        E["UC40 Chấm điểm HD"] -->|include| F["UC40c Gửi điểm"]
        G["UC43 Tổng hợp điểm"] -->|include| H["UC40 Điểm HD\n+ UC41 Điểm PB"]
    end

    subgraph extend["<<extend>> — thực hiện khi có điều kiện"]
        I["UC30 Nộp báo cáo"] -->|extend| J["UC30a Upload file"]
        K["UC24 Phân công PB"] -->|extend| L["UC24a Tự động AI"]
        M["UC13 Đăng ký"] -->|extend| N["UC13c Đề xuất\nđề tài mới"]
        O["UC12 Phê duyệt"] -->|extend| P["UC12a Từ chối\n+ ghi lý do"]
    end
```

---

## 6. Luồng Use Case Chính (Main Flows)

### Flow 1: Đăng Ký Đề Tài
```
Admin → UC50 (Tạo thông báo kỳ đồ án)
   ↓
GVHD → UC11 (Đề xuất đề tài)
   ↓
Admin → UC12 (Phê duyệt đề tài)
   ↓
SV    → UC13 (Xem & đăng ký đề tài) → UC14 (Theo dõi trạng thái)
```

### Flow 2: Thực Hiện Đồ Án
```
SV    → UC21 (Tạo sprint) → UC30 (Nộp báo cáo tuần)
   ↓
GVHD → UC31 (Nhận xét + Rating) → UC32 (Chat hỗ trợ)
   ↓
SV    → UC22 (Upload tài liệu cuối kỳ)
```

### Flow 3: Chấm Điểm & Công Bố Kết Quả
```
Admin → UC24 (Phân công GV phản biện)
   ↓
GVHD  → UC40 (Chấm điểm HD — 40%)
GVPB  → UC41 (Chấm điểm PB — 20%)
[HĐ]  → Điểm HĐ — 40%
   ↓
Admin → UC43 (Tổng hợp → final score → xếp loại)
   ↓
SV    → UC42 (Xem điểm & xếp loại)
```
