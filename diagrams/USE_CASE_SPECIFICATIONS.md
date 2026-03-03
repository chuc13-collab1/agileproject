# Đặc Tả Use Case — Hệ Thống Quản Lý Đồ Án

---

## 4.1 Đặc Tả Use Case Đăng Nhập

| Mã Usecase | UC01 |
|------------|------|
| **Tên Usecase** | Đăng Nhập |
| **Tác nhân** | Sinh viên / GV Hướng dẫn / GV Phản biện / Admin |
| **Mô tả** | Cho phép người dùng truy cập hệ thống bằng tài khoản đã cấp |
| **Điều kiện trước** | Người dùng có tài khoản hợp lệ trong hệ thống |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Truy cập vào hệ thống | |
| 2 | | Hiển thị giao diện đăng nhập |
| 3 | Nhập Email và Mật khẩu | |
| 4 | Nhấn nút **Đăng nhập** | |
| 5 | | Xác thực qua Firebase Auth. Nếu hợp lệ, cấp JWT token và điều hướng theo role |

| **Luồng thay thế** | Sai Email/Mật khẩu → thông báo lỗi, yêu cầu nhập lại. Tài khoản bị khóa → thông báo "Tài khoản đã bị vô hiệu hóa" |
|--------------------|---|
| **Điều kiện sau** | Đăng nhập thành công, vào màn hình chính theo role |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.2 Đặc Tả Use Case Đề Xuất Đề Tài

| Mã Usecase | UC11 |
|------------|------|
| **Tên Usecase** | Đề Xuất Đề Tài |
| **Tác nhân** | Giáo viên hướng dẫn |
| **Mô tả** | Cho phép GV hướng dẫn đề xuất đề tài mới để Admin phê duyệt |
| **Điều kiện trước** | GV đã đăng nhập; kỳ đồ án đang mở nhận đề tài |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào chức năng "Đề tài của tôi", nhấn **Đề xuất đề tài mới** | |
| 2 | | Hiển thị form: tên đề tài, mô tả, yêu cầu, lĩnh vực, số lượng SV, kỳ đồ án |
| 3 | Điền đầy đủ thông tin, nhấn **Gửi đề xuất** | |
| 4 | | Kiểm tra dữ liệu hợp lệ, lưu đề tài trạng thái "Chờ duyệt", gửi thông báo đến Admin |
| 5 | | Hiển thị thông báo "Đề tài đã gửi, đang chờ phê duyệt" |

| **Luồng thay thế** | Thiếu trường bắt buộc → hiển thị lỗi, yêu cầu nhập lại. Kỳ đồ án đã đóng → ẩn nút gửi |
|--------------------|---|
| **Điều kiện sau** | Đề tài trạng thái "Chờ duyệt"; Admin nhận thông báo |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.3 Đặc Tả Use Case Phê Duyệt Đề Tài

| Mã Usecase | UC12 |
|------------|------|
| **Tên Usecase** | Phê Duyệt Đề Tài |
| **Tác nhân** | Quản trị viên (Admin) |
| **Mô tả** | Cho phép Admin phê duyệt hoặc từ chối đề tài do giáo viên đề xuất |
| **Điều kiện trước** | Admin đã đăng nhập; có đề tài trạng thái "Chờ duyệt" |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào "Quản lý đề tài" → tab **Chờ duyệt** | |
| 2 | | Hiển thị danh sách đề tài chờ duyệt |
| 3 | Chọn một đề tài xem chi tiết | |
| 4 | | Hiển thị: tên, mô tả, yêu cầu, lĩnh vực, GV đề xuất |
| 5a | Nhấn **Duyệt** | |
| 6a | | Cập nhật trạng thái "Đã duyệt", gửi thông báo đến GV |
| 5b | Nhấn **Từ chối** | |
| 6b | | Hiển thị ô nhập lý do từ chối |
| 7b | Nhập lý do và xác nhận | |
| 8b | | Cập nhật trạng thái "Từ chối", gửi thông báo kèm lý do đến GV |

