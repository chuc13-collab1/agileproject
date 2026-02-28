# Đặc Tả Use Case — Hệ Thống Quản Lý Đồ Án

---

## 4.1 Đặc Tả Use Case Đăng Nhập

| Mã Usecase | UC01 |
|------------|------|
| **Tên Usecase** | Usecase Đăng Nhập |
| **Tác nhân** | Người dùng (Sinh viên / GV Hướng dẫn / GV Phản biện / Admin) |
| **Mô tả** | Cho phép người dùng truy cập hệ thống bằng tài khoản đã cấp |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Truy cập vào hệ thống | |
| | 2 | | Đưa ra giao diện đăng nhập |
| | 3 | Nhập Email và Mật khẩu | |
| | 4 | Nhấn nút đăng nhập | |
| | 5 | | Hệ thống xác nhận thông tin qua Firebase Auth. Nếu hợp lệ, cấp JWT token và hiển thị màn hình chức năng theo role |

| **Luồng thay thế** | Nếu dữ liệu không hợp lệ (sai Email / Mật khẩu), hệ thống đưa ra thông báo lỗi và yêu cầu nhập lại. Nếu tài khoản bị khóa, hệ thống thông báo "Tài khoản đã bị vô hiệu hóa" |
|--------------------|---|
| **Điều kiện sau** | Đăng nhập vào hệ thống thành công |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.2 Đặc Tả Use Case Đề Xuất Đề Tài

| Mã Usecase | UC11 |
|------------|------|
| **Tên Usecase** | Usecase Đề Xuất Đề Tài |
| **Tác nhân** | Giáo viên hướng dẫn |
| **Mô tả** | Cho phép giáo viên hướng dẫn đề xuất đề tài mới để admin phê duyệt |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Đăng nhập và vào chức năng "Đề tài của tôi" | |
| | 2 | | Hiển thị danh sách đề tài hiện tại và nút "Đề xuất đề tài mới" |
| | 3 | Nhấn "Đề xuất đề tài mới" | |
| | 4 | | Hiển thị form nhập thông tin: tên đề tài, mô tả, yêu cầu, lĩnh vực, số lượng sinh viên, kỳ đồ án |
| | 5 | Điền đầy đủ thông tin và nhấn "Gửi đề xuất" | |
| | 6 | | Hệ thống kiểm tra dữ liệu hợp lệ, lưu đề tài với trạng thái "Chờ duyệt" và gửi thông báo đến Admin |
| | 7 | | Hiển thị thông báo "Đề tài đã được gửi, đang chờ phê duyệt" |

| **Luồng thay thế** | Nếu thiếu thông tin bắt buộc (tên, lĩnh vực, kỳ đồ án), hệ thống hiển thị lỗi và yêu cầu nhập lại. Nếu kỳ đồ án đã đóng, hệ thống thông báo và ẩn nút gửi |
|--------------------|---|
| **Điều kiện sau** | Đề tài được lưu với trạng thái "Chờ duyệt"; Admin nhận thông báo |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.3 Đặc Tả Use Case Phê Duyệt Đề Tài

| Mã Usecase | UC12 |
|------------|------|
| **Tên Usecase** | Usecase Phê Duyệt Đề Tài |
| **Tác nhân** | Quản trị viên (Admin) |
| **Mô tả** | Cho phép Admin xem xét và phê duyệt hoặc từ chối đề tài do giáo viên đề xuất |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Vào chức năng "Quản lý đề tài", chọn tab "Chờ duyệt" | |
| | 2 | | Hiển thị danh sách đề tài có trạng thái "Chờ duyệt" |
| | 3 | Nhấn vào một đề tài để xem chi tiết | |
| | 4 | | Hiển thị đầy đủ thông tin: tên, mô tả, yêu cầu, lĩnh vực, GV đề xuất |
| | 5a | Nhấn "Duyệt" | |
| | 6a | | Hệ thống cập nhật trạng thái thành "Đã duyệt", gửi thông báo đến giáo viên hướng dẫn |
| | 5b | Nhấn "Từ chối" | |
| | 6b | | Hiển thị ô nhập lý do từ chối |
| | 7b | Nhập lý do và xác nhận | |
| | 8b | | Cập nhật trạng thái "Từ chối", gửi thông báo kèm lý do đến giáo viên |

