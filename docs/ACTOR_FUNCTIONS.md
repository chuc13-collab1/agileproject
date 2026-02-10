# Chức Năng Chính Của Từng Actor

## 📌 Tổng Quan

Hệ thống quản lý đồ án có **4 actors chính**, mỗi actor có các chức năng và quyền hạn riêng biệt.

---

## 👨‍🎓 1. SINH VIÊN (Student)

### Chức Năng Chính:

#### 📢 Quản Lý Thông Tin Cá Nhân
- Đăng nhập/Đăng xuất hệ thống
- Xem và cập nhật thông tin cá nhân
- Đổi mật khẩu
- Cập nhật ảnh đại diện

#### 📋 Đăng Ký Đồ Án
- Xem thông báo đồ án từ nhà trường
- Xem danh sách đề tài có sẵn (đã được duyệt)
- Tìm kiếm và lọc đề tài theo:
  - Lĩnh vực
  - Giáo viên hướng dẫn
  - Từ khóa
- Xem chi tiết đề tài (mô tả, yêu cầu, số slot còn lại)
- Đăng ký đề tài mong muốn
- Đề xuất đề tài mới (nếu được phép)
- Xem trạng thái đăng ký

#### 📊 Theo Dõi Tiến Độ
- Xem thông tin đồ án đã đăng ký
- Nộp báo cáo tiến độ theo tuần/giai đoạn:
  - Nhập tiêu đề báo cáo
  - Mô tả công việc đã làm
  - Kết quả đạt được
  - Khó khăn gặp phải
  - Kế hoạch tuần tiếp theo
- Upload file báo cáo (PDF, DOCX)
- Xem lịch sử các báo cáo đã nộp
- Xem nhận xét của giáo viên hướng dẫn
- Xem rating/đánh giá từ giáo viên

#### 📁 Quản Lý Tài Liệu
- Upload tài liệu đồ án:
  - Báo cáo đề cương
  - Báo cáo cuối kỳ
  - Slide thuyết trình
  - Source code
  - Tài liệu khác
- Quản lý phiên bản tài liệu
- Download tài liệu đã upload
- Xóa/cập nhật tài liệu

#### 📈 Xem Kết Quả
- Xem điểm hướng dẫn (từ GV hướng dẫn)
- Xem điểm phản biện (từ GV phản biện)
- Xem điểm hội đồng (nếu có)
- Xem điểm cuối cùng
- Xem xếp loại (A, B+, B, C+, C, D+, D, F)
- Xem nhận xét đánh giá chi tiết

#### 🔔 Thông Báo
- Nhận thông báo khi:
  - Có thông báo đồ án mới
  - Đăng ký đồ án thành công
  - GV nhận xét báo cáo
  - GV chấm điểm
  - Được phân công GV phản biện
  - Có thông báo quan trọng từ hệ thống

### Quyền Hạn:
- ✅ Đọc: Thông báo, đề tài, điểm số, nhận xét của mình
- ✅ Tạo: Đăng ký đồ án, báo cáo tiến độ, upload tài liệu
- ✅ Sửa: Thông tin cá nhân, báo cáo (trước khi GV duyệt)
- ❌ Không thể: Xem thông tin sinh viên khác, sửa điểm, phê duyệt

---

## 👨‍🏫 2. GIÁO VIÊN HƯỚNG DẪN (Supervisor)

### Chức Năng Chính:

#### 📢 Quản Lý Thông Tin
- Đăng nhập/Đăng xuất
- Xem và cập nhật thông tin cá nhân
- Cập nhật chuyên môn, lĩnh vực nghiên cứu
- Cập nhật số lượng sinh viên tối đa có thể hướng dẫn

#### 🎯 Đề Xuất Đề Tài
- Xem các kỳ đồ án đang mở đăng ký
- Đề xuất đề tài mới cho từng kỳ:
  - Nhập tên đề tài
  - Mô tả chi tiết
  - Yêu cầu với sinh viên
  - Kết quả dự kiến
  - Lĩnh vực
  - Số lượng sinh viên (1-2)
- Upload tài liệu mô tả đề tài (optional)
- Xem trạng thái đề tài (chờ duyệt, đã duyệt, bị từ chối)
- Chỉnh sửa đề tài (trước khi duyệt)
- Xem lý do từ chối (nếu bị từ chối)

