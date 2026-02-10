-- ============================================
-- Migration: Create Comments Table
-- Version: 008
-- Description: Teacher comments on progress reports
-- ============================================

USE agile_project_management;

-- ============================================
-- Table: comments
-- Description: Feedback from teachers on progress reports
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  report_id VARCHAR(36) NOT NULL COMMENT 'Reference to progress_reports table',
  teacher_id VARCHAR(36) NOT NULL COMMENT 'Teacher who commented',
  
  -- Comment content
  content TEXT NOT NULL COMMENT 'Comment text',
  rating INT COMMENT 'Rating 1-5 stars',
  
  -- Timestamp
  comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (report_id) REFERENCES progress_reports(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT,
  
  -- Indexes
  INDEX idx_report (report_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_comment_date (comment_date),
  
  -- Constraints
  CONSTRAINT chk_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Business Rules
-- ============================================
-- BR-01: Only supervisor can comment on their students' reports
-- BR-02: Multiple comments allowed per report (conversation thread)
-- BR-03: Rating is optional but recommended

-- ============================================
-- End of Migration
-- ============================================
