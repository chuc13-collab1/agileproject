-- ============================================
-- Table: announcements
-- Description: Project period / registration waves
-- ============================================

USE agile_project_management;

CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  semester VARCHAR(20) NOT NULL COMMENT 'e.g., HK1, HK2, Summer',
  academic_year VARCHAR(20) NOT NULL COMMENT 'e.g., 2024-2025',
  registration_start DATETIME NOT NULL,
  registration_end DATETIME NOT NULL,
  status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_semester (semester),
  INDEX idx_academic_year (academic_year),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