| **Luồng thay thế** | Nếu Admin từ chối nhưng không nhập lý do, hệ thống yêu cầu bắt buộc phải nhập lý do trước khi xác nhận |
|--------------------|---|
| **Điều kiện sau** | Đề tài cập nhật trạng thái "Đã duyệt" hoặc "Từ chối"; GV nhận thông báo kết quả |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.4 Đặc Tả Use Case Đăng Ký Đề Tài

| Mã Usecase | UC13 |
|------------|------|
| **Tên Usecase** | Usecase Đăng Ký Đề Tài |
| **Tác nhân** | Sinh viên |
| **Mô tả** | Cho phép sinh viên tìm kiếm và đăng ký đề tài đồ án trong kỳ đang mở |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Vào chức năng "Danh sách đề tài" | |
| | 2 | | Hiển thị danh sách đề tài đã được duyệt, còn slot trống của kỳ đang mở |
| | 3 | Tìm kiếm / lọc đề tài theo lĩnh vực, GV, từ khóa | |
| | 4 | | Hiển thị kết quả lọc |
| | 5 | Nhấn vào đề tài để xem chi tiết | |
| | 6 | | Hiển thị mô tả, yêu cầu, GV hướng dẫn, số slot còn lại |
| | 7 | Nhấn "Đăng ký đề tài này" | |
| | 8 | | Kiểm tra điều kiện: sinh viên chưa đăng ký đề tài nào trong kỳ, đề tài còn slot. Tạo bản ghi đăng ký với trạng thái "Chờ xác nhận", gửi thông báo đến GV hướng dẫn |
| | 9 | | Hiển thị thông báo "Đăng ký thành công, đang chờ GV xác nhận" |

| **Luồng thay thế** | Nếu sinh viên đã có đề tài trong kỳ, hệ thống thông báo và ẩn nút đăng ký. Nếu đề tài đã hết slot, hệ thống thông báo "Đề tài đã đủ sinh viên" |
|--------------------|---|
| **Điều kiện sau** | Bản ghi đăng ký được tạo; GV hướng dẫn nhận thông báo để xét duyệt |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.5 Đặc Tả Use Case Duyệt Đơn Đăng Ký Sinh Viên

| Mã Usecase | UC20a |
|------------|-------|
| **Tên Usecase** | Usecase Duyệt Đơn Đăng Ký Sinh Viên |
| **Tác nhân** | Giáo viên hướng dẫn |
| **Mô tả** | Cho phép GV hướng dẫn xét duyệt hoặc từ chối đơn đăng ký đề tài của sinh viên |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Nhận thông báo có sinh viên đăng ký, vào "Quản lý sinh viên" | |
| | 2 | | Hiển thị danh sách sinh viên đang đăng ký đề tài của GV |
| | 3 | Xem thông tin chi tiết sinh viên (tên, MSSV, lớp, GPA) | |
| | 4a | Nhấn "Chấp nhận" | |
| | 5a | | Cập nhật trạng thái đồ án thành "Đang thực hiện", gửi thông báo đến sinh viên: "GV đã chấp nhận đơn đăng ký" |
| | 4b | Nhấn "Từ chối" | |
| | 5b | | Cập nhật trạng thái thành "Từ chối", sinh viên nhận thông báo và có thể đăng ký đề tài khác |

| **Luồng thay thế** | Nếu GV đã đủ số lượng sinh viên tối đa, hệ thống cảnh báo trước khi GV chấp nhận thêm |
|--------------------|---|
| **Điều kiện sau** | Sinh viên nhận kết quả; đồ án chuyển trạng thái "Đang thực hiện" hoặc sinh viên được đăng ký lại |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.6 Đặc Tả Use Case Nộp Báo Cáo Tiến Độ

