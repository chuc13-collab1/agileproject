-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th2 11, 2026 lúc 07:27 AM
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `semester`, `academic_year`, `registration_start`, `registration_end`, `status`, `created_at`, `updated_at`) VALUES
('1ea71a26-b7ac-4e25-a707-fcd3292a754d', 'abc', 'sbv', 'Hè', '2025-2026', '2026-02-05 23:03:00', '2026-02-28 23:03:00', 'draft', '2026-02-04 16:03:31', '2026-02-04 16:03:31');

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
('026e0b58-fcf1-478b-96da-c98e0fb6494e', '0669605d-1aa2-4059-ba6d-cef38589c1e3', '219909', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('04587495-51e7-4b5e-9bf5-2261b238e565', '236af62a-7a57-4658-b562-51743e131826', '2110753', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('0870a1a4-58c2-4124-94cb-d29e20a8c71b', '9c97d29f-d46a-4918-a879-a188f8c3810e', '219486', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('0ae97ab2-5cc0-4bad-9697-8f303827ecd8', 'a10c0911-7e7e-41e7-a91a-6fe42715eb2e', '219720', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('0bcef1d0-a3fc-4fd4-98ed-4200fb58a7ed', 'f0ec7dd3-f6ff-4f29-8be4-18a3bac5d14c', '2110076', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('0f0c378b-a76e-4e39-aac9-d1449f20bfb9', 'b9a08191-a170-4334-82c2-d9e74a4109dd', '2110700', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('0f1be148-2b24-4cd0-9d88-8df02dda68a6', 'f700d0f1-943d-445a-be6e-dcabe81dcd99', '219820', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('121f20d4-c64e-4fe8-9d53-623bc16e132f', '650748a6-6a2b-4554-9411-26222815e155', '2110335', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('2533bb62-f971-4872-afb9-e2a95a322e9f', '2a866d04-edb4-4392-97c9-a71256ba2cf4', '2110150', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('28245baf-d387-48b7-b394-47c026fb9d46', 'cf715220-1e64-4e22-bf05-748c5432b116', '2110312', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('2ec4cb69-850a-4dcf-bb11-ca2901805da8', 'c5829480-2593-4d32-9425-74378e079cb9', '219421', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('334bb826-7ad7-44e7-b929-c82984387d68', '45493ecf-6931-4b47-9a9e-91c10774e96c', '2110525', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('35063259-b425-4193-8994-62abd9648678', '35945e90-b659-4d3a-a0bb-1576ed26617f', '2110831', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('37fb09f1-8a20-4fd0-a960-a589489e2854', '0f3e266d-82a8-47cf-981d-208a378e0d19', '2110364', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('43da23b9-74bb-4118-8a06-24328c4792d2', 'b8da8e00-076e-4368-a465-a627a03949ff', '219676', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('49358069-9919-4a81-9a43-de04efe387a1', '613f14e2-2bb5-468b-9953-db2af31b9370', '219751', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('4ac32900-52cd-474d-89f8-ca3f64ec5dbc', '094a4d0c-9144-403f-ab82-d7e450123425', '2110442', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('4bde2227-fcb6-4fa7-8fb9-3eb9054ba7fb', '1195d6b7-0ee7-4328-b477-1cda0985ae41', '2110746', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('4f2bd6fb-f62f-46eb-8003-167a53929483', '7272daed-50a7-4b40-a5f8-4367deb091fd', '219743', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('54c2e866-973c-43d7-b6c9-f61d780965c0', '74a717c9-e4e8-4cef-97ba-6416cf5212e1', '2110124', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('5707c3a1-3671-42c3-a933-c9ea0a71be49', 'eb7ec2ef-d9e2-493c-9850-bcefd211b307', '2110637', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('57c84e97-d839-426e-878e-93a4de915174', '1bc5a95f-29b2-42d7-9a1b-3d3234d312d9', '2110569', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('5b7eaeea-1add-4319-af63-4d23569adf64', '029d8a0a-eebf-4b73-a57d-716c5de42c32', '2110441', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('5dac8b6b-ed10-43ff-a46c-d87c1f06cb41', '784c7f31-a7f3-475f-9222-669f603589db', '2110497', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('65253200-b6c2-4c03-8d1a-f08dceffd937', '7461cbee-1b7c-450c-be78-8d19cdf1629a', '213964', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('652a039c-eb88-4364-901b-ca0333e566db', '427c4fd2-3388-4b1b-9a02-657230f0cb2d', '219685', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('72d8c889-8f86-4133-8276-927328ebc9c7', '37b03a30-d929-4034-919c-a3cddda4de57', '2110842', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('798a4f2c-9ddd-4534-aa44-dc655db8189f', '9b692737-019b-45e3-a007-0343104c9195', '2110783', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('7a18f6f0-c142-47fc-88c1-52f8ba5f7622', '6a8e9b97-55d8-484e-9eb6-35b90d82ba91', '2110405', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('7b513978-e28b-471e-b59e-eaf9ef5c3140', '306177ed-dc1f-4b98-964a-7fb8d8af4bb9', '219906', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('81f8e331-af5d-46f1-98c4-ceee3f5f9a0a', 'b0576430-597c-4914-8854-d79bceb06835', '2110261', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('86fae756-cf11-4c21-b989-bc8f43045946', 'c748c69f-89aa-426a-8e83-f31db334bd88', '2110504', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('8bececee-7099-4c4e-b203-c6bdcd563924', 'c14ac971-524c-4d69-9048-4c9578179a13', '2110557', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('91766504-4235-4f37-84a2-ad23506923fb', 'ae6c8630-8238-43a3-bd55-84e76a543050', '2110203', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('9214c84f-8db1-493a-ba8f-5c3a6c5a01a5', '1ca4448f-c444-4027-8851-a339e4121f24', '2110262', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('96d3a4c4-3609-4792-9c8e-66d037a2f5b8', 'e8d5e190-b21b-4a20-ab05-69639a2d5766', '212464', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('9889ef75-fca9-45b9-81cb-19a906f3ac6b', '6349acde-f218-4f5a-99af-0bc2eb1e464d', '214390', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('9bbba578-6a97-43c2-8712-2dc7f943245a', '82c9975a-dac4-4eed-9be6-85cc894170a3', '2110313', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('9d9c749c-f88b-444d-9d43-006c5c395141', 'deb756db-185b-42ee-a462-6c9d0d8b0da6', '219829', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('9df00633-1386-4582-8fd3-f00b32465f65', '03bc58fb-5cb9-4a5a-a541-68814ea53c0f', '2110714', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('a1be1469-9644-42a5-9c0a-314d1bd98211', '5e188832-a82c-4480-9671-591383b5007e', '2110410', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('a3abb484-8d0f-4708-9a9f-be006fbc1a03', '74889a4c-ce57-4b36-8e5b-e2937335708d', '214111', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('a51eeaa2-8c51-45cd-a7cd-dc7d95fc8665', 'e919e316-c551-4dcf-b6ee-73b3c796369a', '2110244', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('aee67651-7ccf-40ba-b758-3f250d0dce9a', 'c96b7ddb-1a6a-4862-958c-f7dc0d88a730', '2110777', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('b7761207-1443-4e8d-9667-1e77d93ac775', '373706e7-411c-44da-a52a-f907ae029c01', '2110634', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('bc6b3c74-568b-459f-aa8b-7bd7be44cca3', 'd625e0f1-ac64-40f6-86d8-2bb35156b4e0', '2110664', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('bf1fc2a9-bbef-4fee-9eb2-1db9a3e9963d', 'd11c4138-49b5-4847-94d8-49fa72fe69bd', '2110817', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('bf362dcb-619e-4f16-b15b-0c75237a6988', '49ce49a6-a658-43e9-b837-02ca308ff096', '2110079', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('ca4c23c1-e632-44a2-bdb1-1533a3d0d6ad', '283b6c00-ecd2-429a-a760-2d8f92fa3e88', '2110566', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('ca65ca51-4820-4322-b96b-1257746110fe', '3f4eb4a4-fe51-47d0-82f8-7162c0609c3c', '2110582', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('ca751a92-6e9d-44f4-924c-33892175ee35', '8e8ead9a-5084-4493-95b9-42c33f03e031', '213802', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('cab34d6e-5293-44c5-a2a6-6a37ebdf02af', '3b48e42d-fb2d-43cc-bdfe-a2d9fab2ea5b', '2110414', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('cba38008-0b46-419e-9ee8-5e94dd0c4af3', '0744fb57-d683-4fb9-8cda-f3ab6ccd7286', '2110402', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('dd2aa0fd-486b-432c-a0b3-bcaf7077eb1c', '0ba95b53-db9f-491e-82e4-68066547c8f4', '2110607', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('e5c5c09a-3e35-4d00-8fe3-d74b789e6d16', '3c57a472-d67f-4b77-9f8c-882ac65cd0ed', '2110649', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('edb2406f-5595-4da9-adcb-55514a20c1d6', '16540df3-fc50-471b-a9e2-0f6e1be6e81e', '2110703', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028'),
('f1ba074b-997f-4c2e-8066-4070cfcd78b2', 'bf4bfee5-da26-45a0-a45b-59ad9242bad2', '2110568', 'DH22TIN01', 'Công nghệ thông tin', '2024-2028');

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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `teacher_specializations`
--

CREATE TABLE `teacher_specializations` (
  `teacher_id` varchar(36) NOT NULL,
  `specialization` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `topics`
--

CREATE TABLE `topics` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `supervisor_id` varchar(36) NOT NULL,
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
  `approved_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `topics`
--

INSERT INTO `topics` (`id`, `title`, `description`, `supervisor_id`, `reviewer_id`, `status`, `rejection_reason`, `semester`, `academic_year`, `field`, `max_students`, `current_students`, `created_at`, `updated_at`, `approved_at`, `approved_by`) VALUES
('12172c00-839a-44b8-a0a5-d8b2e33f17e9', 'quan li rap chieu phim', 'kjk', '22428871-ec14-4875-ba4a-c46d8a98005c', 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'approved', NULL, '2', '2025-2026', 'Web Development', 2, 0, '2026-02-05 05:07:30', '2026-02-05 05:09:46', '2026-02-05 05:07:47', '22428871-ec14-4875-ba4a-c46d8a98005c'),
('c3893b63-6dae-480f-b179-ea256aff2f35', 'xây dựng hệ thống thư viện dnc', 'lm vè thu vien', '22428871-ec14-4875-ba4a-c46d8a98005c', 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'approved', NULL, 'summer', '2025-2026', 'Web Development', 2, 0, '2026-02-05 04:56:33', '2026-02-05 05:09:46', '2026-02-05 04:56:38', '22428871-ec14-4875-ba4a-c46d8a98005c');

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
('029d8a0a-eebf-4b73-a57d-716c5de42c32', 'u6TRYDt80iMXDC1y11ZUSQJgXnd2', '2110441@test2026.edu.vn', 'Đặng Phương Nam', NULL, NULL, 'student', 1, '2026-02-04 15:20:44', '2026-02-04 15:20:44'),
('03bc58fb-5cb9-4a5a-a541-68814ea53c0f', 'q5royN2iqXQIsqnHZGZlpnHfilf1', '2110714@test2026.edu.vn', 'Nguyễn Mạch Đăng Khoa', NULL, NULL, 'student', 1, '2026-02-04 15:20:35', '2026-02-04 15:20:35'),
('0669605d-1aa2-4059-ba6d-cef38589c1e3', 'w3rIxKU4arTsQoWhKoBB1eNh3ua2', '219909@test2026.edu.vn', 'Trần Hùng Chánh', NULL, NULL, 'student', 1, '2026-02-04 15:20:06', '2026-02-04 15:20:06'),
('0744fb57-d683-4fb9-8cda-f3ab6ccd7286', 'PrpBdRto3WX9rcuwZcbUxUeuHNn2', '2110402@test2026.edu.vn', 'Trương Công Hậu', NULL, NULL, 'student', 1, '2026-02-04 15:20:24', '2026-02-04 15:20:24'),
('094a4d0c-9144-403f-ab82-d7e450123425', 'GeVmHHMfcgffAsbc6pbnxsYMy7l2', '2110442@test2026.edu.vn', 'Võ Thị Ngọc Nhịn', NULL, NULL, 'student', 1, '2026-02-04 15:20:54', '2026-02-04 15:20:54'),
('0ba95b53-db9f-491e-82e4-68066547c8f4', 'dAi3MCLfmdaKrs2cAzJ6ukHvZFg1', '2110607@test2026.edu.vn', 'Hồ Vĩ Kiện', NULL, NULL, 'student', 1, '2026-02-04 15:20:38', '2026-02-04 15:20:38'),
('0f3e266d-82a8-47cf-981d-208a378e0d19', 'yST904m6u1WqpUNqaoEYtPGYuAj2', '2110364@test2026.edu.vn', 'Nguyễn Vĩ Khang', NULL, NULL, 'student', 1, '2026-02-04 15:20:31', '2026-02-04 15:20:31'),
('1195d6b7-0ee7-4328-b477-1cda0985ae41', 'weGSi4anF2fjnQIBds6w9UXuASh1', '2110746@test2026.edu.vn', 'Trịnh Nhật Hào', NULL, NULL, 'student', 1, '2026-02-04 15:20:22', '2026-02-04 15:20:22'),
('16540df3-fc50-471b-a9e2-0f6e1be6e81e', 'iKr7Ayp11aZKGAQYgUPBP3LfIz22', '2110703@test2026.edu.vn', 'Võ Thành Đạt', NULL, NULL, 'student', 1, '2026-02-04 15:20:11', '2026-02-04 15:20:11'),
('1bc5a95f-29b2-42d7-9a1b-3d3234d312d9', '5ywa5WaPxcfjJZkkKlkDCyIvvjt1', '2110569@test2026.edu.vn', 'Nguyễn Văn Hiếu', NULL, NULL, 'student', 1, '2026-02-04 15:20:27', '2026-02-04 15:20:27'),
('1ca4448f-c444-4027-8851-a339e4121f24', 'HtYfRV6AuoUEOC1en6ouRLEDw7C3', '2110262@test2026.edu.vn', 'Tạ Nhật Khoa', NULL, NULL, 'student', 1, '2026-02-04 15:20:36', '2026-02-04 15:20:36'),
('22428871-ec14-4875-ba4a-c46d8a98005c', 'XyyiXMZhdOPEjeNmqLsKUKIxTbq2', 'admin@agile.com', 'Agile Admin', NULL, NULL, 'admin', 1, '2026-02-04 15:52:42', '2026-02-04 16:02:11'),
('236af62a-7a57-4658-b562-51743e131826', '5aewROCwcobFQOUxHGQupVXTjGv1', '2110753@test2026.edu.vn', 'Nguyễn Chí Hiếu', NULL, NULL, 'student', 1, '2026-02-04 15:20:26', '2026-02-04 15:20:26'),
('283b6c00-ecd2-429a-a760-2d8f92fa3e88', 'PjvF7D5uMTTTeBibvlEZkJaTcQi1', '2110566@test2026.edu.vn', 'Lữ Gia Băng', NULL, NULL, 'student', 1, '2026-02-04 15:20:01', '2026-02-04 15:20:01'),
('2a866d04-edb4-4392-97c9-a71256ba2cf4', 'njvt0X4Y9Jgl2aJ1WIdohBWOPU62', '2110150@test2026.edu.vn', 'Nguyễn Trung Hậu', NULL, NULL, 'student', 1, '2026-02-04 15:20:25', '2026-02-04 15:20:25'),
('306177ed-dc1f-4b98-964a-7fb8d8af4bb9', 'whwzuYqsusb03PToBpHFoXKvjzq1', '219906@test2026.edu.vn', 'Hồ Duy Hoàng', NULL, NULL, 'student', 1, '2026-02-04 15:20:28', '2026-02-04 15:20:28'),
('35945e90-b659-4d3a-a0bb-1576ed26617f', 'SowrfD6ltchYsjnnMAVgMyTjhHk1', '2110831@test2026.edu.vn', 'Nguyễn Doãn Minh Đức', NULL, NULL, 'student', 1, '2026-02-04 15:20:13', '2026-02-04 15:20:13'),
('373706e7-411c-44da-a52a-f907ae029c01', 'D3lZIYcFjUQXSUtBN0FAQ2CMLxw2', '2110634@test2026.edu.vn', 'Nguyễn Hữu Nghĩa', NULL, NULL, 'student', 1, '2026-02-04 15:20:48', '2026-02-04 15:20:48'),
('37b03a30-d929-4034-919c-a3cddda4de57', 'FFyFXEjM7ITvUv4SCCahLq0Ospu1', '2110842@test2026.edu.vn', 'Lâm Tấn Kiệt', NULL, NULL, 'student', 1, '2026-02-04 15:20:39', '2026-02-04 15:20:39'),
('3b48e42d-fb2d-43cc-bdfe-a2d9fab2ea5b', 'J7aLheEEzcWbzHROV1RT92kkANo2', '2110414@test2026.edu.vn', 'Trương Thanh Duy', NULL, NULL, 'student', 1, '2026-02-04 15:20:15', '2026-02-04 15:20:15'),
('3c57a472-d67f-4b77-9f8c-882ac65cd0ed', 'Z8mJaAFvI0bSt0YUJSLMQ6tFvnF2', '2110649@test2026.edu.vn', 'Ong Kim Giàu', NULL, NULL, 'student', 1, '2026-02-04 15:20:18', '2026-02-04 15:20:18'),
('3f4eb4a4-fe51-47d0-82f8-7162c0609c3c', 'oib9UwvkblboiY8PoORX5sTCyMU2', '2110582@test2026.edu.vn', 'Lữ Nhật Hào', NULL, NULL, 'student', 1, '2026-02-04 15:20:23', '2026-02-04 15:20:23'),
('427c4fd2-3388-4b1b-9a02-657230f0cb2d', 'jlzc5TCbSSaXyFrUKK4n32eF0UN2', '219685@test2026.edu.vn', 'Nguyễn Huỳnh Khôi', NULL, NULL, 'student', 1, '2026-02-04 15:20:37', '2026-02-04 15:20:37'),
('45493ecf-6931-4b47-9a9e-91c10774e96c', 'wHTcqoGM9jamzT5kC5n4JIlVN8J3', '2110525@test2026.edu.vn', 'Đặng Hữu Nghĩa', NULL, NULL, 'student', 1, '2026-02-04 15:20:50', '2026-02-04 15:20:50'),
('49ce49a6-a658-43e9-b837-02ca308ff096', 'NPzFmjgCqMgU6uKyLmugZnIHdqs2', '2110079@test2026.edu.vn', 'Nguyễn Minh Ngoan', NULL, NULL, 'student', 1, '2026-02-04 15:20:51', '2026-02-04 15:20:51'),
('5e188832-a82c-4480-9671-591383b5007e', 'rOS6isZLL5dgEkLWUUg333Au5aG2', '2110410@test2026.edu.vn', 'Ngô Hoàng Nguyên', NULL, NULL, 'student', 1, '2026-02-04 15:20:52', '2026-02-04 15:20:52'),
('613f14e2-2bb5-468b-9953-db2af31b9370', 'cs4cB89Bn6XuEXjm7EJMgshVQWt1', '219751@test2026.edu.vn', 'Bùi Ngọc Phương Nghi', NULL, NULL, 'student', 1, '2026-02-04 15:20:46', '2026-02-04 15:20:46'),
('6349acde-f218-4f5a-99af-0bc2eb1e464d', '7Oy6XixpIiaZESaEEwUw5ZIOmA32', '214390@test2026.edu.vn', 'Hồng Quốc Bảo', NULL, NULL, 'student', 1, '2026-02-04 15:20:02', '2026-02-04 15:20:02'),
('650748a6-6a2b-4554-9411-26222815e155', 'oqlnTHiF73WjjLdJ8FguOEz03H43', '2110335@test2026.edu.vn', 'Lê Hữu Minh Lợi', NULL, NULL, 'student', 1, '2026-02-04 15:20:41', '2026-02-04 15:20:41'),
('6a8e9b97-55d8-484e-9eb6-35b90d82ba91', 'EgJdy9T9Vod2rhwvQk6nVwg96lG2', '2110405@test2026.edu.vn', 'Nguyễn Chí Bình', NULL, NULL, 'student', 1, '2026-02-04 15:20:05', '2026-02-04 15:20:05'),
('7272daed-50a7-4b40-a5f8-4367deb091fd', 'CwR5ns3bIFOjWnCFkyT7QwlJmgj2', '219743@test2026.edu.vn', 'Huỳnh Thanh Bình', NULL, NULL, 'student', 1, '2026-02-04 15:20:04', '2026-02-04 15:20:04'),
('7461cbee-1b7c-450c-be78-8d19cdf1629a', 'JrL61ScFDNYPpBuSZM0BMvU6xuB2', '213964@test2026.edu.vn', 'Nguyễn Quốc Duy', NULL, NULL, 'student', 1, '2026-02-04 15:20:16', '2026-02-04 15:20:16'),
('74889a4c-ce57-4b36-8e5b-e2937335708d', 'pBSeXNvz7mbHYsZUGLbiDsyL6z82', '214111@test2026.edu.vn', 'Đào Tô Châu', NULL, NULL, 'student', 1, '2026-02-04 15:20:07', '2026-02-04 15:20:07'),
('74a717c9-e4e8-4cef-97ba-6416cf5212e1', '1Uj0vQxhNCVnZxmFO351tYcTBkv1', '2110124@test2026.edu.vn', 'Nguyễn Võ Quang Huy', NULL, NULL, 'student', 1, '2026-02-04 15:20:29', '2026-02-04 15:20:29'),
('784c7f31-a7f3-475f-9222-669f603589db', 'XvTsbNtg92dTNBwoNTTOhOR3hhz2', '2110497@test2026.edu.vn', 'Trần Minh Mẫn', NULL, NULL, 'student', 1, '2026-02-04 15:20:43', '2026-02-04 15:20:43'),
('82c9975a-dac4-4eed-9be6-85cc894170a3', 'qsh6X6QYxYZgR3SpQnzxEYgoHR23', '2110313@test2026.edu.vn', 'La Trọng Nghĩa', NULL, NULL, 'student', 1, '2026-02-04 15:20:46', '2026-02-04 15:20:46'),
('8e8ead9a-5084-4493-95b9-42c33f03e031', '1D2rB4LavfdZ1ljScjKGJf35Z4U2', '213802@test2026.edu.vn', 'Nguyễn Duy Khang', NULL, NULL, 'student', 1, '2026-02-04 15:20:33', '2026-02-04 15:20:33'),
('9b692737-019b-45e3-a007-0343104c9195', 'D4X0N2MAliREHbPXnR6pJogSgWl1', '2110783@test2026.edu.vn', 'Phạm Thành Nam', NULL, NULL, 'student', 1, '2026-02-04 15:20:45', '2026-02-04 15:20:45'),
('9c97d29f-d46a-4918-a879-a188f8c3810e', 'cIYioHVZBCM0XdRpwobFMUxkTlp2', '219486@test2026.edu.vn', 'Nguyễn Tuấn Đạt', NULL, NULL, 'student', 1, '2026-02-04 15:20:12', '2026-02-04 15:20:12'),
('a10c0911-7e7e-41e7-a91a-6fe42715eb2e', 'CIQLu3oAb3YwnEuQFB3jgYuQIy43', '219720@test2026.edu.vn', 'Nguyễn Khánh Duy', NULL, NULL, 'student', 1, '2026-02-04 15:20:14', '2026-02-04 15:20:14'),
('ae6c8630-8238-43a3-bd55-84e76a543050', 'v3wllwbFqsOj4PWCBr9NseulkIk2', '2110203@test2026.edu.vn', 'Nguyễn Hoàng Danh', NULL, NULL, 'student', 1, '2026-02-04 15:20:10', '2026-02-04 15:20:10'),
('b0576430-597c-4914-8854-d79bceb06835', 'yBGuyQRFdxd7Qnx2fovERAH6mSx1', '2110261@test2026.edu.vn', 'Nguyễn Minh Nhựt', NULL, NULL, 'student', 1, '2026-02-04 15:20:55', '2026-02-04 15:20:55'),
('b8da8e00-076e-4368-a465-a627a03949ff', 'eb4B1YwFRrRMILasSCcyC5Db5iN2', '219676@test2026.edu.vn', 'Dương Khánh Chen', NULL, NULL, 'student', 1, '2026-02-04 15:20:08', '2026-02-04 15:20:08'),
('b9a08191-a170-4334-82c2-d9e74a4109dd', 'irq6920eTUYrRVmF55vU55FRDWt2', '2110700@test2026.edu.vn', 'Nguyễn Trường Hải', NULL, NULL, 'student', 1, '2026-02-04 15:20:20', '2026-02-04 15:20:20'),
('bf4bfee5-da26-45a0-a45b-59ad9242bad2', 'a9mBE7aPj9R67hH2kj0URfLrjTh2', '2110568@test2026.edu.vn', 'Lê Hồ Minh Nhựt', NULL, NULL, 'student', 1, '2026-02-04 15:20:55', '2026-02-04 15:20:55'),
('c14ac971-524c-4d69-9048-4c9578179a13', '739XMkf2VSf3WIQN4bk9X18j6hF3', '2110557@test2026.edu.vn', 'Lý Minh Huy', NULL, NULL, 'student', 1, '2026-02-04 15:20:30', '2026-02-04 15:20:30'),
('c5829480-2593-4d32-9425-74378e079cb9', 'lu62sdoMh7bXGzRlAPC0s2gaMtp2', '219421@test2026.edu.vn', 'Lê Minh Khang', NULL, NULL, 'student', 1, '2026-02-04 15:20:32', '2026-02-04 15:20:32'),
('c748c69f-89aa-426a-8e83-f31db334bd88', 'CL15m2hTAaTm3POttMUOfZ9rYoJ2', '2110504@test2026.edu.vn', 'Phan Hoàng Thái An', NULL, NULL, 'student', 1, '2026-02-04 15:19:58', '2026-02-04 15:19:58'),
('c96b7ddb-1a6a-4862-958c-f7dc0d88a730', 'uYkKgiWF6deZIBQA3tnHeI5KxKd2', '2110777@test2026.edu.vn', 'Nguyễn Hoàng Quốc Anh', NULL, NULL, 'student', 1, '2026-02-04 15:20:00', '2026-02-04 15:20:00'),
('cf715220-1e64-4e22-bf05-748c5432b116', '308G8BShZRfF57yBBXtKUJv2h0J3', '2110312@test2026.edu.vn', 'Nguyễn Trung Lĩnh', NULL, NULL, 'student', 1, '2026-02-04 15:20:40', '2026-02-04 15:20:40'),
('d11c4138-49b5-4847-94d8-49fa72fe69bd', 'R3MSXdg9zKTyQdwhw68Qms9rX4K2', '2110817@test2026.edu.vn', 'Mai Trần Trọng Nhân', NULL, NULL, 'student', 1, '2026-02-04 15:20:53', '2026-02-04 15:20:53'),
('d625e0f1-ac64-40f6-86d8-2bb35156b4e0', 'QNPx24oYO9Xg1gdEjk51khar0e43', '2110664@test2026.edu.vn', 'Trần Hoàng Nghĩa', NULL, NULL, 'student', 1, '2026-02-04 15:20:49', '2026-02-04 15:20:49'),
('deb756db-185b-42ee-a462-6c9d0d8b0da6', 'm43RrufVA1O5vUwBkJ4tiC0Ojmq1', '219829@test2026.edu.vn', 'Trần Thành Lợi', NULL, NULL, 'student', 1, '2026-02-04 15:20:42', '2026-02-04 15:20:42'),
('e8d5e190-b21b-4a20-ab05-69639a2d5766', 'Zd0PJ3SL6iYfOTeBGktbgLQTIio2', '212464@test2026.edu.vn', 'Nguyễn Thành Danh', NULL, NULL, 'student', 1, '2026-02-04 15:20:09', '2026-02-04 15:20:09'),
('e919e316-c551-4dcf-b6ee-73b3c796369a', 'Ig6nZQeRLNWlslBApP8dmI6a5sg2', '2110244@test2026.edu.vn', 'Nguyễn Thị Hồng Hạnh', NULL, NULL, 'student', 1, '2026-02-04 15:20:20', '2026-02-04 15:20:20'),
('eb7ec2ef-d9e2-493c-9850-bcefd211b307', 'MxOlR8KYhXPTzfWiIEvIVOQTAHp2', '2110637@test2026.edu.vn', 'Võ Duy Anh', NULL, NULL, 'student', 1, '2026-02-04 15:19:59', '2026-02-04 15:19:59'),
('f0ec7dd3-f6ff-4f29-8be4-18a3bac5d14c', '7l0TzZph1aaGlPNyNQOWacOKGom1', '2110076@test2026.edu.vn', 'Trần Đăng Khoa', NULL, NULL, 'student', 1, '2026-02-04 15:20:34', '2026-02-04 15:20:34'),
('f700d0f1-943d-445a-be6e-dcabe81dcd99', 'vKOgIZuqXRZw4M3RG4IqGta0gAt1', '219820@test2026.edu.vn', 'Đỗ Trí Hào', NULL, NULL, 'student', 1, '2026-02-04 15:20:21', '2026-02-04 15:20:21'),
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
-- Các ràng buộc cho bảng `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `fk_class_advisor` FOREIGN KEY (`advisor_teacher_id`) REFERENCES `teachers` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