#### 👥 Quản Lý Sinh Viên
- Xem danh sách sinh viên đăng ký đề tài của mình
- Duyệt/Từ chối đơn đăng ký của sinh viên
- Xem thông tin chi tiết sinh viên:
  - Mã sinh viên
  - Lớp
  - GPA
  - Lịch sử đồ án (nếu có)
- Xem danh sách sinh viên đang hướng dẫn
- Thống kê số lượng sinh viên theo kỳ

#### 📊 Theo Dõi Tiến Độ Sinh Viên
- Xem dashboard sinh viên hướng dẫn
- Xem danh sách báo cáo chưa xem (có badge thông báo)
- Xem chi tiết từng báo cáo tiến độ:
  - Nội dung báo cáo
  - File đính kèm
  - Ngày nộp
  - Tuần thứ mấy
- Download file báo cáo
- Xem lịch sử báo cáo của sinh viên

#### 💬 Nhận Xét và Đánh Giá Tiến Độ
- Nhận xét báo cáo tiến độ:
  - Viết nhận xét chi tiết
  - Đánh giá rating (1-5 sao)
  - Chọn trạng thái:
    - ✅ Đạt (Approved)
    - ⚠️ Cần sửa (Revision Needed)
- Đề xuất cải thiện
- Gửi nhận xét cho sinh viên
- Xem lịch sử nhận xét

#### 📝 Chấm Điểm Hướng Dẫn
- Xem danh sách đồ án cần chấm điểm
- Xem tài liệu đồ án đầy đủ:
  - Báo cáo cuối kỳ
  - Slide thuyết trình
  - Source code
  - Lịch sử tiến độ
- Chấm điểm theo tiêu chí:
  - Nội dung (0-10)
  - Kỹ thuật (0-10)
  - Trình bày báo cáo (0-10)
  - Thuyết trình (0-10)
- Nhập trọng số cho từng tiêu chí
- Hệ thống tự động tính tổng điểm
- Viết nhận xét tổng quát:
  - Điểm mạnh
  - Điểm yếu
  - Đề xuất cải thiện
- Gửi điểm và nhận xét

#### 📈 Thống Kê
- Xem thống kê cá nhân:
  - Số đề tài đã đề xuất
  - Số sinh viên đang hướng dẫn
  - Số sinh viên đã hoàn thành
  - Điểm trung bình sinh viên
  - Tỷ lệ đạt/không đạt

#### 🔔 Thông Báo
- Nhận thông báo khi:
  - Có sinh viên đăng ký đề tài
  - Sinh viên nộp báo cáo tiến độ
  - Đề tài được duyệt/từ chối
  - Có thông báo từ admin

### Quyền Hạn:
- ✅ Đọc: Thông tin sinh viên hướng dẫn, báo cáo, tài liệu
- ✅ Tạo: Đề tài mới, nhận xét, điểm hướng dẫn
- ✅ Sửa: Đề tài của mình, nhận xét của mình
- ✅ Duyệt: Đơn đăng ký sinh viên
- ❌ Không thể: Xem sinh viên của GV khác, sửa điểm phản biện, phê duyệt đề tài

---

## 👨‍🏫 3. GIÁO VIÊN PHẢN BIỆN (Reviewer)

### Chức Năng Chính:

#### 📢 Quản Lý Thông Tin
- Đăng nhập/Đăng xuất
- Xem và cập nhật thông tin cá nhân

#### 📋 Xem Đồ Án Được Phân Công
- Xem danh sách đồ án được phân công phản biện
- Xem thông tin chi tiết đồ án:
  - Tên đề tài
  - Sinh viên
  - Giáo viên hướng dẫn
  - Thời gian bảo vệ
- Xem trạng thái phản biện (chưa chấm, đã chấm)
- Lọc theo kỳ, trạng thái

#### 📁 Xem Tài Liệu Đồ Án
- Download và xem tài liệu:
  - Báo cáo đồ án
  - Slide thuyết trình
  - Source code
  - Tài liệu liên quan
- Xem lịch sử tiến độ sinh viên
- Xem nhận xét của GV hướng dẫn

#### 📝 Chấm Điểm Phản Biện
- Xem chi tiết đồ án cần phản biện
- Đọc và đánh giá tài liệu
- Chấm điểm theo tiêu chí:
  - Nội dung (0-10)
  - Kỹ thuật (0-10)
  - Trình bày (0-10)
  - Bảo vệ (0-10)
- Nhập trọng số (hoặc dùng mặc định)
- Hệ thống tự động tính tổng điểm

