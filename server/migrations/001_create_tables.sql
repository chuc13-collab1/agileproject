-- ============================================
-- Agile Project Management - MySQL Schema
-- Version: 1.0
-- Description: User Management Tables (No GPA)
-- ============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS agile_project_management
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE agile_project_management;

-- ============================================
-- Table: users
-- Description: Base table for all users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  uid VARCHAR(128) UNIQUE NOT NULL COMMENT 'Firebase Auth UID',
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  photo_url TEXT,
  role ENUM('student', 'teacher', 'admin') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_email (email),
  INDEX idx_uid (uid),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: students
-- Description: Student-specific information (WITHOUT GPA)
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  user_id VARCHAR(36) UNIQUE NOT NULL,
  student_id VARCHAR(50) UNIQUE NOT NULL COMMENT 'Student code/number',
  class_name VARCHAR(100),
  major VARCHAR(200),
  academic_year VARCHAR(20) COMMENT 'e.g., 2024-2028',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_class_name (class_name),
  INDEX idx_academic_year (academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: teachers
-- Description: Teacher-specific information
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  user_id VARCHAR(36) UNIQUE NOT NULL,
  teacher_id VARCHAR(50) UNIQUE NOT NULL COMMENT 'Teacher code/number',
  department VARCHAR(200),
  max_students INT DEFAULT 5 COMMENT 'Maximum students to supervise',
  current_students INT DEFAULT 0 COMMENT 'Current number of students',
  can_supervise BOOLEAN DEFAULT TRUE,
  can_review BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_teacher_id (teacher_id),
  INDEX idx_department (department),
  INDEX idx_can_supervise (can_supervise),
  INDEX idx_can_review (can_review)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: teacher_specializations
-- Description: Many-to-many for teacher specializations
-- ============================================
CREATE TABLE IF NOT EXISTS teacher_specializations (
  teacher_id VARCHAR(36),
  specialization VARCHAR(100),
  PRIMARY KEY (teacher_id, specialization),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  INDEX idx_specialization (specialization)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: admins
-- Description: Admin-specific information
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  user_id VARCHAR(36) UNIQUE NOT NULL,
  admin_id VARCHAR(50) UNIQUE NOT NULL COMMENT 'Admin code',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admin_id (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: admin_permissions
-- Description: Many-to-many for admin permissions
-- ============================================
CREATE TABLE IF NOT EXISTS admin_permissions (
  admin_id VARCHAR(36),
  permission ENUM(
    'manage_users',
    'manage_projects', 
    'manage_topics',
    'manage_grades',
    'manage_system',
    'view_reports'
  ),
  PRIMARY KEY (admin_id, permission),
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  INDEX idx_permission (permission)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert a test admin (password should be set via Firebase Auth)
-- INSERT INTO users (id, uid, email, display_name, role, is_active)
-- VALUES (
--   'admin-001',
--   'firebase-uid-here',
--   'admin@example.com',
--   'System Admin',
--   'admin',
--   TRUE
-- );

-- INSERT INTO admins (id, user_id, admin_id)
-- VALUES ('admin-rec-001', 'admin-001', 'ADMIN001');

-- INSERT INTO admin_permissions (admin_id, permission)
-- VALUES 
--   ('admin-rec-001', 'manage_users'),
--   ('admin-rec-001', 'manage_projects'),
--   ('admin-rec-001', 'manage_topics'),
--   ('admin-rec-001', 'manage_grades'),
--   ('admin-rec-001', 'manage_system'),
--   ('admin-rec-001', 'view_reports');

-- ============================================
-- End of Migration Script
-- ============================================
