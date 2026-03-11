# PHỤ LỤC: ĐẶC TẢ USE CASE CHI TIẾT
Tài liệu này đặc tả chi tiết các Use case (ca sử dụng) và luồng sự kiện cốt lõi của Hệ thống Quản lý Đồ án Tốt nghiệp theo mô hình Agile.

---

### UC01: Đăng nhập hệ thống

*   **Mã Use case:** `UC01`
*   **Tên Use case:** Đăng nhập
*   **Tác nhân:** Sinh viên, GV Hướng dẫn, GV Phản biện, Admin
*   **Mô tả:** Cho phép người dùng truy cập hệ thống bằng tài khoản đã được cấp hoặc tạo mới.
*   **Điều kiện trước:** Hệ thống có sẵn tài khoản hợp lệ kết nối với Firebase Auth.
*   **Luồng sự kiện chính:**
    1. **Tác nhân:** Truy cập vào hệ thống.
    2. **Hệ thống:** Hiển thị màn hình đăng nhập (chọn role hoặc nhập thông tin).
    3. **Tác nhân:** Nhập thông tin Email/Mật khẩu hoặc chọn đăng nhập Google.
    4. **Tác nhân:** Nhấn "Đăng nhập".
    5. **Hệ thống:** Gửi request đến Firebase Auth để xác thực. Gửi token xuống Backend kiểm tra Role.
    6. **Hệ thống:** Cấp JWT token phiên làm việc và điều hướng người dùng tới Dashboard tương ứng với Role.
*   **Luồng thay thế:**
    *   *Bước 5:* Sai Email hoặc Mật khẩu -> Hệ thống hiển thị thông báo "Tài khoản hoặc mật khẩu không đúng".
    *   *Bước 5:* Tài khoản Admin đã khóa -> Hệ thống cảnh báo "Tài khoản của bạn đã bị vô hiệu hóa".
*   **Điều kiện sau (Post-condition):** Phiên làm việc (Session) được khởi tạo thành công bằng JWT token.

---

### UC10: Đề xuất đề tài (Giáo viên)

*   **Mã Use case:** `UC10`
*   **Tên Use case:** Đề xuất đề tài mới
*   **Tác nhân:** Giáo viên hướng dẫn
*   **Mô tả:** Cho phép GV hướng dẫn tạo và đề nghị một đề tài mới lên hệ thống để Admin duyệt.
*   **Điều kiện trước:** Giáo viên đã đăng nhập thành công. Kỳ đăng ký đồ án đang ở trạng thái "Mở" hoặc "Sắp mở".
*   **Luồng sự kiện chính:**
    1. **Tác nhân:** Vào chức năng "Đề tài của tôi", nhấn nút **Đề xuất đề tài mới**.
    2. **Hệ thống:** Hiển thị Form điền: tên đề tài, mô tả, yêu cầu, lĩnh vực, số lượng SV tối đa.
    3. **Tác nhân:** Điền đầy đủ bộ thông tin và nhấn **Gửi đề xuất**.
    4. **Hệ thống:** Lưu đề tài mới vào database với trạng thái `"PENDING"` (Chờ duyệt).
    5. **Hệ thống:** Gửi thông báo Notification đến hệ thống của Admin.
    6. **Hệ thống:** Hiển thị thông báo "Đề xuất đề tài thành công, đang chờ phê duyệt".
*   **Luồng thay thế:**
    *   *Bước 3:* Thiếu trường bắt buộc định dạng -> Hệ thống báo lỗi Validate (Màu đỏ) và giữ nguyên trang, focus vào ô bị thiếu.
    *   *Bước 2:* Kỳ đồ án đã khóa hẳn không còn cho đăng ký đề tài -> Hệ thống báo lỗi và ẩn chức năng thêm mới.
*   **Điều kiện sau:** Có 1 bản ghi đề tài mới ở trạng thái chờ duyệt trong hệ thống. Admin nhận được thông báo.

---

### UC08: Phê duyệt đề tài (Admin)

