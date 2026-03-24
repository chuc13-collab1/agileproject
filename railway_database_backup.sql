-- Database Export from Railway

DROP TABLE IF EXISTS `admin_permissions`;
CREATE TABLE `admin_permissions` (
  `admin_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission` enum('manage_users','manage_projects','manage_topics','manage_grades','manage_system','view_reports') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`admin_id`,`permission`),
  KEY `idx_permission` (`permission`),
  CONSTRAINT `admin_permissions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID',
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Admin code',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `admin_id` (`admin_id`),
  KEY `idx_admin_id` (`admin_id`),
  CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `semester` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., HK1, HK2, Summer',
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g., 2024-2025',
  `registration_start` datetime NOT NULL,
  `registration_end` datetime NOT NULL,
  `status` enum('draft','published','closed') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `proposal_deadline` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_semester` (`semester`),
  KEY `idx_academic_year` (`academic_year`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `announcements` VALUES 
('1ea71a26-b7ac-4e25-a707-fcd3292a754d', 'abc', 'sbv', 'Hè', '2025-2026', '2026-02-05 16:03:00', '2026-02-28 16:03:00', 'published', '2026-02-04 09:03:31', '2026-02-28 05:36:41', NULL),
('429b23d4-e7dd-441e-ab8c-40800a92db30', 'đồ án cơ sở 2', 'THÔNG BÁO ĐỒ ÁN CƠ SỞ 2\n\n📌 Môn học: Đồ án Cơ sở 2\n📅 Thời gian thực hiện: Từ ngày 05/03/2026 đến ngày 30/05/2026\n⏰ Thời gian báo cáo dự kiến: 08h00, ngày 02/06/2026\n📍 Địa điểm: Phòng thực hành CNTT\n\n📖 Nội dung thực hiện:\nSinh viên thực hiện đề tài theo nhóm (2–4 người), xây dựng một hệ thống phần mềm ứng dụng các kiến thức đã học như phân tích – thiết kế hệ thống, thiết kế cơ sở dữ liệu, lập trình và kiểm thử.\n\nYêu cầu:\n\nXây dựng đầy đủ tài liệu (đặc tả yêu cầu, UML, thiết kế CSDL).\n\nHoàn thành sản phẩm chạy được với các chức năng chính.\n\nViết báo cáo hoàn chỉnh và chuẩn bị slide thuyết trình.\n\n⚠️ Lưu ý:\n\nNộp source code và báo cáo trước ngày báo cáo 02 ngày.\n\nNhóm vắng mặt khi báo cáo sẽ không được chấm điểm.\n\nGiảng viên phụ trách: ........................................\nNgày ra thông báo: 28/02/2026', 'HK2', '2025-2026', '2026-03-30 13:26:00', '2026-04-20 13:26:00', 'published', '2026-02-28 05:27:11', '2026-03-10 22:29:35', NULL),
('8964b674-2c4e-4519-8595-068a82757737', 'Đồ án Chuyên ngành K22 – HK1', 'Sinh viên thực hiện các bước sau trên hệ thống quản lý đồ án:\n\nĐăng nhập vào hệ thống bằng tài khoản sinh viên.\n\nXem danh sách đề tài đồ án do giảng viên đề xuất.\n\nLựa chọn đề tài phù hợp và gửi yêu cầu đăng ký.\n\nTheo dõi trạng thái phê duyệt từ giảng viên hướng dẫn hoặc bộ môn.\nSinh viên phải hoàn tất đăng ký trong thời gian quy định.\n\nSau thời gian kết thúc đăng ký, hệ thống sẽ tự động đóng và không tiếp nhận thêm yêu cầu mới.\n\nMọi thắc mắc liên quan đến quá trình đăng ký vui lòng liên hệ giảng viên hướng dẫn hoặc bộ môn phụ trách.', 'HK1', '2025-2026', '2026-05-21 01:52:00', '2026-05-30 01:52:00', 'published', '2026-03-10 21:53:18', '2026-03-10 22:18:58', NULL);

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID',
  `slot_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','confirmed','cancelled','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_bookings_slot` (`slot_id`),
  KEY `fk_bookings_student` (`student_id`),
  KEY `fk_bookings_project` (`project_id`),
  CONSTRAINT `fk_bookings_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bookings_slot` FOREIGN KEY (`slot_id`) REFERENCES `meeting_slots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique class identifier (e.g., DH22TIN01)',
  `class_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Full class name (e.g., Công nghệ thông tin K22)',
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Academic year range (e.g., 2022-2026)',
  `advisor_teacher_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Class advisor foreign key to teachers table',
  `max_students` int DEFAULT '40' COMMENT 'Maximum student capacity',
  `major` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Major/specialization',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Additional class information',
  `is_active` tinyint DEFAULT '1' COMMENT 'Active status',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_code` (`class_code`),
  KEY `idx_class_code` (`class_code`),
  KEY `idx_academic_year` (`academic_year`),
  KEY `idx_advisor` (`advisor_teacher_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `fk_class_advisor` FOREIGN KEY (`advisor_teacher_id`) REFERENCES `teachers` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `classes` VALUES 
('77eab29e-1fda-4a7c-b7f8-4a71615e7249', 'DH22TIN06', 'công nghệ thông tin k10 06', '2022-2026', '413a0865-174f-44cd-9be0-4765187fb9d5', 52, 'công nghệ thông tin', '....', 1, '2026-03-10 21:28:42', '2026-03-10 21:28:42'),
('803dbe76-5dd8-472f-b458-ca5e73476ebc', 'DH22TIN00', 'cntt_k10', '2024-2028', NULL, 57, 'cntt', '', 0, '2026-02-04 08:06:57', '2026-02-04 08:08:47'),
('bc2ad21d-89fb-4adb-a561-e22ac9b7bd4b', 'DH22TIN01', 'cntt k10 k1', '2024-2028', NULL, 60, 'cntt', NULL, 1, '2026-02-04 08:09:58', '2026-02-04 08:09:58');

DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `report_id` varchar(36) NOT NULL COMMENT 'Reference to progress_reports table',
  `teacher_id` varchar(36) NOT NULL COMMENT 'Teacher who commented',
  `content` text NOT NULL COMMENT 'Comment text',
  `rating` int DEFAULT NULL COMMENT 'Rating 1-5 stars',
  `comment_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_report` (`report_id`),
  KEY `idx_teacher` (`teacher_id`),
  KEY `idx_comment_date` (`comment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `comments` VALUES 
('33efe5fd-09c4-4f5f-8d82-3ccce97bf023', '130a7f95-c543-4929-8a03-3257c9a57353', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'dc', 5, '2026-02-12 20:12:19', '2026-02-12 20:12:19', '2026-02-12 20:12:19'),
('5bbeec12-9ea1-4fd4-a755-58110abfb5b3', 'fa8c8a51-e17b-401e-af6b-f16ad394131b', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'sds', 5, '2026-02-28 06:16:00', '2026-02-28 06:16:00', '2026-02-28 06:16:00'),
('824b305b-c864-4261-8848-92756eed1f9c', 'a11f445d-4970-4c99-985f-5f77faac91a0', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'Đề tài Hệ thống quản lý siêu thị được thực hiện nhằm xây dựng một phần mềm hỗ trợ quản lý hoạt động kinh doanh trong siêu thị một cách hiệu quả và khoa học. Trong bối cảnh các cửa hàng bán lẻ ngày càng phát triển, việc quản lý thủ công bằng sổ sách hoặc các công cụ đơn giản dễ dẫn đến sai sót, mất thời gian và khó kiểm soát dữ liệu. Vì vậy, hệ thống được xây dựng để hỗ trợ quản lý hàng hóa, khách hàng, hóa đơn, nhân viên và thống kê doanh thu một cách nhanh chóng và chính xác.', 5, '2026-03-10 23:04:27', '2026-03-10 23:04:27', '2026-03-10 23:04:27');

DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` enum('outline','report','slides','source_code','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` int DEFAULT '1',
  `is_latest` tinyint(1) DEFAULT '1',
  `uploaded_by` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  CONSTRAINT `fk_documents_project_setup_v2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `documents` VALUES 
('1f48ec6e-c5fc-4da7-b274-61ffa2567563', 'd012b94f-445e-42fb-b6a6-b461c669d382', 'source_code', 'agile-project-management.zip', '/app/uploads/progress-reports/file-1773228442595-495778592.zip', 224488668, 'application/x-zip-compressed', 2, 1, '0f4c1d84-459c-49ad-a60d-2deae6074c9c', NULL, '2026-03-11 04:27:43', '2026-03-11 04:27:43');

DROP TABLE IF EXISTS `evaluations`;
CREATE TABLE `evaluations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID',
  `project_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `evaluator_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Teacher UUID',
  `evaluator_type` enum('supervisor','reviewer','council') COLLATE utf8mb4_unicode_ci NOT NULL,
  `criteria_score` json DEFAULT NULL COMMENT 'JSON storing detailed scores',
  `total_score` decimal(4,2) DEFAULT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `strengths` text COLLATE utf8mb4_unicode_ci,
  `weaknesses` text COLLATE utf8mb4_unicode_ci,
  `suggestions` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_evaluation` (`project_id`,`evaluator_id`,`evaluator_type`),
  KEY `fk_evaluations_teacher` (`evaluator_id`),
  CONSTRAINT `fk_evaluations_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_evaluations_teacher` FOREIGN KEY (`evaluator_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `evaluations` VALUES 
('31aae36b-67e9-4e9f-a7f0-44c85c419185', 'd012b94f-445e-42fb-b6a6-b461c669d382', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'supervisor', [object Object], '8.00', 'Đề tài Hệ thống quản lý siêu thị được thực hiện nhằm xây dựng một phần mềm hỗ trợ quản lý hoạt động kinh doanh trong siêu thị một cách hiệu quả và khoa học. Trong bối cảnh các cửa hàng bán lẻ ngày càng phát triển, việc quản lý thủ công bằng sổ sách hoặc các công cụ đơn giản dễ dẫn đến sai sót, mất thời gian và khó kiểm soát dữ liệu. Vì vậy, hệ thống được xây dựng để hỗ trợ quản lý hàng hóa, khách hàng, hóa đơn, nhân viên và thống kê doanh thu một cách nhanh chóng và chính xác.', 'Đề tài Hệ thống quản lý siêu thị được thực hiện nhằm xây dựng một phần mềm hỗ trợ quản lý hoạt động kinh doanh trong siêu thị một cách hiệu quả và khoa học. Trong bối cảnh các cửa hàng bán lẻ ngày càng phát triển, việc quản lý thủ công bằng sổ sách hoặc các công cụ đơn giản dễ dẫn đến sai sót, mất thời gian và khó kiểm soát dữ liệu. Vì vậy, hệ thống được xây dựng để hỗ trợ quản lý hàng hóa, khách hàng, hóa đơn, nhân viên và thống kê doanh thu một cách nhanh chóng và chính xác.', 'Đề tài Hệ thống quản lý siêu thị được thực hiện nhằm xây dựng một phần mềm hỗ trợ quản lý hoạt động kinh doanh trong siêu thị một cách hiệu quả và khoa học. Trong bối cảnh các cửa hàng bán lẻ ngày càng phát triển, việc quản lý thủ công bằng sổ sách hoặc các công cụ đơn giản dễ dẫn đến sai sót, mất thời gian và khó kiểm soát dữ liệu. Vì vậy, hệ thống được xây dựng để hỗ trợ quản lý hàng hóa, khách hàng, hóa đơn, nhân viên và thống kê doanh thu một cách nhanh chóng và chính xác.', 'Đề tài Hệ thống quản lý siêu thị được thực hiện nhằm xây dựng một phần mềm hỗ trợ quản lý hoạt động kinh doanh trong siêu thị một cách hiệu quả và khoa học. Trong bối cảnh các cửa hàng bán lẻ ngày càng phát triển, việc quản lý thủ công bằng sổ sách hoặc các công cụ đơn giản dễ dẫn đến sai sót, mất thời gian và khó kiểm soát dữ liệu. Vì vậy, hệ thống được xây dựng để hỗ trợ quản lý hàng hóa, khách hàng, hóa đơn, nhân viên và thống kê doanh thu một cách nhanh chóng và chính xác.', '2026-03-10 23:10:02', '2026-03-10 23:10:02'),
('b6b02876-714e-4725-9de2-4892bb173e81', 'd012b94f-445e-42fb-b6a6-b461c669d382', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'reviewer', [object Object], '8.68', 'Đề tài Hệ thống quản lý siêu thị được thực hiện nhằm xây dựng một phần mềm hỗ trợ quản lý hoạt động kinh doanh trong siêu thị một cách hiệu quả và khoa học. Trong bối cảnh các cửa hàng bán lẻ ngày càng phát triển, việc quản lý thủ công bằng sổ sách hoặc các công cụ đơn giản dễ dẫn đến sai sót, mất thời gian và khó kiểm soát dữ liệu. Vì vậy, hệ thống được xây dựng để hỗ trợ quản lý hàng hóa, khách hàng, hóa đơn, nhân viên và thống kê doanh thu một cách nhanh chóng và chính xác.', 'Đề tài Hệ thống quản lý siêu thị được thực hiện nhằm xây dựng một phần mềm hỗ trợ quản lý hoạt động kinh doanh trong siêu thị một cách hiệu quả và khoa học. Trong bối cảnh các cửa hàng bán lẻ ngày càng phát triển, việc quản lý thủ công bằng sổ sách hoặc các công cụ đơn giản dễ dẫn đến sai sót, mất thời gian và khó kiểm soát dữ liệu. Vì vậy, hệ thống được xây dựng để hỗ trợ quản lý hàng hóa, khách hàng, hóa đơn, nhân viên và thống kê doanh thu một cách nhanh chóng và chính xác.', 'Đề tài Hệ thống quản lý siêu thị được thực hiện nhằm xây dựng một phần mềm hỗ trợ quản lý hoạt động kinh doanh trong siêu thị một cách hiệu quả và khoa học. Trong bối cảnh các cửa hàng bán lẻ ngày càng phát triển, việc quản lý thủ công bằng sổ sách hoặc các công cụ đơn giản dễ dẫn đến sai sót, mất thời gian và khó kiểm soát dữ liệu. Vì vậy, hệ thống được xây dựng để hỗ trợ quản lý hàng hóa, khách hàng, hóa đơn, nhân viên và thống kê doanh thu một cách nhanh chóng và chính xác.', 'Đề tài Hệ thống quản lý siêu thị được thực hiện nhằm xây dựng một phần mềm hỗ trợ quản lý hoạt động kinh doanh trong siêu thị một cách hiệu quả và khoa học. Trong bối cảnh các cửa hàng bán lẻ ngày càng phát triển, việc quản lý thủ công bằng sổ sách hoặc các công cụ đơn giản dễ dẫn đến sai sót, mất thời gian và khó kiểm soát dữ liệu. Vì vậy, hệ thống được xây dựng để hỗ trợ quản lý hàng hóa, khách hàng, hóa đơn, nhân viên và thống kê doanh thu một cách nhanh chóng và chính xác.', '2026-03-10 23:10:25', '2026-03-10 23:10:25');

DROP TABLE IF EXISTS `meeting_slots`;
CREATE TABLE `meeting_slots` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID',
  `teacher_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Physical room or Meeting Link',
  `max_students` int DEFAULT '1',
  `is_booked` tinyint DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_slots_teacher` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `meeting_slots` VALUES 
('7401dba8-4df1-4ef3-870e-802b74eccd64', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', '2026-02-27 08:41:00', '2026-02-27 09:44:00', 'Online (Google Meet)', 1, 0, '2026-02-12 22:39:52');

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `user_uid` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `message` text COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('info','success','warning','error','project','report','chat','system') COLLATE utf8mb4_general_ci DEFAULT 'info',
  `link` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_read` tinyint DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_uid` (`user_uid`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `notifications` VALUES 
('02752258-8ead-4d5c-a8b9-c1e75272cded', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:25:23'),
('0c20f087-52f8-4b16-9b08-dffc18b55cf8', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:23:10'),
('0f604b51-117f-4e1d-be96-f7ee0e03f694', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:25:23'),
('0fffc5b1-cefb-409d-8105-24213faf9262', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:23:10'),
('11053bbb-ee91-4631-a8f8-660ef496bba6', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:09:00'),
('1452c1df-0cf1-4e98-8006-e1c4ec43e4c1', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:06:53'),
('148b8afb-61a9-42ae-9095-513b95f12e31', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:14:54'),
('15898be9-a74d-4c9c-98eb-ab2844421277', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:40:40'),
('15cd4adb-2030-476b-8829-631174216d44', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:06:53'),
('1833262a-e3bd-495a-b0ac-c8b94b873f3e', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', 'Đồ án được duyệt', 'Đồ án "Hệ thống quản lý và theo dõi tiến độ đồ án tốt nghiệp cho sinh viên" đã được duyệt và đang thực hiện.', 'success', '/student/my-project', 1, '2026-03-10 22:36:42'),
('1a067fe2-3476-4941-ab78-d0567d557e58', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:38:37'),
('1da69efd-3031-4b6e-9dc1-ddf84a953119', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:18:58'),
('1e5bbef4-aa10-43e5-8b61-380f99e0ccbc', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:29:35'),
('22f285ba-d5a6-4bb5-a8eb-b984d1c4899b', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 abc', 'Thông báo mới: abc - Hè/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:12:23'),
('23462df2-255d-473a-add7-70f112083b24', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', 'GVPB đã chấm điểm', 'Đồ án "Hệ thống quản lý và theo dõi tiến độ đồ án tốt nghiệp cho sinh viên" đã được GVPB chấm điểm: 8.7 điểm.', 'success', '/student/results', 1, '2026-03-10 23:10:25'),
('25b99f7e-1cb7-4d8b-9fa4-18c9c8d64b1d', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:29:35'),
('2e55a776-2526-41ea-bade-b611eac25923', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:06:55'),
('2f8fcee8-3202-4540-9f66-ca00cfeaa89d', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:38:37'),
('30668090-c2e9-4b51-8092-e1b8d93a417a', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', 'Giảng viên đã duyệt báo cáo', 'Báo cáo tiến độ đồ án "Hệ thống quản lý và theo dõi tiến độ đồ án tốt nghiệp cho sinh viên" đã duyệt.', 'success', '/student/reports', 0, '2026-03-10 23:04:27'),
('30d264a4-41b5-4721-bf2e-b424e8d73efe', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 abc', 'Thông báo mới: abc - Hè/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:12:22'),
('339a2983-d9da-4798-8e6a-5d88c22bf9e5', 'ByQtTj3r97aNOHVQVQb2rKpNWkm1', 'Sinh viên nộp báo cáo tiến độ', 'Có báo cáo tiến độ mới cho đồ án "Hệ thống quản lý và theo dõi tiến độ đồ án tốt nghiệp cho sinh viên".', 'report', '/teacher/progress-tracking', 1, '2026-03-10 22:50:45'),
('35be6460-58d8-47ef-a70d-f613a824b2e0', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 05:58:56'),
('375362eb-27d6-498a-830b-841a3af8f59b', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:40:40'),
('397fe264-8ba7-4f16-8494-c6957953aeef', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:40:40'),
('3af4530a-ecf7-425d-ad99-f0d696be5dbf', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:06:55'),
('3b53aede-26a7-40bb-b739-61b7c646c9db', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:29:35'),
('4121caa5-d0fe-4368-991c-189cd4a58508', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:49:41'),
('41698b97-93ba-43cf-88c2-f0b9b2d80fbf', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:40:47'),
('4327a965-7b61-45ff-9a6f-f1c589a150b1', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:06:53'),
('44067271-6766-4865-9f2c-e7f8070b1167', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', 'Giảng viên đã duyệt báo cáo', 'Báo cáo tiến độ đồ án "quan li quan ao" đã duyệt.', 'success', '/student/reports', 0, '2026-02-28 06:16:00'),
('45474475-8e04-4f1f-850b-dd00d91b6c75', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:40:47'),
('4ba025c5-56fc-446e-a2fc-d0ceb2e04286', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:38:37'),
('50e63f99-4c0e-4220-85c9-c9053bb76b31', 'ByQtTj3r97aNOHVQVQb2rKpNWkm1', 'Đề xuất đề tài mới', 'Sinh viên đề xuất đề tài "Hệ thống quản lý và theo dõi tiến độ đồ án tốt nghiệp cho sinh viên". Vui lòng xem xét.', 'project', '/teacher/proposals', 1, '2026-03-09 03:13:44'),
('519ce6df-2f1b-4650-875b-15f8e3b5a79c', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:49:41'),
('60301ad4-9229-4965-8e6b-7393a9fa2e9e', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-03 02:11:37'),
('6515ede8-1587-4c8e-9cf7-5ec66f0ecb0a', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:23:10'),
('722b90f5-147f-4573-afa9-be9df39be561', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:14:54'),
('740af3ed-f626-4655-bf55-6f64e467aa28', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:18:58'),
('762e6c05-4dc8-4cc6-a69b-1fa6055f1d72', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 1, '2026-03-10 21:53:18'),
('7699d39c-e767-4d28-ada7-dce091d864aa', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:38:37'),
('7cc4507a-7ab3-4a7f-bc99-a6d12125a738', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:49:41'),
('7d3e3c41-e056-4fd2-b50f-f7415ad46bbe', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:38:37'),
('809ed2c7-3432-4245-9914-71e6d1a52ff9', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 05:58:55'),
('80c92276-2a51-4dc0-8e8e-ddb7c9fd740b', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:06:55'),
('8309ba60-0d94-44f4-aaad-a25dad03fefd', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:18:58'),
('845be23c-f05b-4c4d-948e-f091624e85f7', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', 'Đồ án được duyệt', 'Đồ án "quan li quan ao" đã được duyệt và đang thực hiện.', 'success', '/student/my-project', 0, '2026-03-01 19:23:31'),
('8e7b5a19-871c-43c5-b590-4e1d8ca6403b', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-01 19:21:25'),
('8ffb7a2a-bec9-46d0-b83c-59a7237a1336', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:40:47'),
('9803742b-001d-4a2e-975b-9e9540ef9c0c', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:06:53'),
('9e97f934-be83-4d68-8ee7-7bf320c4594b', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', 'GVHD đã chấm điểm', 'Đồ án "Hệ thống quản lý và theo dõi tiến độ đồ án tốt nghiệp cho sinh viên" đã được GVHD chấm điểm: 8.0 điểm.', 'success', '/student/results', 0, '2026-03-10 23:10:02'),
('9ede870d-1a0a-4613-920e-254666a332d7', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:14:54'),
('a0821c83-60db-4b22-aa35-032e839c4c51', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:53:18'),
('a1cf9c4d-f822-4518-bdab-566a38a23179', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:29:35'),
('a5f60d43-81f7-4b9a-bcb9-2fe000df82d2', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-03 02:11:37'),
('a7994bea-63db-4cc8-9078-b2edb1c8cad9', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-01 19:21:24'),
('a90f6156-0bb9-40a5-840f-91dd65d29459', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:49:41'),
('aa389d10-95b4-4f2b-a3cd-63ac9410612e', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:53:18'),
('ac771381-868c-4760-a433-afc87c272798', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:53:18'),
('ae92ba59-7268-4286-9a2a-24ebf8e52a45', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:06:53'),
('b1a01b34-d96c-448b-b973-4a84eba9f604', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:18:58'),
('b5fc6733-0718-49ae-b67f-5ac469649df8', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:40:47'),
('b8d9c318-fdc8-4ede-9684-ab15c9a1d85c', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-01 19:21:25'),
('bc6d825c-7dd1-41b8-b82e-9b6cf096bae4', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:09:00'),
('bdd3e2b2-ec81-4163-81f5-65d422132a12', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:25:23'),
('be1528f8-78e9-4249-8a32-08a87b7cafde', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 05:58:56'),
('be7275f4-24db-47a7-a114-a000e67075d5', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-03 02:11:37'),
('c1470015-2c0d-43b6-923f-fdbd54693682', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:14:54'),
('c29d5459-a33c-4e11-a680-963eafa6b639', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:25:23'),
('cc2896e4-0a43-4224-82f9-6d407c41bdb1', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:40:40'),
('cc911bb6-86cf-4c15-b0e3-f7d558a0384c', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:14:54'),
('cf144d7c-391c-40d8-9006-8793786f277c', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:09:00'),
('d2c10b58-675b-4d1f-b963-703b71d32395', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:25:23'),
('d45b1035-c3b3-49cb-845b-a4dc24329081', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 abc', 'Thông báo mới: abc - Hè/2025-2026', 'system', '/notifications', 0, '2026-02-28 06:12:22'),
('dd466d2f-d79f-4e3e-9f7f-fd204a4ff065', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:18:58'),
('e35763e3-2950-44bd-803e-f88770a7357f', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:40:47'),
('e4e96efd-f54d-4ef7-93ac-dd48480315bf', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', 'Đề xuất được duyệt', 'Đề xuất đề tài "Hệ thống quản lý và theo dõi tiến độ đồ án tốt nghiệp cho sinh viên" đã được giảng viên duyệt!', 'success', '/student/propose-topic', 1, '2026-03-09 03:14:06'),
('e5a74fce-8572-4319-af1a-81dda321be1b', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:49:41'),
('e6adbf25-5b12-4b5d-a98a-3a42f84e4c43', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-01 19:21:25'),
('e8c03a8d-b3cd-4ed4-90fc-043bb1fb32da', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:23:10'),
('eab0e889-532d-424e-b405-58c0daa56096', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-03 02:11:37'),
('f5fc89fc-7c5a-4894-a18b-4a9d64b3e78e', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:29:35'),
('f78cfaa8-ff0a-47bf-8b11-a9d730dbe338', 'f8feuSm2UmU9s84lBoHH8Rat2f63', '📋 Đồ án Chuyên ngành K22 – HK1', 'Thông báo mới: Đồ án Chuyên ngành K22 – HK1 - HK1/2025-2026', 'system', '/notifications', 0, '2026-03-10 21:53:18'),
('fc889501-20f8-4c05-9b36-0d372a0cb005', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '📋 đồ án cơ sở 2', 'Thông báo mới: đồ án cơ sở 2 - HK2/2025-2026', 'system', '/notifications', 0, '2026-03-10 22:23:10');

DROP TABLE IF EXISTS `progress_reports`;
CREATE TABLE `progress_reports` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID',
  `project_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Reference to projects table',
  `report_title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Report title',
  `week_number` int DEFAULT NULL COMMENT 'Week number (e.g., 1-15)',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Report content/description',
  `achievements` text COLLATE utf8mb4_unicode_ci COMMENT 'What was achieved this period',
  `difficulties` text COLLATE utf8mb4_unicode_ci COMMENT 'Difficulties encountered',
  `next_steps` text COLLATE utf8mb4_unicode_ci COMMENT 'Plan for next period',
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Firebase Storage path to uploaded file',
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Original filename',
  `file_size` bigint DEFAULT NULL COMMENT 'File size in bytes',
  `status` enum('submitted','reviewed','approved','revision_needed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'submitted',
  `submitted_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_date` timestamp NULL DEFAULT NULL COMMENT 'When teacher reviewed',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_status` (`status`),
  KEY `idx_week` (`week_number`),
  KEY `idx_submitted_date` (`submitted_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `progress_reports` VALUES 
('130a7f95-c543-4929-8a03-3257c9a57353', '7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', 'dang nhap', 1, 'Tết là khoảng thời gian đẹp nhất trong năm, khi mọi bộn bề dường như lắng lại để nhường chỗ cho sự sum vầy và yêu thương. Những ngày cuối năm, ai cũng tất bật dọn dẹp nhà cửa, chuẩn bị mâm cỗ, trang trí cành mai, cành đào như một cách chào đón điều mới mẻ. Không khí Tết không chỉ nằm ở mùi bánh chưng đang sôi trên bếp, mà còn ở tiếng cười nói rộn ràng của gia đình khi cùng nhau ngồi lại.\r\n\r\nTết còn là dịp để mỗi người nhìn lại một năm đã qua, với những nỗ lực, thành công và cả những điều chưa trọn vẹn. Khoảnh khắc giao thừa thiêng liêng khiến ta cảm nhận rõ ràng sự chuyển giao giữa cũ và mới, giữa lo toan và hy vọng. Trẻ con háo hức nhận lì xì, người lớn gửi nhau lời chúc bình an, sức khỏe và may mắn.\r\n\r\nDù cuộc sống có thay đổi thế nào, Tết vẫn luôn giữ một vị trí đặc biệt trong lòng mỗi người Việt – đó là thời điểm của đoàn tụ, của lòng biết ơn và của những khởi đầu đầy hi vọng.', NULL, NULL, NULL, 'E:\agile-project-management\server\uploads\progress-reports\file-1770951848755-603698128.zip', 'CinemaManagement.zip', 17199613, 'approved', '2026-02-12 20:04:08', '2026-02-12 20:12:19', '2026-02-12 20:04:08', '2026-02-12 20:12:19'),
('26ac573f-f49b-4216-8099-b6c2d8a54c03', '7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', 'đăng nhập', 1, 'Goal\r\nReview, enhance, and verify the existing student interface pages to match the modern design standards used in Admin and Teacher interfaces.\r\n\r\nCurrent Status\r\n✅ Existing Pages (9 pages)\r\nStudentDashboard - Basic dashboard with stats\r\nMyProject - View project details\r\nDocumentManagement - Upload/manage documents ✅\r\nProgressReports - View progress reports\r\nSubmitReport - Submit new progress report\r\nTopicBrowsing - Browse available topics\r\nTopicRegistration - Register for a topic\r\nStudentTopicProposal - Propose new topic\r\nProjectResults - View results/grades\r\nProposed Changes\r\nPhase 1: UI Enhancements (Priority HIGH)\r\n[MODIFY] \r\nStudentDashboard.tsx\r\nCurrent: Basic layout with plain stats cards Changes:\r\n\r\nAdd gradient header (similar to Teacher/Admin)\r\nImprove stat cards with better colors and icons\r\nAdd live data for pending reports\r\nBetter quick action buttons with gradients\r\nAdd project preview section\r\n[MODIFY] \r\nDocumentManagement.tsx\r\nCurrent: Has upload functionality Changes:\r\n\r\nVerify file upload actually works with backend\r\nAdd drag & drop UI\r\nBetter file type badges\r\nProgress bar for uploads\r\nModern gradients and spacing\r\n[MODIFY] \r\nProgressReports.tsx\r\nCurrent: Basic list of reports Changes:\r\n\r\nModern card layout\r\nBetter status badges with colors\r\nView supervisor comments in modal\r\nRating display (stars)\r\nFilter by status\r\n[MODIFY] \r\nSubmitReport.tsx\r\nCurrent: Form to submit report Changes:\r\n\r\nModern gradient design\r\nBetter textarea styling\r\nSuccess animation after submit\r\nAuto-save draft (optional)\r\nPhase 2: API Integration (Priority MEDIUM)\r\nBackend Endpoints to Verify/Create\r\nDocuments API:\r\n\r\nPOST /api/documents/upload - Upload file\r\nGET /api/projects/:id/documents - Get documents\r\nDELETE /api/documents/:id - Delete document\r\nProgress Reports API:\r\n\r\nGET /api/students/:studentId/progress-reports - Get student reports\r\nPOST /api/progress-reports - Submit new report\r\nGET /api/progress-reports/:id - Get report details\r\nProjects API (already exists):\r\n\r\nGET /api/projects?studentId=:id - Get student''s project\r\nPhase 3: Additional Features (Priority LOW)\r\n[MODIFY] \r\nMyProject.tsx\r\nAdd supervisor contact info\r\nQuick upload button\r\nTimeline visualization\r\nDeadline countdown\r\n[MODIFY] \r\nTopicBrowsing.tsx\r\nSearch and filter\r\nTopic details modal\r\nBetter card layout\r\nVerification Plan\r\nManual Testing\r\nLogin as Student\r\n\r\nNavigate to /student/dashboard\r\nVerify stats load correctly\r\nUpload Document\r\n\r\nGo to /student/documents\r\nTry uploading a file (.pdf, .zip)\r\nVerify file appears in list\r\nTry downloading\r\nSubmit Progress Report\r\n\r\nGo to /student/reports/submit\r\nFill form and submit\r\nVerify appears in reports list\r\nCheck if teacher can see it\r\nView Project\r\n\r\nGo to /student/my-project\r\nVerify project details display\r\nCheck supervisor comments', NULL, NULL, NULL, 'E:\agile-project-management\server\uploads\progress-reports\file-1770950800104-543133750.zip', 'CinemaManagement.zip', 17199613, 'submitted', '2026-02-12 19:46:40', NULL, '2026-02-12 19:46:40', '2026-02-12 19:46:40'),
('9522046d-9fdc-4988-9ac5-87a765de315b', '7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', 'đăng nhập', 1, 'Goal\r\nReview, enhance, and verify the existing student interface pages to match the modern design standards used in Admin and Teacher interfaces.\r\n\r\nCurrent Status\r\n✅ Existing Pages (9 pages)\r\nStudentDashboard - Basic dashboard with stats\r\nMyProject - View project details\r\nDocumentManagement - Upload/manage documents ✅\r\nProgressReports - View progress reports\r\nSubmitReport - Submit new progress report\r\nTopicBrowsing - Browse available topics\r\nTopicRegistration - Register for a topic\r\nStudentTopicProposal - Propose new topic\r\nProjectResults - View results/grades\r\nProposed Changes\r\nPhase 1: UI Enhancements (Priority HIGH)\r\n[MODIFY] \r\nStudentDashboard.tsx\r\nCurrent: Basic layout with plain stats cards Changes:\r\n\r\nAdd gradient header (similar to Teacher/Admin)\r\nImprove stat cards with better colors and icons\r\nAdd live data for pending reports\r\nBetter quick action buttons with gradients\r\nAdd project preview section\r\n[MODIFY] \r\nDocumentManagement.tsx\r\nCurrent: Has upload functionality Changes:\r\n\r\nVerify file upload actually works with backend\r\nAdd drag & drop UI\r\nBetter file type badges\r\nProgress bar for uploads\r\nModern gradients and spacing\r\n[MODIFY] \r\nProgressReports.tsx\r\nCurrent: Basic list of reports Changes:\r\n\r\nModern card layout\r\nBetter status badges with colors\r\nView supervisor comments in modal\r\nRating display (stars)\r\nFilter by status\r\n[MODIFY] \r\nSubmitReport.tsx\r\nCurrent: Form to submit report Changes:\r\n\r\nModern gradient design\r\nBetter textarea styling\r\nSuccess animation after submit\r\nAuto-save draft (optional)\r\nPhase 2: API Integration (Priority MEDIUM)\r\nBackend Endpoints to Verify/Create\r\nDocuments API:\r\n\r\nPOST /api/documents/upload - Upload file\r\nGET /api/projects/:id/documents - Get documents\r\nDELETE /api/documents/:id - Delete document\r\nProgress Reports API:\r\n\r\nGET /api/students/:studentId/progress-reports - Get student reports\r\nPOST /api/progress-reports - Submit new report\r\nGET /api/progress-reports/:id - Get report details\r\nProjects API (already exists):\r\n\r\nGET /api/projects?studentId=:id - Get student''s project\r\nPhase 3: Additional Features (Priority LOW)\r\n[MODIFY] \r\nMyProject.tsx\r\nAdd supervisor contact info\r\nQuick upload button\r\nTimeline visualization\r\nDeadline countdown\r\n[MODIFY] \r\nTopicBrowsing.tsx\r\nSearch and filter\r\nTopic details modal\r\nBetter card layout\r\nVerification Plan\r\nManual Testing\r\nLogin as Student\r\n\r\nNavigate to /student/dashboard\r\nVerify stats load correctly\r\nUpload Document\r\n\r\nGo to /student/documents\r\nTry uploading a file (.pdf, .zip)\r\nVerify file appears in list\r\nTry downloading\r\nSubmit Progress Report\r\n\r\nGo to /student/reports/submit\r\nFill form and submit\r\nVerify appears in reports list\r\nCheck if teacher can see it\r\nView Project\r\n\r\nGo to /student/my-project\r\nVerify project details display\r\nCheck supervisor comments', NULL, NULL, NULL, 'E:\agile-project-management\server\uploads\progress-reports\file-1770950581010-532632719.zip', 'CinemaManagement.zip', 17199613, 'submitted', '2026-02-12 19:43:01', NULL, '2026-02-12 19:43:01', '2026-02-12 19:43:01'),
('9ea69024-55cd-4024-996c-1034637a3379', '7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', 'hoàn thanh dang nhap', 1, 'Tết là khoảng thời gian đẹp nhất trong năm, khi mọi bộn bề dường như lắng lại để nhường chỗ cho sự sum vầy và yêu thương. Những ngày cuối năm, ai cũng tất bật dọn dẹp nhà cửa, chuẩn bị mâm cỗ, trang trí cành mai, cành đào như một cách chào đón điều mới mẻ. Không khí Tết không chỉ nằm ở mùi bánh chưng đang sôi trên bếp, mà còn ở tiếng cười nói rộn ràng của gia đình khi cùng nhau ngồi lại.\r\n\r\nTết còn là dịp để mỗi người nhìn lại một năm đã qua, với những nỗ lực, thành công và cả những điều chưa trọn vẹn. Khoảnh khắc giao thừa thiêng liêng khiến ta cảm nhận rõ ràng sự chuyển giao giữa cũ và mới, giữa lo toan và hy vọng. Trẻ con háo hức nhận lì xì, người lớn gửi nhau lời chúc bình an, sức khỏe và may mắn.\r\n\r\nDù cuộc sống có thay đổi thế nào, Tết vẫn luôn giữ một vị trí đặc biệt trong lòng mỗi người Việt – đó là thời điểm của đoàn tụ, của lòng biết ơn và của những khởi đầu đầy hi vọng.', NULL, NULL, NULL, 'E:\agile-project-management\server\uploads\progress-reports\file-1770951185930-649450032.zip', 'CinemaManagement.zip', 17199613, 'submitted', '2026-02-12 19:53:06', NULL, '2026-02-12 19:53:06', '2026-02-12 19:53:06'),
('a11f445d-4970-4c99-985f-5f77faac91a0', 'd012b94f-445e-42fb-b6a6-b461c669d382', 'fdff', 1, 'Đề tài Hệ thống quản lý siêu thị được thực hiện nhằm xây dựng một phần mềm hỗ trợ quản lý hoạt động kinh doanh trong siêu thị một cách hiệu quả và khoa học. Trong bối cảnh các cửa hàng bán lẻ ngày càng phát triển, việc quản lý thủ công bằng sổ sách hoặc các công cụ đơn giản dễ dẫn đến sai sót, mất thời gian và khó kiểm soát dữ liệu. Vì vậy, hệ thống được xây dựng để hỗ trợ quản lý hàng hóa, khách hàng, hóa đơn, nhân viên và thống kê doanh thu một cách nhanh chóng và chính xác.\r\n\r\nHệ thống cho phép người quản lý thực hiện các chức năng như thêm, sửa, xóa và tìm kiếm thông tin sản phẩm; quản lý thông tin khách hàng và lịch sử mua hàng; lập và in hóa đơn bán hàng; cũng như theo dõi doanh thu và tình trạng tồn kho. Ngoài ra, hệ thống còn hỗ trợ phân quyền người dùng nhằm đảm bảo tính bảo mật và quản lý chặt chẽ các thao tác trong hệ thống.\r\n\r\nViệc ứng dụng công nghệ thông tin vào quản lý siêu thị giúp tối ưu hóa quy trình bán hàng, giảm thiểu sai sót trong quá trình nhập xuất dữ liệu, đồng thời nâng cao hiệu quả quản lý và chất lượng phục vụ khách hàng. Đề tài góp phần tạo ra một giải pháp quản lý hiện đại, phù hợp với nhu cầu thực tế của các cửa hàng và siêu thị quy mô nhỏ đến trung bình.', NULL, NULL, NULL, '/app/uploads/progress-reports/file-1773208239611-533137383.docx', 'nguyá»n tiáº¿n chá»©c_222560_35_AI Táº¡o Banner Quáº£ng CÃ¡o Tá»± Äá»ng.docx', 11536123, 'approved', '2026-03-10 22:50:45', '2026-03-10 23:04:27', '2026-03-10 22:50:45', '2026-03-10 23:04:27'),
('fa8c8a51-e17b-401e-af6b-f16ad394131b', '7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', 'dang nhap', 1, 'Tết là khoảng thời gian đẹp nhất trong năm, khi mọi bộn bề dường như lắng lại để nhường chỗ cho sự sum vầy và yêu thương. Những ngày cuối năm, ai cũng tất bật dọn dẹp nhà cửa, chuẩn bị mâm cỗ, trang trí cành mai, cành đào như một cách chào đón điều mới mẻ. Không khí Tết không chỉ nằm ở mùi bánh chưng đang sôi trên bếp, mà còn ở tiếng cười nói rộn ràng của gia đình khi cùng nhau ngồi lại.\r\n\r\nTết còn là dịp để mỗi người nhìn lại một năm đã qua, với những nỗ lực, thành công và cả những điều chưa trọn vẹn. Khoảnh khắc giao thừa thiêng liêng khiến ta cảm nhận rõ ràng sự chuyển giao giữa cũ và mới, giữa lo toan và hy vọng. Trẻ con háo hức nhận lì xì, người lớn gửi nhau lời chúc bình an, sức khỏe và may mắn.\r\n\r\nDù cuộc sống có thay đổi thế nào, Tết vẫn luôn giữ một vị trí đặc biệt trong lòng mỗi người Việt – đó là thời điểm của đoàn tụ, của lòng biết ơn và của những khởi đầu đầy hi vọng.', NULL, NULL, NULL, 'E:\agile-project-management\server\uploads\progress-reports\file-1770951551057-3819162.docx', 'KNNN_NHÃM17.docx', 2986840, 'approved', '2026-02-12 19:59:11', '2026-02-28 06:16:00', '2026-02-12 19:59:11', '2026-02-28 06:16:00');

DROP TABLE IF EXISTS `project_archive`;
CREATE TABLE `project_archive` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `topic_title` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `topic_field` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `student_code` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `class_name` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `supervisor_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reviewer_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `semester` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `final_score` decimal(5,2) DEFAULT NULL,
  `grade` varchar(5) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'completed',
  `description` text COLLATE utf8mb4_general_ci,
  `document_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `archived_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_academic_year` (`academic_year`),
  KEY `idx_topic_field` (`topic_field`),
  KEY `idx_grade` (`grade`),
  FULLTEXT KEY `idx_search` (`topic_title`,`student_name`,`supervisor_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `project_archive` VALUES 
(1, '7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', 'quan li quan ao', 'Web Development', 'Lê Hồ Minh Nhựt', '2110568', 'DH22TIN01', 'Tiến sĩ Nguyễn Văn X', 'Tiến sĩ Nguyễn Văn X', '2025-2026', '1', NULL, NULL, 'failed', '[Quá hạn - Hạn nộp: 4/3/2026] ', NULL, '2026-03-10 22:32:54'),
(2, 'd012b94f-445e-42fb-b6a6-b461c669d382', 'Hệ thống quản lý và theo dõi tiến độ đồ án tốt nghiệp cho sinh viên', 'Software Engineering', 'nguyễn tiến chức', '222560', 'DH22TIN01', 'Tiến sĩ Nguyễn Văn X', 'Tiến sĩ Nguyễn Văn X', '2025-2026', 'q', NULL, NULL, 'completed', NULL, NULL, '2026-03-20 19:07:08');

DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID',
  `topic_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supervisor_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Teacher who supervises, null if not yet assigned',
  `reviewer_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Teacher who reviews',
  `status` enum('registered','in_progress','submitted','graded','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'registered',
  `registration_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `defense_date` datetime DEFAULT NULL,
  `final_grade` decimal(4,2) DEFAULT NULL COMMENT 'Final grade 0-10',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `report_deadline` datetime DEFAULT NULL,
  `supervisor_score` decimal(4,2) DEFAULT NULL,
  `reviewer_score` decimal(4,2) DEFAULT NULL,
  `council_score` decimal(4,2) DEFAULT NULL,
  `final_score` decimal(4,2) DEFAULT NULL,
  `grade` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_topic` (`topic_id`),
  KEY `idx_student` (`student_id`),
  KEY `idx_supervisor` (`supervisor_id`),
  KEY `idx_reviewer` (`reviewer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_projects_archived` (`archived_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `projects` VALUES 
('1655ceab-6c12-4b85-bab0-019b4d041a31', '9dacc2ec-cb56-4564-8cd0-8f1daeef7ace', 'f472e34b-9358-4132-846e-32df17a612d9', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'in_progress', '2026-02-11 00:34:37', NULL, NULL, NULL, NULL, NULL, '2026-02-11 00:34:37', '2026-03-10 22:47:28', '2026-11-10 17:00:00', NULL, NULL, NULL, NULL, NULL, NULL),
('53c03c1a-3445-4cf9-ab4f-01735e0a1122', '12172c00-839a-44b8-a0a5-d8b2e33f17e9', 'f472e34b-9358-4132-846e-32df17a612d9', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'in_progress', '2026-02-11 00:36:25', NULL, NULL, NULL, NULL, NULL, '2026-02-11 00:36:25', '2026-02-13 02:13:03', '2026-05-14 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL),
('7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', '9dacc2ec-cb56-4564-8cd0-8f1daeef7ace', '4590af2d-1ff9-4206-ab8a-e499f9337fbe', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'failed', '2026-02-11 21:17:34', NULL, NULL, NULL, NULL, NULL, '2026-02-11 21:17:34', '2026-03-10 22:32:54', '2026-03-03 17:00:00', NULL, NULL, NULL, NULL, NULL, '2026-03-10 22:32:54'),
('d012b94f-445e-42fb-b6a6-b461c669d382', 'aff52e8a-6412-4b38-a916-517de1853e71', '7a504d1d-f3a4-421f-bc10-ad57f6a87d3e', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'graded', '2026-03-09 03:14:06', NULL, NULL, NULL, NULL, NULL, '2026-03-09 03:14:06', '2026-03-20 19:07:08', '2026-03-19 17:00:00', '8.00', '8.68', NULL, NULL, NULL, '2026-03-20 19:07:08');

DROP TABLE IF EXISTS `sprint_comments`;
CREATE TABLE `sprint_comments` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `sprint_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `project_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `author_uid` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `author_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `author_role` enum('teacher','student') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'teacher',
  `content` text COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sprint_comments_sprint` (`sprint_id`),
  KEY `idx_sprint_comments_project` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `sprints`;
CREATE TABLE `sprints` (
  `id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `project_id` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
  `sprint_number` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `goals` text COLLATE utf8mb4_general_ci,
  `start_week` int NOT NULL,
  `end_week` int NOT NULL,
  `weight_percent` int DEFAULT '0',
  `status` enum('not_started','in_progress','completed') COLLATE utf8mb4_general_ci DEFAULT 'not_started',
  `actual_progress` int DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sprint` (`project_id`,`sprint_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID',
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Student code/number',
  `class_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `major` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g., 2024-2028',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `student_id` (`student_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_class_name` (`class_name`),
  KEY `idx_academic_year` (`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `students` VALUES 
('4590af2d-1ff9-4206-ab8a-e499f9337fbe', '71c101c9-7f1b-4fcd-80ed-04372ea18866', '2110568', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('7392efd7-cf76-4b79-8e51-c6cf2e9f7028', 'bd824b72-563a-4ee2-9572-4c302bca6774', '2222222', 'DH22TIN01', 'cntt', '2024-2028'),
('7a504d1d-f3a4-421f-bc10-ad57f6a87d3e', '0f4c1d84-459c-49ad-a60d-2deae6074c9c', '222560', 'DH22TIN01', 'cntt', '2024-2028'),
('88efbe99-feea-4ef9-b7df-704e5fc0a271', '237ce1d6-4ba6-441a-96e0-fa1cf792c2a9', '1010101', 'DH22TIN01', 'cntt', '2024-2028'),
('f472e34b-9358-4132-846e-32df17a612d9', 'cfc23678-f40e-42e7-947d-512cf3e19198', 'S294845', 'D20CQCN01-N', 'Software Engineering', NULL);

DROP TABLE IF EXISTS `teacher_specializations`;
CREATE TABLE `teacher_specializations` (
  `teacher_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialization` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`teacher_id`,`specialization`),
  KEY `idx_specialization` (`specialization`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `teacher_specializations` VALUES 
('0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'shdn');

DROP TABLE IF EXISTS `teachers`;
CREATE TABLE `teachers` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID',
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacher_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Teacher code/number',
  `department` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_students` int DEFAULT '5' COMMENT 'Maximum students to supervise',
  `current_students` int DEFAULT '0' COMMENT 'Current number of students',
  `can_supervise` tinyint DEFAULT '1',
  `can_review` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `teacher_id` (`teacher_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_department` (`department`),
  KEY `idx_can_supervise` (`can_supervise`),
  KEY `idx_can_review` (`can_review`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `teachers` VALUES 
('0b4dc15a-b582-4c3a-bd39-ee117160ae93', '413a0865-174f-44cd-9be0-4765187fb9d5', 'GV003', 'công nghệ thông tin', 9, 0, 1, 1),
('42dae8d0-0279-4867-994b-45dcedb1f17e', 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'T321965', 'Information Technology', 5, 0, 1, 1);

DROP TABLE IF EXISTS `topic_proposals`;
CREATE TABLE `topic_proposals` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `expected_results` text COLLATE utf8mb4_unicode_ci,
  `proposed_by_student_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_supervisor_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected','revision_requested') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `teacher_feedback` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `proposed_by_student_id` (`proposed_by_student_id`),
  KEY `requested_supervisor_id` (`requested_supervisor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `topic_proposals` VALUES 
('4895b15b-263b-4e8f-a83a-939066859226', 'Hệ thống quản lý và theo dõi tiến độ đồ án tốt nghiệp cho sinh viên', 'Đề tài nhằm xây dựng một hệ thống web hỗ trợ quản lý và theo dõi tiến độ thực hiện đồ án tốt nghiệp của sinh viên trong trường đại học. Hệ thống cho phép sinh viên đăng ký đề tài, gửi báo cáo tiến độ theo từng giai đoạn và nhận phản hồi từ giảng viên hướng dẫn.\n\nGiảng viên có thể theo dõi tiến độ thực hiện của sinh viên, đánh giá các mốc quan trọng và quản lý danh sách sinh viên hướng dẫn. Ngoài ra, hệ thống cũng hỗ trợ quản trị viên trong việc phân công giảng viên, quản lý đề tài và thống kê kết quả.\n\nHệ thống hướng tới việc số hóa quy trình quản lý đồ án, giúp tăng tính minh bạch, dễ theo dõi và nâng cao hiệu quả quản lý trong nhà trường.', 'Lập trình Web (HTML, CSS, JavaScript)\n\nFramework backend (NodeJS / .NET / Spring Boot)\n\nCơ sở dữ liệu (MySQL / PostgreSQL)\n\nKiến thức về thiết kế hệ thống và API\n\nHiểu biết cơ bản về Git và quản lý mã nguồn', 'Xây dựng hoàn chỉnh hệ thống web quản lý đồ án.\n\nSinh viên có thể đăng ký đề tài, nộp báo cáo và theo dõi tiến độ.\n\nGiảng viên có thể theo dõi, nhận xét và đánh giá sinh viên.\n\nQuản trị viên có thể quản lý đề tài, người dùng và thống kê dữ liệu.\n\nHệ thống có giao diện thân thiện, dễ sử dụng và đảm bảo bảo mật dữ liệu.', '7a504d1d-f3a4-421f-bc10-ad57f6a87d3e', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', 'approved', NULL, '2026-03-09 03:13:44', '2026-03-09 03:14:06');

DROP TABLE IF EXISTS `topics`;
CREATE TABLE `topics` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `supervisor_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User ID of the teacher, null if student proposed or unassigned',
  `reviewer_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `semester` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `field` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_students` int DEFAULT '2',
  `current_students` int DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requirements` text COLLATE utf8mb4_unicode_ci COMMENT 'Project requirements',
  `expected_results` text COLLATE utf8mb4_unicode_ci COMMENT 'Expected project results',
  `proposed_by_type` enum('teacher','student') COLLATE utf8mb4_unicode_ci DEFAULT 'teacher',
  `original_proposal_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_to_student_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_supervisor` (`supervisor_id`),
  KEY `idx_status` (`status`),
  KEY `idx_semester_year` (`semester`,`academic_year`),
  KEY `fk_topics_reviewer` (`reviewer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `topics` VALUES 
('12172c00-839a-44b8-a0a5-d8b2e33f17e9', 'quan li rap chieu phim', 'kjk', '22428871-ec14-4875-ba4a-c46d8a98005c', '413a0865-174f-44cd-9be0-4765187fb9d5', 'approved', NULL, '2', '2025-2026', 'Web Development', 2, 1, '2026-02-04 22:07:30', '2026-03-10 22:31:18', '2026-02-04 22:07:47', '22428871-ec14-4875-ba4a-c46d8a98005c', NULL, NULL, 'teacher', NULL, NULL),
('9a2ae3a9-02f7-437f-ac42-4fef4b533e5e', 'Tạo ra một công cụ hỗ trợ thiết kế và phân tích chiến thuật cho trò chơi điện tử', 'Đề tài này yêu cầu sinh viên tạo ra một công cụ hỗ trợ thiết kế và phân tích chiến thuật cho trò chơi điện tử, cho phép người dùng tạo ra và симуля các kịch bản chiến thuật khác nhau. Công cụ phải có khả năng phân tích và đánh giá hiệu quả của các chiến thuật, cũng như cung cấp các đề xuất để cải thiện chiến thuật. Sinh viên cũng cần phải đảm bảo công cụ có giao diện người dùng thân thiện và dễ sử dụng.', '413a0865-174f-44cd-9be0-4765187fb9d5', 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'approved', NULL, '1', '2024-2025', 'Game Development', 2, 0, '2026-02-28 06:47:36', '2026-03-07 06:10:14', NULL, NULL, '2026-02-28 20:47:36', 'Sinh viên cần có kiến thức về lập trình, thiết kế trò chơi và phân tích dữ liệu.', 'teacher', NULL, NULL),
('9dacc2ec-cb56-4564-8cd0-8f1daeef7ace', 'quan li quan ao', 'sfdf', NULL, 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'approved', NULL, '1', '2024-2025', 'Web Development', 2, 2, '2026-02-11 00:14:14', '2026-03-10 22:31:18', '2026-02-11 00:14:24', '22428871-ec14-4875-ba4a-c46d8a98005c', 'fdssd', 'dsdsd', 'teacher', NULL, NULL),
('9f156319-e614-4708-820b-931ac7f2c714', 'Phát triển ứng dụng di động tích hợp Chatbot để hỗ trợ sinh viên', 'Mục tiêu của đề tài này là thiết kế và phát triển một ứng dụng di động tích hợp công nghệ chatbot để hỗ trợ sinh viên trong việc tìm kiếm thông tin, giải đáp thắc mắc và hỗ trợ học tập. Phạm vi của dự án bao gồm việc nghiên cứu và phân tích các yêu cầu của người dùng, thiết kế giao diện người dùng thân thiện và trực quan, cũng như tích hợp các tính năng như trả lời câu hỏi tự động, đặt lịch hẹn và gửi thông báo. Dự án sẽ sử dụng các công nghệ như React Native, Node.js và Dialogflow để phát triển chatbot và ứng dụng di động.', '413a0865-174f-44cd-9be0-4765187fb9d5', 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'approved', NULL, '1', '2024-2025', 'Mobile App', 2, 0, '2026-02-28 06:29:07', '2026-03-07 06:10:14', '2026-02-28 06:35:50', NULL, 'Yêu cầu sinh viên có kiến thức về lập trình Java hoặc Kotlin, hiểu biết về công nghệ React Native và Node.js, cũng như kỹ năng phân tích và thiết kế hệ thống', '', 'teacher', NULL, NULL),
('a27b445f-f0f1-4dd2-90a9-832dc4c0095c', 'Xây dựng một hệ thống AI cho trò chơi chiến thuật turn-based', 'Đề tài này yêu cầu sinh viên xây dựng một hệ thống AI cho trò chơi chiến thuật turn-based, cho phép người máy chơi có khả năng đưa ra quyết định và thực hiện hành động một cách thông minh. Hệ thống AI phải có khả năng học hỏi và thích nghi với các tình huống khác nhau, cũng như có thể điều chỉnh độ khó tùy theo người chơi. Sinh viên cũng cần phải đảm bảo hệ thống AI có hiệu suất tốt và không ảnh hưởng đến trải nghiệm người dùng.', '413a0865-174f-44cd-9be0-4765187fb9d5', 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'approved', NULL, '1', '2024-2025', 'Game Development', 2, 0, '2026-02-28 06:47:36', '2026-03-07 06:10:14', NULL, NULL, '2026-02-28 20:47:36', 'Sinh viên cần có kiến thức về lập trình, trí tuệ nhân tạo và thiết kế trò chơi.', 'teacher', NULL, NULL),
('aff52e8a-6412-4b38-a916-517de1853e71', 'Hệ thống quản lý và theo dõi tiến độ đồ án tốt nghiệp cho sinh viên', 'Đề tài nhằm xây dựng một hệ thống web hỗ trợ quản lý và theo dõi tiến độ thực hiện đồ án tốt nghiệp của sinh viên trong trường đại học. Hệ thống cho phép sinh viên đăng ký đề tài, gửi báo cáo tiến độ theo từng giai đoạn và nhận phản hồi từ giảng viên hướng dẫn.\n\nGiảng viên có thể theo dõi tiến độ thực hiện của sinh viên, đánh giá các mốc quan trọng và quản lý danh sách sinh viên hướng dẫn. Ngoài ra, hệ thống cũng hỗ trợ quản trị viên trong việc phân công giảng viên, quản lý đề tài và thống kê kết quả.\n\nHệ thống hướng tới việc số hóa quy trình quản lý đồ án, giúp tăng tính minh bạch, dễ theo dõi và nâng cao hiệu quả quản lý trong nhà trường.', '0b4dc15a-b582-4c3a-bd39-ee117160ae93', NULL, 'pending', NULL, 'HK2', '2025-2026', 'Software Engineering', 1, 1, '2026-03-09 03:14:06', '2026-03-09 03:14:06', NULL, NULL, 'Lập trình Web (HTML, CSS, JavaScript)\n\nFramework backend (NodeJS / .NET / Spring Boot)\n\nCơ sở dữ liệu (MySQL / PostgreSQL)\n\nKiến thức về thiết kế hệ thống và API\n\nHiểu biết cơ bản về Git và quản lý mã nguồn', 'Xây dựng hoàn chỉnh hệ thống web quản lý đồ án.\n\nSinh viên có thể đăng ký đề tài, nộp báo cáo và theo dõi tiến độ.\n\nGiảng viên có thể theo dõi, nhận xét và đánh giá sinh viên.\n\nQuản trị viên có thể quản lý đề tài, người dùng và thống kê dữ liệu.\n\nHệ thống có giao diện thân thiện, dễ sử dụng và đảm bảo bảo mật dữ liệu.', 'student', '4895b15b-263b-4e8f-a83a-939066859226', '7a504d1d-f3a4-421f-bc10-ad57f6a87d3e'),
('c3893b63-6dae-480f-b179-ea256aff2f35', 'xây dựng hệ thống thư viện dnc', 'lm vè thu vien', '22428871-ec14-4875-ba4a-c46d8a98005c', '413a0865-174f-44cd-9be0-4765187fb9d5', 'approved', NULL, 'summer', '2025-2026', 'Web Development', 2, 0, '2026-02-04 21:56:33', '2026-03-07 06:10:14', '2026-02-04 21:56:38', '22428871-ec14-4875-ba4a-c46d8a98005c', NULL, NULL, 'teacher', NULL, NULL),
('e4087abf-f64f-4c3c-a607-fcce424c7aa4', 'Phát triển trò chơi chiến thuật thời gian thực trên nền tảng di động', 'Đề tài này yêu cầu sinh viên thiết kế và phát triển một trò chơi chiến thuật thời gian thực trên nền tảng di động, tích hợp các yếu tố như xây dựng, quản lý tài nguyên, đào tạo và điều khiển quân đội. Trò chơi phải có giao diện người dùng thân thiện, hiệu ứng hình ảnh và âm thanh hấp dẫn. Sinh viên cũng cần phải đảm bảo trò chơi có độ khó tăng dần và có khả năng chơi lại cao.', '413a0865-174f-44cd-9be0-4765187fb9d5', 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'approved', NULL, '1', '2024-2025', 'Game Development', 2, 0, '2026-02-28 06:47:36', '2026-03-07 06:10:14', NULL, NULL, '2026-02-28 20:47:36', 'Sinh viên cần có kiến thức về lập trình di động, thiết kế trò chơi và quản lý dự án.', 'teacher', NULL, NULL),
('e649fe98-f1a9-4d76-b135-561c24d42264', 'Xây dựng hệ thống dự đoán nhu cầu bán hàng dựa trên dữ liệu lịch sử và thời tiết', 'Hệ thống này sẽ sử dụng thuật toán học máy để phân tích dữ liệu lịch sử bán hàng và dữ liệu thời tiết để dự đoán nhu cầu bán hàng trong tương lai. Từ đó, giúp doanh nghiệp quản lý tồn kho, tối ưu hóa hàng hóa và giảm thiểu thất thoát. Hệ thống cũng có thể cung cấp thông tin về xu hướng bán hàng và giúp doanh nghiệp đưa ra quyết định kinh doanh thông minh hơn. Dự án này yêu cầu sinh viên có kiến thức về dữ liệu lớn, học máy và phân tích dữ liệu.', '413a0865-174f-44cd-9be0-4765187fb9d5', 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'approved', NULL, '1', '2024-2025', 'AI/ML', 2, 0, '2026-02-28 06:39:27', '2026-03-07 06:10:14', NULL, NULL, '2026-02-28 20:39:27', 'Sinh viên cần có kiến thức về Python, thư viện scikit-learn, pandas và numpy. Ngoài ra, sinh viên cũng cần có kinh nghiệm làm việc với dữ liệu lớn và học máy.', 'teacher', NULL, NULL);

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'UUID',
  `uid` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Firebase Auth UID',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_url` text COLLATE utf8mb4_unicode_ci,
  `role` enum('student','teacher','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`uid`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_email` (`email`),
  KEY `idx_uid` (`uid`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` VALUES 
('0f4c1d84-459c-49ad-a60d-2deae6074c9c', 's57MtPAV1dQ5EYxRdnwEsEOTFt22', 'chuc222560@nctu.edu.vn', 'nguyễn tiến chức', '0987543212', NULL, 'student', 1, '2026-03-09 02:11:58', '2026-03-10 21:21:35'),
('22428871-ec14-4875-ba4a-c46d8a98005c', 'XyyiXMZhdOPEjeNmqLsKUKIxTbq2', 'admin@agile.com', 'Agile Admin', NULL, NULL, 'admin', 1, '2026-02-04 08:52:42', '2026-02-04 09:02:11'),
('237ce1d6-4ba6-441a-96e0-fa1cf792c2a9', 'f8feuSm2UmU9s84lBoHH8Rat2f63', 'nguyenquoctanh2603@gmail.com', 'nguyễn quốc tánh', '8345678543', NULL, 'student', 1, '2026-02-28 06:40:29', '2026-02-28 22:20:44'),
('413a0865-174f-44cd-9be0-4765187fb9d5', 'ByQtTj3r97aNOHVQVQb2rKpNWkm1', 'nguyenvanx@school.edu.vn', 'Tiến sĩ Nguyễn Văn X', '0123456789', NULL, 'teacher', 1, '2026-02-11 20:01:35', '2026-02-11 21:18:27'),
('71c101c9-7f1b-4fcd-80ed-04372ea18866', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '2110568@test2026.edu.vn', 'Lê Hồ Minh Nhựt', '', NULL, 'student', 1, '2026-02-11 20:49:02', '2026-02-11 20:57:10'),
('bd824b72-563a-4ee2-9572-4c302bca6774', 'MHk9nJPRg5V7G0xTvRSgxUPGdnj1', 'baokhangml99@gmail.com', 'nguyen av án', '09873456789', NULL, 'student', 1, '2026-02-28 05:29:44', '2026-02-28 05:29:44'),
('cfc23678-f40e-42e7-947d-512cf3e19198', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', 'nguyentienchuc2023@gmail.com', 'Chức Nguyễn Tiến', NULL, NULL, 'student', 1, '2026-02-11 00:34:37', '2026-02-11 00:34:37'),
('fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', '1qypbeQjIbdqlHdlVQpzrle0PuA3', 'teacher@test.com', 'Giảng Viên Test', NULL, NULL, 'teacher', 1, '2026-02-04 22:08:39', '2026-03-03 01:10:52');

