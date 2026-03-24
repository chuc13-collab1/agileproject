-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th3 21, 2026 lúc 03:18 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `agile_project_management`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admins`
--

CREATE TABLE `admins` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `user_id` varchar(36) NOT NULL,
  `admin_id` varchar(50) NOT NULL COMMENT 'Admin code'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin_permissions`
--

CREATE TABLE `admin_permissions` (
  `admin_id` varchar(36) NOT NULL,
  `permission` enum('manage_users','manage_projects','manage_topics','manage_grades','manage_system','view_reports') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `announcements`
--

CREATE TABLE `announcements` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `semester` varchar(20) NOT NULL COMMENT 'e.g., HK1, HK2, Summer',
  `academic_year` varchar(20) NOT NULL COMMENT 'e.g., 2024-2025',
  `registration_start` datetime NOT NULL,
  `registration_end` datetime NOT NULL,
  `status` enum('draft','published','closed') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `proposal_deadline` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `semester`, `academic_year`, `registration_start`, `registration_end`, `status`, `created_at`, `updated_at`, `proposal_deadline`) VALUES
('1ea71a26-b7ac-4e25-a707-fcd3292a754d', 'abc', 'sbv', 'Hè', '2025-2026', '2026-02-05 23:03:00', '2026-02-28 23:03:00', 'published', '2026-02-04 16:03:31', '2026-02-28 12:36:41', NULL),
('429b23d4-e7dd-441e-ab8c-40800a92db30', 'đồ án cơ sở 2', 'THÔNG BÁO ĐỒ ÁN CƠ SỞ 2\n\n📌 Môn học: Đồ án Cơ sở 2\n📅 Thời gian thực hiện: Từ ngày 05/03/2026 đến ngày 30/05/2026\n⏰ Thời gian báo cáo dự kiến: 08h00, ngày 02/06/2026\n📍 Địa điểm: Phòng thực hành CNTT\n\n📖 Nội dung thực hiện:\nSinh viên thực hiện đề tài theo nhóm (2–4 người), xây dựng một hệ thống phần mềm ứng dụng các kiến thức đã học như phân tích – thiết kế hệ thống, thiết kế cơ sở dữ liệu, lập trình và kiểm thử.\n\nYêu cầu:\n\nXây dựng đầy đủ tài liệu (đặc tả yêu cầu, UML, thiết kế CSDL).\n\nHoàn thành sản phẩm chạy được với các chức năng chính.\n\nViết báo cáo hoàn chỉnh và chuẩn bị slide thuyết trình.\n\n⚠️ Lưu ý:\n\nNộp source code và báo cáo trước ngày báo cáo 02 ngày.\n\nNhóm vắng mặt khi báo cáo sẽ không được chấm điểm.\n\nGiảng viên phụ trách: ........................................\nNgày ra thông báo: 28/02/2026', 'HK2', '2025-2026', '2026-03-28 19:26:00', '2026-04-18 19:26:00', 'published', '2026-02-28 12:27:11', '2026-02-28 12:35:21', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookings`
--

CREATE TABLE `bookings` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `slot_id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `project_id` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `classes`
--

CREATE TABLE `classes` (
  `id` char(36) NOT NULL,
  `class_code` varchar(20) NOT NULL COMMENT 'Unique class identifier (e.g., DH22TIN01)',
  `class_name` varchar(100) DEFAULT NULL COMMENT 'Full class name (e.g., Công nghệ thông tin K22)',
  `academic_year` varchar(20) NOT NULL COMMENT 'Academic year range (e.g., 2022-2026)',
  `advisor_teacher_id` char(36) DEFAULT NULL COMMENT 'Class advisor foreign key to teachers table',
  `max_students` int(11) DEFAULT 40 COMMENT 'Maximum student capacity',
  `major` varchar(100) DEFAULT NULL COMMENT 'Major/specialization',
  `description` text DEFAULT NULL COMMENT 'Additional class information',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Active status',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `classes`
--

INSERT INTO `classes` (`id`, `class_code`, `class_name`, `academic_year`, `advisor_teacher_id`, `max_students`, `major`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
('803dbe76-5dd8-472f-b458-ca5e73476ebc', 'DH22TIN00', 'cntt_k10', '2024-2028', NULL, 57, 'cntt', '', 0, '2026-02-04 15:06:57', '2026-02-04 15:08:47'),
('bc2ad21d-89fb-4adb-a561-e22ac9b7bd4b', 'DH22TIN01', 'cntt k10 k1', '2024-2028', NULL, 60, 'cntt', NULL, 1, '2026-02-04 15:09:58', '2026-02-04 15:09:58');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `comments`
--

CREATE TABLE `comments` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `report_id` varchar(36) NOT NULL COMMENT 'Reference to progress_reports table',
  `teacher_id` varchar(36) NOT NULL COMMENT 'Teacher who commented',
  `content` text NOT NULL COMMENT 'Comment text',
  `rating` int(11) DEFAULT NULL COMMENT 'Rating 1-5 stars',
  `comment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Đang đổ dữ liệu cho bảng `comments`
--

INSERT INTO `comments` (`id`, `report_id`, `teacher_id`, `content`, `rating`, `comment_date`, `created_at`, `updated_at`) VALUES
('33efe5fd-09c4-4f5f-8d82-3ccce97bf023', '130a7f95-c543-4929-8a03-3257c9a57353', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'dc', 5, '2026-02-13 03:12:19', '2026-02-13 03:12:19', '2026-02-13 03:12:19'),
('5bbeec12-9ea1-4fd4-a755-58110abfb5b3', 'fa8c8a51-e17b-401e-af6b-f16ad394131b', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'sds', 5, '2026-02-28 13:16:00', '2026-02-28 13:16:00', '2026-02-28 13:16:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `documents`
--

CREATE TABLE `documents` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `project_id` varchar(36) NOT NULL,
  `document_type` enum('outline','report','slides','source_code','other') NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `version` int(11) DEFAULT 1,
  `is_latest` tinyint(1) DEFAULT 1,
  `uploaded_by` varchar(36) NOT NULL COMMENT 'User UUID',
  `description` text DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `meeting_slots`
--

CREATE TABLE `meeting_slots` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `teacher_id` varchar(36) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL COMMENT 'Physical room or Meeting Link',
  `max_students` int(11) DEFAULT 1,
  `is_booked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `meeting_slots`
--

INSERT INTO `meeting_slots` (`id`, `teacher_id`, `start_time`, `end_time`, `location`, `max_students`, `is_booked`, `created_at`) VALUES
('7401dba8-4df1-4ef3-870e-802b74eccd64', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', '2026-02-27 15:41:00', '2026-02-27 16:44:00', 'Online (Google Meet)', 1, 0, '2026-02-13 05:39:52');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL,
  `user_uid` varchar(128) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error','project','report','chat','system') DEFAULT 'info',
  `link` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `notifications`
--

INSERT INTO `notifications` (`id`, `user_uid`, `title`, `message`, `type`, `link`, `is_read`, `created_at`) VALUES
('11053bbb-ee91-4631-a8f8-660ef496bba6', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:09:00'),
('15898be9-a74d-4c9c-98eb-ab2844421277', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:40:40'),
('22f285ba-d5a6-4bb5-a8eb-b984d1c4899b', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 abc', 'Thông báo mới: abc - Hè/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:12:23'),
('2e55a776-2526-41ea-bade-b611eac25923', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:06:55'),
('30d264a4-41b5-4721-bf2e-b424e8d73efe', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 abc', 'Thông báo mới: abc - Hè/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:12:22'),
('35be6460-58d8-47ef-a70d-f613a824b2e0', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 12:58:56'),
('375362eb-27d6-498a-830b-841a3af8f59b', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:40:40'),
('397fe264-8ba7-4f16-8494-c6957953aeef', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:40:40'),
('3af4530a-ecf7-425d-ad99-f0d696be5dbf', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:06:55'),
('44067271-6766-4865-9f2c-e7f8070b1167', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', 'Giảng viên đã duyệt báo cáo', 'Báo cáo tiến độ đồ án \"quan li quan ao\" đã duyệt.', 'success', '/student/reports', 0, '2026-02-28 13:16:00'),
('809ed2c7-3432-4245-9914-71e6d1a52ff9', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 12:58:55'),
('80c92276-2a51-4dc0-8e8e-ddb7c9fd740b', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:06:55'),
('845be23c-f05b-4c4d-948e-f091624e85f7', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', 'Đồ án được duyệt', 'Đồ án \"quan li quan ao\" đã được duyệt và đang thực hiện.', 'success', '/student/my-project', 0, '2026-03-02 02:23:31'),
('8e7b5a19-871c-43c5-b590-4e1d8ca6403b', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-02 02:21:25'),
('a7994bea-63db-4cc8-9078-b2edb1c8cad9', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-02 02:21:24'),
('b8d9c318-fdc8-4ede-9684-ab15c9a1d85c', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-02 02:21:25'),
('bc6d825c-7dd1-41b8-b82e-9b6cf096bae4', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:09:00'),
('be1528f8-78e9-4249-8a32-08a87b7cafde', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 12:58:56'),
('cc2896e4-0a43-4224-82f9-6d407c41bdb1', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:40:40'),
('cf144d7c-391c-40d8-9006-8793786f277c', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:09:00'),
('d45b1035-c3b3-49cb-845b-a4dc24329081', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 abc', 'Thông báo mới: abc - Hè/2025-2026', 'system', '/notifications', 0, '2026-02-28 13:12:22'),
('e6adbf25-5b12-4b5d-a98a-3a42f84e4c43', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-02 02:21:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `progress_reports`
--

CREATE TABLE `progress_reports` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `project_id` varchar(36) NOT NULL COMMENT 'Reference to projects table',
  `report_title` varchar(200) NOT NULL COMMENT 'Report title',
  `week_number` int(11) DEFAULT NULL COMMENT 'Week number (e.g., 1-15)',
  `content` text NOT NULL COMMENT 'Report content/description',
  `achievements` text DEFAULT NULL COMMENT 'What was achieved this period',
  `difficulties` text DEFAULT NULL COMMENT 'Difficulties encountered',
  `next_steps` text DEFAULT NULL COMMENT 'Plan for next period',
  `file_path` varchar(500) DEFAULT NULL COMMENT 'Firebase Storage path to uploaded file',
  `file_name` varchar(255) DEFAULT NULL COMMENT 'Original filename',
  `file_size` bigint(20) DEFAULT NULL COMMENT 'File size in bytes',
  `status` enum('submitted','reviewed','approved','revision_needed') NOT NULL DEFAULT 'submitted',
  `submitted_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_date` timestamp NULL DEFAULT NULL COMMENT 'When teacher reviewed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `progress_reports`
--

INSERT INTO `progress_reports` (`id`, `project_id`, `report_title`, `week_number`, `content`, `achievements`, `difficulties`, `next_steps`, `file_path`, `file_name`, `file_size`, `status`, `submitted_date`, `reviewed_date`, `created_at`, `updated_at`) VALUES
('130a7f95-c543-4929-8a03-3257c9a57353', '7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', 'dang nhap', 1, 'Tết là khoảng thời gian đẹp nhất trong năm, khi mọi bộn bề dường như lắng lại để nhường chỗ cho sự sum vầy và yêu thương. Những ngày cuối năm, ai cũng tất bật dọn dẹp nhà cửa, chuẩn bị mâm cỗ, trang trí cành mai, cành đào như một cách chào đón điều mới mẻ. Không khí Tết không chỉ nằm ở mùi bánh chưng đang sôi trên bếp, mà còn ở tiếng cười nói rộn ràng của gia đình khi cùng nhau ngồi lại.\r\n\r\nTết còn là dịp để mỗi người nhìn lại một năm đã qua, với những nỗ lực, thành công và cả những điều chưa trọn vẹn. Khoảnh khắc giao thừa thiêng liêng khiến ta cảm nhận rõ ràng sự chuyển giao giữa cũ và mới, giữa lo toan và hy vọng. Trẻ con háo hức nhận lì xì, người lớn gửi nhau lời chúc bình an, sức khỏe và may mắn.\r\n\r\nDù cuộc sống có thay đổi thế nào, Tết vẫn luôn giữ một vị trí đặc biệt trong lòng mỗi người Việt – đó là thời điểm của đoàn tụ, của lòng biết ơn và của những khởi đầu đầy hi vọng.', NULL, NULL, NULL, 'E:\\agile-project-management\\server\\uploads\\progress-reports\\file-1770951848755-603698128.zip', 'CinemaManagement.zip', 17199613, 'approved', '2026-02-13 03:04:08', '2026-02-13 03:12:19', '2026-02-13 03:04:08', '2026-02-13 03:12:19'),
('26ac573f-f49b-4216-8099-b6c2d8a54c03', '7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', 'đăng nhập', 1, 'Goal\r\nReview, enhance, and verify the existing student interface pages to match the modern design standards used in Admin and Teacher interfaces.\r\n\r\nCurrent Status\r\n✅ Existing Pages (9 pages)\r\nStudentDashboard - Basic dashboard with stats\r\nMyProject - View project details\r\nDocumentManagement - Upload/manage documents ✅\r\nProgressReports - View progress reports\r\nSubmitReport - Submit new progress report\r\nTopicBrowsing - Browse available topics\r\nTopicRegistration - Register for a topic\r\nStudentTopicProposal - Propose new topic\r\nProjectResults - View results/grades\r\nProposed Changes\r\nPhase 1: UI Enhancements (Priority HIGH)\r\n[MODIFY] \r\nStudentDashboard.tsx\r\nCurrent: Basic layout with plain stats cards Changes:\r\n\r\nAdd gradient header (similar to Teacher/Admin)\r\nImprove stat cards with better colors and icons\r\nAdd live data for pending reports\r\nBetter quick action buttons with gradients\r\nAdd project preview section\r\n[MODIFY] \r\nDocumentManagement.tsx\r\nCurrent: Has upload functionality Changes:\r\n\r\nVerify file upload actually works with backend\r\nAdd drag & drop UI\r\nBetter file type badges\r\nProgress bar for uploads\r\nModern gradients and spacing\r\n[MODIFY] \r\nProgressReports.tsx\r\nCurrent: Basic list of reports Changes:\r\n\r\nModern card layout\r\nBetter status badges with colors\r\nView supervisor comments in modal\r\nRating display (stars)\r\nFilter by status\r\n[MODIFY] \r\nSubmitReport.tsx\r\nCurrent: Form to submit report Changes:\r\n\r\nModern gradient design\r\nBetter textarea styling\r\nSuccess animation after submit\r\nAuto-save draft (optional)\r\nPhase 2: API Integration (Priority MEDIUM)\r\nBackend Endpoints to Verify/Create\r\nDocuments API:\r\n\r\nPOST /api/documents/upload - Upload file\r\nGET /api/projects/:id/documents - Get documents\r\nDELETE /api/documents/:id - Delete document\r\nProgress Reports API:\r\n\r\nGET /api/students/:studentId/progress-reports - Get student reports\r\nPOST /api/progress-reports - Submit new report\r\nGET /api/progress-reports/:id - Get report details\r\nProjects API (already exists):\r\n\r\nGET /api/projects?studentId=:id - Get student\'s project\r\nPhase 3: Additional Features (Priority LOW)\r\n[MODIFY] \r\nMyProject.tsx\r\nAdd supervisor contact info\r\nQuick upload button\r\nTimeline visualization\r\nDeadline countdown\r\n[MODIFY] \r\nTopicBrowsing.tsx\r\nSearch and filter\r\nTopic details modal\r\nBetter card layout\r\nVerification Plan\r\nManual Testing\r\nLogin as Student\r\n\r\nNavigate to /student/dashboard\r\nVerify stats load correctly\r\nUpload Document\r\n\r\nGo to /student/documents\r\nTry uploading a file (.pdf, .zip)\r\nVerify file appears in list\r\nTry downloading\r\nSubmit Progress Report\r\n\r\nGo to /student/reports/submit\r\nFill form and submit\r\nVerify appears in reports list\r\nCheck if teacher can see it\r\nView Project\r\n\r\nGo to /student/my-project\r\nVerify project details display\r\nCheck supervisor comments', NULL, NULL, NULL, 'E:\\agile-project-management\\server\\uploads\\progress-reports\\file-1770950800104-543133750.zip', 'CinemaManagement.zip', 17199613, 'submitted', '2026-02-13 02:46:40', NULL, '2026-02-13 02:46:40', '2026-02-13 02:46:40'),
('9522046d-9fdc-4988-9ac5-87a765de315b', '7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', 'đăng nhập', 1, 'Goal\r\nReview, enhance, and verify the existing student interface pages to match the modern design standards used in Admin and Teacher interfaces.\r\n\r\nCurrent Status\r\n✅ Existing Pages (9 pages)\r\nStudentDashboard - Basic dashboard with stats\r\nMyProject - View project details\r\nDocumentManagement - Upload/manage documents ✅\r\nProgressReports - View progress reports\r\nSubmitReport - Submit new progress report\r\nTopicBrowsing - Browse available topics\r\nTopicRegistration - Register for a topic\r\nStudentTopicProposal - Propose new topic\r\nProjectResults - View results/grades\r\nProposed Changes\r\nPhase 1: UI Enhancements (Priority HIGH)\r\n[MODIFY] \r\nStudentDashboard.tsx\r\nCurrent: Basic layout with plain stats cards Changes:\r\n\r\nAdd gradient header (similar to Teacher/Admin)\r\nImprove stat cards with better colors and icons\r\nAdd live data for pending reports\r\nBetter quick action buttons with gradients\r\nAdd project preview section\r\n[MODIFY] \r\nDocumentManagement.tsx\r\nCurrent: Has upload functionality Changes:\r\n\r\nVerify file upload actually works with backend\r\nAdd drag & drop UI\r\nBetter file type badges\r\nProgress bar for uploads\r\nModern gradients and spacing\r\n[MODIFY] \r\nProgressReports.tsx\r\nCurrent: Basic list of reports Changes:\r\n\r\nModern card layout\r\nBetter status badges with colors\r\nView supervisor comments in modal\r\nRating display (stars)\r\nFilter by status\r\n[MODIFY] \r\nSubmitReport.tsx\r\nCurrent: Form to submit report Changes:\r\n\r\nModern gradient design\r\nBetter textarea styling\r\nSuccess animation after submit\r\nAuto-save draft (optional)\r\nPhase 2: API Integration (Priority MEDIUM)\r\nBackend Endpoints to Verify/Create\r\nDocuments API:\r\n\r\nPOST /api/documents/upload - Upload file\r\nGET /api/projects/:id/documents - Get documents\r\nDELETE /api/documents/:id - Delete document\r\nProgress Reports API:\r\n\r\nGET /api/students/:studentId/progress-reports - Get student reports\r\nPOST /api/progress-reports - Submit new report\r\nGET /api/progress-reports/:id - Get report details\r\nProjects API (already exists):\r\n\r\nGET /api/projects?studentId=:id - Get student\'s project\r\nPhase 3: Additional Features (Priority LOW)\r\n[MODIFY] \r\nMyProject.tsx\r\nAdd supervisor contact info\r\nQuick upload button\r\nTimeline visualization\r\nDeadline countdown\r\n[MODIFY] \r\nTopicBrowsing.tsx\r\nSearch and filter\r\nTopic details modal\r\nBetter card layout\r\nVerification Plan\r\nManual Testing\r\nLogin as Student\r\n\r\nNavigate to /student/dashboard\r\nVerify stats load correctly\r\nUpload Document\r\n\r\nGo to /student/documents\r\nTry uploading a file (.pdf, .zip)\r\nVerify file appears in list\r\nTry downloading\r\nSubmit Progress Report\r\n\r\nGo to /student/reports/submit\r\nFill form and submit\r\nVerify appears in reports list\r\nCheck if teacher can see it\r\nView Project\r\n\r\nGo to /student/my-project\r\nVerify project details display\r\nCheck supervisor comments', NULL, NULL, NULL, 'E:\\agile-project-management\\server\\uploads\\progress-reports\\file-1770950581010-532632719.zip', 'CinemaManagement.zip', 17199613, 'submitted', '2026-02-13 02:43:01', NULL, '2026-02-13 02:43:01', '2026-02-13 02:43:01'),
('9ea69024-55cd-4024-996c-1034637a3379', '7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', 'hoàn thanh dang nhap', 1, 'Tết là khoảng thời gian đẹp nhất trong năm, khi mọi bộn bề dường như lắng lại để nhường chỗ cho sự sum vầy và yêu thương. Những ngày cuối năm, ai cũng tất bật dọn dẹp nhà cửa, chuẩn bị mâm cỗ, trang trí cành mai, cành đào như một cách chào đón điều mới mẻ. Không khí Tết không chỉ nằm ở mùi bánh chưng đang sôi trên bếp, mà còn ở tiếng cười nói rộn ràng của gia đình khi cùng nhau ngồi lại.\r\n\r\nTết còn là dịp để mỗi người nhìn lại một năm đã qua, với những nỗ lực, thành công và cả những điều chưa trọn vẹn. Khoảnh khắc giao thừa thiêng liêng khiến ta cảm nhận rõ ràng sự chuyển giao giữa cũ và mới, giữa lo toan và hy vọng. Trẻ con háo hức nhận lì xì, người lớn gửi nhau lời chúc bình an, sức khỏe và may mắn.\r\n\r\nDù cuộc sống có thay đổi thế nào, Tết vẫn luôn giữ một vị trí đặc biệt trong lòng mỗi người Việt – đó là thời điểm của đoàn tụ, của lòng biết ơn và của những khởi đầu đầy hi vọng.', NULL, NULL, NULL, 'E:\\agile-project-management\\server\\uploads\\progress-reports\\file-1770951185930-649450032.zip', 'CinemaManagement.zip', 17199613, 'submitted', '2026-02-13 02:53:06', NULL, '2026-02-13 02:53:06', '2026-02-13 02:53:06'),
('fa8c8a51-e17b-401e-af6b-f16ad394131b', '7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', 'dang nhap', 1, 'Tết là khoảng thời gian đẹp nhất trong năm, khi mọi bộn bề dường như lắng lại để nhường chỗ cho sự sum vầy và yêu thương. Những ngày cuối năm, ai cũng tất bật dọn dẹp nhà cửa, chuẩn bị mâm cỗ, trang trí cành mai, cành đào như một cách chào đón điều mới mẻ. Không khí Tết không chỉ nằm ở mùi bánh chưng đang sôi trên bếp, mà còn ở tiếng cười nói rộn ràng của gia đình khi cùng nhau ngồi lại.\r\n\r\nTết còn là dịp để mỗi người nhìn lại một năm đã qua, với những nỗ lực, thành công và cả những điều chưa trọn vẹn. Khoảnh khắc giao thừa thiêng liêng khiến ta cảm nhận rõ ràng sự chuyển giao giữa cũ và mới, giữa lo toan và hy vọng. Trẻ con háo hức nhận lì xì, người lớn gửi nhau lời chúc bình an, sức khỏe và may mắn.\r\n\r\nDù cuộc sống có thay đổi thế nào, Tết vẫn luôn giữ một vị trí đặc biệt trong lòng mỗi người Việt – đó là thời điểm của đoàn tụ, của lòng biết ơn và của những khởi đầu đầy hi vọng.', NULL, NULL, NULL, 'E:\\agile-project-management\\server\\uploads\\progress-reports\\file-1770951551057-3819162.docx', 'KNNN_NHÃM17.docx', 2986840, 'approved', '2026-02-13 02:59:11', '2026-02-28 13:16:00', '2026-02-13 02:59:11', '2026-02-28 13:16:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `projects`
--

CREATE TABLE `projects` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `topic_id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `supervisor_id` varchar(36) DEFAULT NULL COMMENT 'Teacher who supervises, null if not yet assigned',
  `reviewer_id` varchar(36) DEFAULT NULL COMMENT 'Teacher who reviews',
  `status` enum('registered','in_progress','submitted','graded','completed','failed') DEFAULT 'registered',
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `defense_date` datetime DEFAULT NULL,
  `final_grade` decimal(4,2) DEFAULT NULL COMMENT 'Final grade 0-10',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `report_deadline` datetime DEFAULT NULL,
  `supervisor_score` decimal(4,2) DEFAULT NULL,
  `reviewer_score` decimal(4,2) DEFAULT NULL,
  `council_score` decimal(4,2) DEFAULT NULL,
  `final_score` decimal(4,2) DEFAULT NULL,
  `grade` varchar(10) DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `projects`
--

INSERT INTO `projects` (`id`, `topic_id`, `student_id`, `supervisor_id`, `reviewer_id`, `status`, `registration_date`, `start_date`, `end_date`, `defense_date`, `final_grade`, `notes`, `created_at`, `updated_at`, `report_deadline`, `supervisor_score`, `reviewer_score`, `council_score`, `final_score`, `grade`, `archived_at`) VALUES
('1655ceab-6c12-4b85-bab0-019b4d041a31', '9dacc2ec-cb56-4564-8cd0-8f1daeef7ace', 'f472e34b-9358-4132-846e-32df17a612d9', NULL, NULL, 'in_progress', '2026-02-11 07:34:37', NULL, NULL, NULL, NULL, NULL, '2026-02-11 07:34:37', '2026-03-02 02:23:31', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('53c03c1a-3445-4cf9-ab4f-01735e0a1122', '12172c00-839a-44b8-a0a5-d8b2e33f17e9', 'f472e34b-9358-4132-846e-32df17a612d9', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'in_progress', '2026-02-11 07:36:25', NULL, NULL, NULL, NULL, NULL, '2026-02-11 07:36:25', '2026-02-13 09:13:03', '2026-05-14 07:00:00', NULL, NULL, NULL, NULL, NULL, NULL),
('7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', '9dacc2ec-cb56-4564-8cd0-8f1daeef7ace', '4590af2d-1ff9-4206-ab8a-e499f9337fbe', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'in_progress', '2026-02-12 04:17:34', NULL, NULL, NULL, NULL, NULL, '2026-02-12 04:17:34', '2026-02-12 13:00:59', '2026-05-13 07:00:00', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `project_archive`
--

CREATE TABLE `project_archive` (
  `id` int(11) NOT NULL,
  `project_id` varchar(36) NOT NULL,
  `topic_title` varchar(500) NOT NULL,
  `topic_field` varchar(255) DEFAULT NULL,
  `student_name` varchar(255) NOT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  `supervisor_name` varchar(255) DEFAULT NULL,
  `reviewer_name` varchar(255) DEFAULT NULL,
  `academic_year` varchar(20) NOT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `final_score` decimal(5,2) DEFAULT NULL,
  `grade` varchar(5) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'completed',
  `description` text DEFAULT NULL,
  `document_url` varchar(500) DEFAULT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sprints`
--

CREATE TABLE `sprints` (
  `id` varchar(36) NOT NULL,
  `project_id` varchar(36) NOT NULL,
  `sprint_number` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `goals` text DEFAULT NULL,
  `start_week` int(11) NOT NULL,
  `end_week` int(11) NOT NULL,
  `weight_percent` int(11) DEFAULT 0,
  `status` enum('not_started','in_progress','completed') DEFAULT 'not_started',
  `actual_progress` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sprint_comments`
--

CREATE TABLE `sprint_comments` (
  `id` varchar(36) NOT NULL,
  `sprint_id` varchar(36) NOT NULL,
  `project_id` varchar(36) NOT NULL,
  `author_uid` varchar(255) NOT NULL,
  `author_name` varchar(255) NOT NULL,
  `author_role` enum('teacher','student') NOT NULL DEFAULT 'teacher',
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `students`
--

CREATE TABLE `students` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `user_id` varchar(36) NOT NULL,
  `student_id` varchar(50) NOT NULL COMMENT 'Student code/number',
  `class_name` varchar(100) DEFAULT NULL,
  `major` varchar(200) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL COMMENT 'e.g., 2024-2028'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `students`
--

INSERT INTO `students` (`id`, `user_id`, `student_id`, `class_name`, `major`, `academic_year`) VALUES
('4590af2d-1ff9-4206-ab8a-e499f9337fbe', '71c101c9-7f1b-4fcd-80ed-04372ea18866', '2110568', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('7392efd7-cf76-4b79-8e51-c6cf2e9f7028', 'bd824b72-563a-4ee2-9572-4c302bca6774', '2222222', 'DH22TIN01', 'cntt', '2024-2028'),
('88efbe99-feea-4ef9-b7df-704e5fc0a271', '237ce1d6-4ba6-441a-96e0-fa1cf792c2a9', '1010101', 'DH22TIN01', 'cntt', '2024-2028'),
('f472e34b-9358-4132-846e-32df17a612d9', 'cfc23678-f40e-42e7-947d-512cf3e19198', 'S294845', 'D20CQCN01-N', 'Software Engineering', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `teachers`
--

CREATE TABLE `teachers` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `user_id` varchar(36) NOT NULL,
  `teacher_id` varchar(50) NOT NULL COMMENT 'Teacher code/number',
  `department` varchar(200) DEFAULT NULL,
  `max_students` int(11) DEFAULT 5 COMMENT 'Maximum students to supervise',
  `current_students` int(11) DEFAULT 0 COMMENT 'Current number of students',
  `can_supervise` tinyint(1) DEFAULT 1,
  `can_review` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `teachers`
--

INSERT INTO `teachers` (`id`, `user_id`, `teacher_id`, `department`, `max_students`, `current_students`, `can_supervise`, `can_review`) VALUES
('0b4dc15a-b582-4c3a-bd39-ee117160ae93', '413a0865-174f-44cd-9be0-4765187fb9d5', 'GV003', 'công nghệ thông tin', 9, 0, 1, 1),
('42dae8d0-0279-4867-994b-45dcedb1f17e', 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'T321965', 'Information Technology', 5, 0, 1, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `teacher_specializations`
--

CREATE TABLE `teacher_specializations` (
  `teacher_id` varchar(36) NOT NULL,
  `specialization` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `teacher_specializations`
--

INSERT INTO `teacher_specializations` (`teacher_id`, `specialization`) VALUES
('0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'shdn');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `topics`
--

CREATE TABLE `topics` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `supervisor_id` varchar(36) DEFAULT NULL COMMENT 'User ID of the teacher, null if student proposed or unassigned',
  `reviewer_id` varchar(36) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `rejection_reason` text DEFAULT NULL,
  `semester` varchar(20) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `field` varchar(100) DEFAULT NULL,
  `max_students` int(11) DEFAULT 2,
  `current_students` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` varchar(36) DEFAULT NULL,
  `requirements` text DEFAULT NULL COMMENT 'Project requirements',
  `expected_results` text DEFAULT NULL COMMENT 'Expected project results',
  `proposed_by_type` enum('teacher','student') DEFAULT 'teacher',
  `original_proposal_id` varchar(36) DEFAULT NULL,
  `assigned_to_student_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `topics`
--

INSERT INTO `topics` (`id`, `title`, `description`, `supervisor_id`, `reviewer_id`, `status`, `rejection_reason`, `semester`, `academic_year`, `field`, `max_students`, `current_students`, `created_at`, `updated_at`, `approved_at`, `approved_by`, `requirements`, `expected_results`, `proposed_by_type`, `original_proposal_id`, `assigned_to_student_id`) VALUES
('12172c00-839a-44b8-a0a5-d8b2e33f17e9', 'quan li rap chieu phim', 'kjk', '22428871-ec14-4875-ba4a-c46d8a98005c', 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'approved', NULL, '2', '2025-2026', 'Web Development', 2, 1, '2026-02-05 05:07:30', '2026-02-11 07:36:25', '2026-02-05 05:07:47', '22428871-ec14-4875-ba4a-c46d8a98005c', NULL, NULL, 'teacher', NULL, NULL),
('9a2ae3a9-02f7-437f-ac42-4fef4b533e5e', 'Tạo ra một công cụ hỗ trợ thiết kế và phân tích chiến thuật cho trò chơi điện tử', 'Đề tài này yêu cầu sinh viên tạo ra một công cụ hỗ trợ thiết kế và phân tích chiến thuật cho trò chơi điện tử, cho phép người dùng tạo ra và симуля các kịch bản chiến thuật khác nhau. Công cụ phải có khả năng phân tích và đánh giá hiệu quả của các chiến thuật, cũng như cung cấp các đề xuất để cải thiện chiến thuật. Sinh viên cũng cần phải đảm bảo công cụ có giao diện người dùng thân thiện và dễ sử dụng.', '413a0865-174f-44cd-9be0-4765187fb9d5', NULL, 'approved', NULL, '1', '2024-2025', 'Game Development', 2, 0, '2026-02-28 13:47:36', '2026-02-28 13:47:36', '0000-00-00 00:00:00', NULL, '2026-02-28 20:47:36', 'Sinh viên cần có kiến thức về lập trình, thiết kế trò chơi và phân tích dữ liệu.', 'teacher', NULL, NULL),
('9dacc2ec-cb56-4564-8cd0-8f1daeef7ace', 'quan li quan ao', 'sfdf', NULL, NULL, 'approved', NULL, '1', '2024-2025', 'Web Development', 2, 2, '2026-02-11 07:14:14', '2026-02-12 04:17:34', '2026-02-11 07:14:24', '22428871-ec14-4875-ba4a-c46d8a98005c', 'fdssd', 'dsdsd', 'teacher', NULL, NULL),
('9f156319-e614-4708-820b-931ac7f2c714', 'Phát triển ứng dụng di động tích hợp Chatbot để hỗ trợ sinh viên', 'Mục tiêu của đề tài này là thiết kế và phát triển một ứng dụng di động tích hợp công nghệ chatbot để hỗ trợ sinh viên trong việc tìm kiếm thông tin, giải đáp thắc mắc và hỗ trợ học tập. Phạm vi của dự án bao gồm việc nghiên cứu và phân tích các yêu cầu của người dùng, thiết kế giao diện người dùng thân thiện và trực quan, cũng như tích hợp các tính năng như trả lời câu hỏi tự động, đặt lịch hẹn và gửi thông báo. Dự án sẽ sử dụng các công nghệ như React Native, Node.js và Dialogflow để phát triển chatbot và ứng dụng di động.', '413a0865-174f-44cd-9be0-4765187fb9d5', NULL, 'approved', NULL, '1', '2024-2025', 'Mobile App', 2, 0, '2026-02-28 13:29:07', '2026-02-28 13:35:50', '2026-02-28 13:35:50', NULL, 'Yêu cầu sinh viên có kiến thức về lập trình Java hoặc Kotlin, hiểu biết về công nghệ React Native và Node.js, cũng như kỹ năng phân tích và thiết kế hệ thống', '', 'teacher', NULL, NULL),
('a27b445f-f0f1-4dd2-90a9-832dc4c0095c', 'Xây dựng một hệ thống AI cho trò chơi chiến thuật turn-based', 'Đề tài này yêu cầu sinh viên xây dựng một hệ thống AI cho trò chơi chiến thuật turn-based, cho phép người máy chơi có khả năng đưa ra quyết định và thực hiện hành động một cách thông minh. Hệ thống AI phải có khả năng học hỏi và thích nghi với các tình huống khác nhau, cũng như có thể điều chỉnh độ khó tùy theo người chơi. Sinh viên cũng cần phải đảm bảo hệ thống AI có hiệu suất tốt và không ảnh hưởng đến trải nghiệm người dùng.', '413a0865-174f-44cd-9be0-4765187fb9d5', NULL, 'approved', NULL, '1', '2024-2025', 'Game Development', 2, 0, '2026-02-28 13:47:36', '2026-02-28 13:47:36', '0000-00-00 00:00:00', NULL, '2026-02-28 20:47:36', 'Sinh viên cần có kiến thức về lập trình, trí tuệ nhân tạo và thiết kế trò chơi.', 'teacher', NULL, NULL),
('c3893b63-6dae-480f-b179-ea256aff2f35', 'xây dựng hệ thống thư viện dnc', 'lm vè thu vien', '22428871-ec14-4875-ba4a-c46d8a98005c', 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'approved', NULL, 'summer', '2025-2026', 'Web Development', 2, 0, '2026-02-05 04:56:33', '2026-02-05 05:09:46', '2026-02-05 04:56:38', '22428871-ec14-4875-ba4a-c46d8a98005c', NULL, NULL, 'teacher', NULL, NULL),
('e4087abf-f64f-4c3c-a607-fcce424c7aa4', 'Phát triển trò chơi chiến thuật thời gian thực trên nền tảng di động', 'Đề tài này yêu cầu sinh viên thiết kế và phát triển một trò chơi chiến thuật thời gian thực trên nền tảng di động, tích hợp các yếu tố như xây dựng, quản lý tài nguyên, đào tạo và điều khiển quân đội. Trò chơi phải có giao diện người dùng thân thiện, hiệu ứng hình ảnh và âm thanh hấp dẫn. Sinh viên cũng cần phải đảm bảo trò chơi có độ khó tăng dần và có khả năng chơi lại cao.', '413a0865-174f-44cd-9be0-4765187fb9d5', NULL, 'approved', NULL, '1', '2024-2025', 'Game Development', 2, 0, '2026-02-28 13:47:36', '2026-02-28 13:47:36', '0000-00-00 00:00:00', NULL, '2026-02-28 20:47:36', 'Sinh viên cần có kiến thức về lập trình di động, thiết kế trò chơi và quản lý dự án.', 'teacher', NULL, NULL),
('e649fe98-f1a9-4d76-b135-561c24d42264', 'Xây dựng hệ thống dự đoán nhu cầu bán hàng dựa trên dữ liệu lịch sử và thời tiết', 'Hệ thống này sẽ sử dụng thuật toán học máy để phân tích dữ liệu lịch sử bán hàng và dữ liệu thời tiết để dự đoán nhu cầu bán hàng trong tương lai. Từ đó, giúp doanh nghiệp quản lý tồn kho, tối ưu hóa hàng hóa và giảm thiểu thất thoát. Hệ thống cũng có thể cung cấp thông tin về xu hướng bán hàng và giúp doanh nghiệp đưa ra quyết định kinh doanh thông minh hơn. Dự án này yêu cầu sinh viên có kiến thức về dữ liệu lớn, học máy và phân tích dữ liệu.', '413a0865-174f-44cd-9be0-4765187fb9d5', NULL, 'approved', NULL, '1', '2024-2025', 'AI/ML', 2, 0, '2026-02-28 13:39:27', '2026-02-28 13:39:27', '0000-00-00 00:00:00', NULL, '2026-02-28 20:39:27', 'Sinh viên cần có kiến thức về Python, thư viện scikit-learn, pandas và numpy. Ngoài ra, sinh viên cũng cần có kinh nghiệm làm việc với dữ liệu lớn và học máy.', 'teacher', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `topic_proposals`
--

CREATE TABLE `topic_proposals` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `expected_results` text DEFAULT NULL,
  `proposed_by_student_id` varchar(36) NOT NULL,
  `requested_supervisor_id` varchar(36) NOT NULL,
  `status` enum('pending','approved','rejected','revision_requested') DEFAULT 'pending',
  `teacher_feedback` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `uid` varchar(128) NOT NULL COMMENT 'Firebase Auth UID',
  `email` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `photo_url` text DEFAULT NULL,
  `role` enum('student','teacher','admin') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `uid`, `email`, `display_name`, `phone`, `photo_url`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
('22428871-ec14-4875-ba4a-c46d8a98005c', 'XyyiXMZhdOPEjeNmqLsKUKIxTbq2', 'admin@agile.com', 'Agile Admin', NULL, NULL, 'admin', 1, '2026-02-04 15:52:42', '2026-02-04 16:02:11'),
('237ce1d6-4ba6-441a-96e0-fa1cf792c2a9', 'f8feuSm2UmU9s84lBoHH8Rat2f63', 'nguyenquoctanh2603@gmail.com', 'nguyễn quốc tánh', '8345678543', NULL, 'student', 1, '2026-02-28 13:40:29', '2026-03-01 05:20:44'),
('413a0865-174f-44cd-9be0-4765187fb9d5', 'ByQtTj3r97aNOHVQVQb2rKpNWkm1', 'nguyenvanx@school.edu.vn', 'Tiến sĩ Nguyễn Văn X', '0123456789', NULL, 'teacher', 1, '2026-02-12 03:01:35', '2026-02-12 04:18:27'),
('71c101c9-7f1b-4fcd-80ed-04372ea18866', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '2110568@test2026.edu.vn', 'Lê Hồ Minh Nhựt', '', NULL, 'student', 1, '2026-02-12 03:49:02', '2026-02-12 03:57:10'),
('bd824b72-563a-4ee2-9572-4c302bca6774', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', 'baokhangml99@gmail.com', 'nguyen av án', '09873456789', NULL, 'student', 1, '2026-02-28 12:29:44', '2026-02-28 12:29:44'),
('cfc23678-f40e-42e7-947d-512cf3e19198', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', 'nguyentienchuc2023@gmail.com', 'Chức Nguyễn Tiến', NULL, NULL, 'student', 1, '2026-02-11 07:34:37', '2026-02-11 07:34:37'),
('fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'dummy-teacher-uid', 'teacher@test.com', 'Giảng Viên Test', NULL, NULL, 'teacher', 1, '2026-02-05 05:08:39', '2026-02-05 05:08:39');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `admin_id` (`admin_id`),
  ADD KEY `idx_admin_id` (`admin_id`);

--
-- Chỉ mục cho bảng `admin_permissions`
--
ALTER TABLE `admin_permissions`
  ADD PRIMARY KEY (`admin_id`,`permission`),
  ADD KEY `idx_permission` (`permission`);

--
-- Chỉ mục cho bảng `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_semester` (`semester`),
  ADD KEY `idx_academic_year` (`academic_year`),
  ADD KEY `idx_status` (`status`);

--
-- Chỉ mục cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bookings_slot` (`slot_id`),
  ADD KEY `fk_bookings_student` (`student_id`),
  ADD KEY `fk_bookings_project` (`project_id`);

--
-- Chỉ mục cho bảng `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `class_code` (`class_code`),
  ADD KEY `idx_class_code` (`class_code`),
  ADD KEY `idx_academic_year` (`academic_year`),
  ADD KEY `idx_advisor` (`advisor_teacher_id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Chỉ mục cho bảng `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_report` (`report_id`),
  ADD KEY `idx_teacher` (`teacher_id`),
  ADD KEY `idx_comment_date` (`comment_date`);

--
-- Chỉ mục cho bảng `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project_id` (`project_id`),
  ADD KEY `idx_document_type` (`document_type`);

--
-- Chỉ mục cho bảng `meeting_slots`
--
ALTER TABLE `meeting_slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_slots_teacher` (`teacher_id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_uid` (`user_uid`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Chỉ mục cho bảng `progress_reports`
--
ALTER TABLE `progress_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project` (`project_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_week` (`week_number`),
  ADD KEY `idx_submitted_date` (`submitted_date`);

--
-- Chỉ mục cho bảng `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_topic` (`topic_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_supervisor` (`supervisor_id`),
  ADD KEY `idx_reviewer` (`reviewer_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_projects_archived` (`archived_at`);

--
-- Chỉ mục cho bảng `project_archive`
--
ALTER TABLE `project_archive`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_academic_year` (`academic_year`),
  ADD KEY `idx_topic_field` (`topic_field`),
  ADD KEY `idx_grade` (`grade`);
ALTER TABLE `project_archive` ADD FULLTEXT KEY `idx_search` (`topic_title`,`student_name`,`supervisor_name`);

--
-- Chỉ mục cho bảng `sprints`
--
ALTER TABLE `sprints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_sprint` (`project_id`,`sprint_number`);

--
-- Chỉ mục cho bảng `sprint_comments`
--
ALTER TABLE `sprint_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sprint_comments_sprint` (`sprint_id`),
  ADD KEY `idx_sprint_comments_project` (`project_id`);

--
-- Chỉ mục cho bảng `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_class_name` (`class_name`),
  ADD KEY `idx_academic_year` (`academic_year`);

--
-- Chỉ mục cho bảng `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `teacher_id` (`teacher_id`),
  ADD KEY `idx_teacher_id` (`teacher_id`),
  ADD KEY `idx_department` (`department`),
  ADD KEY `idx_can_supervise` (`can_supervise`),
  ADD KEY `idx_can_review` (`can_review`);

--
-- Chỉ mục cho bảng `teacher_specializations`
--
ALTER TABLE `teacher_specializations`
  ADD PRIMARY KEY (`teacher_id`,`specialization`),
  ADD KEY `idx_specialization` (`specialization`);

--
-- Chỉ mục cho bảng `topics`
--
ALTER TABLE `topics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_supervisor` (`supervisor_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_semester_year` (`semester`,`academic_year`),
  ADD KEY `fk_topics_reviewer` (`reviewer_id`);

--
-- Chỉ mục cho bảng `topic_proposals`
--
ALTER TABLE `topic_proposals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposed_by_student_id` (`proposed_by_student_id`),
  ADD KEY `requested_supervisor_id` (`requested_supervisor_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uid` (`uid`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_uid` (`uid`),
  ADD KEY `idx_active` (`is_active`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `project_archive`
--
ALTER TABLE `project_archive`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `admin_permissions`
--
ALTER TABLE `admin_permissions`
  ADD CONSTRAINT `admin_permissions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_bookings_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bookings_slot` FOREIGN KEY (`slot_id`) REFERENCES `meeting_slots` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bookings_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `fk_class_advisor` FOREIGN KEY (`advisor_teacher_id`) REFERENCES `teachers` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `progress_reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`);

--
-- Các ràng buộc cho bảng `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `fk_documents_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `meeting_slots`
--
ALTER TABLE `meeting_slots`
  ADD CONSTRAINT `fk_slots_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `progress_reports`
--
ALTER TABLE `progress_reports`
  ADD CONSTRAINT `progress_reports_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_projects_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_projects_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `teachers` (`id`),
  ADD CONSTRAINT `fk_projects_topic` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `teacher_specializations`
--
ALTER TABLE `teacher_specializations`
  ADD CONSTRAINT `teacher_specializations_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `topics`
--
ALTER TABLE `topics`
  ADD CONSTRAINT `fk_topics_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `topics_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `topic_proposals`
--
ALTER TABLE `topic_proposals`
  ADD CONSTRAINT `topic_proposals_ibfk_1` FOREIGN KEY (`proposed_by_student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `topic_proposals_ibfk_2` FOREIGN KEY (`requested_supervisor_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