*   **Mã Use case:** `UC08`
*   **Tên Use case:** Phê duyệt đề tài
*   **Tác nhân:** Quản trị viên (Admin)
*   **Mô tả:** Cho phép Admin xem, kiểm duyệt hoặc từ chối đề tài do giáo viên đề nghị.
*   **Điều kiện trước:** Admin đã đăng nhập. Tồn tại ít nhất một đề tài trạng thái "Chờ duyệt".
*   **Luồng sự kiện chính:**
    1. **Tác nhân:** Vào menu "Quản lý đề tài", chuyển sang Tab "Chờ duyệt" (Pending).
    2. **Hệ thống:** Tải và hiển thị danh sách các đề tài PENDING.
    3. **Tác nhân:** Nhấn vào 1 đề tài để xem chi tiết thông tin (Tên, Lĩnh vực, GV, Yêu cầu).
    4. **Tác nhân:** Nhấn nút **Phê duyệt** (Approve).
    5. **Hệ thống:** Cập nhật bản ghi đề tài thành `"APPROVED"` (Đã duyệt).
    6. **Hệ thống:** Gửi in-app Notification đến thẳng GV chủ nhiệm đề tài đó.
*   **Luồng thay thế:**
    *   *Tại bước 4:* Admin chọn nút **Từ chối** (Reject). Hệ thống hiển thị Popup bắt buộc nhập lý do từ chối. Admin nhập xong nhấn Gửi. Hệ thống cập nhật trạng thái `"REJECTED"` và gửi thông báo kèm lý do về GV. Nếu Admin không nhập lý do -> Validate báo lỗi.
*   **Điều kiện sau:** Trạng thái đề tài chuyển thành Approve / Reject. Lượng đề tài khả dụng trên hệ thống tăng lên (nếu duyệt).

---

### UC09: Đăng ký đề tài (Sinh viên)

*   **Mã Use case:** `UC09`
*   **Tên Use case:** Đăng ký đề tài
*   **Tác nhân:** Sinh viên
*   **Mô tả:** Cho phép sinh viên truy cập kho đề tài và chọn 1 đề tài phù hợp để đăng ký.
*   **Điều kiện trước:** SV đã đăng nhập. Sinh viên chưa có đề tài trong kỳ hiện tại. Kỳ đăng ký đang mở.
*   **Luồng sự kiện chính:**
    1. **Tác nhân:** Vào chức năng "Danh sách Đề tài".
    2. **Hệ thống:** Hiển thị danh sách các đề tài đã Duyệt (`APPROVED`) và số lượng slot trống (`available_slots > 0`).
    3. **Tác nhân:** Tìm kiếm, lọc đề tài theo tên Giảng viên hoặc lĩnh vực, bấm vào để xem chi tiết.
    4. **Tác nhân:** Nhấn nút **Đăng ký đề tài này**.
    5. **Hệ thống:** Kiểm tra transaction DB (Sinh viên hiện tại chưa có đề tài + Đề tài còn Slot).
    6. **Hệ thống:** Tạo bản ghi bảng `TopicProposal` hoặc khóa mềm gắn kết SV vào đồ án với trạng thái `"WAITING_GV"`. Trừ bớt slot khả dụng của đề tài. Gửi thông báo đến cho GVHD.
    7. **Hệ thống:** Báo nhắc "Đăng ký thành công, chờ GV xác nhận".
*   **Luồng thay thế:**
    *   *Tại bước 5:* Nếu do load chậm mà có nhóm khác đã "tranh" đăng ký lấy slot cuối cùng -> Transation DB throws báo lỗi "Đề tài đã đầy slot". Reload lại trang.
*   **Điều kiện sau:** Giảm số lượng Slot đề tài, tạo bản ghi chờ xử lý từ phía Giảng Viên.

---

### UC04: Duyệt đơn đăng ký sinh viên (Giảng viên)

*   **Mã Use case:** `UC04_1`
*   **Tên Use case:** Xác nhận đăng ký đồ án
*   **Tác nhân:** Giáo viên hướng dẫn
*   **Mô tả:** Cho phép Giáo viên đồng ý hướng dẫn hoặc từ chối sinh viên đã đăng ký vào đề tài của mình.
*   **Điều kiện trước:** GV đã đăng nhập. Có SV vừa apply vào đề tài của GV đó.
*   **Luồng sự kiện chính:**
    1. **Tác nhân:** Vào chức năng "Quản lý Sinh viên đang đăng ký".
    2. **Hệ thống:** Hiển thị danh sách các sinh viên đang ở trạng thái Chờ xác nhận (Waitlist).
    3. **Tác nhân:** Xem xét thông tin và năng lực sinh viên, sau đó nhấn **Chấp nhận**.
    4. **Hệ thống:** Cập nhật trạng thái Project thành In Progress, ấn định liên kết SV - GV chính thức. Duyệt thông báo.
    5. **Hệ thống:** Nếu đề tài đạt lượng SV tối đa quy định, tự động chuyển state đề tài về `FULL`, không hiển thị trên danh sách Đăng ký nữa.
