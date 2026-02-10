-- ============================================
-- Migration 004: Create topics table
-- Description: Stores thesis topics proposed by teachers
-- ============================================

CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Relationships
    supervisor_id VARCHAR(36) NOT NULL, -- User ID of the teacher
    
    -- Status Workflow
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    
    -- Cycle Info (Linked to Announcement ideally, but storing values for now)
    semester VARCHAR(20) NOT NULL, -- 1, 2, summer
    academic_year VARCHAR(20) NOT NULL, -- e.g. 2024-2028
    
    -- Topic Details
    field VARCHAR(100), -- Web, Mobile, AI, etc.
    max_students INT DEFAULT 2,
    current_students INT DEFAULT 0,
    
    -- Meta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by VARCHAR(36) NULL, -- Admin User ID
    
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_supervisor (supervisor_id),
    INDEX idx_status (status),
    INDEX idx_semester_year (semester, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
