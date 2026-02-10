-- ============================================
-- Migration: Create Evaluations Table
-- Version: 009
-- Description: Detailed grading evaluations from teachers
-- ============================================

USE agile_project_management;

-- ============================================
-- Table: evaluations
-- Description: Detailed evaluations with criteria breakdown
-- ============================================
CREATE TABLE IF NOT EXISTS evaluations (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  project_id VARCHAR(36) NOT NULL COMMENT 'Reference to projects table',
  evaluator_id VARCHAR(36) NOT NULL COMMENT 'Teacher evaluator',
  evaluator_type ENUM('supervisor', 'reviewer', 'council') NOT NULL,
  
  -- Criteria scores (JSON format for flexibility)
  -- Example: {"content": 8.5, "technical": 9.0, "presentation": 7.5, "defense": 8.0}
  criteria_score JSON COMMENT 'Breakdown of scores by criteria',
  
  -- Total score (0-10)
  total_score DECIMAL(4,2) NOT NULL COMMENT 'Total/average score',
  
  -- Detailed feedback
  comments TEXT COMMENT 'Overall evaluation comments',
  strengths TEXT COMMENT 'Project strengths',
  weaknesses TEXT COMMENT 'Areas for improvement',
  suggestions TEXT COMMENT 'Suggestions for future work',
  
  -- Timestamp
  evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluator_id) REFERENCES teachers(id) ON DELETE RESTRICT,
  
  -- Indexes
  INDEX idx_project (project_id),
  INDEX idx_evaluator (evaluator_id),
  INDEX idx_evaluator_type (evaluator_type),
  INDEX idx_evaluation_date (evaluation_date),
  
  -- Constraints
  CONSTRAINT chk_total_score CHECK (total_score >= 0 AND total_score <= 10),
  
  -- Unique constraint: One evaluation per evaluator per project
  UNIQUE KEY uk_project_evaluator (project_id, evaluator_id, evaluator_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Business Rules
-- ============================================
-- BR-01: Each project can have max 1 supervisor evaluation, 1 reviewer evaluation
-- BR-02: Total score is calculated from criteria_score (weighted average)
-- BR-03: Supervisor evaluation: content(40%), technical(30%), presentation(20%), defense(10%)
-- BR-04: Reviewer evaluation: similar criteria but may have different weights
-- BR-05: Once submitted, evaluations can be edited within 24 hours

-- ============================================
-- Sample JSON format for criteria_score
-- ============================================
-- {
--   "content": 8.5,       // Content quality (0-10)
--   "technical": 9.0,     // Technical implementation (0-10)
--   "presentation": 7.5,  // Report/presentation quality (0-10)
--   "defense": 8.0        // Defense/Q&A performance (0-10)
-- }

-- ============================================
-- End of Migration
-- ============================================