| Mã Usecase | UC30 |
|------------|------|
| **Tên Usecase** | Usecase Nộp Báo Cáo Tiến Độ |
| **Tác nhân** | Sinh viên |
| **Mô tả** | Cho phép sinh viên nộp báo cáo tiến độ hàng tuần để GV hướng dẫn theo dõi |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Vào "Báo cáo tiến độ", nhấn "Nộp báo cáo mới" | |
| | 2 | | Hiển thị form nhập: tiêu đề, công việc đã làm, kết quả đạt được, khó khăn, kế hoạch tuần tiếp theo |
| | 3 | Điền thông tin báo cáo | |
| | 4 | (Tùy chọn) Đính kèm file báo cáo (PDF, DOCX) | |
| | 5 | Nhấn "Nộp báo cáo" | |
| | 6 | | Kiểm tra các trường bắt buộc và định dạng/kích thước file. Lưu báo cáo và file vào hệ thống, tự động xác định tuần thứ |
| | 7 | | Gửi thông báo đến GV hướng dẫn: "Sinh viên đã nộp báo cáo tuần N" |
| | 8 | | Hiển thị báo cáo trong lịch sử với trạng thái "Đã nộp" |

| **Luồng thay thế** | Nếu file vượt quá 10MB hoặc sai định dạng, hệ thống báo lỗi và không cho upload. Nếu sinh viên đã nộp trong tuần, hệ thống cảnh báo và cho phép cập nhật thay vì tạo mới |
|--------------------|---|
| **Điều kiện sau** | Báo cáo được lưu; GV hướng dẫn nhận thông báo |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.7 Đặc Tả Use Case Nhận Xét Báo Cáo Tiến Độ

| Mã Usecase | UC31 |
|------------|------|
| **Tên Usecase** | Usecase Nhận Xét Báo Cáo Tiến Độ |
| **Tác nhân** | Giáo viên hướng dẫn |
| **Mô tả** | Cho phép GV hướng dẫn đọc, đánh giá và phản hồi báo cáo tiến độ của sinh viên |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Nhận thông báo có báo cáo mới, vào "Tiến độ sinh viên" | |
| | 2 | | Hiển thị danh sách báo cáo chưa xem với badge số lượng |
| | 3 | Chọn sinh viên và báo cáo cần nhận xét | |
| | 4 | | Hiển thị nội dung báo cáo: công việc đã làm, kết quả, khó khăn, kế hoạch, file đính kèm |
| | 5 | (Tùy chọn) Download file báo cáo để đọc chi tiết | |
| | 6 | Nhập nhận xét, chọn rating (1–5 sao) và trạng thái (Đạt / Cần sửa) | |
| | 7 | Nhấn "Gửi nhận xét" | |
| | 8 | | Lưu nhận xét vào hệ thống, cập nhật trạng thái báo cáo thành "Đã nhận xét", gửi thông báo đến sinh viên |

| **Luồng thay thế** | Nếu GV không nhập nhận xét mà chỉ chọn trạng thái, hệ thống yêu cầu nhập tối thiểu nội dung nhận xét |
|--------------------|---|
| **Điều kiện sau** | Sinh viên nhận được nhận xét; báo cáo cập nhật trạng thái "Đã nhận xét" |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.8 Đặc Tả Use Case Phân Công GV Phản Biện

| Mã Usecase | UC24 |
|------------|------|
| **Tên Usecase** | Usecase Phân Công GV Phản Biện |
| **Tác nhân** | Quản trị viên (Admin) |
| **Mô tả** | Cho phép Admin phân công giáo viên phản biện cho đồ án, hỗ trợ gợi ý tự động từ AI |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Vào "Phân công phản biện", chọn đồ án cần phân công | |
| | 2 | | Hiển thị thông tin đồ án: tên đề tài, lĩnh vực, GV hướng dẫn |
| | 3 | Nhấn "Gợi ý tự động" | |
| | 4 | | Hệ thống gửi yêu cầu đến AI (Gemini) với thông tin lĩnh vực, chuyên môn GV, số đồ án đang PB |
| | 5 | | Hiển thị danh sách top 5 GV phù hợp kèm điểm phù hợp |
| | 6 | Chọn một GV từ danh sách gợi ý | |
| | 7 | | Kiểm tra: GV được chọn không phải là GV hướng dẫn của đồ án |
| | 8 | | Cập nhật GV phản biện vào đồ án, gửi thông báo đến GV phản biện |

