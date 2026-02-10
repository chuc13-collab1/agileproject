# Chi Tiết Đặc Tả Use Case

## UC-01: Đăng Ký Đồ Án

### Thông Tin Cơ Bản
- **Use Case ID**: UC-01
- **Use Case Name**: Đăng ký đồ án
- **Actor**: Sinh viên
- **Priority**: High
- **Status**: Required

### Mô Tả
Sinh viên xem danh sách đề tài có sẵn và đăng ký đồ án với giáo viên hướng dẫn

### Preconditions (Điều Kiện Tiên Quyết)
1. Sinh viên đã đăng nhập vào hệ thống
2. Thông báo đồ án cho kỳ hiện tại đã được công bố
3. Đang trong thời gian đăng ký (registration_start ≤ current_date ≤ registration_end)
4. Sinh viên chưa có đồ án nào trong kỳ này
5. Đề tài đã được phê duyệt (status = 'approved')

### Postconditions (Điều Kiện Sau)
1. Một bản ghi mới được tạo trong bảng Project với status = 'registered'
2. Số lượng sinh viên đăng ký của đề tài được cập nhật
3. Thông báo được gửi đến giáo viên hướng dẫn
4. Sinh viên nhận được xác nhận đăng ký

### Main Flow (Luồng Chính)
1. Sinh viên chọn "Đăng ký đồ án"
2. Hệ thống hiển thị thông báo đồ án hiện tại
3. Sinh viên chọn "Xem danh sách đề tài"
4. Hệ thống hiển thị danh sách đề tài đã được duyệt, kèm thông tin:
   - Mã đề tài
   - Tên đề tài
   - Giáo viên hướng dẫn
   - Mô tả
   - Yêu cầu
   - Số lượng slot còn lại
5. Sinh viên lọc/tìm kiếm đề tài theo:
   - Lĩnh vực
   - Giáo viên
   - Từ khóa
6. Sinh viên chọn một đề tài
7. Hệ thống hiển thị chi tiết đề tài
8. Sinh viên xác nhận đăng ký
9. Hệ thống kiểm tra:
   - Đề tài còn slot không
   - Sinh viên đủ điều kiện không
   - Trong thời gian đăng ký không
10. Hệ thống tạo Project mới
11. Hệ thống gửi thông báo đến giáo viên hướng dẫn
12. Hệ thống hiển thị thông báo thành công

### Alternative Flows (Luồng Thay Thế)

#### Alt-01A: Đề tài đã hết slot
- **At step 9**: Nếu đề tài đã hết slot:
  1. Hệ thống hiển thị thông báo "Đề tài đã đủ số lượng sinh viên"
  2. Quay lại bước 4

#### Alt-01B: Ngoài thời gian đăng ký
- **At step 9**: Nếu không trong thời gian đăng ký:
  1. Hệ thống hiển thị thông báo "Đã hết hạn đăng ký"
  2. Use case kết thúc

#### Alt-01C: Sinh viên đã có đồ án trong kỳ
- **At step 9**: Nếu sinh viên đã đăng ký đồ án khác:
  1. Hệ thống hiển thị "Bạn đã đăng ký đồ án khác trong kỳ này"
  2. Use case kết thúc

#### Alt-01D: Đề xuất đề tài mới
- **At step 6**: Sinh viên chọn "Đề xuất đề tài mới":
  1. Sinh viên nhập thông tin đề tài
  2. Sinh viên chọn giáo viên hướng dẫn mong muốn
  3. Hệ thống gửi đề xuất đến giáo viên và admin
  4. Chờ phê duyệt (chuyển sang UC-03)

### Exception Flows (Luồng Ngoại Lệ)
- **E1**: Lỗi kết nối database
  - Hiển thị thông báo lỗi
  - Ghi log
  - Yêu cầu thử lại
  
- **E2**: Session timeout
  - Redirect đến trang đăng nhập
  - Lưu trạng thái hiện tại

### Business Rules
- BR-01: Một sinh viên chỉ được đăng ký 1 đồ án trong 1 kỳ
- BR-02: Chỉ được đăng ký đề tài đã được phê duyệt
- BR-03: Phải trong thời gian đăng ký
- BR-04: Đề tài phải còn slot trống

---

## UC-02: Quản Lý Thông Báo Đồ Án

### Thông Tin Cơ Bản
- **Use Case ID**: UC-02
- **Use Case Name**: Quản lý thông báo đồ án
- **Actor**: Quản trị viên
- **Priority**: High
- **Status**: Required

### Mô Tả
Quản trị viên tạo và công bố thông báo về đồ án cho mỗi học kỳ

### Preconditions
1. Quản trị viên đã đăng nhập
2. Có quyền tạo thông báo

### Postconditions
1. Thông báo mới được tạo trong bảng Announcement
2. Tất cả sinh viên và giáo viên nhận được thông báo
3. Sinh viên có thể bắt đầu đăng ký đồ án

