-- ============================================
-- Migration: Create Progress Reports Table
-- Version: 007
-- Description: Weekly/periodic progress reports from students
-- ============================================

USE agile_project_management;

-- ============================================
-- Table: progress_reports
-- Description: Student progress reports
-- ============================================
CREATE TABLE IF NOT EXISTS progress_reports (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  project_id VARCHAR(36) NOT NULL COMMENT 'Reference to projects table',
  
  -- Report metadata
  report_title VARCHAR(200) NOT NULL COMMENT 'Report title',
  week_number INT COMMENT 'Week number (e.g., 1-15)',
  
  -- Content
  content TEXT NOT NULL COMMENT 'Report content/description',
  achievements TEXT COMMENT 'What was achieved this period',
  difficulties TEXT COMMENT 'Difficulties encountered',
  next_steps TEXT COMMENT 'Plan for next period',
  
  -- File attachment (stored in Firebase Storage)
  file_path VARCHAR(500) COMMENT 'Firebase Storage path to uploaded file',
  file_name VARCHAR(255) COMMENT 'Original filename',
  file_size BIGINT COMMENT 'File size in bytes',
  
  -- Status
  status ENUM(
    'submitted',        -- Student submitted
    'reviewed',         -- Teacher reviewed (commented)
    'approved',         -- Approved by teacher
    'revision_needed'   -- Needs revision
  ) DEFAULT 'submitted' NOT NULL,
  
  -- Timestamps
  submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_date TIMESTAMP NULL COMMENT 'When teacher reviewed',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_project (project_id),
  INDEX idx_status (status),
  INDEX idx_week (week_number),
  INDEX idx_submitted_date (submitted_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Business Rules
-- ============================================
-- BR-01: Students should submit weekly or bi-weekly reports
-- BR-02: Reports must be reviewed by supervisor within 3 days
-- BR-03: Students can edit reports only if status = 'revision_needed'

-- ============================================
-- End of Migration
-- ============================================
