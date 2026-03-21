# BÁO CÁO GIAI ĐOẠN 1: KHẢO SÁT VÀ PHÂN TÍCH NGHIỆP VỤ
**Sinh viên**: Trần Siêu Hoàng Khang  
**MSSV**: 221429  
**Lớp**: DH22TIN06  
**Đề tài**: Xây dựng website sàn giao dịch phế phẩm nông nghiệp và sản phẩm nghệ thuật tái chế **Farm2Art**

---

## 1. TỔNG QUAN ĐỀ TÀI

### 1.1 Giới thiệu
- **Thực trạng**: Việt Nam thải ra hàng triệu tấn phụ phẩm nông nghiệp (rơm rạ, trấu, xơ dừa...) lãng phí và gây ô nhiễm khi đốt.
- **Nhu cầu**: Các nghệ nhân, doanh nghiệp tái chế tìm kiếm nguồn nguyên liệu xanh ổn định nhưng thiếu kênh kết nối.
- **Giải pháp**: **Farm2Art** - Sàn thương mại điện tử kết nối Nông dân (cung) và Nghệ nhân (cầu). Mô hình Kinh tế tuần hoàn biến phế phẩm thành tài sản, thúc đẩy tiêu dùng bền vững.

### 1.2 Mục tiêu
*   **Tổng quát**: Xây dựng sàn TMĐT hoạt động mượt mà, an toàn, hỗ trợ kinh tế tuần hoàn.
*   **Kỹ thuật**: 
    *   Framework: **Next.js 15**, **React 19**, **TypeScript**, **Firebase**.
    *   Hiệu năng: Load < 3s, Lighthouse > 90.
*   **Bảo mật**: RBAC (User, Seller, Admin), HTTPS, Firebase Auth.
*   **Giao diện**: Mobile-first, Tailwind CSS, dễ sài cho nông dân.
*   **Tích hợp**: VNPay (Thanh toán), Cloudinary (Hình ảnh).

### 1.3 Phạm vi đề tài
- **Đối tượng**: Nông dân (Seller), Nghệ nhân (Buyer), Admin (Quản trị).
- **Phạm vi chức năng**: 22 chức năng chính (Mua sắm, Đặt hàng, Quản trị, Giao tiếp, Tài chính).
- **Phạm vi kỹ thuật**: Frontend (>50 Components React TS), Backend (>25 Next.js API routes), DB Firestore, Deploy Vercel/Docker.

---

## 2. KHẢO SÁT VÀ PHÂN TÍCH

### 2.1 Phương pháp khảo sát
- Nghiên cứu tài liệu thứ cấp (Số liệu phụ phẩm, Kinh tế tuần hoàn).
- Phân tích đối thủ: Shopee, Lazada (TMĐT cơ bản) & Etsy (Nghệ thuật tái chế).
- Phỏng vấn & Khảo sát khảo sát trực tiếp Nông dân và Nghệ nhân.

### 2.2 Kết quả khảo sát (Nhu cầu phụ trợ)
*   **Người dùng (Buyer)**: Cần nguồn gốc, chất lượng minh bạch; Bảng xếp hạng uy tín; Tìm kiếm nâng cao; Chat trực tiếp; Thanh toán an toàn.
*   **Người bán (Seller)**: Cần giao diện cực kỳ đơn giản (Mobile); Quản lý kho đơn hàng trực quan; Ví điện tử minh bạch số dư & dòng tiền.
*   **Admin**: Dashboard metrics (Doanh thu, Đơn hàng); Công cụ kiểm duyệt tài khoản/sản phẩm; Công cụ xử lý khiếu nại.

---

## 3. CỐT LÕI CÔNG NGHỆ (Stack)
- **Language**: TypeScript (Type-safe).
- **Frontend**: Next.js 15 + React 19 (SSR, React Server Components).
- **Backend / DB**: Firebase Auth (Xác thực) + Firestore (NoSQL Realtime).
- **Styling**: Tailwind CSS (Utility-first).

---

## 4. KIẾN TRÚC HỆ THỐNG
*   **Mô hình**: Full-stack Monolithic trên Next.js (Tích hợp SSR Client và API Router Backend chung 1 dự án).
*   **Frontend**: Component-based (Tái sử dụng cao).
*   **Database**: Document-based qua Firestore, phân chia Collection riêng cho Users, Products, Orders...

---

## 5. PHÂN BÃ RÃ CHỨC NĂNG (5 Nhóm)
1.  **Mua sắm**: Xem SP, Filter nâng cao, Wishlist, Đánh giá sản phẩm.
2.  **Đặt hàng & Giao hàng**: Giỏ hàng, Áp Coupon, Quản lý đơn, Kiểm duyệt Seller.
3.  **Quản trị & Phân tích**: Dashboard KPIs, Phê duyệt Sản phẩm, API tracking.
4.  **Giao tiếp**: Chatbot AI hỗ trợ, Tin nhắn trực tiếp (Realtime), Email/SMS Notifications.
5.  **Tài chính**: Ví điện tử Seller, Quản lý Tồn kho, Gợi ý sản phẩm thông minh.

---

## 6. PHÂN QUYỀN (Role-Based Access Control)
*   **User (Buyer)**: Browse sản phẩm, Buy/Pay, Chat, Đánh giá.
*   **Seller**: Up sản phẩm kinh doanh, Manage orders, Theo dõi ví, Rút tiền banking.
*   **Admin**: Toàn quyền duyệt sản phẩm/Tài khoản seller, Dashboard số liệu, Xử lý khiếu nại.

---

## 7. YÊU CẦU PHI CHỨC NĂNG
*   **Bảo mật**: Khóa static API, check Input validate chống XSS/CSRF.
*   **Tải trọng**: Lazy loading, SSR kết hợp caching static assets.
*   **Thích ứng**: Hiển thị mượt mà trên Thiết bị di động.

---

## 8. KẾT LUẬN & GIAI ĐOẠN 2
- Giai đoạn 1 đã chốt xong: Specs nghiệp vụ, Tech stack dự kiến, Phân chia Role.
- **Tiền đề Giai đoạn 2**: Thiết kế chi tiết Database Firestore, Vẽ sơ đồ UML (Use Case, ERD, DFD, Sequence) để phục vụ cho việc implement mã nguồn.
