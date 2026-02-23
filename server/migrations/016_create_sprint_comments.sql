-- Create sprint_comments table for teacher feedback on sprints
CREATE TABLE IF NOT EXISTS sprint_comments (
    id VARCHAR(36) PRIMARY KEY,
    sprint_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    author_uid VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_role ENUM('teacher', 'student') NOT NULL DEFAULT 'teacher',
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sprint_comments_sprint (sprint_id),
    INDEX idx_sprint_comments_project (project_id)
);
