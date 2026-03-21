# KHẢO SÁT VÀ PHÂN TÍCH NGHIỆP VỤ
## Hệ thống Quản lý Đồ án Tốt nghiệp theo mô hình Agile

---

## 1. Mục tiêu Hệ thống (Business Goals)
*   **Số hóa quy trình**: Thay thế việc quản lý đồ án thủ công qua Excel/Drive bằng một nền tảng tập trung.
*   **Ứng dụng Agile/Scrum**: Giúp sinh viên làm quen với quy trình làm việc thực tế (Sprint, Task, Kanban) và Giảng viên theo dõi được tiến độ **hàng ngày** thay vì chỉ gõ báo cáo cuối kỳ.
*   **Hỗ trợ thông minh**: Tích hợp **AI Chatbot** trả lời kiến thức chuyên môn và tự động **gợi ý Giảng viên phản biện** phù hợp nhất với Đề tài.

---

## 2. Chủ thể & Phân quyền (Actors & Permissions)

| Tác nhân (Actor) | Quyền hạn & Nghiệp vụ cốt lõi |
| :--- | :--- |
| **Sinh viên (Student)** | - Duyệt kho đề tài, Đăng ký Đề tài.<br>- Tạo **Sprint** (chu kỳ làm việc), Lập mục tiêu.<br>- Kéo thả **Task** trên Bảng Kanban (Todo - Doing - Done).<br>- Nộp báo cáo tiến độ dưới dạng tài liệu/file đính kèm.<br>- Gửi chat trao đổi nhóm. |
| **Giảng viên (Teacher)** | - Đề xuất Đề tài mới (chờ Admin duyệt).<br>- Duyệt/Từ chối Sinh viên join nhóm đồ án.<br>- Xem bảng Kanban của sinh viên, **Review & Chấm điểm Sprint**.<br>- Tạo lịch hẹn online/offline.<br>- Chấm điểm đồ án (với vai trò GV Hướng dẫn hoặc Phản biện). |
| **Quản trị viên (Admin)** | - Quản lý Danh mục (User, Lớp học).<br>- Phê duyệt đề tài giáo viên đưa lên.<br>- **Phân công GV Phản biện** (Hệ thống dùng AI Mapping).<br>- Tổng hợp & Công bố điểm số toàn kỳ.<br>- Xuất báo cáo điểm Excel phục vụ lưu trữ. |

---

## 3. Quy trình Nghiệp vụ Đầu - Cuối (End-to-End Workflows)

### 🔄 Luồng 1: Khởi tạo Đề tài & Ghép nhóm (Forming)
1.  **GV** tạo Đề xuất Đề tài ➔ **Admin** kiểm duyệt ➔ Trạng thái chuyển thành `APPROVED`.
2.  **SV** xem danh sách Đề tài khả dụng ➔ Nhấp **Đăng ký** (Transaction DB sẽ trừ Slot mềm để chống trùng lặp).
3.  **GV** duyệt SV vào danh sách chính thức ➔ Khởi tạo **Project** trạng thái `IN_PROGRESS`.

---

### 🔄 Luồng 2: Quản lý Agile & Đánh giá (Sprinting)
1.  **SV** tạo Sprint (Thời gian 1-2 tuần). Lập danh sách Task.
2.  Trong chu kỳ, **SV** cập nhật trạng thái Task (Kéo thả). Progress bar tự động cập nhật Dashboard.
3.  Kết thúc Sprint: **SV** đính kèm File/Link báo cáo ➔ Gửi phê duyệt.
4.  **GV** nhận Notification ➔ Vào Review, đánh giá Sao (1-5★) và để lại Nhận xét ➔ Đánh dấu Sprint `COMPLETED` ➔ Hệ thống mở khóa Sprint tiếp theo.

---

### 🔄 Luồng 3: Nghiệm thu & Hội đồng (Closing)
1.  **SV** nộp bản Báo cáo Đồ án Final và Link source code.
2.  **Admin** vào menu phân công Phản biện ➔ Nhấp **AI Suggest** để nhận Top 3 GV Match nhất (VD chuyên sâu về React, AI, IoT...).
3.  **GV Hướng dẫn** & **GV Phản biện** nhập điểm theo tiêu chí (form chấm điểm định sẵn).
4.  **Admin** bấm lệnh **Tính điểm Tổng kết** (Tỷ lệ động 60-40) ➔ **Công bố kết quả** lên Dashboard SV ➔ Đóng Project.

---

## 4. Hệ thống Chat & Trợ lý Ảo (AI / Communications)
*   **Chat groups**: Tự động sinh ra kênh liên lạc thẳng hàng cho mỗi Project (SV-GV).
*   **Hỏi AI (Gemini)**: SV dùng để debug lỗi code, hỏi giải thuật. Hệ thống nhồi thêm ngữ cảnh "Chuyên ngành đồ án" để AI sinh câu trả lời thông minh, không bị chung chung.

---

## 5. Các Ràng buộc Nghiệp vụ (Business Rules)
*   **Ràng buộc 1**: Sinh viên chỉ được tham gia **Tối đa 1 Đồ án** trong 1 học kỳ.
*   **Ràng buộc 2**: Đề tài không được phép vượt quá tỷ lệ sinh viên tối đa đã cấu hình (ngăn overload GV).
*   **Ràng buộc 3**: Giáo viên hướng dẫn **KHÔNG ĐƯỢC** chấm Điểm phản biện cho chính đồ án của mình.
*   **Ràng buộc 4**: Ngày kết thúc Sprint sau không được đè lên ngày kết thúc Sprint trước để đảm bảo tính tuần tự.
