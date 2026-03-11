# CHƯƠNG 5. KẾT QUẢ ĐỀ TÀI VÀ ĐÁNH GIÁ

## 5.1. Môi trường phát triển và triển khai
Hệ thống **Agile Project Management** được phát triển trên đa nền tảng (Web và Mobile) cùng với hệ thống Backend mạnh mẽ, phục vụ nhiều đối tượng người dùng: Quản trị viên, Giảng viên và Sinh viên.

- **Frontend Web:** Sử dụng **React 18** (với TypeScript), Vite, Tailwind CSS để tối ưu tốc độ build và render giao diện. Thư viện React Router DOM, Axios, Recharts phục vụ điều hướng, gọi API và trực quan hóa dữ liệu thống kê. Áp dụng PWA (Progressive Web App) giúp ứng dụng duyệt web linh hoạt.
- **Frontend Mobile:** Sử dụng framework **Flutter**, tổ chức kiến trúc theo Clean Architecture, Riverpod làm State Management, Go Router để điều hướng và các plugin UI chuẩn (Cupertino Icons, Google Fonts, Shimmer) để phát triển ứng dụng di động đa nền tảng cho Android và iOS với hiệu năng native.
- **Backend API:** Xây dựng bằng **Node.js và Express** theo chuẩn RESTful API. Áp dụng kiến trúc Model-Controller-Route rành mạch. Zod cho validate dữ liệu đầu vào. Zod và JWT tăng cường bảo mật. Firebase Admin SDK kết hợp với quy trình xử lý đa luồng. Tích hợp AI AI/Gemini vào trợ lý thông minh.
- **Cơ sở dữ liệu (DBMS):** **MySQL** để quản lý dữ liệu có cấu trúc phức tạp (quan hệ user, sinh viên, giảng viên, đồ án, nhóm, task). Sử dụng transaction cho các nghiệp vụ cập nhật chéo bảng dữ liệu nhằm đảm bảo tính toàn vẹn (ACID).
- **Công cụ hỗ trợ khác:** Firebase (Authentication, Cloud Messaging Push Notifications), Postman để test API, Git/GitHub để quản lý version code, JWT bảo mật Authentication. Nodemailer gửi email thông báo. Xuất báo cáo qua jsPDF/Excel.

---

## 5.2. Kết quả đạt được của hệ thống

Sau quá trình nghiên cứu, phân tích thiết kế và xây dựng code, hệ thống cơ bản đạt được các mục tiêu chức năng đặt ra, giải quyết trọn vẹn bài toán quản lý quy trình làm đồ án theo quy chuẩn Agile cho sinh viên ngành CNTT. Dưới đây là các phân hệ đã triển khai thành công:

### 5.2.1. Phân hệ Định danh và Phân quyền (Authentication & Authorization)
- Đăng nhập an toàn theo cơ chế Email/Mật khẩu lưu trữ băm.
- Định danh và cấp quyền rành mạch cho 3 Role: **Admin** (Quản lý cấp cao), **Teacher** (Giảng viên hướng dẫn) và **Student** (Sinh viên thực hiện đề tài).
- Cơ chế bảo mật JWT + Middleware bảo vệ API trên Backend chống truy cập trái phép. Phân quyền Router trên cả Web và Mobile.

### 5.2.2. Phân hệ Quản trị viên (Admin Portal - Web)
- **Quản lý Tài khoản (User Management):** Xem danh sách toàn bộ người dùng. Hỗ trợ tạo mới đơn lẻ hoặc import hàng loạt Sinh viên/Giảng viên từ file Excel (.csv, .xlsx). Tính năng khóa/mở khóa tài khoản linh hoạt.
- **Quản lý Thể loại, Học kỳ (Category & Semester):** Thiết lập các học kỳ cho từng khóa đồ án, quản lý các danh mục công nghệ (Web, AI, Mobile, Security, v.v.).
- **Quản lý Lớp học (Class Management):** Tạo lớp học phần, phân công Giảng viên đứng lớp, cấu hình số lượng sinh viên tối đa, deadline nộp đề tài/nhóm.
- **Export Dữ liệu:** Hỗ trợ xuất danh sách, báo cáo điểm số dưới định dạng Excel và PDF để lưu trữ học vụ.

### 5.2.3. Phân hệ Giảng viên (Teacher Dashboard - Web/Mobile)
- **Quản lý Đề tài (Topic Management):** Chủ động tạo danh sách đề tài gơi ý. Kiểm duyệt, từ chối hoặc yêu cầu sửa đổi các đề tài do sinh viên (hoặc nhóm trưởng) tự đề xuất.
- **Quản lý Lớp và Nhóm (Class & Group):** Quản lý trạng thái các nhóm trong lớp mình phụ trách. Xem danh sách thành viên của từng nhóm.
- **Bảng điều khiển Tiến độ (Kanban Board):** Theo dõi tiến độ task của tất cả các nhóm theo thời gian thực. Bảng Kanban hỗ trợ cột (To-Do, In Progress, Review, Done). Giảng viên có quyền kéo/chuyển trạng thái khi Task đã đạt yêu cầu hoặc trả lại yêu cầu sửa đổi (Review -> In Progress).
- **Phản hồi và Chấm điểm (Grading & Commenting):** Thêm nhận xét / feedback trực tiếp trên từng Task của sinh viên. Đánh giá và nhập điểm tổng kết vào cuối kỳ cho các đồ án.
- **Thống kê (Analytics):** Biểu đồ hiển thị tình trạng hoàn thành công việc của từng nhóm, biểu đồ phân loại đề tài. (Có sự tham gia của thư viện Recharts).