*   **Luồng thay thế:**
    *   *Tại bước 3:* GV nhấn **Từ chối**, hệ thống yêu cầu lý do nhẹ, sau đó trả lại Slot vào cho Đề tài. Xóa khóa mềm, báo hủy đến SV để SV chọn đề tài khác.
*   **Điều kiện sau:** Tồn tại 1 thực thể Project hoạt động chính thức giữa GV và SV.

---

### UC14: Quản lý Sprint (SV cập nhật tiến độ)

*   **Mã Use case:** `UC14`
*   **Tên Use case:** Tạo và cập nhật trạng thái Sprint (Agile)
*   **Tác nhân:** Sinh viên
*   **Mô tả:** Mạch máu của hệ thống - Cho phép SV phân chia công việc theo chu kỳ rẽ nhánh (1-2 tuần) và cập nhật tasks.
*   **Điều kiện trước:** SV đã có một Đồ án (Project) trạng thái `IN_PROGRESS`.
*   **Luồng sự kiện chính:**
    1. **Tác nhân:** Truy cập Project Dashboard, chuyển qua tab **Sprints**, nhấn **Tạo Sprint mới**.
    2. **Hệ thống:** Hiển thị Form lấy tên Sprint (VD: Sprint 1 - Dựng base), ngày BD/KT, danh sách các task nhỏ.
    3. **Tác nhân:** Nhập đủ danh sách mục tiêu và task, bấm **Save Sprint**.
    4. **Hệ thống:** Lưu trạng thái Sprint `ACTIVE`.
    5. **Tác nhân:** Hàng ngày vào hệ thống, kéo thả Task (Kanban) từ Todo -> Doing -> Done.
    6. **Hệ thống:** Frontend tự động thay đổi thanh Progress Bar (%) hoàn thành Sprint real-time.
*   **Luồng thay thế:**
    *   *Lỗi nhập liệu:* Ngày kết thúc trước Ngày bắt đầu -> Hệ thống chặn lưu.
*   **Điều kiện sau:** Các taskboard được cập nhật, dữ liệu % hoàn thành sẵn sàng để review.

---

### UC15: Nộp và nhận xét báo cáo tiến độ (SV & GV)

*   **Mã Use case:** `UC15`
*   **Tên Use case:** Nộp và duyệt báo cáo (Sprint Review)
*   **Tác nhân:** Sinh viên (Nộp) & GV Hướng dẫn (Duyệt/Nhận xét)
*   **Mô tả:** Quy trình xác nhận kết thúc một Sprint.
*   **Luồng sự kiện chính:**
    1. **Tác nhân (SV):** Khi kết thúc thời gian Sprint, nhấn nút "Kết thúc Sprint & Nộp báo cáo" trên Sprint Board.
    2. **Hệ thống:** Hiển thị form cho nộp Document (PDF, file ZIP hoặc đính kèm link Source code).
    3. **Tác nhân (SV):** Gắn file và note, gởi báo cáo.
    4. **Hệ thống:** Chuyển trạng thái Sprint thành `REVIEWING`, upload file lên Firebase Storage lấy URL. Gửi thông báo đến GV.
    5. **Tác nhân (GV):** Nhận được thông báo, vào tab "Chờ nhận xét". 
    6. **Hệ thống:** Tải ra file đính kèm, danh sách task (completed/failed).
    7. **Tác nhân (GV):** Đọc nội dung, đánh giá điểm (Rating 1-5 sao), type nhận xét và đổi trạng thái (COMPLETED hoặc NEEDS_WORK).
    8. **Hệ thống:** Lưu review vào DB. Mở khóa Sprint tiếp theo cho SV. Thông báo kết quả về SV.
*   **Điều kiện sau:** Có bản ghi đánh giá chi tiết (Reviews) lưu trong DB, phục vụ cho việc tính điểm chuyên cần cuối kỳ.

---

### UC22: Chat Realtime & Hỏi AI Chatbot

*   **Mã Use case:** `UC22` & `UC23`
*   **Tên Use case:** Hệ thống giao tiếp (Chat)
*   **Tác nhân:** Sinh viên, Giáo viên
*   **Mô tả:** Kết nối kênh giao tiếp text tốc độ cao nhờ Firebase RTDB và gọi Trợ lý Ảo AI xử lý dữ liệu.
*   **Luồng sự kiện chính (Người - Người):**
    1. **Tác nhân:** Vào phòng chat nhóm "Đồ án X".
    2. **Hệ thống:** Listen on Firebase Firestore, render các dòng text cũ.
    3. **Tác nhân:** Gõ chat và bấm gửi.
    4. **Hệ thống:** Xóa ô nhập, push data lên Firebase, bên nhận lập tức được stream cập nhật UI mới (không cần f5).