#### 💬 Nhận Xét Đánh Giá
- Viết nhận xét chi tiết:
  - Điểm mạnh của đồ án
  - Điểm yếu, hạn chế
  - Câu hỏi trong buổi bảo vệ
  - Đề xuất cải thiện
- Đánh giá tổng quan
- Gửi điểm và nhận xét

#### 📊 Thống Kê
- Xem danh sách đồ án đã phản biện
- Số lượng đồ án theo kỳ
- Điểm trung bình đã chấm

#### 🔔 Thông Báo
- Nhận thông báo khi:
  - Được phân công phản biện đồ án mới
  - Gần đến hạn chấm điểm
  - Có cập nhật tài liệu từ sinh viên

### Quyền Hạn:
- ✅ Đọc: Thông tin đồ án được phân công, tài liệu, báo cáo
- ✅ Tạo: Điểm phản biện, nhận xét
- ✅ Sửa: Điểm và nhận xét của mình (trước deadline)
- ❌ Không thể: Xem đồ án không được phân công, sửa điểm hướng dẫn

---

## 👨‍💼 4. QUẢN TRỊ VIÊN (Admin)

### Chức Năng Chính:

#### 📢 Quản Lý Hệ Thống
- Đăng nhập/Đăng xuất
- Xem dashboard tổng quan hệ thống
- Cấu hình hệ thống
- Quản lý phân quyền

#### 👥 Quản Lý Người Dùng
- **Quản lý sinh viên:**
  - Thêm sinh viên mới (import từ Excel)
  - Xem danh sách sinh viên
  - Sửa thông tin sinh viên
  - Kích hoạt/Vô hiệu hóa tài khoản
  - Reset mật khẩu
  - Tìm kiếm và lọc
  
- **Quản lý giáo viên:**
  - Thêm giáo viên mới
  - Xem danh sách giáo viên
  - Cập nhật thông tin (khoa, chuyên môn, số lượng SV tối đa)
  - Kích hoạt/Vô hiệu hóa tài khoản
  - Phân quyền (hướng dẫn, phản biện, cả hai)

- **Quản lý admin:**
  - Thêm/xóa admin khác
  - Phân quyền chi tiết

#### 📣 Quản Lý Thông Báo Đồ Án
- Tạo thông báo đồ án mới:
  - Nhập tiêu đề
  - Nội dung chi tiết
  - Học kỳ (1, 2, hè)
  - Năm học
  - Thời gian bắt đầu đăng ký
  - Thời gian kết thúc đăng ký
  - Hạn nộp báo cáo cuối kỳ
  - Ngày bảo vệ dự kiến
  - Upload tài liệu đính kèm
- Lưu nháp/Công bố ngay
- Chỉnh sửa thông báo (đã công bố)
- Đóng đăng ký sớm
- Gia hạn thời gian đăng ký
- Gửi thông báo đến tất cả user (email + in-app)
- Xem lịch sử thông báo

#### 🎯 Quản Lý Đề Tài
- Xem danh sách tất cả đề tài
- Lọc theo:
  - Trạng thái (chờ duyệt, đã duyệt, từ chối)
  - Học kỳ
  - Giáo viên
  - Lĩnh vực
- Xem chi tiết đề tài
- **Phê duyệt đề tài:**
  - Duyệt đề tài phù hợp
  - Từ chối và ghi rõ lý do
  - Yêu cầu chỉnh sửa
- Chỉnh sửa đề tài (nếu cần)
- Xóa đề tài (chưa có SV đăng ký)
- Thống kê đề tài theo kỳ

#### 📋 Quản Lý Đồ Án
- Xem danh sách tất cả đồ án
- Xem chi tiết từng đồ án:
  - Thông tin sinh viên
  - Đề tài
  - GV hướng dẫn
  - GV phản biện
  - Trạng thái
  - Điểm số
- Lọc theo nhiều tiêu chí
- Tìm kiếm đồ án
- Theo dõi tiến độ chung
- Xem báo cáo tiến độ
- Xem tài liệu đã nộp

#### 👨‍🏫 Phân Công Giáo Viên Phản Biện
- Xem danh sách đồ án cần phản biện
- **Phân công tự động:**
  - Hệ thống gợi ý GV phù hợp dựa trên:
    - Chuyên môn phù hợp với đề tài
    - Số lượng đồ án đang phản biện
    - Không trùng GV hướng dẫn
    - Cùng khoa/bộ môn
  - Xem top 5 gợi ý với điểm phù hợp
  - Chọn từ danh sách gợi ý

