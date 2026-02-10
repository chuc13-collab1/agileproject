-- ============================================
-- Migration: Create Projects Table
-- Version: 006
-- Description: Projects table for student thesis projects
-- ============================================

USE agile_project_management;

-- ============================================
-- Table: projects
-- Description: Student thesis/project registrations
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  topic_id VARCHAR(36) NOT NULL COMMENT 'Reference to topics table',
  student_id VARCHAR(36) NOT NULL COMMENT 'Reference to students table',
  supervisor_id VARCHAR(36) NOT NULL COMMENT 'Supervising teacher',
  reviewer_id VARCHAR(36) COMMENT 'Reviewing teacher (assigned later)',
  
  -- Status tracking
  status ENUM(
    'registered',      -- Student registered
    'in_progress',     -- Project ongoing
    'submitted',       -- Final submission done
    'reviewed',        -- Reviewed by supervisor/reviewer
    'completed',       -- Passed
    'failed'          -- Failed
  ) DEFAULT 'registered' NOT NULL,
  
  -- Scoring (0-10 scale)
  supervisor_score DECIMAL(4,2) COMMENT 'Score from supervisor (0-10)',
  reviewer_score DECIMAL(4,2) COMMENT 'Score from reviewer (0-10)',
  council_score DECIMAL(4,2) COMMENT 'Average score from council (0-10)',
  final_score DECIMAL(4,2) COMMENT 'Final calculated score (0-10)',
  grade VARCHAR(2) COMMENT 'Letter grade: A, B+, B, C+, C, D+, D, F',
  
  -- Dates
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  defense_date DATE COMMENT 'Defense/presentation date',
  
  -- Additional info
  notes TEXT COMMENT 'General notes about project',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE RESTRICT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
  FOREIGN KEY (supervisor_id) REFERENCES teachers(id) ON DELETE RESTRICT,
  FOREIGN KEY (reviewer_id) REFERENCES teachers(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_topic (topic_id),
  INDEX idx_student (student_id),
  INDEX idx_supervisor (supervisor_id),
  INDEX idx_reviewer (reviewer_id),
  INDEX idx_status (status),
  INDEX idx_registration_date (registration_date),
  
  -- Constraints
  CONSTRAINT chk_supervisor_score CHECK (supervisor_score IS NULL OR (supervisor_score >= 0 AND supervisor_score <= 10)),
  CONSTRAINT chk_reviewer_score CHECK (reviewer_score IS NULL OR (reviewer_score >= 0 AND reviewer_score <= 10)),
  CONSTRAINT chk_council_score CHECK (council_score IS NULL OR (council_score >= 0 AND council_score <= 10)),
  CONSTRAINT chk_final_score CHECK (final_score IS NULL OR (final_score >= 0 AND final_score <= 10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Business Rules (enforced at application level)
-- ============================================
-- BR-01: One student can only have one active project per semester
-- BR-02: Supervisor cannot be the same as reviewer
-- BR-03: Final score calculation: supervisor*0.4 + reviewer*0.2 + council*0.4
-- BR-04: Grade mapping:
--   A:  9.0-10.0
--   B+: 8.5-8.9
--   B:  8.0-8.4
--   C+: 7.5-7.9
--   C:  7.0-7.4
--   D+: 6.5-6.9
--   D:  6.0-6.4
--   F:  0.0-5.9

-- ============================================
-- End of Migration
-- ============================================