| **Luồng thay thế** | Admin có thể chọn "Phân công thủ công" để tự chọn GV từ danh sách. Nếu GV được chọn là GV hướng dẫn, hệ thống báo lỗi và không cho phép |
|--------------------|---|
| **Điều kiện sau** | Đồ án có GV phản biện; GV phản biện nhận thông báo |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.9 Đặc Tả Use Case Chấm Điểm Hướng Dẫn

| Mã Usecase | UC40 |
|------------|------|
| **Tên Usecase** | Usecase Chấm Điểm Hướng Dẫn |
| **Tác nhân** | Giáo viên hướng dẫn |
| **Mô tả** | Cho phép GV hướng dẫn chấm điểm đồ án theo các tiêu chí, chiếm 40% điểm cuối |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Vào "Chấm điểm", chọn đồ án cần chấm | |
| | 2 | | Hiển thị thông tin đồ án, danh sách tài liệu nộp và lịch sử báo cáo tiến độ |
| | 3 | (Tùy chọn) Download tài liệu để đánh giá | |
| | 4 | Nhập điểm 4 tiêu chí (0–10): Nội dung, Kỹ thuật, Trình bày báo cáo, Thuyết trình | |
| | 5 | Nhập trọng số cho từng tiêu chí (mặc định 25% mỗi tiêu chí) | |
| | 6 | | Hệ thống tự động tính điểm: supervisor_score = Σ(điểm × trọng_số) |
| | 7 | Nhập nhận xét tổng quan (điểm mạnh, điểm yếu, đề xuất) | |
| | 8 | Nhấn "Lưu & Gửi điểm" | |
| | 9 | | Lưu điểm vào hệ thống, gửi thông báo đến sinh viên |

| **Luồng thay thế** | Nếu điểm nhập ngoài khoảng 0–10, hệ thống báo lỗi. Nếu tổng trọng số ≠ 100%, hệ thống cảnh báo yêu cầu điều chỉnh. GV có thể lưu nháp trước khi gửi chính thức |
|--------------------|---|
| **Điều kiện sau** | Điểm hướng dẫn được lưu; sinh viên nhận thông báo kết quả |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.10 Đặc Tả Use Case Chấm Điểm Phản Biện

| Mã Usecase | UC41 |
|------------|------|
| **Tên Usecase** | Usecase Chấm Điểm Phản Biện |
| **Tác nhân** | Giáo viên phản biện |
| **Mô tả** | Cho phép GV phản biện đánh giá và chấm điểm đồ án được phân công, chiếm 20% điểm cuối |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Vào "Đồ án được phân công" | |
| | 2 | | Hiển thị danh sách đồ án, phân loại theo trạng thái chưa chấm / đã chấm |
| | 3 | Chọn đồ án cần chấm điểm | |
| | 4 | | Hiển thị thông tin: tên đề tài, sinh viên, GV hướng dẫn, danh sách tài liệu |
| | 5 | Download tài liệu, đọc báo cáo để đánh giá | |
| | 6 | Nhập điểm 4 tiêu chí (0–10): Nội dung, Kỹ thuật, Trình bày, Bảo vệ | |
| | 7 | Nhập câu hỏi phản biện và nhận xét chi tiết | |
| | 8 | Nhấn "Gửi điểm" | |
| | 9 | | Lưu điểm phản biện vào hệ thống |

| **Luồng thay thế** | Nếu GV phản biện cố truy cập đồ án không thuộc danh sách phân công, hệ thống chặn quyền truy cập |
|--------------------|---|
| **Điều kiện sau** | Điểm phản biện được lưu vào hệ thống |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.11 Đặc Tả Use Case Tổng Hợp & Công Bố Điểm

