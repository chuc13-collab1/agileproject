# CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 6.1. Kết luận chung về đề tài
Trong suốt quá trình thực hiện đồ án **"Xây dựng hệ thống Quản lý Đồ án theo mô hình Agile (Agile Project Management)"**, nhóm thực hiện đã tìm hiểu, phân tích và áp dụng thành công các kiến thức chuyên ngành Công nghệ thông tin từ lý thuyết vào thực tiễn. Đề tài không chỉ mang lại một giải pháp phần mềm quản lý học vụ số hóa mà còn thay đổi tư duy làm việc nhóm của sinh viên theo hướng công nghiệp (chuẩn Agile/Scrum).

Nhìn chung, hệ thống đã đáp ứng được các mục tiêu cốt lõi:
- **Số hóa quy trình:** Chuyển đổi toàn bộ quy trình từ việc sinh viên lập nhóm, đăng ký đề tài đến khi giảng viên giao task, theo dõi tiến độ và chấm điểm lên nền tảng số.
- **Tính thực tiễn cao:** Mô phỏng lại cách quản trị dự án phần mềm chuyên nghiệp thông qua Bảng Kanban (Kanban Board), giúp sinh viên làm quen với luồng công việc thực tế của các doanh nghiệp CNTT (sắp xếp Task, cập nhật State In-Progress/Review/Done).
- **Hệ sinh thái Đa nền tảng:** Kết hợp mượt mà giữa **Web App (React)** dành cho Giảng viên/Quản trị viên với **Mobile App (Flutter)** tiện dụng cho Sinh viên để xem thông báo (Push Notification) và cập nhật báo cáo nhanh chóng mọi lúc mọi nơi.
- **Kiến trúc linh hoạt:** Hệ thống Backend (Node.js/Express) kết hợp CSDL quan hệ (MySQL) đáp ứng tốt và ổn định các nghiệp vụ vòng lặp phức tạp, phân quyền an toàn với JWT và có khả năng mở rộng.

## 6.2. Các kết quả cụ thể đạt được

1. **Về mặt công nghệ:**
   - Xây dựng thành công hệ thống Frontend Web bằng React 18, Vite.
   - Hoàn thiện ứng dụng Mobile đa nền tảng bằng Flutter áp dụng Clean Architecture.
   - Triển khai thành công Backend RESTful API bằng Node.js, Express và bảo mật bằng sơ đồ JWT.
   - Thao tác thành thạo CSDL MySQL trong việc thiết kế Schema phân mảnh phức tạp (User - Class - Project - Task - Sprint).

2. **Về mặt nghiệp vụ chức năng:**
   - Hoàn tất phân hệ Admin: CRUD tài khoản, Import Excel, Export danh sách.
   - Hoàn tất phân hệ Giảng viên: Duyệt đề tài, Bảng điều khiển (Dashboard) theo dõi các nhóm bằng biểu đồ, Review & Nhận xét Task, Chấm điểm.
   - Hoàn tất phân hệ Sinh viên: Tạo Work-space, Kéo/thả Task (Kanban), theo dõi Deadline Sprint, Nộp file minh chứng, Nhận thông báo Real-time.

3. **Về mặt kỹ năng:**
   - Củng cố kỹ năng làm việc nhóm, quản lý source code (Git/GitHub).
   - Nâng cao khả năng phân tích thiết kế hệ thống (vẽ Use Case, Activity Diagram, ERD).
   - Tiếp cận quy trình phát triển phần mềm theo vòng đời tiêu chuẩn.

## 6.3. Những mặt còn hạn chế
Mặc dù hệ thống đã hoạt động ổn định và đáp ứng cơ bản các yêu cầu đặt ra, nhưng vẫn còn một số điểm giới hạn do rào cản về thời gian và giới hạn hạ tầng máy chủ sinh viên:
- **Tốc độ phản hồi Real-time:** Một số tính năng cập nhật bảng Kanban giữa các thành viên đang làm cùng 1 nhóm chưa được đồng bộ tức thời tuyệt đối (chưa triển khai WebSocket toàn diện) mà phải làm mới trang hoặc phụ thuộc vào thông báo đẩy (Push Notifications Firebase).
- **Tương tác trực tiếp:** Chưa tích hợp được khu vực thảo luận/Chat nội bộ cho từng nhóm hay giữa Nhóm – Giảng viên ngay trên ứng dụng, người dùng vẫn phải trao đổi qua Zalo hoặc nền tảng khác.
- **Phân tích dữ liệu (Data Analytics):** Hệ thống Report/Dashboard cho Giảng viên mới dừng ở mức Thống kê tổng quan (Pie Chart, Bar Chart cơ bản). Chưa có các biểu đồ phân tích hiệu suất tối ưu đặc trưng của Scrum như Burndown Chart (Biểu đồ đốt lưới công việc).

## 6.4. Định hướng phát triển tương lai
Để hoàn thiện và có thể đưa hệ thống vào áp dụng thực tiễn ở quy mô toàn trường (toàn Khoa CNTT), nhóm đề xuất các hướng phát triển tiếp theo trong tương lai:
1. **Nâng cấp tính năng Chat & Video Call:** Tích hợp Socket.io và WebRTC để sinh viên/giảng viên có thể trao đổi trực tuyến hoặc họp nhóm (Daily meeting) ngay trên hệ thống.
2. **Áp dụng AI/Machine Learning:** 
   - Gợi ý đề tài thông minh cho sinh viên dựa trên điểm số hoặc môn học thế mạnh.
   - Tự động nhận diện rủi ro (Risk Alert) cho Giảng viên nếu một nhóm sinh viên có dấu hiệu trễ nải (Task bị tồn đọng ở trạng thái "To-Do" quá 7 ngày).
3. **Mở rộng kết nối (Integration):** Tích hợp OAuth2/SSO với hệ thống đăng nhập dùng chung của Nhà trường để đồng bộ danh sách Sinh viên/Giảng viên/Lớp học phần tự động từ Cổng Đào Tạo.
4. **Tối ưu Big Data:** Khi số lượng dữ liệu Log/Task lên đến hàng triệu bản ghi, cần áp dụng các cơ chế Caching (Redis) và NoSQL để giảm tải cho DB chính (MySQL) khi truy xuất lịch sử báo cáo.

---
**Tóm lại**, kết quả thực hiện đồ án đã minh chứng cho những nỗ lực nghiên cứu và làm việc nghiêm túc. Đề tài "Hệ thống Quản lý Đồ án mô hình Agile" là một bước đệm quan trọng, không chỉ củng cố lượng kiến thức nền tảng vững chắc mà còn mở ra tầm nhìn về việc xây dựng các dự án phần mềm quy mô lớn, hướng đến giá trị thiết thực cho môi trường Giáo dục & Đào tạo.
