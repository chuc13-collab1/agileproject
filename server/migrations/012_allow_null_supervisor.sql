ALTER TABLE topics MODIFY COLUMN supervisor_id VARCHAR(36) NULL COMMENT 'User ID of the teacher, null if student proposed or unassigned';