- **Phân công thủ công:**
  - Chọn đồ án
  - Chọn GV phản biện từ danh sách
  - Hệ thống validate (không trùng GV hướng dẫn)
  
- Phân công hàng loạt
- Thay đổi GV phản biện (nếu cần)
- Gửi thông báo phân công
- Theo dõi trạng thái phản biện

#### 🏛️ Quản Lý Hội Đồng Bảo Vệ
- Tạo hội đồng bảo vệ:
  - Tên hội đồng
  - Địa điểm
  - Ngày bảo vệ
  - Học kỳ
- Phân công thành viên hội đồng:
  - Chủ tịch
  - Thư ký
  - Ủy viên
- Phân đồ án vào hội đồng
- Lập lịch bảo vệ chi tiết
- In biên bản họp hội đồng

#### 📊 Tổng Hợp Điểm
- Xem tổng hợp điểm tất cả đồ án
- Kiểm tra điểm:
  - Điểm hướng dẫn
  - Điểm phản biện
  - Điểm hội đồng
- Hệ thống tự động tính điểm cuối:
  - Công thức: `final = supervisor × 0.4 + reviewer × 0.2 + council × 0.4`
  - (hoặc tùy chỉnh công thức)
- Xác định xếp loại (A, B+, B, C+, C, D+, D, F)
- Công bố điểm cho sinh viên
- Xuất bảng điểm (Excel, PDF)

#### 📈 Báo Cáo Thống Kê
- **Thống kê đăng ký:**
  - Tổng số đề tài theo kỳ
  - Tổng số đăng ký
  - Tỷ lệ đăng ký/đề tài
  - Số đề tài còn trống
  - Biểu đồ đăng ký theo thời gian

- **Thống kê theo giáo viên:**
  - Số đề tài đề xuất
  - Số sinh viên hướng dẫn/phản biện
  - Điểm trung bình của sinh viên
  - Tỷ lệ hoàn thành

- **Thống kê kết quả:**
  - Phân bố điểm (A, B, C, D, F)
  - Tỷ lệ đạt/không đạt
  - Điểm trung bình chung
  - Top sinh viên xuất sắc
  - So sánh giữa các kỳ

- **Thống kê theo lĩnh vực:**
  - Lĩnh vực được quan tâm nhất
  - Kết quả theo lĩnh vực
  - Xu hướng theo năm

- **Xuất báo cáo:**
  - Export PDF
  - Export Excel
  - In báo cáo
  - Gửi email báo cáo

#### 🔔 Quản Lý Thông Báo
- Xem tất cả thông báo trong hệ thống
- Gửi thông báo hàng loạt:
  - Tất cả sinh viên
  - Tất cả giáo viên
  - Theo khoa/lớp
  - Theo điều kiện cụ thể
- Xóa thông báo cũ
- Cấu hình email template

#### ⚙️ Cấu Hình Hệ Thống
- Cấu hình chung:
  - Công thức tính điểm
  - Trọng số các tiêu chí chấm điểm
  - Số lượng sinh viên tối đa/GV
  - Thời gian tối thiểu giữa các báo cáo
- Cấu hình email:
  - SMTP server
  - Email template
- Cấu hình file upload:
  - Kích thước tối đa
  - Định dạng cho phép
- Sao lưu và khôi phục dữ liệu

### Quyền Hạn:
- ✅ Toàn quyền trên tất cả chức năng
- ✅ Đọc/Tạo/Sửa/Xóa tất cả dữ liệu
- ✅ Quản lý người dùng
- ✅ Cấu hình hệ thống
- ⚠️ Nên có audit log cho các thay đổi quan trọng

---

## 📊 Ma Trận Phân Quyền

| Chức Năng | Sinh Viên | GV HD | GV PB | Admin |
|-----------|:---------:|:-----:|:-----:|:-----:|
| **Xem thông báo** | ✅ | ✅ | ✅ | ✅ |
| **Đăng ký đồ án** | ✅ | ❌ | ❌ | ✅* |
| **Đề xuất đề tài** | ⚠️ | ✅ | ❌ | ✅ |
| **Phê duyệt đề tài** | ❌ | ❌ | ❌ | ✅ |
| **Nộp báo cáo tiến độ** | ✅ | ❌ | ❌ | ❌ |
| **Nhận xét báo cáo** | ❌ | ✅ | ❌ | ❌ |
| **Chấm điểm hướng dẫn** | ❌ | ✅ | ❌ | ✅* |
| **Chấm điểm phản biện** | ❌ | ❌ | ✅ | ✅* |
| **Phân công phản biện** | ❌ | ❌ | ❌ | ✅ |
| **Xem điểm của mình** | ✅ | ❌ | ❌ | ✅ |
| **Xem tất cả điểm** | ❌ | ⚠️ | ⚠️ | ✅ |
| **Upload tài liệu** | ✅ | ✅ | ❌ | ✅ |
| **Báo cáo thống kê** | ❌ | ⚠️ | ⚠️ | ✅ |
| **Quản lý người dùng** | ❌ | ❌ | ❌ | ✅ |
| **Cấu hình hệ thống** | ❌ | ❌ | ❌ | ✅ |

