-- ============================================
-- Migration: Create Documents Table
-- Version: 010
-- Description: Project documents and file management
-- ============================================

USE agile_project_management;

-- ============================================
-- Table: documents
-- Description: Project-related documents (proposals, reports, presentations, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  project_id VARCHAR(36) NOT NULL COMMENT 'Reference to projects table',
  
  -- Document type
  document_type ENUM(
    'proposal',       -- Proposal document
    'report',         -- Final report
    'presentation',   -- Slide deck
    'source_code',    -- Source code/project files
    'other'          -- Other documents
  ) NOT NULL,
  
  -- File information
  file_name VARCHAR(255) NOT NULL COMMENT 'Original filename',
  file_path VARCHAR(500) NOT NULL COMMENT 'Firebase Storage path or URL',
  file_size BIGINT COMMENT 'File size in bytes',
  mime_type VARCHAR(100) COMMENT 'MIME type (e.g., application/pdf)',
  
  -- Version control
  version INT DEFAULT 1 COMMENT 'Document version number',
  is_latest BOOLEAN DEFAULT TRUE COMMENT 'Is this the latest version?',
  
  -- Upload information
  uploaded_by VARCHAR(36) NOT NULL COMMENT 'User who uploaded (student or teacher)',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Metadata
  description TEXT COMMENT 'Document description',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
  
  -- Indexes
  INDEX idx_project (project_id),
  INDEX idx_document_type (document_type),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_uploaded_at (uploaded_at),
  INDEX idx_is_latest (is_latest),
  INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Business Rules
-- ============================================
-- BR-01: Students can upload multiple versions, older versions kept for history
-- BR-02: When new version uploaded, set previous version's is_latest = FALSE
-- BR-03: Max file size: 50MB per file
-- BR-04: Allowed file types: .pdf, .docx, .pptx, .zip
-- BR-05: Source code must be in .zip format
-- BR-06: Final report and presentation are required for project completion

-- ============================================
-- File Storage Structure (Firebase Storage)
-- ============================================
-- /project-documents/{project_id}/{document_type}/{timestamp}_{filename}
-- Example: /project-documents/abc-123/report/1707396000000_final_report.pdf

-- ============================================
-- End of Migration
-- ============================================
