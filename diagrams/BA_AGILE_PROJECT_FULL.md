# BÁO CÁO GIAI ĐOẠN 1
## KHẢO SÁT VÀ PHÂN TÍCH NGHIỆP VỤ
*(Thời gian: 12/01 – 02/02/2026)*

**Đề tài**: Xây dựng hệ thống Quản lý Đồ án Tốt nghiệp theo mô hình Agile

---

## 1. TỔNG QUAN ĐỀ TÀI

### 1.1 Giới thiệu
Trong môi trường giáo dục đại học, Quy trình làm Đồ án Tốt nghiệp (ĐATN) đóng vai trò quyết định đánh giá năng lực đầu ra của sinh viên. Tuy nhiên, phương pháp quản lý truyền thống hiện đang bộc lộ nhiều hạn chế: Việc trao đổi giữa Giảng viên (GV) hướng dẫn và Sinh viên (SV) thường ngắt quãng qua email, Drive hoặc zalo; GV khó theo dõi khối lượng công việc hàng ngày của SV; và việc đánh giá tiến độ thường dồn vào cuối kỳ, dẫn đến hiện tượng "nước đến chân mới nhảy". 

Nhận thấy khoảng trống này, dự án **Agile Project Management (APM)** ra đời với sứ mệnh đổi mới quy trình quản lý ĐATN. APM ứng dụng tư duy **Agile/Scrum** – mô hình quản lý dự án phần mềm chuyên nghiệp – vào quản lý đồ án. Hệ thống giúp chia nhỏ đồ án thành các chu kỳ làm việc (Sprints), trực quan hóa công việc qua bảng Kanban, giúp SV chủ động cập nhật công việc hàng ngày và GV đánh giá tiến độ sát sao hơn. Ngoài ra, việc tích hợp **Trợ lý AI (Gemini)** hỗ trợ tư vấn kỹ thuật và tự động gán GV Phản biện giúp tối ưu hóa nghiệp vụ quản lý cho nhà trường. 

Từ góc độ sư phạm, APM rèn luyện cho SV thói quen làm việc có kế hoạch, bám sát deadline và làm quen với quy trình doanh nghiệp sớm. Về quản lý, hệ thống tạo ra chuỗi dữ liệu đánh giá liên tục, minh bạch và chính xác cho toàn bộ đợt bảo vệ.

### 1.2. Mục tiêu

#### 1.2.1. Mục tiêu tổng quát
Xây dựng hệ thống APM là một nền tảng quản lý đồ án toàn diện, kết nối Sinh viên – Giảng viên – Admin. Hệ thống lấy cấu trúc Sprint/Task làm trung tâm (Core), kết hợp giao tiếp thời gian thực (Chat) và Trí tuệ nhân tạo (AI) để kiến tạo quy trình bảo vệ đồ án khép kín, an toàn và đạt hiệu suất cao.

#### 1.2.2. Mục tiêu cụ thể
1.  **Về kỹ thuật**: Xây dựng hệ thống trên nền tảng **React 18 (Vite) + TypeScript** cho Frontend nhằm đạt tốc độ render nhanh; **Node.js (Express)** cho API xử lý; **MySQL** lưu trữ dữ liệu quan hệ và **Firebase** điều phối cấu trúc Realtime (Chat) và Module Authen.
2.  **Về chức năng**: Triển khai 26 chức năng cốt lõi chia thành 5 nhóm module chính: Quản lý Đề tài/Dự án; Quản lý Agile (Sprint/Kanban); Hệ thống Chấm điểm; Giao tiếp (Chat & AI Chatbot); và Quản trị hành chính.
3.  **Về bảo mật**: Triển khai xác thực qua **Firebase Auth kết hợp JWT Token** Backend. Áp dụng cơ chế phân quyền Role-Based Access Control (RBAC) chặt chẽ với các role: Student, Teacher, Admin.
4.  **Về trải nghiệm (UX/UI)**: Hệ thống đạt tính thích ứng (Responsive) tốt trên Desktop, Tablet và Mobile. Sử dụng typography, spacing chuẩn hóa cho phân vùng làm việc gọn gàng.
5.  **Về hỗ trợ thông minh**: Ứng dụng AI phân tích từ khóa chuyên môn để **gợi ý Giảng viên phản biện (Reviewer)** tương ứng cho Admin gán assign cực gọn.

