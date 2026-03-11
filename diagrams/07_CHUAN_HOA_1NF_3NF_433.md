### 4.3.3 Chuẩn hóa dữ liệu (1NF - 3NF)

Để đảm bảo cơ sở dữ liệu không bị dư thừa (redundancy) và tránh các dị thường khi thêm/sửa/xóa dữ liệu (anomalies), quá trình thiết kế vật lý của hệ thống "Quản lý Đồ án Agile" tuân thủ các quy tắc chuẩn hóa từ Dạng Chuẩn 1 (1NF) đến Dạng Chuẩn 3 (3NF).

**a. Nguyên tắc chuẩn hóa chung áp dụng cho dự án**
1.  **Dạng chuẩn 1 (1NF - First Normal Form):** Đảm bảo mọi giá trị trong các cột của một bảng đều là giá trị đơn trị (Atomic). Không có cột nào chứa mảng hoặc một tập danh sách các giá trị.
    *   *Áp dụng:* Bảng `USERS` chỉ chứa 1 số điện thoại duy nhất ở cột `phone`. Nếu SV có nhiều số, phải tách thành bảng riêng (hoặc giới hạn 1 số).
2.  **Dạng chuẩn 2 (2NF - Second Normal Form):** Đạt 1NF và mọi thuộc tính không khóa phải phụ thuộc hoàn toàn vào khóa chính (toàn bộ khóa chính, chứ không phải một phần khóa chính).
    *   *Áp dụng:* Tránh để các thông tin thuộc về "Topic" (như `topic_name`, `topic_description`) nằm chung trong bảng "Project" (có khóa chính tạo từ tổ hợp khóa).
3.  **Dạng chuẩn 3 (3NF - Third Normal Form):** Đạt 2NF và không có thuộc tính không khóa nào phụ thuộc bắc cầu vào khóa chính (mọi thuộc tính cung cấp thông tin trực tiếp về khóa, không thông qua một thuộc tính khác).
    *   *Áp dụng:* Không lưu trữ thông tin tên Giảng viên (`teacher_name`) bên trong bảng `CLASS`, mà chỉ lưu `teacher_id`. Khi cần tên, phải join với bảng `USERS`.

**b. Ví dụ minh họa quá trình chuẩn hóa (Bảng Sinh viên - Đồ án)**

Giả sử ban đầu, ta có một bảng gộp chưa chuẩn hóa (Unnormalized Form - UNF) dùng để lưu thông tin Đồ án như sau:

| project_id (PK) | project_name | student_id | student_name | student_email | topic_id | topic_name |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| PROJ_01 | Đồ án A | SV01, SV02 | Nam, Hoa | n@e.com, h@e.com | TOPIC_99 | Web React |

*   **Vi phạm 1NF:** Cột `student_id`, `student_name`, `student_email` đều chứa nhiều giá trị (mảng) trên 1 dòng.
*   **Xử lý đưa về 1NF:** Tách mỗi sinh viên thành 1 dòng.
    *   `PROJ_01` - `SV01` - `Nam` - `n@e.com` - `TOPIC_99` - `Web React`
    *   `PROJ_01` - `SV02` - `Hoa` - `h@e.com` - `TOPIC_99` - `Web React`

*   **Vi phạm 2NF/3NF:**
    1.  Cột `student_name` và `student_email` chỉ phụ thuộc vào `student_id` chứ không phụ thuộc vào `project_id`. (Vi phạm 3NF do tính phụ thuộc gián tiếp/bắc cầu hoặc vi phạm phần khóa).
    2.  Cột `topic_name` chỉ phụ thuộc vào `topic_id`.
    3.  Thông tin "Web React" bị lặp lại nhiều lần.

*   **Xử lý đưa về chuẩn 3 (3NF):** Tách thành các bảng độc lập chỉ chứa các thuộc tính phụ thuộc 100% vào Khóa Chính của bản thân nó:

    1.  **Bảng `USERS` (Chứa thông tin SV):** `id` (PK), `name`, `email`.
    2.  **Bảng `TOPICS` (Chứa thông tin Đề tài):** `id` (PK), `name`.
    3.  **Bảng `PROJECTS` (Ghi nhận đồ án):** `id` (PK), `name`, `topic_id` (FK).
    4.  **Bảng `PROJECT_STUDENTS` (Bảng trung gian N-N):** `project_id` (FK), `student_id` (FK).

*Kết quả:* Dữ liệu của hệ thống hoàn toàn loại bỏ sự lặp lại. Khi Sinh viên đổi email, ta chỉ cần update 1 dòng duy nhất bên bảng `USERS`, dữ liệu toàn hệ thống lập tức nhất quán. Quá trình thiết kế CSDL Vật lý (tiếp theo) tuân thủ chặt chẽ kết quả 3NF này.