| **Luồng thay thế** | Từ chối mà không nhập lý do → hệ thống yêu cầu bắt buộc phải nhập lý do |
|--------------------|---|
| **Điều kiện sau** | Đề tài cập nhật trạng thái "Đã duyệt" hoặc "Từ chối"; GV nhận thông báo |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.4 Đặc Tả Use Case Đăng Ký Đề Tài

| Mã Usecase | UC13 |
|------------|------|
| **Tên Usecase** | Đăng Ký Đề Tài |
| **Tác nhân** | Sinh viên |
| **Mô tả** | Cho phép sinh viên tìm kiếm và đăng ký đề tài trong kỳ đang mở |
| **Điều kiện trước** | SV đã đăng nhập; chưa có đề tài trong kỳ hiện tại; kỳ đồ án đang mở |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào "Danh sách đề tài" | |
| 2 | | Hiển thị danh sách đề tài đã duyệt, còn slot, của kỳ đang mở |
| 3 | Tìm kiếm / lọc theo lĩnh vực, GV, từ khóa | |
| 4 | | Hiển thị kết quả lọc |
| 5 | Nhấn vào đề tài để xem chi tiết | |
| 6 | | Hiển thị: mô tả, yêu cầu, GV hướng dẫn, số slot còn lại |
| 7 | Nhấn **Đăng ký đề tài này** | |
| 8 | | Kiểm tra: SV chưa đăng ký trong kỳ, đề tài còn slot. Tạo bản ghi trạng thái "Chờ xác nhận", gửi thông báo đến GV |
| 9 | | Hiển thị "Đăng ký thành công, đang chờ GV xác nhận" |

| **Luồng thay thế** | SV đã có đề tài → ẩn nút đăng ký. Đề tài hết slot → thông báo "Đề tài đã đủ sinh viên" |
|--------------------|---|
| **Điều kiện sau** | Bản ghi đăng ký tạo ra; GV nhận thông báo |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.5 Đặc Tả Use Case Duyệt Đơn Đăng Ký Sinh Viên

| Mã Usecase | UC20a |
|------------|-------|
| **Tên Usecase** | Duyệt Đơn Đăng Ký Sinh Viên |
| **Tác nhân** | Giáo viên hướng dẫn |
| **Mô tả** | Cho phép GV hướng dẫn chấp nhận hoặc từ chối đơn đăng ký đề tài của sinh viên |
| **Điều kiện trước** | GV đã đăng nhập; có SV đăng ký đề tài đang chờ xác nhận |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Nhận thông báo, vào "Quản lý sinh viên" | |
| 2 | | Hiển thị danh sách SV đang đăng ký đề tài |
| 3 | Xem thông tin chi tiết SV (tên, MSSV, lớp, GPA) | |
| 4a | Nhấn **Chấp nhận** | |
| 5a | | Cập nhật trạng thái đồ án "Đang thực hiện"; gửi thông báo đến SV |
| 4b | Nhấn **Từ chối** | |
| 5b | | Cập nhật trạng thái "Từ chối"; SV có thể đăng ký đề tài khác |

| **Luồng thay thế** | GV đã đủ số SV tối đa → hệ thống cảnh báo trước khi chấp nhận thêm |
|--------------------|---|
| **Điều kiện sau** | SV nhận kết quả; đồ án chuyển "Đang thực hiện" hoặc SV được đăng ký lại |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.6 Đặc Tả Use Case Quản Lý Sprint