### Main Flow
1. Admin chọn "Tạo thông báo đồ án"
2. Hệ thống hiển thị form nhập liệu:
   - Tiêu đề
   - Nội dung
   - Học kỳ
   - Năm học
   - Thời gian bắt đầu đăng ký
   - Thời gian kết thúc đăng ký
   - Hạn nộp báo cáo
   - Ngày bảo vệ (dự kiến)
3. Admin nhập thông tin
4. Hệ thống validate:
   - Ngày bắt đầu < Ngày kết thúc
   - Các trường bắt buộc không để trống
5. Admin chọn "Lưu nháp" hoặc "Công bố"
6. Nếu chọn "Công bố":
   - Hệ thống tạo Announcement với status = 'published'
   - Gửi Notification đến tất cả User có role = 'student' và 'teacher'
   - Gửi email thông báo
7. Hệ thống hiển thị thông báo thành công

### Alternative Flows

#### Alt-02A: Lưu nháp
- **At step 5**: Admin chọn "Lưu nháp":
  1. Hệ thống lưu với status = 'draft'
  2. Không gửi thông báo
  3. Admin có thể chỉnh sửa và công bố sau

#### Alt-02B: Chỉnh sửa thông báo
- **Pre-condition**: Đã có thông báo
  1. Admin chọn thông báo cần sửa
  2. Hệ thống hiển thị form với dữ liệu hiện tại
  3. Admin cập nhật thông tin
  4. Hệ thống lưu và gửi thông báo cập nhật

#### Alt-02C: Đóng đăng ký sớm
  1. Admin chọn "Đóng đăng ký"
  2. Hệ thống cập nhật status = 'closed'
  3. Sinh viên không thể đăng ký thêm

---

## UC-03: Đề Xuất Đề Tài

### Thông Tin Cơ Bản
- **Use Case ID**: UC-03
- **Use Case Name**: Đề xuất đề tài
- **Actor**: Giáo viên hướng dẫn
- **Priority**: High
- **Status**: Required

### Preconditions
1. Giáo viên đã đăng nhập
2. Có thông báo đồ án đã được công bố

### Postconditions
1. Đề tài mới được tạo với status = 'pending'
2. Admin nhận được thông báo để phê duyệt

### Main Flow
1. Giáo viên chọn "Đề xuất đề tài"
2. Hệ thống hiển thị form:
   - Mã đề tài (tự động)
   - Tên đề tài
   - Mô tả chi tiết
   - Yêu cầu với sinh viên
   - Kết quả dự kiến
   - Lĩnh vực
   - Số lượng sinh viên tối đa
3. Giáo viên nhập thông tin
4. Giáo viên có thể đính kèm tài liệu mô tả
5. Hệ thống validate dữ liệu
6. Giáo viên gửi đề xuất
7. Hệ thống tạo Topic với:
   - status = 'pending'
   - proposed_by = teacher_id
8. Hệ thống gửi thông báo đến Admin
9. Hiển thị thông báo thành công

### Alternative Flows

#### Alt-03A: Admin duyệt đề tài
  1. Admin xem danh sách đề tài chờ duyệt
  2. Admin chọn đề tài
  3. Admin xem chi tiết
  4. Admin chọn "Phê duyệt" hoặc "Từ chối"
  5. Nếu phê duyệt:
     - status = 'approved'
     - approved_by = admin_id
     - approved_at = current_timestamp
  6. Nếu từ chối:
     - status = 'rejected'
     - Nhập lý do từ chối
  7. Gửi thông báo đến giáo viên

---

## UC-04: Theo Dõi Tiến Độ

### Thông Tin Cơ Bản
- **Use Case ID**: UC-04
- **Use Case Name**: Theo dõi tiến độ đồ án
- **Actor**: Sinh viên, Giáo viên hướng dẫn
- **Priority**: High
- **Status**: Required

### Sub Use Cases
- UC-04A: Nộp báo cáo tiến độ (Sinh viên)
- UC-04B: Nhận xét báo cáo (Giáo viên)

### UC-04A: Nộp Báo Cáo Tiến Độ

#### Main Flow
1. Sinh viên đăng nhập và chọn đồ án của mình
2. Hệ thống hiển thị thông tin đồ án và lịch sử báo cáo
3. Sinh viên chọn "Nộp báo cáo mới"
4. Hệ thống hiển thị form:
   - Tuần thứ (tự động)
   - Tiêu đề
   - Nội dung đã làm
   - Kết quả đạt được
   - Khó khăn gặp phải
   - Kế hoạch tuần tiếp theo
5. Sinh viên nhập thông tin
6. Sinh viên đính kèm file (nếu có)
7. Sinh viên gửi báo cáo
8. Hệ thống tạo Progress_Report với status = 'submitted'
9. Gửi thông báo đến giáo viên hướng dẫn
10. Hiển thị thông báo thành công

### UC-04B: Nhận Xét Báo Cáo

