# Use Case Diagram - Hệ Thống Quản Lý Đồ Án Sinh Viên

## Actors (Các Tác Nhân)

### 1. Sinh Viên
- Đăng ký đồ án
- Xem thông báo đồ án
- Nộp báo cáo tiến độ
- Xem nhận xét từ giáo viên
- Xem điểm đánh giá

### 2. Giáo Viên Hướng Dẫn
- Đăng ký hướng dẫn đồ án
- Đề xuất đề tài
- Duyệt sinh viên đăng ký
- Theo dõi tiến độ sinh viên
- Nhận xét báo cáo
- Chấm điểm hướng dẫn

### 3. Giáo Viên Phản Biện
- Nhận phân công phản biện
- Xem tài liệu đồ án
- Chấm điểm phản biện
- Nhận xét đánh giá

### 4. Quản Trị Viên/Ban Quản Lý
- Tạo thông báo đồ án
- Phân công giáo viên phản biện
- Quản lý danh sách đề tài
- Phê duyệt đề tài
- Quản lý tiến độ chung
- Tổng hợp điểm
- Xuất báo cáo thống kê

## Use Cases Chính

### UC1: Đăng Ký Đồ Án
**Actor:** Sinh Viên
**Mô tả:** Sinh viên xem danh sách đề tài và đăng ký đồ án sau khi nhà trường đưa ra thông báo
**Precondition:** 
- Sinh viên đã đăng nhập
- Thông báo đồ án đã được công bố
- Trong thời gian đăng ký

**Flow:**
1. Sinh viên xem thông báo đồ án
2. Sinh viên xem danh sách đề tài có sẵn
3. Sinh viên chọn đề tài hoặc đề xuất đề tài mới
4. Sinh viên chọn giáo viên hướng dẫn (nếu được phép)
5. Hệ thống gửi yêu cầu đăng ký
6. Giáo viên hướng dẫn xét duyệt
7. Hệ thống thông báo kết quả

### UC2: Quản Lý Thông Báo Đồ Án
**Actor:** Quản Trị Viên
**Mô tả:** Tạo và công bố thông báo về đồ án
**Flow:**
1. Tạo thông báo mới
2. Nhập thông tin (thời gian đăng ký, nộp báo cáo, bảo vệ)
3. Công bố thông báo
4. Hệ thống gửi thông báo đến sinh viên

### UC3: Đề Xuất Đề Tài
**Actor:** Giáo Viên Hướng Dẫn
**Mô tả:** Giáo viên đề xuất đề tài đồ án
**Flow:**
1. Giáo viên tạo đề tài mới
2. Nhập thông tin đề tài (tên, mô tả, yêu cầu, số lượng sinh viên)
3. Gửi đề xuất
4. Quản trị viên phê duyệt
5. Đề tài được công bố

### UC4: Theo Dõi Tiến Độ
**Actor:** Giáo Viên Hướng Dẫn, Sinh Viên
**Mô tả:** Theo dõi và cập nhật tiến độ thực hiện đồ án
**Flow (Sinh viên):**
1. Sinh viên nộp báo cáo tiến độ
2. Giáo viên xem và nhận xét
3. Sinh viên xem phản hồi

### UC5: Phân Công Phản Biện
**Actor:** Quản Trị Viên
**Mô tả:** Phân công giáo viên phản biện cho các đồ án
**Flow:**
1. Xem danh sách đồ án cần phản biện
2. Chọn giáo viên phản biện
3. Gửi thông báo phân công
4. Giáo viên phản biện nhận nhiệm vụ

### UC6: Chấm Điểm Đồ Án
**Actor:** Giáo Viên Hướng Dẫn, Giáo Viên Phản Biện
**Mô tả:** Đánh giá và chấm điểm đồ án
**Flow:**
1. Giáo viên xem tài liệu đồ án
2. Nhập điểm và nhận xét
3. Hệ thống tổng hợp điểm
4. Công bố điểm cho sinh viên

### UC7: Báo Cáo Thống Kê
**Actor:** Quản Trị Viên
**Mô tả:** Tạo báo cáo thống kê về đồ án
**Flow:**
1. Chọn loại báo cáo
2. Chọn kỳ/năm học
3. Hệ thống tổng hợp dữ liệu
4. Xuất báo cáo

## Relationships

- **Include:** 
  - Tất cả use case include "Đăng nhập"
  - "Đăng ký đồ án" include "Xem danh sách đề tài"
  
- **Extend:**
  - "Đăng ký đồ án" extend "Đề xuất đề tài mới" (nếu cho phép)
  - "Chấm điểm" extend "Nhận xét chi tiết"

- **Generalization:**
  - "Giáo viên hướng dẫn" và "Giáo viên phản biện" có thể kế thừa từ "Giáo viên"
