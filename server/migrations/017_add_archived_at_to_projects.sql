-- Add archived_at column for soft-delete after archiving
ALTER TABLE projects ADD COLUMN archived_at TIMESTAMP NULL DEFAULT NULL;
CREATE INDEX idx_projects_archived ON projects(archived_at);
