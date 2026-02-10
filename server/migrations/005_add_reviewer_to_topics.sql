-- ============================================
-- Migration 005: Add reviewer_id to topics
-- Description: Adds a reviewer column (User ID) to topics table
-- ============================================

-- Add reviewer_id column if it doesn't exist
SELECT count(*) 
INTO @exist 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'topics' 
AND column_name = 'reviewer_id';

SET @query = IF(@exist <= 0, 
    'ALTER TABLE topics ADD COLUMN reviewer_id VARCHAR(36) NULL AFTER supervisor_id, ADD CONSTRAINT fk_topics_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL',
    'SELECT "Column reviewer_id already exists"');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
