## 4.2 Thiết kế hệ thống

### 4.2.1 Thiết kế tổng thể

**a. Mô hình kiến trúc phần mềm (Kiến trúc 3-Tier & MVC)**
Hệ thống "Quản lý Đồ án Agile" được thiết kế dựa trên mô hình kiến trúc **3-Tier** (3 Lớp) phổ biến, trong đó phần xử lý Backend áp dụng tư tưởng của mô hình **MVC** (Model - View - Controller), mang lại khả năng phân tách logic rõ ràng (Separation of Concerns):

1.  **Presentation Tier (Lớp Trình diễn / Frontend - View):**
    *   Xây dựng dưới dạng Single Page Application (SPA) bằng **React (Web)** và **Flutter (Mobile)**.
    *   Chịu trách nhiệm hiển thị giao diện UI tương tác với Admin, Giảng viên, Sinh viên.
    *   Giao tiếp với Server hoàn toàn thông qua các endpoint RESTful API và gửi nhận JSON. Cập nhật giao diện tự động dựa trên State (Riverpod đối với Flutter, React Hooks đối với Web).
2.  **Application Tier / Business Logic (Lớp Ứng dụng / Backend - Controller & Service):**
    *   Xây dựng bằng **Node.js** và **Express.js**.
    *   Đây là trung tâm xử lý nghiêp vụ của hệ thống: kiểm tra xác thực (JWT Middleware), thực thi logic tạo đề tài, duyệt Sprint, tính toán điểm số.
    *   Đóng vai trò điều phối (Controller) nhận request từ Presentation Tier, gọi tới Service/Model để xử lý dữ liệu và trả về kết quả.
    *   Đồng thời tích hợp với các hệ thống bên ngoài thứ ba như: Groq API (để gọi mô hình AI Llama 3.3).
3.  **Data Tier (Lớp Dữ liệu / Model):**
    *   Là lớp dưới cùng, nơi lưu trữ dữ liệu lâu dài và an toàn.
    *   Sử dụng **MySQL** làm Cơ sở dữ liệu quan hệ cốt lõi để lưu các thực thể (Users, Classes, Projects, Sprints, Grades).
    *   Sử dụng **Firebase** để lưu trữ file báo cáo (Storage) và lưu log chat trực tuyến (Realtime Database).

**b. Công nghệ sử dụng**
Nhằm đáp ứng yêu cầu một hệ thống web/mobile hiện đại, hiệu năng cao, dự án sử dụng các công nghệ sau:
*   **Ngôn ngữ lập trình:** JavaScript/TypeScript (cho Web và Server), Dart (cho Mobile).
*   **Frontend (Web):** React 18, Vite, React Router, Recharts (vẽ biểu đồ).
*   **Frontend (Mobile):** Flutter, Riverpod, Dio.
*   **Backend:** Node.js, Express, Axios.
*   **Cơ sở dữ liệu:** MySQL (primary), Firebase Realtime Database.
*   **Bảo mật & Phân quyền:** JWT (JSON Web Tokens), Firebase Auth, mã hóa mật khẩu.
*   **Tích hợp AI:** Sử dụng Groq Cloud API chạy LLM Llama 3.3 phục vụ tính năng AI Chatbot ảo.

### 4.2.2 Thiết kế xử lý

Trong phần thiết kế xử lý sâu của hệ thống, hướng tiếp cận thiết kế hướng đối tượng (OOP) được áp dụng một cách triệt để thông qua các sơ đồ:

*   **Sơ đồ Lớp (Class Diagram):** Mô tả chi tiết các thuộc tính, phương thức và mối quan hệ (Kế thừa, Kết hợp, Phụ thuộc) giữa các thực thể phần mềm cấu thành nên ứng dụng (VD: User, Student, Teacher, Topic, Project, Sprint, ProgressReport).
    *(Xem chi tiết tại sơ đồ UML đính kèm: Class Diagram)*.

*   **Sơ đồ Tuần tự (Sequence Diagram):** Minh họa luồng đi của các thông điệp (messages) giữa các đối tượng theo thời gian thực đối với các nghiệp vụ phức tạp nhất. Các luồng đã được xây dựng bao gồm:
    1. Đăng nhập & Xác thực thông qua JWT.
    2. Quy trình Sinh viên đăng ký và GV duyệt Đề tài.
    3. Quy trình Lập kế hoạch Sprint Agile.
    4. Quy trình nộp và nghiệm thu Báo cáo tiến độ.
    5. Admin phân công Giảng viên phản biện.
    6. Hội đồng chấm điểm và tổng kết xếp loại.
    *(Xem chi tiết tại hệ thống sơ đồ UML đính kèm: Sequence Diagrams)*.