| Mã Usecase | UC21 |
|------------|------|
| **Tên Usecase** | Quản Lý Sprint |
| **Tác nhân** | Sinh viên, Giáo viên hướng dẫn |
| **Mô tả** | Cho phép sinh viên lên kế hoạch sprint Agile; GV theo dõi và comment tiến độ |
| **Điều kiện trước** | Đồ án đang trạng thái "Đang thực hiện" |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | SV vào "Đồ án của tôi" → tab Sprint, nhấn **Tạo sprint mới** | |
| 2 | | Hiển thị form: tên sprint, mục tiêu, ngày bắt đầu, ngày kết thúc, danh sách task |
| 3 | Nhập thông tin và danh sách task | |
| 4 | Nhấn **Lưu sprint** | |
| 5 | | Lưu sprint trạng thái "Đang lập kế hoạch", thông báo đến GV |
| 6 | GV xem sprint, để lại comment hoặc yêu cầu điều chỉnh | |
| 7 | | Hiển thị comment của GV; gửi thông báo đến SV |
| 8 | SV cập nhật trạng thái task: Chưa làm → Đang làm → Hoàn thành | |
| 9 | | Lưu trạng thái mới, cập nhật thanh tiến độ sprint |

| **Luồng thay thế** | Ngày kết thúc < ngày bắt đầu → báo lỗi. GV có thể yêu cầu SV điều chỉnh mục tiêu sprint |
|--------------------|---|
| **Điều kiện sau** | Sprint được lưu, GV theo dõi được tiến độ |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.7 Đặc Tả Use Case Nộp Báo Cáo Tiến Độ

| Mã Usecase | UC30 |
|------------|------|
| **Tên Usecase** | Nộp Báo Cáo Tiến Độ |
| **Tác nhân** | Sinh viên |
| **Mô tả** | Cho phép sinh viên nộp báo cáo tiến độ hàng tuần để GV hướng dẫn theo dõi |
| **Điều kiện trước** | SV đã đăng nhập; đồ án đang trạng thái "Đang thực hiện" |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào "Báo cáo tiến độ", nhấn **Nộp báo cáo mới** | |
| 2 | | Hiển thị form: tiêu đề, công việc đã làm, kết quả, khó khăn, kế hoạch tuần tiếp theo |
| 3 | Điền thông tin báo cáo | |
| 4 | (Tùy chọn) Đính kèm file báo cáo (PDF, DOCX) | |
| 5 | Nhấn **Nộp báo cáo** | |
| 6 | | Kiểm tra trường bắt buộc và định dạng/kích thước file. Lưu báo cáo, tự xác định tuần thứ |
| 7 | | Gửi thông báo đến GV hướng dẫn: "Sinh viên đã nộp báo cáo tuần N" |
| 8 | | Hiển thị báo cáo trong lịch sử với trạng thái "Đã nộp" |

| **Luồng thay thế** | File > 10MB hoặc sai định dạng → báo lỗi, không cho upload. SV đã nộp trong tuần → cảnh báo, cho phép cập nhật thay vì tạo mới |
|--------------------|---|
| **Điều kiện sau** | Báo cáo được lưu; GV nhận thông báo |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.8 Đặc Tả Use Case Nhận Xét Báo Cáo Tiến Độ

| Mã Usecase | UC31 |
|------------|------|
| **Tên Usecase** | Nhận Xét Báo Cáo Tiến Độ |
| **Tác nhân** | Giáo viên hướng dẫn |
| **Mô tả** | Cho phép GV hướng dẫn đọc, đánh giá và phản hồi báo cáo tiến độ của sinh viên |
| **Điều kiện trước** | GV đã đăng nhập; SV đã nộp báo cáo mới |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Nhận thông báo, vào "Tiến độ sinh viên" | |
| 2 | | Hiển thị danh sách báo cáo chưa xem kèm badge số lượng |
| 3 | Chọn sinh viên và báo cáo cần nhận xét | |
| 4 | | Hiển thị nội dung: công việc đã làm, kết quả, khó khăn, kế hoạch, file đính kèm |
| 5 | (Tùy chọn) Download file để đọc chi tiết | |
| 6 | Nhập nhận xét, chọn rating (1–5 sao), trạng thái (Đạt / Cần sửa) | |
| 7 | Nhấn **Gửi nhận xét** | |
| 8 | | Lưu nhận xét, cập nhật trạng thái "Đã nhận xét", gửi thông báo đến SV |