### 5.2.4. Phân hệ Sinh viên (Student Portal - Web/Mobile)
- **Tham gia nhóm & Đăng ký (Group & Registration):** Tự do tìm kiếm nhóm/lớp học phần còn trống để xin tham gia. Nhóm trưởng có quyền đại diện đề xuất đề tài lên Giảng viên hoặc chọn đề tài từ thư viện gợi ý của Giảng viên.
- **Quản lý Sprint & Task chuẩn Agile:** 
  - Xem danh sách các Sprint/Tuần làm việc.
  - Tự tạo các Task nhỏ dựa trên User Story, gán (assign) Task cho thành viên trong nhóm. Cập nhật ngày bắt đầu, deadline.
  - Giao diện kéo thả Kanban (Drag & Drop) trực quan giúp sinh viên tự chuyển trạng thái Task khi đang làm hoặc hoàn thành.
  - Nộp minh chứng (Attach Files/Links Github).
- **Nhận thông báo (Push Notifications):** Qua Firebase Cloud Messaging, sinh viên nhận ngay thông báo khi Giảng viên duyệt đề tài, comment lỗi sai hoặc nhắc nhở deadline sắp đến.

### 5.2.5. Hiệu năng Backend và DevOps
- Khung sườn Backend xử lý đồng thời lượng lớn request từ cả app Web và Mobile qua cơ chế non-blocking I/O của Node.js.
- Upload/Lưu trữ file chứng minh đề tài (PDF, hình ảnh) qua Multer, có cơ chế sanitize bảo vệ.
- Có khả năng mở rộng/scale database nhờ thiết kế Schema tối ưu với các khóa ngoại (Foreign Keys) chính xác giữa Student – Class – Group – Project – Task.

---

## 5.3. Trực quan hóa Giao diện Ứng dụng (Screenshots/UI)

*(Ghi chú cho SV: Chụp ảnh màn hình ứng dụng thực tế chạy trên máy tính hoặc điện thoại rồi chèn dưới mỗi tiêu đề)*

1. **Hình 5.1:** Giao diện Đăng nhập hệ thống (Web và App).
2. **Hình 5.2:** Layout UI Bảng điều khiển (Dashboard) của Quản trị viên quản lý danh mục.
3. **Hình 5.3:** Giao diện tính năng Import/Export danh sách Sinh viên bằng Excel.
4. **Hình 5.4:** Giao diện Quản lý Đề tài và xét duyệt cho Giảng viên.
5. **Hình 5.5:** Màn hình Kéo - Thả thẻ công việc trên Bảng Kanban chuẩn Agile (Sprint Board).
6. **Hình 5.6:** Tính năng Comment phản hồi Task trực tiếp và nhận thông báo trên app Mobile.
7. **Hình 5.7:** Giao diện Thống kê biểu đồ tiến độ các nhóm thuộc lớp học.

---

## 5.4. Đánh giá chất lượng sản phẩm

### 5.4.1. Ưu điểm nổi bật
- **Bám sát thực tiễn ngành CNTT:** Thay vì các hệ thống quản lý đăng ký đề tài truyền thống thuần văn bản, dự án này áp dụng mô hình quản trị Agile/Scrum. Điều này giúp hệ thống trở thành **công cụ rèn luyện** cho sinh viên cách chia nhỏ Task, làm việc nhóm, chuyển state trên Kanban y hệt công cụ JIRA / Trello ngoài doanh nghiệp.
- **Hoạt động đa nền tảng (Cross-platform):** Với combo Web React (cho Giảng viên/Admin dùng máy tính) và Mobile Flutter (để Sinh viên dễ chụp ảnh/xem thông báo trên điện thoại), hệ thống mang lại luồng trải nghiệm người dùng luân chuyển rất mượt mà, tiện lợi ở bất cứ đâu.
- **Công nghệ hiện đại & Kiến trúc tốt:** RESTful API tách biệt, bảo mật cao. Code Frontend Web và Mobile được thiết kế theo dạng Component tái sử dụng và Clean Architecture, dễ bảo trì, dễ thay đổi requirement nếu dự án cần scale.

### 5.4.2. Hạn chế và Hướng cải tiến
- **Tính năng giao tiếp (Chat):** Hiện mới dừng ở mức Comment (bình luận) vào Task. Tương lai nên mở rộng bằng WebSocket/Socket.IO để xây dựng phòng chat nhóm/giảng viên theo thời gian thực (Real-time chat room).
- **Hệ thống cảnh báo rủi ro tự động:** Thuật toán đánh giá nếu nhóm có lượng Task "In Progress" quá nhiều nhưng sát ngày Deadline mà không chuyển sang "Done" thì AI/Hệ thống tự động flag màu đỏ hoặc cảnh báo đẩy cho Giảng viên. 
- **Tối ưu Caching:** Do lượng Task lớn, ở những truy vấn truy xuất Bảng Kanban hoặc Dashboard, nên tích hợp thêm bộ nhớ đệm (Redis) để giảm tải cho database MySQL chính gốc khi có hàng nghìn sinh viên truy cập cùng lúc.

---

## 5.5. Kết luận phân đoạn (Chương 5)
Thông qua kết quả đạt được, đồ án đã triển khai thành công những thiết kế được đề ra ở Chương 4. Hệ thống **Agile Project Management** không chỉ là phần mềm "Quản lý Đồ án" thông thường, mà còn là môi trường ảo tích hợp quản lý Task nhóm mạnh mẽ. Mặc dù sản phẩm vẫn còn một số điểm cần mở rộng, song có thể khẳng định đề tài đã đạt được cơ bản các mục tiêu ban đầu, sản phẩm có thể đưa vào chạy thử nghiệm ở quy mô vừa và nhỏ (cấp khoa/cấp môn học).
