-- Migration 002: Create Classes Table
-- Purpose: Add class management with advisor assignment and student capacity tracking

USE agile_project_management;

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id CHAR(36) PRIMARY KEY,
  class_code VARCHAR(20) UNIQUE NOT NULL COMMENT 'Unique class identifier (e.g., DH22TIN01)',
  class_name VARCHAR(100) COMMENT 'Full class name (e.g., Công nghệ thông tin K22)',
  academic_year VARCHAR(20) NOT NULL COMMENT 'Academic year range (e.g., 2022-2026)',
  advisor_teacher_id CHAR(36) COMMENT 'Class advisor foreign key to teachers table',
  max_students INT DEFAULT 40 COMMENT 'Maximum student capacity',
  major VARCHAR(100) COMMENT 'Major/specialization',
  description TEXT COMMENT 'Additional class information',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Active status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key to teachers table
  CONSTRAINT fk_class_advisor 
    FOREIGN KEY (advisor_teacher_id) 
    REFERENCES teachers(user_id) 
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  
  -- Indexes for performance
  INDEX idx_class_code (class_code),
  INDEX idx_academic_year (academic_year),
  INDEX idx_advisor (advisor_teacher_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraint to students table
-- Note: This assumes class_name column exists and will reference class_code
-- We'll handle data migration separately to avoid breaking existing data
DELIMITER //

CREATE PROCEDURE add_class_fk_to_students()
BEGIN
  DECLARE fk_exists INT DEFAULT 0;
  
  -- Check if foreign key already exists
  SELECT COUNT(*) INTO fk_exists
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = 'agile_project_management'
    AND TABLE_NAME = 'students'
    AND CONSTRAINT_NAME = 'fk_students_class'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY';
  
  -- Only add if it doesn't exist
  IF fk_exists = 0 THEN
    -- Note: We'll add this FK later after migrating existing data
    -- ALTER TABLE students
    --   ADD CONSTRAINT fk_students_class 
    --   FOREIGN KEY (class_name) 
    --   REFERENCES classes(class_code) 
    --   ON DELETE SET NULL
    --   ON UPDATE CASCADE;
    
    SELECT 'FK will be added after data migration' AS status;
  ELSE
    SELECT 'FK already exists' AS status;
  END IF;
END //

DELIMITER ;

CALL add_class_fk_to_students();
DROP PROCEDURE add_class_fk_to_students;

-- Insert sample classes for testing (optional)
-- Uncomment if you want sample data

/*
INSERT INTO classes (id, class_code, class_name, academic_year, max_students, major, is_active) VALUES
  (UUID(), 'DH22TIN01', 'Công nghệ thông tin K22 - Lớp 1', '2022-2026', 40, 'Công nghệ thông tin', TRUE),
  (UUID(), 'DH22TIN02', 'Công nghệ thông tin K22 - Lớp 2', '2022-2026', 40, 'Công nghệ thông tin', TRUE),
  (UUID(), 'DH22TIN03', 'Công nghệ thông tin K22 - Lớp 3', '2022-2026', 35, 'Công nghệ thông tin', TRUE),
  (UUID(), 'DH23TIN01', 'Công nghệ thông tin K23 - Lớp 1', '2023-2027', 40, 'Công nghệ thông tin', TRUE),
  (UUID(), 'DH23TIN02', 'Công nghệ thông tin K23 - Lớp 2', '2023-2027', 40, 'Công nghệ thông tin', TRUE);
*/

-- Verify table creation
SELECT 
  TABLE_NAME, 
  TABLE_ROWS, 
  CREATE_TIME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'agile_project_management' 
  AND TABLE_NAME = 'classes';

SELECT 'Classes table created successfully' AS status;