| **Luồng thay thế** | Chọn trạng thái mà không nhập nội dung → yêu cầu nhập tối thiểu nội dung nhận xét |
|--------------------|---|
| **Điều kiện sau** | SV nhận được nhận xét; báo cáo cập nhật "Đã nhận xét" |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.9 Đặc Tả Use Case Chat Realtime

| Mã Usecase | UC32 |
|------------|------|
| **Tên Usecase** | Chat Realtime |
| **Tác nhân** | Sinh viên, Giáo viên hướng dẫn |
| **Mô tả** | Cho phép SV và GV hướng dẫn trao đổi trực tiếp qua chat realtime (Firebase Firestore) |
| **Điều kiện trước** | Cả hai đã đăng nhập; tồn tại mối liên kết SV – GV qua đề tài |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào chức năng "Chat" | |
| 2 | | Hiển thị danh sách phòng chat (mỗi cặp SV–GV là một phòng) |
| 3 | Chọn phòng chat | |
| 4 | | Tải lịch sử tin nhắn từ Firebase Firestore theo `chatRoomId` |
| 5 | Nhập nội dung tin nhắn và nhấn **Gửi** | |
| 6 | | Lưu message vào Firestore; hiển thị realtime cho cả hai phía qua Firestore listener |
| 7 | Bên nhận xem tin nhắn và phản hồi | |
| 8 | | Tin nhắn phản hồi hiển thị realtime, không cần tải lại trang |

| **Luồng thay thế** | Mất kết nối → thông báo "Offline", tự kết nối lại khi có mạng |
|--------------------|---|
| **Điều kiện sau** | Tin nhắn lưu vĩnh viễn trên Firestore; cả hai bên đều nhận |
| **Điều kiện thoát** | Người dùng đóng cửa sổ chat |

---

## 4.10 Đặc Tả Use Case Phân Công GV Phản Biện

| Mã Usecase | UC24 |
|------------|------|
| **Tên Usecase** | Phân Công GV Phản Biện |
| **Tác nhân** | Quản trị viên (Admin) |
| **Mô tả** | Cho phép Admin phân công GV phản biện cho đồ án, hỗ trợ gợi ý tự động từ Grok AI |
| **Điều kiện trước** | Admin đã đăng nhập; đồ án trạng thái "Đã nộp"; chưa có GV phản biện |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào "Phân công phản biện", chọn đồ án | |
| 2 | | Hiển thị thông tin: tên đề tài, lĩnh vực, GV hướng dẫn |
| 3 | Nhấn **Gợi ý tự động** | |
| 4 | | Gửi yêu cầu đến Grok AI với thông tin lĩnh vực, chuyên môn GV, số đồ án đang phản biện |
| 5 | | Hiển thị top 5 GV phù hợp kèm điểm phù hợp |
| 6 | Chọn GV từ danh sách gợi ý | |
| 7 | | Kiểm tra: GV được chọn không phải là GV hướng dẫn của đồ án |
| 8 | | Cập nhật GV phản biện vào đồ án; gửi thông báo đến GV phản biện |

| **Luồng thay thế** | Admin chọn "Phân công thủ công" → tự chọn từ danh sách. Chọn GV hướng dẫn làm phản biện → báo lỗi, không cho phép |
|--------------------|---|
| **Điều kiện sau** | Đồ án có GV phản biện; GV phản biện nhận thông báo |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.11 Đặc Tả Use Case Chấm Điểm Hướng Dẫn

