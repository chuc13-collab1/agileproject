CREATE DATABASE agile_project_management;
GO
USE agile_project_management;
GO

CREATE TABLE [users] (
  [id] VARCHAR(36) NOT NULL,
  [uid] VARCHAR(128) NOT NULL,
  [email] NVARCHAR(255) NOT NULL,
  [display_name] NVARCHAR(255) NOT NULL,
  [phone] VARCHAR(20) NULL,
  [photo_url] NVARCHAR(MAX) NULL,
  [role] VARCHAR(20) NOT NULL CHECK ([role] IN ('student','teacher','admin')),
  [is_active] BIT DEFAULT 1,
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [updated_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE [admins] (
  [id] VARCHAR(36) NOT NULL,
  [user_id] VARCHAR(36) NOT NULL,
  [admin_id] VARCHAR(50) NOT NULL
);

CREATE TABLE [admin_permissions] (
  [admin_id] VARCHAR(36) NOT NULL,
  [permission] VARCHAR(50) NOT NULL CHECK ([permission] IN ('manage_users','manage_projects','manage_topics','manage_grades','manage_system','view_reports'))
);

CREATE TABLE [students] (
  [id] VARCHAR(36) NOT NULL,
  [user_id] VARCHAR(36) NOT NULL,
  [student_id] VARCHAR(50) NOT NULL,
  [class_name] NVARCHAR(100) NULL,
  [major] NVARCHAR(200) NULL,
  [academic_year] VARCHAR(20) NULL
);

CREATE TABLE [teachers] (
  [id] VARCHAR(36) NOT NULL,
  [user_id] VARCHAR(36) NOT NULL,
  [teacher_id] VARCHAR(50) NOT NULL,
  [department] NVARCHAR(200) NULL,
  [max_students] INT DEFAULT 5,
  [current_students] INT DEFAULT 0,
  [can_supervise] BIT DEFAULT 1,
  [can_review] BIT DEFAULT 1
);

CREATE TABLE [teacher_specializations] (
  [teacher_id] VARCHAR(36) NOT NULL,
  [specialization] NVARCHAR(100) NOT NULL
);

CREATE TABLE [classes] (
  [id] CHAR(36) NOT NULL,
  [class_code] VARCHAR(20) NOT NULL,
  [class_name] NVARCHAR(100) NULL,
  [academic_year] VARCHAR(20) NOT NULL,
  [advisor_teacher_id] VARCHAR(36) NULL,
  [max_students] INT DEFAULT 40,
  [major] NVARCHAR(100) NULL,
  [description] NVARCHAR(MAX) NULL,
  [is_active] BIT DEFAULT 1,
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [updated_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE [announcements] (
  [id] VARCHAR(36) NOT NULL,
  [title] NVARCHAR(255) NOT NULL,
  [content] NVARCHAR(MAX) NOT NULL,
  [semester] NVARCHAR(20) NOT NULL,
  [academic_year] VARCHAR(20) NOT NULL,
  [registration_start] DATETIME NOT NULL,
  [registration_end] DATETIME NOT NULL,
  [status] VARCHAR(20) DEFAULT 'draft' CHECK ([status] IN ('draft','published','closed')),
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [updated_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [proposal_deadline] DATETIME NULL
);

CREATE TABLE [topics] (
  [id] VARCHAR(36) NOT NULL,
  [title] NVARCHAR(255) NOT NULL,
  [description] NVARCHAR(MAX) NULL,
  [supervisor_id] VARCHAR(36) NULL,
  [reviewer_id] VARCHAR(36) NULL,
  [status] VARCHAR(20) DEFAULT 'pending' CHECK ([status] IN ('pending','approved','rejected')),
  [rejection_reason] NVARCHAR(MAX) NULL,
  [semester] NVARCHAR(20) NOT NULL,
  [academic_year] VARCHAR(20) NOT NULL,
  [field] NVARCHAR(100) NULL,
  [max_students] INT DEFAULT 2,
  [current_students] INT DEFAULT 0,
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [updated_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [approved_at] DATETIME NULL,
  [approved_by] VARCHAR(36) NULL,
  [requirements] NVARCHAR(MAX) NULL,
  [expected_results] NVARCHAR(MAX) NULL,
  [proposed_by_type] VARCHAR(20) DEFAULT 'teacher' CHECK ([proposed_by_type] IN ('teacher','student')),
  [original_proposal_id] VARCHAR(36) NULL,
  [assigned_to_student_id] VARCHAR(36) NULL
);

CREATE TABLE [topic_proposals] (
  [id] VARCHAR(36) NOT NULL,
  [title] NVARCHAR(255) NOT NULL,
  [description] NVARCHAR(MAX) NULL,
  [requirements] NVARCHAR(MAX) NULL,
  [expected_results] NVARCHAR(MAX) NULL,
  [proposed_by_student_id] VARCHAR(36) NOT NULL,
  [requested_supervisor_id] VARCHAR(36) NOT NULL,
  [status] VARCHAR(30) DEFAULT 'pending' CHECK ([status] IN ('pending','approved','rejected','revision_requested')),
  [teacher_feedback] NVARCHAR(MAX) NULL,
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [reviewed_at] DATETIME NULL
);

CREATE TABLE [projects] (
  [id] VARCHAR(36) NOT NULL,
  [topic_id] VARCHAR(36) NOT NULL,
  [student_id] VARCHAR(36) NOT NULL,
  [supervisor_id] VARCHAR(36) NULL,
  [reviewer_id] VARCHAR(36) NULL,
  [status] VARCHAR(20) DEFAULT 'registered' CHECK ([status] IN ('registered','in_progress','submitted','graded','completed','failed')),
  [registration_date] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [start_date] DATE NULL,
  [end_date] DATE NULL,
  [defense_date] DATETIME NULL,
  [final_grade] DECIMAL(4,2) NULL,
  [notes] NVARCHAR(MAX) NULL,
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [updated_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [report_deadline] DATETIME NULL,
  [supervisor_score] DECIMAL(4,2) NULL,
  [reviewer_score] DECIMAL(4,2) NULL,
  [council_score] DECIMAL(4,2) NULL,
  [final_score] DECIMAL(4,2) NULL,
  [grade] VARCHAR(10) NULL,
  [archived_at] DATETIME NULL
);

CREATE TABLE [project_archive] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [project_id] VARCHAR(36) NOT NULL,
  [topic_title] NVARCHAR(500) NOT NULL,
  [topic_field] NVARCHAR(255) NULL,
  [student_name] NVARCHAR(255) NOT NULL,
  [student_code] VARCHAR(50) NULL,
  [class_name] NVARCHAR(50) NULL,
  [supervisor_name] NVARCHAR(255) NULL,
  [reviewer_name] NVARCHAR(255) NULL,
  [academic_year] VARCHAR(20) NOT NULL,
  [semester] NVARCHAR(20) NULL,
  [final_score] DECIMAL(5,2) NULL,
  [grade] VARCHAR(5) NULL,
  [status] VARCHAR(50) DEFAULT 'completed',
  [description] NVARCHAR(MAX) NULL,
  [document_url] NVARCHAR(500) NULL,
  [archived_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE [sprints] (
  [id] VARCHAR(36) NOT NULL,
  [project_id] VARCHAR(36) NOT NULL,
  [sprint_number] INT NOT NULL,
  [title] NVARCHAR(255) NOT NULL,
  [goals] NVARCHAR(MAX) NULL,
  [start_week] INT NOT NULL,
  [end_week] INT NOT NULL,
  [weight_percent] INT DEFAULT 0,
  [status] VARCHAR(20) DEFAULT 'not_started' CHECK ([status] IN ('not_started','in_progress','completed')),
  [actual_progress] INT DEFAULT 0,
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [updated_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE [progress_reports] (
  [id] VARCHAR(36) NOT NULL,
  [project_id] VARCHAR(36) NOT NULL,
  [report_title] NVARCHAR(200) NOT NULL,
  [week_number] INT NULL,
  [content] NVARCHAR(MAX) NOT NULL,
  [achievements] NVARCHAR(MAX) NULL,
  [difficulties] NVARCHAR(MAX) NULL,
  [next_steps] NVARCHAR(MAX) NULL,
  [file_path] NVARCHAR(500) NULL,
  [file_name] NVARCHAR(255) NULL,
  [file_size] BIGINT NULL,
  [status] VARCHAR(30) DEFAULT 'submitted' NOT NULL CHECK ([status] IN ('submitted','reviewed','approved','revision_needed')),
  [submitted_date] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [reviewed_date] DATETIME NULL,
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [updated_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE [comments] (
  [id] VARCHAR(36) NOT NULL,
  [report_id] VARCHAR(36) NOT NULL,
  [teacher_id] VARCHAR(36) NOT NULL,
  [content] NVARCHAR(MAX) NOT NULL,
  [rating] INT NULL,
  [comment_date] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [updated_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE [sprint_comments] (
  [id] VARCHAR(36) NOT NULL,
  [sprint_id] VARCHAR(36) NOT NULL,
  [project_id] VARCHAR(36) NOT NULL,
  [author_uid] VARCHAR(255) NOT NULL,
  [author_name] NVARCHAR(255) NOT NULL,
  [author_role] VARCHAR(20) DEFAULT 'teacher' NOT NULL CHECK ([author_role] IN ('teacher','student')),
  [content] NVARCHAR(MAX) NOT NULL,
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [updated_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE [meeting_slots] (
  [id] VARCHAR(36) NOT NULL,
  [teacher_id] VARCHAR(36) NOT NULL,
  [start_time] DATETIME NOT NULL,
  [end_time] DATETIME NOT NULL,
  [location] NVARCHAR(255) NULL,
  [max_students] INT DEFAULT 1,
  [is_booked] BIT DEFAULT 0,
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE [bookings] (
  [id] VARCHAR(36) NOT NULL,
  [slot_id] VARCHAR(36) NOT NULL,
  [student_id] VARCHAR(36) NOT NULL,
  [project_id] VARCHAR(36) NULL,
  [notes] NVARCHAR(MAX) NULL,
  [status] VARCHAR(20) DEFAULT 'pending' CHECK ([status] IN ('pending','confirmed','cancelled','completed')),
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  [updated_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE [notifications] (
  [id] VARCHAR(36) NOT NULL,
  [user_uid] VARCHAR(128) NOT NULL,
  [title] NVARCHAR(255) NOT NULL,
  [message] NVARCHAR(MAX) NOT NULL,
  [type] VARCHAR(20) DEFAULT 'info' CHECK ([type] IN ('info','success','warning','error','project','report','chat','system')),
  [link] NVARCHAR(500) NULL,
  [is_read] BIT DEFAULT 0,
  [created_at] DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==============================================================================
-- KHAI BÁO KHÓA CHÍNH (PRIMARY KEYS) & KHÓA ĐỘC NHẤT (UNIQUE)
-- ==============================================================================

ALTER TABLE [users] ADD CONSTRAINT PK_users PRIMARY KEY ([id]);
ALTER TABLE [users] ADD CONSTRAINT UQ_users_uid UNIQUE ([uid]);
ALTER TABLE [users] ADD CONSTRAINT UQ_users_email UNIQUE ([email]);

ALTER TABLE [admins] ADD CONSTRAINT PK_admins PRIMARY KEY ([id]);
ALTER TABLE [admins] ADD CONSTRAINT UQ_admins_user_id UNIQUE ([user_id]);
ALTER TABLE [admins] ADD CONSTRAINT UQ_admins_admin_id UNIQUE ([admin_id]);

ALTER TABLE [admin_permissions] ADD CONSTRAINT PK_admin_permissions PRIMARY KEY ([admin_id], [permission]);

ALTER TABLE [students] ADD CONSTRAINT PK_students PRIMARY KEY ([id]);
ALTER TABLE [students] ADD CONSTRAINT UQ_students_user_id UNIQUE ([user_id]);
ALTER TABLE [students] ADD CONSTRAINT UQ_students_student_id UNIQUE ([student_id]);

ALTER TABLE [teachers] ADD CONSTRAINT PK_teachers PRIMARY KEY ([id]);
ALTER TABLE [teachers] ADD CONSTRAINT UQ_teachers_user_id UNIQUE ([user_id]);
ALTER TABLE [teachers] ADD CONSTRAINT UQ_teachers_teacher_id UNIQUE ([teacher_id]);

ALTER TABLE [teacher_specializations] ADD CONSTRAINT PK_teacher_specializations PRIMARY KEY ([teacher_id], [specialization]);

ALTER TABLE [classes] ADD CONSTRAINT PK_classes PRIMARY KEY ([id]);
ALTER TABLE [classes] ADD CONSTRAINT UQ_classes_class_code UNIQUE ([class_code]);

ALTER TABLE [announcements] ADD CONSTRAINT PK_announcements PRIMARY KEY ([id]);

ALTER TABLE [topics] ADD CONSTRAINT PK_topics PRIMARY KEY ([id]);

ALTER TABLE [topic_proposals] ADD CONSTRAINT PK_topic_proposals PRIMARY KEY ([id]);

ALTER TABLE [projects] ADD CONSTRAINT PK_projects PRIMARY KEY ([id]);

ALTER TABLE [project_archive] ADD CONSTRAINT PK_project_archive PRIMARY KEY ([id]);

ALTER TABLE [sprints] ADD CONSTRAINT PK_sprints PRIMARY KEY ([id]);
ALTER TABLE [sprints] ADD CONSTRAINT UQ_sprints_project_sprint UNIQUE ([project_id], [sprint_number]);

ALTER TABLE [progress_reports] ADD CONSTRAINT PK_progress_reports PRIMARY KEY ([id]);

ALTER TABLE [comments] ADD CONSTRAINT PK_comments PRIMARY KEY ([id]);

ALTER TABLE [sprint_comments] ADD CONSTRAINT PK_sprint_comments PRIMARY KEY ([id]);

ALTER TABLE [meeting_slots] ADD CONSTRAINT PK_meeting_slots PRIMARY KEY ([id]);

ALTER TABLE [bookings] ADD CONSTRAINT PK_bookings PRIMARY KEY ([id]);

ALTER TABLE [notifications] ADD CONSTRAINT PK_notifications PRIMARY KEY ([id]);

-- ==============================================================================
-- KHAI BÁO KHÓA NGOẠI (FOREIGN KEYS)
-- ==============================================================================

ALTER TABLE [admins] ADD CONSTRAINT FK_admins_users FOREIGN KEY ([user_id]) REFERENCES [users]([id]) ON DELETE CASCADE;

ALTER TABLE [admin_permissions] ADD CONSTRAINT FK_admin_permissions_admins FOREIGN KEY ([admin_id]) REFERENCES [admins]([id]) ON DELETE CASCADE;

ALTER TABLE [students] ADD CONSTRAINT FK_students_users FOREIGN KEY ([user_id]) REFERENCES [users]([id]) ON DELETE CASCADE;

ALTER TABLE [teachers] ADD CONSTRAINT FK_teachers_users FOREIGN KEY ([user_id]) REFERENCES [users]([id]) ON DELETE CASCADE;

ALTER TABLE [teacher_specializations] ADD CONSTRAINT FK_teacher_specializations_teachers FOREIGN KEY ([teacher_id]) REFERENCES [teachers]([id]) ON DELETE CASCADE;

ALTER TABLE [classes] ADD CONSTRAINT FK_classes_advisor FOREIGN KEY ([advisor_teacher_id]) REFERENCES [users]([id]) ON DELETE NO ACTION;

ALTER TABLE [topics] ADD CONSTRAINT FK_topics_supervisor FOREIGN KEY ([supervisor_id]) REFERENCES [users]([id]) ON DELETE CASCADE;
ALTER TABLE [topics] ADD CONSTRAINT FK_topics_reviewer FOREIGN KEY ([reviewer_id]) REFERENCES [users]([id]) ON DELETE NO ACTION;

ALTER TABLE [topic_proposals] ADD CONSTRAINT FK_topic_proposals_student FOREIGN KEY ([proposed_by_student_id]) REFERENCES [students]([id]) ON DELETE CASCADE;
ALTER TABLE [topic_proposals] ADD CONSTRAINT FK_topic_proposals_supervisor FOREIGN KEY ([requested_supervisor_id]) REFERENCES [teachers]([id]) ON DELETE NO ACTION;

ALTER TABLE [projects] ADD CONSTRAINT FK_projects_topic FOREIGN KEY ([topic_id]) REFERENCES [topics]([id]) ON DELETE CASCADE;
ALTER TABLE [projects] ADD CONSTRAINT FK_projects_student FOREIGN KEY ([student_id]) REFERENCES [students]([id]) ON DELETE NO ACTION;
ALTER TABLE [projects] ADD CONSTRAINT FK_projects_supervisor FOREIGN KEY ([supervisor_id]) REFERENCES [teachers]([id]) ON DELETE NO ACTION;
ALTER TABLE [projects] ADD CONSTRAINT FK_projects_reviewer FOREIGN KEY ([reviewer_id]) REFERENCES [teachers]([id]) ON DELETE NO ACTION;

ALTER TABLE [progress_reports] ADD CONSTRAINT FK_progress_reports_project FOREIGN KEY ([project_id]) REFERENCES [projects]([id]) ON DELETE CASCADE;

ALTER TABLE [comments] ADD CONSTRAINT FK_comments_report FOREIGN KEY ([report_id]) REFERENCES [progress_reports]([id]) ON DELETE CASCADE;
ALTER TABLE [comments] ADD CONSTRAINT FK_comments_teacher FOREIGN KEY ([teacher_id]) REFERENCES [teachers]([id]) ON DELETE NO ACTION;

ALTER TABLE [meeting_slots] ADD CONSTRAINT FK_slots_teacher FOREIGN KEY ([teacher_id]) REFERENCES [teachers]([id]) ON DELETE CASCADE;

ALTER TABLE [bookings] ADD CONSTRAINT FK_bookings_slot FOREIGN KEY ([slot_id]) REFERENCES [meeting_slots]([id]) ON DELETE CASCADE;
ALTER TABLE [bookings] ADD CONSTRAINT FK_bookings_student FOREIGN KEY ([student_id]) REFERENCES [students]([id]) ON DELETE NO ACTION;
ALTER TABLE [bookings] ADD CONSTRAINT FK_bookings_project FOREIGN KEY ([project_id]) REFERENCES [projects]([id]) ON DELETE NO ACTION;

ALTER TABLE [sprints] ADD CONSTRAINT FK_sprints_project FOREIGN KEY ([project_id]) REFERENCES [projects]([id]) ON DELETE CASCADE;

ALTER TABLE [sprint_comments] ADD CONSTRAINT FK_sprint_comments_sprint FOREIGN KEY ([sprint_id]) REFERENCES [sprints]([id]) ON DELETE CASCADE;
ALTER TABLE [sprint_comments] ADD CONSTRAINT FK_sprint_comments_project FOREIGN KEY ([project_id]) REFERENCES [projects]([id]) ON DELETE NO ACTION;

ALTER TABLE [notifications] ADD CONSTRAINT FK_notifications_user FOREIGN KEY ([user_uid]) REFERENCES [users]([uid]) ON DELETE CASCADE;