#### Main Flow
1. Giáo viên xem danh sách sinh viên hướng dẫn
2. Giáo viên chọn một sinh viên
3. Hệ thống hiển thị các báo cáo chưa xem
4. Giáo viên chọn một báo cáo
5. Hệ thống hiển thị chi tiết báo cáo
6. Giáo viên nhập nhận xét
7. Giáo viên chọn rating (1-5 sao)
8. Giáo viên chọn status:
   - Approved (Đạt)
   - Revision needed (Cần sửa)
9. Hệ thống lưu Comment
10. Gửi thông báo đến sinh viên
11. Hiển thị thành công

---

## UC-05: Phân Công Phản Biện

### Thông Tin Cơ Bản
- **Use Case ID**: UC-05
- **Use Case Name**: Phân công giáo viên phản biện
- **Actor**: Quản trị viên
- **Priority**: Medium
- **Status**: Required

### Main Flow
1. Admin chọn "Phân công phản biện"
2. Hệ thống hiển thị danh sách đồ án status = 'submitted' chưa có phản biện
3. Admin chọn một hoặc nhiều đồ án
4. Admin chọn "Tự động phân công" hoặc "Phân công thủ công"
5. Nếu tự động:
   - Hệ thống gợi ý giáo viên phù hợp dựa trên:
     - Chuyên môn
     - Số lượng đồ án đang phản biện
     - Không trùng với giáo viên hướng dẫn
6. Nếu thủ công:
   - Admin chọn từng giáo viên cho từng đồ án
7. Hệ thống validate:
   - Reviewer ≠ Supervisor
   - Giáo viên chưa quá tải
8. Hệ thống cập nhật reviewer_id trong Project
9. Gửi thông báo đến giáo viên phản biện và sinh viên
10. Hiển thị thành công

---

## UC-06: Chấm Điểm Đồ Án

### Thông Tin Cơ Bản
- **Use Case ID**: UC-06
- **Use Case Name**: Chấm điểm đồ án
- **Actor**: Giáo viên hướng dẫn, Giáo viên phản biện
- **Priority**: High
- **Status**: Required

### Main Flow
1. Giáo viên đăng nhập
2. Chọn danh sách đồ án cần chấm
3. Hệ thống hiển thị các đồ án với status = 'submitted'
4. Giáo viên chọn một đồ án
5. Hệ thống hiển thị:
   - Thông tin sinh viên
   - Thông tin đề tài
   - Tài liệu đồ án
   - Báo cáo tiến độ
6. Giáo viên xem tài liệu
7. Giáo viên nhập điểm theo tiêu chí:
   - Điểm nội dung (0-10)
   - Điểm trình bày (0-10)
   - Điểm thuyết trình (0-10)
8. Hệ thống tính tổng điểm
9. Giáo viên nhập nhận xét chi tiết
10. Giáo viên gửi điểm
11. Hệ thống lưu vào Evaluation
12. Nếu là giáo viên hướng dẫn:
    - Cập nhật Project.supervisor_score
13. Nếu là giáo viên phản biện:
    - Cập nhật Project.reviewer_score
14. Nếu đã có đủ cả 2 điểm:
    - Tính final_score = supervisor_score * 0.7 + reviewer_score * 0.3
    - Xác định grade (A, B+, B, C+, C, D+, D, F)
    - Cập nhật status = 'completed' hoặc 'failed'
15. Gửi thông báo đến sinh viên (nếu đã có điểm cuối)

---

## UC-07: Báo Cáo Thống Kê

### Thông Tin Cơ Bản
- **Use Case ID**: UC-07
- **Use Case Name**: Báo cáo thống kê
- **Actor**: Quản trị viên
- **Priority**: Low
- **Status**: Optional

### Main Flow
1. Admin chọn "Báo cáo thống kê"
2. Hệ thống hiển thị các loại báo cáo:
   - Thống kê đăng ký theo kỳ
   - Thống kê theo giáo viên
   - Thống kê theo lĩnh vực
   - Thống kê điểm
   - Thống kê tiến độ
3. Admin chọn loại báo cáo
4. Admin chọn bộ lọc:
   - Học kỳ
   - Năm học
   - Khoa
5. Hệ thống tổng hợp dữ liệu
6. Hiển thị báo cáo với:
   - Biểu đồ
   - Bảng số liệu
7. Admin có thể:
   - Xuất PDF
   - Xuất Excel
   - In báo cáo

### Ví Dụ Báo Cáo

#### Báo Cáo Thống Kê Đăng Ký
- Tổng số đề tài
- Tổng số đăng ký
- Số đề tài đã đủ sinh viên
- Số đề tài chưa có sinh viên
- Biểu đồ đăng ký theo ngày

#### Báo Cáo Theo Giáo Viên
- Số lượng đề tài đề xuất
- Số sinh viên hướng dẫn
- Số đồ án phản biện
- Điểm trung bình của sinh viên

#### Báo Cáo Kết Quả
- Phân bố điểm (A, B, C, D, F)
- Tỷ lệ đạt/không đạt
- Điểm trung bình chung
- Top sinh viên xuất sắc