| Mã Usecase | UC40 |
|------------|------|
| **Tên Usecase** | Chấm Điểm Hướng Dẫn |
| **Tác nhân** | Giáo viên hướng dẫn |
| **Mô tả** | Cho phép GV hướng dẫn chấm điểm đồ án theo tiêu chí, chiếm 40% điểm cuối |
| **Điều kiện trước** | GV đã đăng nhập; đồ án trạng thái "Đã nộp" |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào "Chấm điểm", chọn đồ án cần chấm | |
| 2 | | Hiển thị thông tin đồ án, danh sách tài liệu và lịch sử báo cáo tiến độ |
| 3 | (Tùy chọn) Download tài liệu để đánh giá | |
| 4 | Nhập điểm 4 tiêu chí (0–10): Nội dung, Kỹ thuật, Trình bày, Thuyết trình | |
| 5 | | Tự động tính: `supervisor_score = Σ(điểm × trọng_số)` |
| 6 | Nhập nhận xét tổng quan (điểm mạnh, điểm yếu, đề xuất) | |
| 7 | Nhấn **Lưu & Gửi điểm** | |
| 8 | | Lưu điểm vào hệ thống; gửi thông báo đến sinh viên |

| **Luồng thay thế** | Điểm ngoài 0–10 → báo lỗi. Tổng trọng số ≠ 100% → cảnh báo. GV có thể lưu nháp trước khi gửi chính thức |
|--------------------|---|
| **Điều kiện sau** | Điểm hướng dẫn được lưu; SV nhận thông báo |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.12 Đặc Tả Use Case Chấm Điểm Phản Biện

| Mã Usecase | UC41 |
|------------|------|
| **Tên Usecase** | Chấm Điểm Phản Biện |
| **Tác nhân** | Giáo viên phản biện |
| **Mô tả** | Cho phép GV phản biện đánh giá đồ án được phân công, chiếm 20% điểm cuối |
| **Điều kiện trước** | GV đã đăng nhập; được Admin phân công phản biện đồ án |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào "Đồ án được phân công" | |
| 2 | | Hiển thị danh sách đồ án, phân loại: chưa chấm / đã chấm |
| 3 | Chọn đồ án cần chấm | |
| 4 | | Hiển thị: tên đề tài, sinh viên, GV hướng dẫn, danh sách tài liệu |
| 5 | Download tài liệu, đọc báo cáo | |
| 6 | Nhập điểm 4 tiêu chí (0–10): Nội dung, Kỹ thuật, Trình bày, Bảo vệ | |
| 7 | Nhập câu hỏi phản biện và nhận xét chi tiết | |
| 8 | Nhấn **Gửi điểm** | |
| 9 | | Lưu điểm phản biện vào hệ thống |

| **Luồng thay thế** | Truy cập đồ án không thuộc danh sách phân công → hệ thống chặn quyền truy cập |
|--------------------|---|
| **Điều kiện sau** | Điểm phản biện được lưu |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.13 Đặc Tả Use Case Tổng Hợp & Công Bố Điểm

| Mã Usecase | UC43 |
|------------|------|
| **Tên Usecase** | Tổng Hợp & Công Bố Điểm |
| **Tác nhân** | Quản trị viên (Admin) |
| **Mô tả** | Tính điểm cuối theo công thức, xếp loại và công bố kết quả cho sinh viên |
| **Điều kiện trước** | Admin đã đăng nhập; đã có đủ điểm HD và điểm PB |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào "Tổng hợp điểm" | |
| 2 | | Hiển thị danh sách đồ án kèm điểm HD, điểm PB, điểm Hội đồng |
| 3 | | Tự động tính: `final = HD × 40% + PB × 20% + HĐ × 40%` |
| 4 | | Xếp loại: A (≥9.0), B+ (≥8.5), B (≥8.0), C+ (≥7.0), C (≥6.5), D+ (≥5.5), D (≥5.0), F (<5.0) |
| 5 | Kiểm tra kết quả, nhấn **Công bố điểm** | |
| 6 | | Cập nhật trạng thái đồ án "Hoàn thành"; gửi thông báo đến tất cả SV |
| 7 | (Tùy chọn) Nhấn **Export bảng điểm** | |
| 8 | | Xuất file Excel hoặc PDF chứa bảng điểm toàn bộ |