### 1.3. Phạm vi của đề tài
*   **Đối tượng sử dụng**: Sinh viên thực hiện đồ án, Giảng viên Hướng dẫn/Phản biện, và Quản trị viên (Khoa/Trường).
*   **Phạm vi chức năng**: Tập trung 26 usecase cốt lõi định hình vòng đời dự án từ Đăng ký ➔ Duyệt ➔ Kế hoạch Agile (Sprinting) ➔ Giao tiếp ➔ Chấm điểm tổng kết.
*   **Phạm vi kỹ thuật**: React Client structure chuẩn layered, Express Backend modular route, hệ thống Hybrid DB (MySQL + Firebase RTDB).

---

## 2. KHẢO SÁT VÀ PHÂN TÍCH

### 2.1 Phương pháp khảo sát
1.  **Nghiên cứu tài liệu (Theory)**: Đi sâu tìm hiểu mô hình Agile/Scrum (Product Backlog, Sprint, Daily Meet, Sprint Review) và quy chế đào tạo tín chỉ, làm đồ án của các trường đại học.
2.  **Phân tích hệ thống tương tự (Competitor setup)**: Nghiên cứu các app quản lý task chuyên nghiệp như **Jira, Trello, Asana**. Rút ra kiến trúc bàng Kanban tối giản và xây dựng lại theo context "Nghiệp vụ giáo dục / Đồ án tốt nghiệp".
3.  **Phương pháp khảo sát người dùng**: 
    *   Phỏng vấn Sinh viên về tình trạng quên Task, trễ deadline và mất log trao đổi với GVHD.
    *   Trao đổi với Giảng viên để hiểu khó khăn trong việc nhắc nhở hàng chục nhóm và chấm điểm chuyên cần cuối kỳ.

### 2.2. Kết quả khảo sát

#### 2.2.1. Nhu cầu của Sinh viên (Student)
Sinh viên có nhu cầu cao về việc **Chia nhỏ công việc**. Thay vì dồn mọi thứ vào deadline cuối kỳ, SV mong muốn hệ thống ép deadlines từng tuần gọn gàng.
*   Cần Dashboard theo dõi: Tiến độ hoàn thành đồ án bao nhiêu % hiện tại.
*   Cần không gian giao tiếp: Nộp báo cáo không bị trôi như zalo.
*   Cần gợi ý đáp án nhanh: Có AI chatbot túc trực 24/7 để gỡ lỗi kỹ thuật hoặc tư vấn giải thuật.

#### 2.2.2. Nhu cầu của Giảng viên (Teacher)
Giảng viên hướng dẫn cần một bảng theo dõi danh sách các nhóm họ đang quản trị:
*   Cần biết Group A tuần này làm task gì, Group B đang bị block ở đâu thông qua biểu đồ hoặc báo cáo Sprint.
*   Ghi chú (Comment) phản hồi trực tiếp ngay khi SV nộp báo cáo online, duyệt hoặc cần làm lại (NEEDS_WORK).
*   Công cụ nhập điểm đa tiêu chí (Nội dung, Hình thức, Kỹ thuật) lưu trữ an toàn.

#### 2.2.3. Nhu cầu của Quản trị viên (Admin)
Admin (Trợ lý giáo vụ / Admin Khoa) cần một góc nhìn Toàn cảnh:
*   Phê duyệt đề tài giáo viên mở cho học kỳ mới.
*   Theo dõi danh sách SV chưa có đề tài để hỗ trợ.
*   **Điểm nghẽn phản biện**: Thường mất nhiều thời gian dò danh sách GV rảnh/phù hợp chuyên ngành để gán chấm phản biện. Admin cần công tụ gán Reviewer thông minh, tự động hóa.

---

## 3. CÔNG NGHỆ VÀ CÔNG CỤ SỬ DỤNG

*   **TypeScript**: Chuẩn hóa kiểu dữ liệu cho toàn hệ thống Client - Server, giảm thiểu lỗi runtime do biến null/undefined.
*   **React 18 + Vite**: Xây dựng Single Page Application (SPA) mượt mà, render Dynamic Kanban board không giật lag.
*   **Node.js (Express)**: Bộ API router backend nhẹ, dễ gán middleware Authentication xử lý logic query MySQL nhanh gọn.
*   **MySQL & Firebase**: 
    *   *MySQL*: Xử lý dữ liệu cấu trúc (Topic, Student, Score, Sprint).
    *   *Firebase*: Xử lý Realtime chat stream & Files storage.
