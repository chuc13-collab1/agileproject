-- Migration: Add support for Student Topic Proposals

DROP TABLE IF EXISTS topic_proposals;

-- 1. Create table for topic proposals
CREATE TABLE topic_proposals (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    expected_results TEXT,
    proposed_by_student_id VARCHAR(36) NOT NULL,
    requested_supervisor_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'revision_requested') DEFAULT 'pending',
    teacher_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (proposed_by_student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_supervisor_id) REFERENCES teachers(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Add columns to topics table to track origin and assignment
-- proposed_by_type: 'teacher' (default) or 'student'
-- original_proposal_id: link back to proposal if from student
-- assigned_to_student_id: pre-assign student if topic came from their proposal/approved
ALTER TABLE topics 
ADD COLUMN IF NOT EXISTS proposed_by_type ENUM('teacher', 'student') DEFAULT 'teacher',
ADD COLUMN IF NOT EXISTS original_proposal_id VARCHAR(36) NULL,
ADD COLUMN IF NOT EXISTS assigned_to_student_id VARCHAR(36) NULL;

-- 3. Add proposal deadline to announcements
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS proposal_deadline DATETIME NULL;