| **Luồng thay thế** | Đồ án chưa đủ điểm HD hoặc PB → đánh dấu "Chưa đủ điểm", không tính điểm cuối |
|--------------------|---|
| **Điều kiện sau** | SV xem được điểm cuối và xếp loại; đồ án hoàn thành |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.14 Đặc Tả Use Case Tạo Thông Báo Kỳ Đồ Án

| Mã Usecase | UC50 |
|------------|------|
| **Tên Usecase** | Tạo Thông Báo Kỳ Đồ Án |
| **Tác nhân** | Quản trị viên (Admin) |
| **Mô tả** | Cho phép Admin tạo thông báo mở kỳ đồ án mới và gửi đến toàn bộ người dùng |
| **Điều kiện trước** | Admin đã đăng nhập |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào "Quản lý thông báo", nhấn **Tạo thông báo mới** | |
| 2 | | Hiển thị form: tiêu đề, nội dung, học kỳ, năm học, thời gian mở/đóng đăng ký, hạn nộp, ngày bảo vệ |
| 3 | Điền đầy đủ thông tin | |
| 4 | (Tùy chọn) Upload file đính kèm | |
| 5 | Nhấn **Công bố ngay** | |
| 6 | | Lưu trạng thái "Đã công bố"; gửi in-app notification đến tất cả SV và GV |
| 7 | | Hiển thị thông báo thành công |

| **Luồng thay thế** | Admin chọn "Lưu nháp" → chỉnh sửa sau, không gửi ngay. Thời gian đóng < thời gian mở → báo lỗi validate |
|--------------------|---|
| **Điều kiện sau** | Thông báo công bố; tất cả người dùng nhận in-app notification |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.15 Đặc Tả Use Case Chat AI Trợ Lý

| Mã Usecase | UC62 |
|------------|------|
| **Tên Usecase** | Chat AI Trợ Lý |
| **Tác nhân** | Sinh viên, Giáo viên hướng dẫn |
| **Mô tả** | Cho phép người dùng tương tác với Grok AI để được hỗ trợ tư vấn đề tài, tiến độ và câu hỏi học thuật |
| **Điều kiện trước** | Người dùng đã đăng nhập; hệ thống kết nối được Grok AI API |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào chức năng "AI Trợ lý" | |
| 2 | | Hiển thị giao diện chat với lịch sử hội thoại |
| 3 | Nhập câu hỏi hoặc yêu cầu hỗ trợ | |
| 4 | Nhấn **Gửi** | |
| 5 | | Server gửi prompt kèm context (role người dùng, thông tin đồ án) đến Grok AI API |
| 6 | | Grok AI phản hồi; server stream kết quả về client |
| 7 | | Hiển thị câu trả lời trên giao diện chat theo dạng streaming |
| 8 | Người dùng tiếp tục hội thoại hoặc đặt câu hỏi mới | |

| **Luồng thay thế** | Grok AI API lỗi hoặc timeout → hiển thị thông báo "AI tạm thời không khả dụng, vui lòng thử lại" |
|--------------------|---|
| **Điều kiện sau** | Hội thoại được lưu trong session; người dùng nhận câu trả lời |
| **Điều kiện thoát** | Người dùng đóng cửa sổ chat hoặc kết thúc phiên |

---

## 4.16 Đặc Tả Use Case Upload Tài Liệu