*   **@google/genai (Gemini)**: Đóng vai trò Backend NLP tư vấn và phân tích Keywords.

---

## 4. KIẾN TRÚC HỆ THỐNG

APM tổ chức theo mô hình **Separation of Concerns (Tách biệt ứng dụng)**:

*   **Client**: Sử dụng kiến trúc Layered chuẩn - `components` chung, `pages` Dashboard cho từng Role riêng, `services` xử lý Axios API backend Call.
*   **Server**: RESTful API module, bọc qua middleware `verifyToken`. Các router handler gánh logic xử lý query database và phân chia endpoints sạch sẽ.
*   **Hybrid Database**: Tổ chức truy vấn dữ liệu đồng bộ. Quan hệ chính thuộc MySQL; Dữ liệu stream, thông báo rẽ nhánh sang socket/Firebase để chia tải.

---

## 5. CHỨC NĂNG HỆ THỐNG

### 5.1. Nhóm quản lý Đề tài & Dự án
Hỗ trợ GV đề xuất đề tài lên Admin kiểm duyệt. Phục vụ SV lọc tìm và **Đăng ký đề tài**. Khi đăng ký được GV chấp nhận, hệ thống biến thể thành Project trạng thái `IN_PROGRESS` chính thức.

### 5.2. Nhóm quản lý Agile (Sprint / Kanban)
**Mạch máu hệ thống**: Cho phép SV cấu hình Sprint (1-2 tuần) và lập mục tiêu. SV kéo thả Taskboard (Todo ➔ Doing ➔ Done), Progress bar tự động nhảy số. Cho phép SV nộp báo cáo kết thúc sprint và GV chấm điểm review (1-5 sao).

### 5.3. Nhóm Giao tiếp & AI Chuyên môn
Tạo room chat gán chết cho từng đồ án để GV-SV đàm thoại. Đồng thời bao gồm **Trợ lý AI Gemini Stream**, nhận diện context đề tài hiện tại bạn đang làm để sinh code mẫu, gợi ý logic và giải đáp thắc mắc không delay.

### 5.4. Nhóm Phản biện & Chấm điểm
Hệ thống cho phép nhập điểm song song (Hướng dẫn và Phản biện). Admin gán phản biện thông qua AI Recommend matching keywords. Hệ thống tự động tính điểm trung bình (Tự điều chỉnh dynamic ratio) và xuất file Excel báo cáo.

---

## 6. PHÂN QUYỀN NGƯỜI DÙNG (RBAC)

*   **Student**: Đăng ký đề tài, Update Kanban board, nộp bài, xem feedback, hỏi AI.
*   **Teacher**: Duyệt đề tài/SV, Comment review bảng Task daily, Nhận xét Sprint, Chấm điểm phân quyền.
*   **Admin**: Quản trị users/lớp, Duyệt Đề tài chờ duyệt, Phân công GV phản biện, Xuất báo cáo điểm final đóng vòng đời đồ án.

---

## 7. YÊU CẦU PHI CHỨC NĂNG

*   **An toàn mạng**: Chặn bypass token API, validation server-side nghiêm ngặt chống SQL injection cho các câu query database pool.
*   **Hiệu xuất mượt mà (Performance)**: Load giao diện Kanban dashboard dưới 2s kết hợp caching dữ liệu tĩnh.
*   **Mobile view friendly**: Đảm bảo SV dễ dàng vào điểm danh task, đọc comment GV trên màn smartphone tiện lợi nhất.

---

## 8. THỐNG KÊ DỰ ÁN
*   Khám phá cấu trúc: 26 use case nghiệp vụ chuẩn Agile.
*   Số lượng API routes backend: Trên 19 routes chia tầng API endpoints.
*   Thiết kế bao gồm Class Diagrams tổng thể, 8 luồng SD (Sequence Diagrams) cho nghiệp vụ: Đăng ký, Nộp báo cáo, Gán phản biện.

---

## 9. KẾT LUẬN
Giai đoạn 1 đã hoàn thiện Khảo sát chi tiết nghiệp vụ Agile áp dụng cho khung Đồ án Tốt nghiệp. Bộ khung specs rõ ràng hỗ trợ việc thiết cấu trúc Database (Table, Relationship) và Interface Client bám sát user stories.

Thiết lập giai đoạn 2 sẽ đi sâu thiết kế Database Schema MySQL (ERD), gán khóa phụ, hoàn thiện UI/UX design prototype và implement coding modules.