**Chú thích:**
- ✅ : Có quyền đầy đủ
- ❌ : Không có quyền
- ⚠️ : Có quyền hạn chế (chỉ xem của mình)
- ✅* : Admin có thể thay mặt (trong trường hợp đặc biệt)

---

## 🔄 Luồng Tương Tác Giữa Các Actor

### 1. Luồng Đăng Ký Đồ Án
```
Admin → Tạo thông báo → (Gửi tới) → Tất cả users

GV Hướng Dẫn → Đề xuất đề tài → Admin → Phê duyệt

Sinh Viên → Xem đề tài → Đăng ký → GV Hướng Dẫn → Duyệt
```

### 2. Luồng Thực Hiện Đồ Án
```
Sinh Viên → Nộp báo cáo → GV Hướng Dẫn → Nhận xét → Sinh Viên
                                              ↓
                                        Theo dõi tiến độ
```

### 3. Luồng Chấm Điểm
```
Admin → Phân công phản biện → GV Phản Biện

Sinh Viên → Hoàn thành đồ án → GV Hướng Dẫn → Chấm điểm (40%)
                            ↘                              ↓
                              GV Phản Biện → Chấm điểm (20%)
                                                         ↓
                            Hội Đồng → Chấm điểm (40%)
                                                         ↓
                            Hệ thống tự động tính điểm cuối
                                                         ↓
                            Admin → Công bố → Sinh Viên
```

---

## 📋 Tổng Kết

### Số Lượng Chức Năng:
- **Sinh Viên:** ~25 chức năng chính
- **GV Hướng Dẫn:** ~30 chức năng chính
- **GV Phản Biện:** ~15 chức năng chính
- **Admin:** ~50+ chức năng quản trị

### Mức Độ Phức Tạp:
- **Sinh Viên:** Trung bình (tập trung vào công việc cá nhân)
- **GV Hướng Dẫn:** Cao (quản lý nhiều sinh viên, nhiều tương tác)
- **GV Phản Biện:** Thấp (chỉ đánh giá)
- **Admin:** Rất cao (quản trị toàn hệ thống)

### Tần Suất Sử Dụng:
- **Sinh Viên:** Cao (sử dụng thường xuyên trong suốt kỳ)
- **GV Hướng Dẫn:** Cao (theo dõi liên tục)
- **GV Phản Biện:** Thấp (chỉ vào cuối kỳ)
- **Admin:** Trung bình (cao vào đầu và cuối kỳ)

---

## 🎯 Ưu Tiên Phát Triển (MVP)

### Phase 1 - Core Features (Must Have):
1. ✅ Đăng nhập/Phân quyền
2. ✅ Tạo thông báo (Admin)
3. ✅ Đề xuất & Phê duyệt đề tài
4. ✅ Đăng ký đồ án (Sinh viên)
5. ✅ Nộp báo cáo tiến độ
6. ✅ Nhận xét báo cáo (GV HD)
7. ✅ Chấm điểm (GV HD + GV PB)
8. ✅ Xem điểm (Sinh viên)

### Phase 2 - Important Features (Should Have):
1. ⭐ Upload/Download tài liệu
2. ⭐ Hệ thống thông báo real-time
3. ⭐ Phân công phản biện tự động
4. ⭐ Dashboard thống kê cơ bản
5. ⭐ Tìm kiếm và lọc

### Phase 3 - Nice to Have (Could Have):
1. 💡 Báo cáo thống kê chi tiết
2. 💡 Export dữ liệu
3. 💡 Email notification
4. 💡 Quản lý hội đồng
5. 💡 Mobile responsive

### Phase 4 - Future (Won't Have Now):
1. 🔮 Mobile app
2. 🔮 Chat giữa SV và GV
3. 🔮 Video call/Meeting integration
4. 🔮 AI suggestion
5. 🔮 Blockchain certificate