*   **Luồng sự kiện chính (Người - AI Groq):**
    1. **Tác nhân:** Vào tab Trợ Lý AI. Gõ câu hỏi (VD: "Phân bổ thời gian đồ án làm Spring Boot thế nào?").
    2. **Hệ thống:** Nhận text. Đóng gói đoạn text bằng Prompt Engineering theo Ngữ Cảnh (ngành học, đề tài đang làm). Gửi API qua Groq Llama 3 API bằng Axios Stream.
    3. **Hệ thống (Web):** Màn hình người dùng hiển thị hiệu ứng chữ type (streaming) trả lời mượt mà.
    4. **Tác nhân:** Có thể hỏi tiếp trên bối cảnh hội thoại session đó.
*   **Điều kiện sau:** Log chat được lưu, Session AI có thể lưu lại History.

---

### UC17: Phân công GV Phản biện (Admin)

*   **Mã Use case:** `UC17`
*   **Tên Use case:** Phân công GV Phản biện thuật toán
*   **Tác nhân:** Admin
*   **Mô tả:** Quy trình chỉ định Giảng viên chấm điểm phản biện cho hệ thống đồ án khi nộp bài cuối cùng.
*   **Luồng sự kiện chính:**
    1. **Tác nhân:** Vào Menu Phân công hội đồng/Phản biện.
    2. **Hệ thống:** Load list đồ án sắp nộp nhưng trống Giáo viên PB.
    3. **Tác nhân:** Nhấn vào Đồ án X. Sau đó bấm nút **Gợi ý Tự Động (AI Recommend)**.
    4. **Hệ thống:** Gửi cấu hình "Tên đề tài X", "Keywords công nghệ", "Chuyên môn GV" cho AI xử lý.
    5. **Hệ thống:** Đề xuất List Top 3 Giáo viên có Match Score % cao nhất. Load xuống giao diện.
    6. **Tác nhân:** Chọn ngay 1 GV trong mảng gợi ý đó, xác nhận Assign.
    7. **Hệ thống:** Báo check validate (Đảm bảo GV phản biện `!=` GV hướng dẫn). Update DB, gửi email cho thầy phản biện.
*   **Luồng thay thế:** AI bị timeout -> Pop-up báo, tự động fallback về màn Dropdown ComboBox chọn GV thủ công.

---

### UC18: Chấm điểm đồ án tổng hợp (Hướng dẫn & Phản biện & Tổng kết)

*   **Mã Use case:** `UC18`
*   **Tên Use case:** Quy trình nhập điểm & Báo cáo cuối kỳ
*   **Tác nhân:** GV Hướng Dẫn, GV Phản biện, Admin
*   **Mô tả:** Các thao tác chấm điểm (Mô hình 2 thang điểm HD & PB).
*   **Luồng sự kiện chính:**
    1. **Tác nhân (GVHD & GVPB):** Vào tab "Chấm điểm", mở form form Đồ án SV đã nộp bản final.
    2. **Hệ thống:** Mở giao diện 4 tiêu chí trắc nghiệm form có sẵn (Nội dung, Kỹ thuật, Trình bày, Thái độ). Giới hạn input từ (0-10).
    3. **Tác nhân:** Nhập số liệu và Nhấn Lưu Xác Nhận.
    4. **Hệ thống:** Lưu vào Field tương ứng (`supervisor_score` hoặc `reviewer_score`). Validate giới hạn >= 0 và <= 10.
    5. **Tác nhân (Admin):** Cuối đợt vào tab "Tổng kết Điểm bảng". Hệ thống tự nhận diện nếu các đồ án có ĐẦY ĐỦ cả 2 field -> Thực hiện phép toán `final = (SV_GVHD * 60%) + (SV_GVPB * 40%)` (Tỷ lệ động configure). Đánh giá chữ A, B, C, D...
    6. **Tác nhân (Admin):** Ấn "Công bố hệ thống".
    7. **Hệ thống:** Set trạng thái End Project. Public điểm lên Dashboard SV, hỗ trợ nút "Export Excel" để Admin làm giấy tờ.
*   **Điều kiện sau:** Dự án khép kín hoàn thành, đánh giá Academic Assessment được public thành công.

---
*Tài liệu này được soạn thảo vào lúc Hệ thống Đồ án Tốt Nghiệp chuẩn bị Implement - Update 2024.*
