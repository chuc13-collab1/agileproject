## 4.3 Phân tích & Thiết kế CSDL

### 4.3.1 Phân tích yêu cầu dữ liệu

Hệ thống "Quản lý Đồ án Agile" yêu cầu lưu trữ và xử lý một lượng dữ liệu đa dạng để phục vụ quản lý thông tin tài khoản, đề tài, quy trình duyệt kết quả, lịch hẹn và trao đổi realtime. 

Căn cứ vào nghiệp vụ đã khảo sát ở phần 4.1, dữ liệu của hệ thống được chia thành 4 nhóm chính với các thực thể (Entity) đại diện như sau:

**1. Nhóm Dữ liệu Quản trị Nguồn Lực (Resource Management)**
Đây là nhóm cốt lõi liên quan đến quyền truy cập và phân bổ nhân sự sinh viên, giảng viên.
*   **Thực thể `User` (Người dùng):** Lưu trữ thông tin đăng nhập, vai trò phân quyền (Role: admin, teacher, student).
*   **Thực thể `Class` (Lớp học):** Lưu trữ thông tin các lớp tín chỉ/lớp hành chính được Admin tạo ra để gom nhóm sinh viên.
*   **Thực thể `UserClass` (Phân lớp):** Lưu trữ lịch sử, thời gian một Sinh viên tham gia vào một Lớp học cụ thể.

**2. Nhóm Dữ liệu Đề tài & Khởi tạo Đồ án (Topic & Project Initiation)**
Nhóm này phục vụ quy trình sinh viên đi tìm hoặc đề xuất đề tài trước khi chính thức bắt tay làm đồ án.
*   **Thực thể `Topic` (Đề tài):** Lưu trữ thông tin ngân hàng đề tài được tạo sẵn bởi Giảng viên (Tên, Mô tả, Lĩnh vực, Số thành viên).
*   **Thực thể `TopicProposal` (Đề xuất đề tài):** Lưu trữ yêu cầu tự đề xuất đề tài mới của Sinh viên gửi Giảng viên duyệt (chứa trạng thái Pending, Approved, Rejected).
*   **Thực thể `Project` (Đồ án):** Đây là vòng đời chính thức khi Sinh viên và Đề tài đã chốt hợp lệ. Lưu trữ trạng thái tổng thể của một nhóm sinh viên thực hiện một đồ án (Điểm số, Trạng thái nghiệm thu).
*   **Thực thể `ProjectStudent` (Thành viên nhóm):** Liên kết nhiều SV vào cùng một Đồ án (mô hình làm việc nhóm).

**3. Nhóm Dữ liệu Quản lý Tiến độ (Agile Process Data)**
Nhóm này là điểm nhấn của hệ thống, phục vụ vòng lặp quản lý tiến độ Agile/Scrum.
*   **Thực thể `Sprint` (Vòng lặp/Giai đoạn):** Chia đồ án thành các khoảng thời gian (phân đoạn) ngắn hạn. Lưu trữ mục tiêu, ngày bắt đầu, ngày kết thúc và trạng thái của Sprint.
*   **Thực thể `SprintComment` (Góp ý Sprint):** Lưu trữ nhận xét, trao đổi nhanh giữa GV và SV trong phạm vi một Sprint cụ thể.
*   **Thực thể `ProgressReport` (Báo cáo tiến độ):** Lưu trữ biên bản báo cáo (form chữ, URL đính kèm tài liệu, link mã nguồn) do SV nộp lên khi kết thúc một Sprint.

**4. Nhóm Dữ liệu Trợ giúp & Tương tác (Interaction Data)**
*   **Thực thể `Appointment` (Lịch hẹn/Meeting):** Lưu trữ lịch gặp mặt trực tuyến hoặc trực tiếp giữa SV và GV dựa trên các khung giờ GV rảnh.
*   **Thực thể `Announcement` (Thông báo):** Quyết định, quy chế được Admin ban hành cho toàn bộ Sinh viên/Giảng viên.
*   **Thực thể `Notification` (Thông báo tự động):** Lưu trữ hệ thống Notification chuông khi có báo cáo mới nộp, có đề tài được duyệt, v.v.

*(Lưu ý: Dữ liệu trao đổi trực tiếp Chat App và các File Binary PDF/Docx sẽ không lưu trực tiếp thông qua Relational Schema này mà được quản lý độc lập tại Cloud của nền tảng Firebase).*

*(Các mô tả trên sẽ được hình thức hóa thành Sơ đồ ERD (Mô hình khái niệm) ở mục 4.3.2).*