| Mã Usecase | UC43 |
|------------|------|
| **Tên Usecase** | Usecase Tổng Hợp và Công Bố Điểm |
| **Tác nhân** | Quản trị viên (Admin) |
| **Mô tả** | Tính điểm cuối theo công thức, xếp loại và công bố kết quả cho sinh viên |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Vào "Tổng hợp điểm" | |
| | 2 | | Hiển thị danh sách đồ án kèm điểm HD, điểm PB, điểm Hội đồng |
| | 3 | | Hệ thống tự động tính: `final = HD × 40% + PB × 20% + HĐ × 40%` |
| | 4 | | Xếp loại tự động: A (≥9.0), B+ (≥8.5), B (≥8.0), C+ (≥7.0), C (≥6.5), D+ (≥5.5), D (≥5.0), F (<5.0) |
| | 5 | Kiểm tra kết quả và nhấn "Công bố điểm" | |
| | 6 | | Cập nhật trạng thái đồ án "Hoàn thành", gửi thông báo đến tất cả sinh viên |
| | 7 | (Tùy chọn) Nhấn "Export bảng điểm" | |
| | 8 | | Xuất file Excel hoặc PDF chứa bảng điểm toàn bộ đồ án |

| **Luồng thay thế** | Nếu đồ án chưa đủ điểm HD hoặc PB, hệ thống đánh dấu "Chưa đủ điểm" và không tính điểm cuối |
|--------------------|---|
| **Điều kiện sau** | Sinh viên xem được điểm cuối và xếp loại; đồ án hoàn thành |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.12 Đặc Tả Use Case Tạo Thông Báo Kỳ Đồ Án

| Mã Usecase | UC50 |
|------------|------|
| **Tên Usecase** | Usecase Tạo Thông Báo Kỳ Đồ Án |
| **Tác nhân** | Quản trị viên (Admin) |
| **Mô tả** | Cho phép Admin tạo thông báo mở kỳ đồ án mới, thông báo đến toàn bộ người dùng |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Vào "Quản lý thông báo", nhấn "Tạo thông báo mới" | |
| | 2 | | Hiển thị form nhập: tiêu đề, nội dung, học kỳ, năm học, thời gian mở/đóng đăng ký, hạn nộp, ngày bảo vệ |
| | 3 | Điền đầy đủ thông tin | |
| | 4 | (Tùy chọn) Upload file đính kèm | |
| | 5 | Nhấn "Công bố ngay" | |
| | 6 | | Lưu thông báo với trạng thái "Đã công bố", gửi in-app notification đến tất cả sinh viên và giáo viên |
| | 7 | | Hiển thị thông báo thành công |

| **Luồng thay thế** | Admin có thể chọn "Lưu nháp" để chỉnh sửa sau khi không gửi ngay. Nếu thời gian đóng trước thời gian mở, hệ thống báo lỗi validate |
|--------------------|---|
| **Điều kiện sau** | Thông báo công bố; tất cả người dùng nhận được in-app notification |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.13 Đặc Tả Use Case Chat Realtime

| Mã Usecase | UC32 |
|------------|------|
| **Tên Usecase** | Usecase Chat Realtime |
| **Tác nhân** | Sinh viên, Giáo viên hướng dẫn |
| **Mô tả** | Cho phép sinh viên và GV hướng dẫn trao đổi trực tiếp qua chat realtime dựa trên Firebase Firestore |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Vào chức năng "Chat" | |
| | 2 | | Hiển thị danh sách phòng chat (mỗi cặp SV – GV là một phòng) |
| | 3 | Chọn phòng chat | |
| | 4 | | Tải lịch sử tin nhắn từ Firebase Firestore theo chatRoomId |
| | 5 | Nhập nội dung tin nhắn và nhấn "Gửi" | |
| | 6 | | Lưu message vào Firestore, hiển thị ngay lập tức cho cả hai phía qua Firestore listener (realtime) |
| | 7 | Bên nhận xem tin nhắn và phản hồi | |
| | 8 | | Tin nhắn phản hồi hiển thị realtime, không cần tải lại trang |

