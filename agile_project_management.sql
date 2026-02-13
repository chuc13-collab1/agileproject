-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th2 12, 2026 lúc 01:36 PM
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
('1ea71a26-b7ac-4e25-a707-fcd3292a754d', 'abc', 'sbv', 'Hè', '2025-2026', '2026-02-05 23:03:00', '2026-02-28 23:03:00', 'draft', '2026-02-04 16:03:31', '2026-02-04 16:03:31', NULL);

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
  `grade` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `projects`
--

INSERT INTO `projects` (`id`, `topic_id`, `student_id`, `supervisor_id`, `reviewer_id`, `status`, `registration_date`, `start_date`, `end_date`, `defense_date`, `final_grade`, `notes`, `created_at`, `updated_at`, `report_deadline`, `supervisor_score`, `reviewer_score`, `council_score`, `final_score`, `grade`) VALUES
('1655ceab-6c12-4b85-bab0-019b4d041a31', '9dacc2ec-cb56-4564-8cd0-8f1daeef7ace', 'f472e34b-9358-4132-846e-32df17a612d9', NULL, NULL, 'registered', '2026-02-11 07:34:37', NULL, NULL, NULL, NULL, NULL, '2026-02-11 07:34:37', '2026-02-11 07:34:37', NULL, NULL, NULL, NULL, NULL, NULL),
('53c03c1a-3445-4cf9-ab4f-01735e0a1122', '12172c00-839a-44b8-a0a5-d8b2e33f17e9', 'f472e34b-9358-4132-846e-32df17a612d9', NULL, NULL, 'registered', '2026-02-11 07:36:25', NULL, NULL, NULL, NULL, NULL, '2026-02-11 07:36:25', '2026-02-11 07:36:25', NULL, NULL, NULL, NULL, NULL, NULL),
('7d14c6f2-ca70-42be-bfd4-ffd5bba2690c', '9dacc2ec-cb56-4564-8cd0-8f1daeef7ace', '4590af2d-1ff9-4206-ab8a-e499f9337fbe', NULL, NULL, 'registered', '2026-02-12 04:17:34', NULL, NULL, NULL, NULL, NULL, '2026-02-12 04:17:34', '2026-02-12 05:26:41', NULL, NULL, NULL, NULL, NULL, NULL);

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
('048195e4-2aa9-4a89-84a4-b293dae26b24', '1f3d7e5a-739f-49ab-bcb1-8d6bb02cd53c', '2110441', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('04b01d50-de02-40c4-a513-1cc09899027d', '5c433075-373b-47ca-b84e-653addaec973', '2110497', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('05334b08-49d2-45c7-880a-6f34764fb1d5', '83321290-9216-440a-b267-fa960dc9e8f6', '2110783', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('060e04c0-6a6b-4536-89a3-5aa83d5a1365', 'e92dba11-2f50-43d9-8e91-c5ad8bd65153', '2110714', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('079e0698-f949-4d08-a6e5-cc3e962d76ad', '2bbe422c-930a-4ca5-8a6a-6a56b4585e38', '2110442', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('1042f06c-6fb0-405e-a0b5-8e19c9c704cc', '3bae702f-4ab2-4ad3-85c2-7a448f53c302', '219829', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('1769ad1a-0d93-4338-acdf-64690265a2d1', '1519fcf8-5581-4d28-9d14-5a3ab151c4d8', '219906', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('1ca8e8e9-f2c8-4066-a233-c1316a140db4', '653f47f9-619c-41a2-9a84-118ed4c3e527', '2110079', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('1f566582-b7b3-426d-ba0d-52687b1a4862', 'c37d25c6-fdfa-4e6c-8d5b-c55ec55e9bbc', '219486', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('22ddcfe6-0da7-442a-922d-ff5ad92a56a2', '51168fd2-d27a-4cf3-9f94-3c2a59ff77dd', '2110649', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('250fc17d-42f3-4ea6-b2d2-608bb52691af', 'd20dfe85-335f-4003-8c49-a1596d3603fb', '2110312', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('27147eec-18af-4020-979c-7a458a6972fb', '910edbb4-4e9c-4f7a-b84d-95d96adb6602', '214390', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('29228d07-c4ce-41e0-b4bc-479b52e0c3a7', 'd4cef114-a281-46ae-a9f9-b5de4ff26988', '219685', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('2ae92e7b-36ed-4eaf-aa65-bfbfac0a84d3', '22dc5d24-49fc-42ba-bc1d-3f0b1230190d', '2110076', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('2f93c4e0-e8a1-4287-8920-f02837292172', '3a7378b4-95e3-48e4-bea1-2e8a6622933a', '2110664', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('30607bc9-1aa2-4d1c-8abf-eceaf0d2b4f9', 'c4197b6d-22ea-4f4b-aac6-ffbba015e826', '2110364', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('344b56e9-2f3b-4214-af92-002ad8312096', 'bf23da45-80b4-4bd5-846b-5568ec6732bc', '212464', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('356456fa-5a48-4937-9c99-ec6224b790dd', 'f9906a4f-7c67-4e53-a6cb-216c4ff46068', '2110817', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('3a63e570-8d41-4453-a018-19e364dfa169', 'f2cf9167-61db-491d-8954-e2d1f447bfb3', '2110746', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('3c4d5d43-44ba-4e63-a6cd-a86ac9a2340e', '6b3de99e-596c-4bab-8707-43aac65c3ef2', '2110753', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('3ec28eed-0aec-4229-8438-bccffbfae31a', '501d3356-5c71-427c-80ed-11ab4925832c', '2110402', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('4253809d-da4c-4e11-ab70-608b2a9af6c3', 'f4128d5f-3677-4d4e-84e2-a56c226d2487', '2110262', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('4590af2d-1ff9-4206-ab8a-e499f9337fbe', '71c101c9-7f1b-4fcd-80ed-04372ea18866', '2110568', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('5caa192a-d2df-436c-8154-39cf25e88e12', '7189d157-f644-46ac-ab06-86c86bc5a460', '219421', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('615de2d4-442d-4ae9-b558-2667dfddc758', '54c00a70-8f45-4596-b383-014dba7408c8', '2110410', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('61d07f7f-41d2-437b-9d56-ceb08a43a60b', 'bbe61600-9c72-46a4-8ee6-de91b4be240f', '2110414', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('6b405251-7093-448a-9916-7630b7faf3ca', '7aad2ace-2a90-438e-aeb9-e79ddf983ac2', '219743', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('7677560e-c7c6-413a-b6bd-0e12fc6856e2', 'b7909344-91d4-4dcc-b8f0-c13f32939f00', '2110203', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('7f74ac1e-118a-4f0e-b021-8e4ade48279f', '90968236-41e2-4eaf-baa5-640a0d989fad', '2110637', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('813cef4d-fdd0-4e74-a018-46dad6b65097', 'a3a932dd-56ff-4f23-80af-0c94d286a053', '219751', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('88cca877-1d2c-4cbc-87ac-3263b802d6bb', '5c704a19-d0f3-484d-991d-83f21f1de849', '2110124', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('89b90e07-6292-4554-84fc-0b6ce5c1e548', '20855f4f-428e-49c3-81b7-e016325a3397', '2110335', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('89ec8362-92a9-4e59-a15f-5809dcac9733', '74059395-92ea-4361-b54e-7d1926df0bbf', '219909', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('8c0f20d9-55b6-4808-99d7-5a740e00364a', '8d17fba0-23b8-47ce-9c90-138462b937e6', '2110557', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('8ce89096-92be-47f8-a727-785fad8ea0a4', 'c99d7fe8-3a3c-4e78-ac0a-28d63c489c8b', '2110405', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('934c8b9b-eed6-466a-b1fa-322497b97911', '2b3784dc-2326-4e57-830b-3fbe754cb4df', '2110842', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('97a303b7-236b-4e9f-b23b-4d31f2849260', '2d643ae8-2dc2-4e1d-9f16-0b69475ed56c', '219676', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('9c06eb01-1d7f-44ee-9ec9-60a38e18a141', '9c63fa4d-1f2a-44f5-ba34-b12dc49a6392', '213964', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('9dfd8874-b372-49db-a729-02d2c57ff5b6', '833662f9-a0d1-4202-b83e-3b92939ee8f1', '214111', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('a1c45e0f-1630-43b0-9cf2-b34527f9e992', '8f3588d3-96fa-4a93-826c-c76e31ef55e6', '2110634', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('a86bf3c5-5577-46de-aac0-b31d8a764d6c', '25901eb8-228d-497e-88f6-016315029ec0', '2110566', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('a875ca9c-70ec-4da4-bcef-a0754e39c3c1', '244c4d9f-7bb8-4432-b5c7-72421ac8c8f0', '2110525', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('b49dac9e-4435-45b3-a097-e26ef2287ea6', '9f418e5d-adc5-47cd-be30-0eae8ed660a2', '2110582', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('c2551c07-0d80-4309-912d-4b5fbe995d36', 'aa18bd5d-d2cf-4fd9-b47f-a6087305a090', '2110150', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('c40d20f7-9e47-4ddc-8b43-c06ddf75fe48', '9b306ca6-5c1e-4823-9f66-a36e7d37486d', '213802', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('c853729b-4206-4bc2-b926-fa3eab55b1a9', '90885b8b-0566-48bf-a71a-e8c7b089e41d', '2110244', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('cb1de8e1-3147-4b92-ab8d-746047f68087', 'ad3520b6-c8d7-4a45-b0ba-f6928b97c56e', '2110831', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('ce17512e-ebd8-475d-bdef-600811de6dc8', '964aacd4-b6f6-4c29-a92f-6ce4ec8bb437', '2110703', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('e27cdde9-0770-46df-a0e8-44abceadd9b1', 'bf302ead-a297-4fed-acfd-37b87090b4e1', '2110313', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('e9534bce-8e19-46a4-823f-d7f991ae2964', '2490a170-2e0a-4d41-b1cc-09148db8dce3', '219720', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('eb009999-eaa8-425f-a72a-950cb95847d6', 'c344b730-e463-4978-a0ff-25706ca67af5', '2110607', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('eb571251-b40c-4761-9d8d-9bd85d3465e7', '50c96d79-b4f6-46ab-8c98-abcee4cbec7c', '2110700', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('f200418d-cce2-4f28-a567-1cf598ecf03c', 'ae8deaf6-ec75-4671-ab2d-346900a35c2f', '2110569', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('f2bb3226-e008-4386-aac4-4cad4616c939', '14dfeec1-c927-4af9-a933-6f92c052c4be', '219820', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('f472e34b-9358-4132-846e-32df17a612d9', 'cfc23678-f40e-42e7-947d-512cf3e19198', 'S294845', 'D20CQCN01-N', 'Software Engineering', NULL),
('f644926b-42f7-4ea5-b817-9586f5c9b29c', '651180ef-ad6f-4599-aaf6-2ee184936771', '2110261', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('fb186096-52bd-4f16-a55e-7ce34e4bcd9b', '8897f22c-5ae4-4cc2-9e63-96a5dbb4b3ce', '2110504', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026'),
('fdc2bda2-ba47-4575-bd05-2a86dcc28987', 'b11e650b-3050-4872-a737-55a7ea1022be', '2110777', 'DH22TIN01', 'Công nghệ thông tin', '2022-2026');

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
('9dacc2ec-cb56-4564-8cd0-8f1daeef7ace', 'quan li quan ao', 'sfdf', NULL, NULL, 'approved', NULL, '1', '2024-2025', 'Web Development', 2, 2, '2026-02-11 07:14:14', '2026-02-12 04:17:34', '2026-02-11 07:14:24', '22428871-ec14-4875-ba4a-c46d8a98005c', 'fdssd', 'dsdsd', 'teacher', NULL, NULL),
('c3893b63-6dae-480f-b179-ea256aff2f35', 'xây dựng hệ thống thư viện dnc', 'lm vè thu vien', '22428871-ec14-4875-ba4a-c46d8a98005c', 'fe9cfcb2-8e73-4dd2-9116-7644c2f86aab', 'approved', NULL, 'summer', '2025-2026', 'Web Development', 2, 0, '2026-02-05 04:56:33', '2026-02-05 05:09:46', '2026-02-05 04:56:38', '22428871-ec14-4875-ba4a-c46d8a98005c', NULL, NULL, 'teacher', NULL, NULL);

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
('14dfeec1-c927-4af9-a933-6f92c052c4be', 'OSwh3lQsQGWCLs1ihXe9Y6uvBRk2', '219820@test2026.edu.vn', 'Đỗ Trí Hào', NULL, NULL, 'student', 1, '2026-02-12 03:48:32', '2026-02-12 03:48:32'),
('1519fcf8-5581-4d28-9d14-5a3ab151c4d8', '0Ze0Yrcq5aRgIpUOkMQfLTA5qEB2', '219906@test2026.edu.vn', 'Hồ Duy Hoàng', NULL, NULL, 'student', 1, '2026-02-12 03:48:38', '2026-02-12 03:48:38'),
('1f3d7e5a-739f-49ab-bcb1-8d6bb02cd53c', 'QBV0Y8FTnBOCTVe307hxLF3Ff8E3', '2110441@test2026.edu.vn', 'Đặng Phương Nam', NULL, NULL, 'student', 1, '2026-02-12 03:48:51', '2026-02-12 03:48:51'),
('20855f4f-428e-49c3-81b7-e016325a3397', '30KzRR6WToTkZVQB5ZWkvYLdwFm1', '2110335@test2026.edu.vn', 'Lê Hữu Minh Lợi', NULL, NULL, 'student', 1, '2026-02-12 03:48:49', '2026-02-12 03:48:49'),
('22428871-ec14-4875-ba4a-c46d8a98005c', 'XyyiXMZhdOPEjeNmqLsKUKIxTbq2', 'admin@agile.com', 'Agile Admin', NULL, NULL, 'admin', 1, '2026-02-04 15:52:42', '2026-02-04 16:02:11'),
('22dc5d24-49fc-42ba-bc1d-3f0b1230190d', '2AtJdxtIaFg75eCl91ApMYDDgGb2', '2110076@test2026.edu.vn', 'Trần Đăng Khoa', NULL, NULL, 'student', 1, '2026-02-12 03:48:43', '2026-02-12 03:48:43'),
('244c4d9f-7bb8-4432-b5c7-72421ac8c8f0', 'wtduPvRQ9VfuV3pAjFy11Nioyxo1', '2110525@test2026.edu.vn', 'Đặng Hữu Nghĩa', NULL, NULL, 'student', 1, '2026-02-12 03:48:57', '2026-02-12 03:48:57'),
('2490a170-2e0a-4d41-b1cc-09148db8dce3', 'VpoLQvZNKTalBTby0YsYqqqK2l63', '219720@test2026.edu.vn', 'Nguyễn Khánh Duy', NULL, NULL, 'student', 1, '2026-02-12 03:48:27', '2026-02-12 03:48:27'),
('25901eb8-228d-497e-88f6-016315029ec0', 'UtwPrUykBmXUABbAVPABeBbcsC12', '2110566@test2026.edu.vn', 'Lữ Gia Băng', NULL, NULL, 'student', 1, '2026-02-12 03:48:16', '2026-02-12 03:48:16'),
('2b3784dc-2326-4e57-830b-3fbe754cb4df', 'X0YFdbJPEuQetF57nLRt3VjxzSx2', '2110842@test2026.edu.vn', 'Lâm Tấn Kiệt', NULL, NULL, 'student', 1, '2026-02-12 03:48:47', '2026-02-12 03:48:47'),
('2bbe422c-930a-4ca5-8a6a-6a56b4585e38', 'sy1hWKjHPqRe6tuZG4Ag7l9upL32', '2110442@test2026.edu.vn', 'Võ Thị Ngọc Nhịn', NULL, NULL, 'student', 1, '2026-02-12 03:49:00', '2026-02-12 03:49:00'),
('2d643ae8-2dc2-4e1d-9f16-0b69475ed56c', 'GqcaMxNAt7NQ7qtH7a1srabfPeD3', '219676@test2026.edu.vn', 'Dương Khánh Chen', NULL, NULL, 'student', 1, '2026-02-12 03:48:22', '2026-02-12 03:48:22'),
('3a7378b4-95e3-48e4-bea1-2e8a6622933a', 'VsjffHJ46mMY9hvyn8iZCoEcinf1', '2110664@test2026.edu.vn', 'Trần Hoàng Nghĩa', NULL, NULL, 'student', 1, '2026-02-12 03:48:56', '2026-02-12 03:48:56'),
('3bae702f-4ab2-4ad3-85c2-7a448f53c302', 'LyQrrF4Hh3ZWR9Z9t2SRPgx3cDo2', '219829@test2026.edu.vn', 'Trần Thành Lợi', NULL, NULL, 'student', 1, '2026-02-12 03:48:50', '2026-02-12 03:48:50'),
('413a0865-174f-44cd-9be0-4765187fb9d5', 'ByQtTj3r97aNOHVQVQb2rKpNWkm1', 'nguyenvanx@school.edu.vn', 'Tiến sĩ Nguyễn Văn X', '0123456789', NULL, 'teacher', 1, '2026-02-12 03:01:35', '2026-02-12 04:18:27'),
('501d3356-5c71-427c-80ed-11ab4925832c', 'lCU1u7Pj5wSUR6F2H0fh1MzztKq2', '2110402@test2026.edu.vn', 'Trương Công Hậu', NULL, NULL, 'student', 1, '2026-02-12 03:48:34', '2026-02-12 03:48:34'),
('50c96d79-b4f6-46ab-8c98-abcee4cbec7c', 'N8FO5aMjnGPFL56mJwv7tUx1JV63', '2110700@test2026.edu.vn', 'Nguyễn Trường Hải', NULL, NULL, 'student', 1, '2026-02-12 03:48:30', '2026-02-12 03:48:30'),
('51168fd2-d27a-4cf3-9f94-3c2a59ff77dd', 'fI0NwhfF2hVeqB1jXlFYxac6Zt13', '2110649@test2026.edu.vn', 'Ong Kim Giàu', NULL, NULL, 'student', 1, '2026-02-12 03:48:29', '2026-02-12 03:48:29'),
('54c00a70-8f45-4596-b383-014dba7408c8', '8idTiuYnm6Mtj5mMaZcD0waYmI23', '2110410@test2026.edu.vn', 'Ngô Hoàng Nguyên', NULL, NULL, 'student', 1, '2026-02-12 03:48:58', '2026-02-12 03:48:58'),
('5c433075-373b-47ca-b84e-653addaec973', 'VSC0DodaLRZoiMW4N1z2pKybKfB3', '2110497@test2026.edu.vn', 'Trần Minh Mẫn', NULL, NULL, 'student', 1, '2026-02-12 03:48:50', '2026-02-12 03:48:50'),
('5c704a19-d0f3-484d-991d-83f21f1de849', 'XMaaja0X9geVptnIMRRgLP6ylf32', '2110124@test2026.edu.vn', 'Nguyễn Võ Quang Huy', NULL, NULL, 'student', 1, '2026-02-12 03:48:38', '2026-02-12 03:48:38'),
('651180ef-ad6f-4599-aaf6-2ee184936771', 'Bnpgv7tpuLPw2ma1dhp2p8eN2a42', '2110261@test2026.edu.vn', 'Nguyễn Minh Nhựt', NULL, NULL, 'student', 1, '2026-02-12 03:49:01', '2026-02-12 03:49:01'),
('653f47f9-619c-41a2-9a84-118ed4c3e527', 'r9VJWjrkbBfySTalQCqcv6BjkPt2', '2110079@test2026.edu.vn', 'Nguyễn Minh Ngoan', NULL, NULL, 'student', 1, '2026-02-12 03:48:58', '2026-02-12 03:48:58'),
('6b3de99e-596c-4bab-8707-43aac65c3ef2', 'wG7UYod2Lfep65glAYgYRFL3aeu1', '2110753@test2026.edu.vn', 'Nguyễn Chí Hiếu', NULL, NULL, 'student', 1, '2026-02-12 03:48:36', '2026-02-12 03:48:36'),
('7189d157-f644-46ac-ab06-86c86bc5a460', 'TAolORWziAbzDp4IisT4VznVXSb2', '219421@test2026.edu.vn', 'Lê Minh Khang', NULL, NULL, 'student', 1, '2026-02-12 03:48:41', '2026-02-12 03:48:41'),
('71c101c9-7f1b-4fcd-80ed-04372ea18866', 'Kqpw5CjefCWADGMzfCstlYqyDxL2', '2110568@test2026.edu.vn', 'Lê Hồ Minh Nhựt', '', NULL, 'student', 1, '2026-02-12 03:49:02', '2026-02-12 03:57:10'),
('74059395-92ea-4361-b54e-7d1926df0bbf', '5dYKz5Wo7KgjJQ4i1b5A58QlH2C2', '219909@test2026.edu.vn', 'Trần Hùng Chánh', NULL, NULL, 'student', 1, '2026-02-12 03:48:20', '2026-02-12 03:48:20'),
('7aad2ace-2a90-438e-aeb9-e79ddf983ac2', 'nDkdFI5NwRUBOgDot4hWrl6BS7H2', '219743@test2026.edu.vn', 'Huỳnh Thanh Bình', NULL, NULL, 'student', 1, '2026-02-12 03:48:18', '2026-02-12 03:48:18'),
('83321290-9216-440a-b267-fa960dc9e8f6', 'fB1ydCl67kOVQbuBYkfaoCDJBhV2', '2110783@test2026.edu.vn', 'Phạm Thành Nam', NULL, NULL, 'student', 1, '2026-02-12 03:48:52', '2026-02-12 03:48:52'),
('833662f9-a0d1-4202-b83e-3b92939ee8f1', 'v22YqtTxp1Qe7Athu5qFJiUOwi53', '214111@test2026.edu.vn', 'Đào Tô Châu', NULL, NULL, 'student', 1, '2026-02-12 03:48:21', '2026-02-12 03:48:21'),
('8897f22c-5ae4-4cc2-9e63-96a5dbb4b3ce', 'gJbtndo88AWcvKATo9z5U63tBHn1', '2110504@test2026.edu.vn', 'Phan Hoàng Thái An', NULL, NULL, 'student', 1, '2026-02-12 03:48:14', '2026-02-12 03:48:14'),
('8d17fba0-23b8-47ce-9c90-138462b937e6', '64EELByDH5dBPpGivSRuGoclRM32', '2110557@test2026.edu.vn', 'Lý Minh Huy', NULL, NULL, 'student', 1, '2026-02-12 03:48:39', '2026-02-12 03:48:39'),
('8f3588d3-96fa-4a93-826c-c76e31ef55e6', 'Q6BnTpiAAQfeOGEhHyfHccUeVck1', '2110634@test2026.edu.vn', 'Nguyễn Hữu Nghĩa', NULL, NULL, 'student', 1, '2026-02-12 03:48:55', '2026-02-12 03:48:55'),
('90885b8b-0566-48bf-a71a-e8c7b089e41d', 'tpG3wSXa6JTP3GHoGflvZvq1fj83', '2110244@test2026.edu.vn', 'Nguyễn Thị Hồng Hạnh', NULL, NULL, 'student', 1, '2026-02-12 03:48:31', '2026-02-12 03:48:31'),
('90968236-41e2-4eaf-baa5-640a0d989fad', 'Bjt47naiRWWIdV4ZgLc2mW3tTVr1', '2110637@test2026.edu.vn', 'Võ Duy Anh', NULL, NULL, 'student', 1, '2026-02-12 03:48:15', '2026-02-12 03:48:15'),
('910edbb4-4e9c-4f7a-b84d-95d96adb6602', 'gIuJ9vgXBHcqk5kVENspOVGAu8j1', '214390@test2026.edu.vn', 'Hồng Quốc Bảo', NULL, NULL, 'student', 1, '2026-02-12 03:48:17', '2026-02-12 03:48:17'),
('964aacd4-b6f6-4c29-a92f-6ce4ec8bb437', 'v8iRiYe757Z0hAkkQRx3mzJuTwd2', '2110703@test2026.edu.vn', 'Võ Thành Đạt', NULL, NULL, 'student', 1, '2026-02-12 03:48:24', '2026-02-12 03:48:24'),
('9b306ca6-5c1e-4823-9f66-a36e7d37486d', '9y1VHm3QVJhCAbiPsOe6gLZmXZ13', '213802@test2026.edu.vn', 'Nguyễn Duy Khang', NULL, NULL, 'student', 1, '2026-02-12 03:48:42', '2026-02-12 03:48:42'),
('9c63fa4d-1f2a-44f5-ba34-b12dc49a6392', '61yXgegTOihpnoyxu6vrf14HJH52', '213964@test2026.edu.vn', 'Nguyễn Quốc Duy', NULL, NULL, 'student', 1, '2026-02-12 03:48:28', '2026-02-12 03:48:28'),
('9f418e5d-adc5-47cd-be30-0eae8ed660a2', 'EuDAWF68AWSOLWv4WAyh52t7W3J2', '2110582@test2026.edu.vn', 'Lữ Nhật Hào', NULL, NULL, 'student', 1, '2026-02-12 03:48:33', '2026-02-12 03:48:33'),
('a3a932dd-56ff-4f23-80af-0c94d286a053', 'TI6EBDVI6FMUqxat7iGC3d1rTjg1', '219751@test2026.edu.vn', 'Bùi Ngọc Phương Nghi', NULL, NULL, 'student', 1, '2026-02-12 03:48:53', '2026-02-12 03:48:53'),
('aa18bd5d-d2cf-4fd9-b47f-a6087305a090', 'e4RPkITNNOes2SAD52sll4JhIDH2', '2110150@test2026.edu.vn', 'Nguyễn Trung Hậu', NULL, NULL, 'student', 1, '2026-02-12 03:48:35', '2026-02-12 03:48:35'),
('ad3520b6-c8d7-4a45-b0ba-f6928b97c56e', 'Un7pMhhUUieckfn428zVc1uPWOr1', '2110831@test2026.edu.vn', 'Nguyễn Doãn Minh Đức', NULL, NULL, 'student', 1, '2026-02-12 03:48:26', '2026-02-12 03:48:26'),
('ae8deaf6-ec75-4671-ab2d-346900a35c2f', 'hiDmWawGpAbSDXLstPEftMAFJCe2', '2110569@test2026.edu.vn', 'Nguyễn Văn Hiếu', NULL, NULL, 'student', 1, '2026-02-12 03:48:37', '2026-02-12 03:48:37'),
('b11e650b-3050-4872-a737-55a7ea1022be', 'cjv8g8snkddCqF1lUG8gdTmLxnU2', '2110777@test2026.edu.vn', 'Nguyễn Hoàng Quốc Anh', NULL, NULL, 'student', 1, '2026-02-12 03:48:15', '2026-02-12 03:48:15'),
('b7909344-91d4-4dcc-b8f0-c13f32939f00', 'g3RNcRaTi7RBJcWwlDtaDRRtVLo2', '2110203@test2026.edu.vn', 'Nguyễn Hoàng Danh', NULL, NULL, 'student', 1, '2026-02-12 03:48:23', '2026-02-12 03:48:23'),
('bbe61600-9c72-46a4-8ee6-de91b4be240f', 'vHer5A8ygqVyGrmV9ngJEOVWU4N2', '2110414@test2026.edu.vn', 'Trương Thanh Duy', NULL, NULL, 'student', 1, '2026-02-12 03:48:28', '2026-02-12 03:48:28'),
('bf23da45-80b4-4bd5-846b-5568ec6732bc', 'L44nWdXdyZOknwcemtLCscaXbaJ3', '212464@test2026.edu.vn', 'Nguyễn Thành Danh', NULL, NULL, 'student', 1, '2026-02-12 03:48:22', '2026-02-12 03:48:22'),
('bf302ead-a297-4fed-acfd-37b87090b4e1', '9jYRV6pOssfpl50qxn8uQ0xyYtJ2', '2110313@test2026.edu.vn', 'La Trọng Nghĩa', NULL, NULL, 'student', 1, '2026-02-12 03:48:54', '2026-02-12 03:48:54'),
('c344b730-e463-4978-a0ff-25706ca67af5', 'UULlF40mnQfOKTdZFEfVoK33v9m2', '2110607@test2026.edu.vn', 'Hồ Vĩ Kiện', NULL, NULL, 'student', 1, '2026-02-12 03:48:46', '2026-02-12 03:48:46'),
('c37d25c6-fdfa-4e6c-8d5b-c55ec55e9bbc', 'Lsbv2PKi5PPlqXR9xtA9ZfIKQUm2', '219486@test2026.edu.vn', 'Nguyễn Tuấn Đạt', NULL, NULL, 'student', 1, '2026-02-12 03:48:25', '2026-02-12 03:48:25'),
('c4197b6d-22ea-4f4b-aac6-ffbba015e826', 'q78v5Aat2hdXY7xHyb211MHbpMe2', '2110364@test2026.edu.vn', 'Nguyễn Vĩ Khang', NULL, NULL, 'student', 1, '2026-02-12 03:48:40', '2026-02-12 03:48:40'),
('c99d7fe8-3a3c-4e78-ac0a-28d63c489c8b', 'EQrhZpmGIuZ14LuSDIAPvyByYTK2', '2110405@test2026.edu.vn', 'Nguyễn Chí Bình', NULL, NULL, 'student', 1, '2026-02-12 03:48:19', '2026-02-12 03:48:19'),
('cfc23678-f40e-42e7-947d-512cf3e19198', 'QHcWXOq7WjTXNwbwFmgv6svlmS22', 'nguyentienchuc2023@gmail.com', 'Chức Nguyễn Tiến', NULL, NULL, 'student', 1, '2026-02-11 07:34:37', '2026-02-11 07:34:37'),
('d20dfe85-335f-4003-8c49-a1596d3603fb', 'RBVSSR9k6BS5ulseLkcLWIO1dPU2', '2110312@test2026.edu.vn', 'Nguyễn Trung Lĩnh', NULL, NULL, 'student', 1, '2026-02-12 03:48:48', '2026-02-12 03:48:48'),
('d4cef114-a281-46ae-a9f9-b5de4ff26988', 'UpSPFPTtu2MXxVblg8HdEB8y4js1', '219685@test2026.edu.vn', 'Nguyễn Huỳnh Khôi', NULL, NULL, 'student', 1, '2026-02-12 03:48:45', '2026-02-12 03:48:45'),
('e92dba11-2f50-43d9-8e91-c5ad8bd65153', '2rp1Wn3ek4c7A9AZqjwnC58bBPp1', '2110714@test2026.edu.vn', 'Nguyễn Mạch Đăng Khoa', NULL, NULL, 'student', 1, '2026-02-12 03:48:44', '2026-02-12 03:48:44'),
('f2cf9167-61db-491d-8954-e2d1f447bfb3', 'QPSS5dtoKPbtofpYDNNFoTD2hfS2', '2110746@test2026.edu.vn', 'Trịnh Nhật Hào', NULL, NULL, 'student', 1, '2026-02-12 03:48:33', '2026-02-12 03:48:33'),
('f4128d5f-3677-4d4e-84e2-a56c226d2487', 'raHLbC6lkeX1tdBeKeMf7n1BCmB3', '2110262@test2026.edu.vn', 'Tạ Nhật Khoa', NULL, NULL, 'student', 1, '2026-02-12 03:48:44', '2026-02-12 03:48:44'),
('f9906a4f-7c67-4e53-a6cb-216c4ff46068', 'zshvGhiS2SccwR2bEuLS5WUkxYf2', '2110817@test2026.edu.vn', 'Mai Trần Trọng Nhân', NULL, NULL, 'student', 1, '2026-02-12 03:48:59', '2026-02-12 03:48:59'),
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
-- Chỉ mục cho bảng `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_topic` (`topic_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_supervisor` (`supervisor_id`),
  ADD KEY `idx_reviewer` (`reviewer_id`),
  ADD KEY `idx_status` (`status`);

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