| Mã Usecase | UC22 |
|------------|------|
| **Tên Usecase** | Upload Tài Liệu |
| **Tác nhân** | Sinh viên, Giáo viên hướng dẫn |
| **Mô tả** | Cho phép người dùng tải lên tài liệu đồ án vào hệ thống lưu trữ |
| **Điều kiện trước** | Đã đăng nhập; đồ án đang "Đang thực hiện" |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào "Quản lý tài liệu", nhấn **Upload tài liệu** | |
| 2 | | Hiển thị form chọn file và nhập mô tả |
| 3 | Chọn file (PDF, DOCX, ZIP, v.v.) và nhập mô tả ngắn | |
| 4 | Nhấn **Tải lên** | |
| 5 | | Kiểm tra định dạng và kích thước file (tối đa 50MB) |
| 6 | | Upload file lên server; lưu metadata (tên file, loại, kích thước, ngày upload, người upload) |
| 7 | | Hiển thị file trong danh sách tài liệu với link download |

| **Luồng thay thế** | File vượt 50MB hoặc sai định dạng → báo lỗi, không cho upload |
|--------------------|---|
| **Điều kiện sau** | File được lưu trữ; danh sách tài liệu cập nhật |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## 4.17 Đặc Tả Use Case Quản Lý Sinh Viên

| Mã Usecase | UC70 |
|------------|------|
| **Tên Usecase** | Quản Lý Sinh Viên |
| **Tác nhân** | Quản trị viên (Admin) |
| **Mô tả** | Cho phép Admin thêm, sửa, kích hoạt / vô hiệu hóa tài khoản sinh viên |
| **Điều kiện trước** | Admin đã đăng nhập |

| STT | Tác nhân | Hệ thống phản hồi |
|-----|----------|-------------------|
| 1 | Vào "Quản lý sinh viên" | |
| 2 | | Hiển thị danh sách SV: tên, MSSV, lớp, email, trạng thái |
| 3a | Nhấn **Import từ Excel** | |
| 4a | Chọn file Excel đúng template | |
| 5a | | Đọc dữ liệu, tạo tài khoản Firebase Auth + lưu DB từng SV. Báo cáo: thành công / lỗi từng dòng |
| 3b | Nhấn **Thêm mới** để tạo thủ công | |
| 4b | Nhập thông tin sinh viên | |
| 5b | | Tạo tài khoản Firebase Auth, lưu DB, gửi thông tin đăng nhập |
| 3c | Nhấn toggle **Kích hoạt / Vô hiệu** | |
| 4c | | Cập nhật trạng thái; tài khoản bị khóa không thể đăng nhập |

| **Luồng thay thế** | File Excel sai template hoặc trùng MSSV → bỏ qua dòng lỗi, báo cáo chi tiết |
|--------------------|---|
| **Điều kiện sau** | Tài khoản SV được tạo / cập nhật |
| **Điều kiện thoát** | Thực hiện thành công / Người dùng nhấn thoát |

---

## Bảng Tổng Hợp Use Case

| STT | Mã UC | Tên Use Case | Actor chính |
|-----|-------|-------------|-------------|
| 1 | UC01 | Đăng nhập | Tất cả |
| 2 | UC11 | Đề xuất đề tài | Supervisor |
| 3 | UC12 | Phê duyệt đề tài | Admin |
| 4 | UC13 | Đăng ký đề tài | Student |
| 5 | UC20a | Duyệt đơn đăng ký | Supervisor |
| 6 | UC21 | Quản lý Sprint | Student, Supervisor |
| 7 | UC30 | Nộp báo cáo tiến độ | Student |
| 8 | UC31 | Nhận xét báo cáo | Supervisor |
| 9 | UC32 | Chat realtime | Student, Supervisor |
| 10 | UC24 | Phân công GV phản biện | Admin |
| 11 | UC40 | Chấm điểm hướng dẫn | Supervisor |
| 12 | UC41 | Chấm điểm phản biện | Reviewer |
| 13 | UC43 | Tổng hợp & công bố điểm | Admin |
| 14 | UC50 | Tạo thông báo kỳ đồ án | Admin |
| 15 | UC62 | Chat AI trợ lý (Grok AI) | Student, Supervisor |
| 16 | UC22 | Upload tài liệu | Student, Supervisor |
| 17 | UC70 | Quản lý sinh viên | Admin |