| **Luồng thay thế** | Nếu mất kết nối mạng, hệ thống thông báo "Offline" và tự động kết nối lại khi có mạng |
|--------------------|---|
| **Điều kiện sau** | Tin nhắn được lưu vĩnh viễn trên Firestore; cả hai bên đều nhận |
| **Điều kiện thoát** | Khi người dùng đóng cửa sổ chat |

---

## 4.14 Đặc Tả Use Case Quản Lý Sprint

| Mã Usecase | UC21 |
|------------|------|
| **Tên Usecase** | Usecase Quản Lý Sprint |
| **Tác nhân** | Sinh viên, Giáo viên hướng dẫn |
| **Mô tả** | Cho phép sinh viên lên kế hoạch sprint theo Agile, GV theo dõi và comment tiến độ |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Sinh viên vào "Đồ án của tôi" → tab "Sprint", nhấn "Tạo sprint mới" | |
| | 2 | | Hiển thị form: tên sprint, mục tiêu, ngày bắt đầu, ngày kết thúc, danh sách task |
| | 3 | Nhập thông tin sprint và danh sách task | |
| | 4 | Nhấn "Lưu sprint" | |
| | 5 | | Lưu sprint với trạng thái "Đang lập kế hoạch", thông báo đến GV |
| | 6 | GV vào xem sprint, để lại comment hoặc yêu cầu điều chỉnh | |
| | 7 | | Hiển thị comment của GV; gửi thông báo đến sinh viên |
| | 8 | Sinh viên cập nhật trạng thái task: Chưa làm → Đang làm → Hoàn thành | |
| | 9 | | Lưu trạng thái mới, cập nhật thanh tiến độ sprint |

| **Luồng thay thế** | Nếu ngày kết thúc sprint nhỏ hơn ngày bắt đầu, hệ thống báo lỗi. GV có thể yêu cầu SV điều chỉnh mục tiêu sprint |
|--------------------|---|
| **Điều kiện sau** | Sprint được lưu và hiển thị trong danh sách; GV theo dõi được tiến độ |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |

---

## 4.15 Đặc Tả Use Case Quản Lý Người Dùng (Admin)

| Mã Usecase | UC70 |
|------------|------|
| **Tên Usecase** | Usecase Quản Lý Sinh Viên |
| **Tác nhân** | Quản trị viên (Admin) |
| **Mô tả** | Cho phép Admin thêm, sửa, kích hoạt / vô hiệu hóa tài khoản sinh viên |

| Luồng sự kiện | STT | Tác nhân | Hệ thống phản hồi |
|--------------|-----|----------|-------------------|
| | 1 | Vào "Quản lý sinh viên" | |
| | 2 | | Hiển thị danh sách sinh viên với thông tin: tên, MSSV, lớp, email, trạng thái |
| | 3a | Nhấn "Import từ Excel" | |
| | 4a | Chọn file Excel đúng template | |
| | 5a | | Đọc dữ liệu từ file, tạo tài khoản Firebase Auth và lưu vào DB cho từng sinh viên. Báo cáo kết quả: thành công / lỗi từng dòng |
| | 3b | Nhấn "Thêm mới" để tạo thủ công | |
| | 4b | Nhập thông tin sinh viên | |
| | 5b | | Tạo tài khoản Firebase Auth, lưu vào DB, gửi thông tin đăng nhập |
| | 3c | Nhấn toggle "Kích hoạt / Vô hiệu hóa" | |
| | 4c | | Cập nhật trạng thái tài khoản; sinh viên bị khóa không thể đăng nhập |

| **Luồng thay thế** | Nếu file Excel sai template hoặc trùng MSSV, hệ thống bỏ qua các dòng lỗi và báo cáo chi tiết |
|--------------------|---|
| **Điều kiện sau** | Tài khoản sinh viên được tạo / cập nhật trong hệ thống |
| **Điều kiện thoát** | Khi chức năng thực hiện thành công / Khi người dùng nhấn thoát |
