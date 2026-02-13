-- ============================================
-- Agile Project Management - Scheduling Tables
-- Description: Meeting slots and bookings
-- ============================================

CREATE TABLE IF NOT EXISTS `meeting_slots` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `teacher_id` varchar(36) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL COMMENT 'Physical room or Meeting Link',
  `max_students` int(11) DEFAULT 1,
  `is_booked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_slots_teacher` (`teacher_id`),
  CONSTRAINT `fk_slots_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bookings` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `slot_id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `project_id` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_bookings_slot` (`slot_id`),
  KEY `fk_bookings_student` (`student_id`),
  KEY `fk_bookings_project` (`project_id`),
  CONSTRAINT `fk_bookings_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bookings_slot` FOREIGN KEY (`slot_id`) REFERENCES `meeting_slots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
