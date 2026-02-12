ALTER TABLE topics ADD COLUMN IF NOT EXISTS requirements TEXT DEFAULT NULL COMMENT 'Project requirements';
ALTER TABLE topics ADD COLUMN IF NOT EXISTS expected_results TEXT DEFAULT NULL COMMENT 'Expected project results';
