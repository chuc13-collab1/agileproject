-- =====================================================
-- Agile Project Management - SQL Server (T-SQL)
-- =====================================================

CREATE DATABASE agile_project_management;
GO

USE agile_project_management;
GO

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE users (
    id          VARCHAR(36)     NOT NULL,
    uid         VARCHAR(128)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    display_name VARCHAR(255)   NOT NULL,
    phone       VARCHAR(20)     NULL,
    photo_url   VARCHAR(MAX)    NULL,
    role        VARCHAR(10)     NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    is_active   BIT             NOT NULL DEFAULT 1,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_users         PRIMARY KEY (id),
    CONSTRAINT UQ_users_uid     UNIQUE (uid),
    CONSTRAINT UQ_users_email   UNIQUE (email)
);
GO

-- =====================================================
-- TABLE: students
-- =====================================================
CREATE TABLE students (
    id              VARCHAR(36)     NOT NULL,
    user_id         VARCHAR(36)     NOT NULL,
    student_id      VARCHAR(50)     NOT NULL,
    class_name      VARCHAR(100)    NULL,
    major           VARCHAR(200)    NULL,
    academic_year   VARCHAR(20)     NULL,
    CONSTRAINT PK_students              PRIMARY KEY (id),
    CONSTRAINT UQ_students_user_id      UNIQUE (user_id),
    CONSTRAINT UQ_students_student_id   UNIQUE (student_id),
    CONSTRAINT FK_students_users        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

-- =====================================================
-- TABLE: teachers
-- =====================================================
CREATE TABLE teachers (
    id                  VARCHAR(36)     NOT NULL,
    user_id             VARCHAR(36)     NOT NULL,
    teacher_id          VARCHAR(50)     NOT NULL,
    department          VARCHAR(200)    NULL,
    max_students        INT             NOT NULL DEFAULT 5,
    current_students    INT             NOT NULL DEFAULT 0,
    can_supervise       BIT             NOT NULL DEFAULT 1,
    can_review          BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_teachers              PRIMARY KEY (id),
    CONSTRAINT UQ_teachers_user_id      UNIQUE (user_id),
    CONSTRAINT UQ_teachers_teacher_id   UNIQUE (teacher_id),
    CONSTRAINT FK_teachers_users        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

-- =====================================================
-- TABLE: admins
-- =====================================================
CREATE TABLE admins (
    id          VARCHAR(36)     NOT NULL,
    user_id     VARCHAR(36)     NOT NULL,
    admin_id    VARCHAR(50)     NOT NULL,
    CONSTRAINT PK_admins            PRIMARY KEY (id),
    CONSTRAINT UQ_admins_user_id    UNIQUE (user_id),
    CONSTRAINT UQ_admins_admin_id   UNIQUE (admin_id),
    CONSTRAINT FK_admins_users      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

-- =====================================================
-- TABLE: admin_permissions
-- =====================================================
CREATE TABLE admin_permissions (
    admin_id    VARCHAR(36)     NOT NULL,
    permission  VARCHAR(30)     NOT NULL CHECK (permission IN (
                    'manage_users', 'manage_projects', 'manage_topics',
                    'manage_grades', 'manage_system', 'view_reports')),
    CONSTRAINT PK_admin_permissions         PRIMARY KEY (admin_id, permission),
    CONSTRAINT FK_admin_permissions_admins  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);
GO

-- =====================================================
-- TABLE: teacher_specializations
-- =====================================================
CREATE TABLE teacher_specializations (
    teacher_id      VARCHAR(36)     NOT NULL,
    specialization  VARCHAR(100)    NOT NULL,
    CONSTRAINT PK_teacher_specs         PRIMARY KEY (teacher_id, specialization),
    CONSTRAINT FK_teacher_specs_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);
GO

-- =====================================================
-- TABLE: classes
-- =====================================================
CREATE TABLE classes (
    id                  CHAR(36)        NOT NULL,
    class_code          VARCHAR(20)     NOT NULL,
    class_name          VARCHAR(100)    NULL,
    academic_year       VARCHAR(20)     NOT NULL,
    advisor_teacher_id  VARCHAR(36)     NULL,
    max_students        INT             NOT NULL DEFAULT 40,
    major               VARCHAR(100)    NULL,
    description         VARCHAR(MAX)    NULL,
    is_active           BIT             NOT NULL DEFAULT 1,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_classes               PRIMARY KEY (id),
    CONSTRAINT UQ_classes_code          UNIQUE (class_code),
    CONSTRAINT FK_classes_advisor       FOREIGN KEY (advisor_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);
GO

-- =====================================================
-- TABLE: topics
-- =====================================================
CREATE TABLE topics (
    id                      VARCHAR(36)     NOT NULL,
    title                   VARCHAR(255)    NOT NULL,
    description             VARCHAR(MAX)    NULL,
    supervisor_id           VARCHAR(36)     NULL,
    reviewer_id             VARCHAR(36)     NULL,
    status                  VARCHAR(10)     NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason        VARCHAR(MAX)    NULL,
    semester                VARCHAR(20)     NOT NULL,
    academic_year           VARCHAR(20)     NOT NULL,
    field                   VARCHAR(100)    NULL,
    max_students            INT             NOT NULL DEFAULT 2,
    current_students        INT             NOT NULL DEFAULT 0,
    requirements            VARCHAR(MAX)    NULL,
    expected_results        VARCHAR(MAX)    NULL,
    proposed_by_type        VARCHAR(10)     NOT NULL DEFAULT 'teacher'
                                CHECK (proposed_by_type IN ('teacher', 'student')),
    original_proposal_id    VARCHAR(36)     NULL,
    assigned_to_student_id  VARCHAR(36)     NULL,
    approved_at             DATETIME2       NULL,
    approved_by             VARCHAR(36)     NULL,
    created_at              DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at              DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_topics                PRIMARY KEY (id),
    CONSTRAINT FK_topics_supervisor     FOREIGN KEY (supervisor_id) REFERENCES users(id),
    CONSTRAINT FK_topics_reviewer       FOREIGN KEY (reviewer_id)   REFERENCES users(id)
);
GO

-- =====================================================
-- TABLE: topic_proposals
-- =====================================================
CREATE TABLE topic_proposals (
    id                      VARCHAR(36)     NOT NULL,
    title                   VARCHAR(255)    NOT NULL,
    description             VARCHAR(MAX)    NULL,
    requirements            VARCHAR(MAX)    NULL,
    expected_results        VARCHAR(MAX)    NULL,
    proposed_by_student_id  VARCHAR(36)     NOT NULL,
    requested_supervisor_id VARCHAR(36)     NOT NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
    teacher_feedback        VARCHAR(MAX)    NULL,
    created_at              DATETIME2       NOT NULL DEFAULT GETDATE(),
    reviewed_at             DATETIME2       NULL,
    CONSTRAINT PK_topic_proposals           PRIMARY KEY (id),
    CONSTRAINT FK_proposals_student         FOREIGN KEY (proposed_by_student_id)  REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT FK_proposals_supervisor      FOREIGN KEY (requested_supervisor_id) REFERENCES teachers(id) ON DELETE NO ACTION
);
GO

-- =====================================================
-- TABLE: projects
-- =====================================================
CREATE TABLE projects (
    id                  VARCHAR(36)     NOT NULL,
    topic_id            VARCHAR(36)     NOT NULL,
    student_id          VARCHAR(36)     NOT NULL,
    supervisor_id       VARCHAR(36)     NULL,
    reviewer_id         VARCHAR(36)     NULL,
    status              VARCHAR(15)     NOT NULL DEFAULT 'registered'
                            CHECK (status IN ('registered','in_progress','submitted','graded','completed','failed')),
    registration_date   DATETIME2       NOT NULL DEFAULT GETDATE(),
    start_date          DATE            NULL,
    end_date            DATE            NULL,
    defense_date        DATETIME2       NULL,
    report_deadline     DATETIME2       NULL,
    supervisor_score    DECIMAL(4,2)    NULL,
    reviewer_score      DECIMAL(4,2)    NULL,
    council_score       DECIMAL(4,2)    NULL,
    final_score         DECIMAL(4,2)    NULL,
    grade               VARCHAR(10)     NULL,
    notes               VARCHAR(MAX)    NULL,
    archived_at         DATETIME2       NULL,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_projects              PRIMARY KEY (id),
    CONSTRAINT FK_projects_topic        FOREIGN KEY (topic_id)      REFERENCES topics(id)   ON DELETE CASCADE,
    CONSTRAINT FK_projects_student      FOREIGN KEY (student_id)    REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT FK_projects_supervisor   FOREIGN KEY (supervisor_id) REFERENCES teachers(id),
    CONSTRAINT FK_projects_reviewer     FOREIGN KEY (reviewer_id)   REFERENCES teachers(id)
);
GO

-- =====================================================
-- TABLE: project_archive
-- =====================================================
CREATE TABLE project_archive (
    id              INT             NOT NULL IDENTITY(1,1),
    project_id      VARCHAR(36)     NOT NULL,
    topic_title     VARCHAR(500)    NOT NULL,
    topic_field     VARCHAR(255)    NULL,
    student_name    VARCHAR(255)    NOT NULL,
    student_code    VARCHAR(50)     NULL,
    class_name      VARCHAR(50)     NULL,
    supervisor_name VARCHAR(255)    NULL,
    reviewer_name   VARCHAR(255)    NULL,
    academic_year   VARCHAR(20)     NOT NULL,
    semester        VARCHAR(20)     NULL,
    final_score     DECIMAL(5,2)    NULL,
    grade           VARCHAR(5)      NULL,
    status          VARCHAR(50)     NOT NULL DEFAULT 'completed',
    description     VARCHAR(MAX)    NULL,
    document_url    VARCHAR(500)    NULL,
    archived_at     DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_project_archive   PRIMARY KEY (id)
);
GO

-- =====================================================
-- TABLE: sprints
-- =====================================================
CREATE TABLE sprints (
    id              VARCHAR(36)     NOT NULL,
    project_id      VARCHAR(36)     NOT NULL,
    sprint_number   INT             NOT NULL,
    title           VARCHAR(255)    NOT NULL,
    goals           VARCHAR(MAX)    NULL,
    start_week      INT             NOT NULL,
    end_week        INT             NOT NULL,
    weight_percent  INT             NOT NULL DEFAULT 0,
    status          VARCHAR(15)     NOT NULL DEFAULT 'not_started'
                        CHECK (status IN ('not_started', 'in_progress', 'completed')),
    actual_progress INT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_sprints               PRIMARY KEY (id),
    CONSTRAINT UQ_sprints_number        UNIQUE (project_id, sprint_number),
    CONSTRAINT FK_sprints_project       FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
GO

-- =====================================================
-- TABLE: sprint_comments
-- =====================================================
CREATE TABLE sprint_comments (
    id          VARCHAR(36)     NOT NULL,
    sprint_id   VARCHAR(36)     NOT NULL,
    project_id  VARCHAR(36)     NOT NULL,
    author_uid  VARCHAR(255)    NOT NULL,
    author_name VARCHAR(255)    NOT NULL,
    author_role VARCHAR(10)     NOT NULL DEFAULT 'teacher'
                    CHECK (author_role IN ('teacher', 'student')),
    content     VARCHAR(MAX)    NOT NULL,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_sprint_comments           PRIMARY KEY (id),
    CONSTRAINT FK_sprint_comments_sprint    FOREIGN KEY (sprint_id)   REFERENCES sprints(id)  ON DELETE CASCADE,
    CONSTRAINT FK_sprint_comments_project   FOREIGN KEY (project_id)  REFERENCES projects(id)
);
GO

-- =====================================================
-- TABLE: progress_reports
-- =====================================================
CREATE TABLE progress_reports (
    id              VARCHAR(36)     NOT NULL,
    project_id      VARCHAR(36)     NOT NULL,
    report_title    VARCHAR(200)    NOT NULL,
    week_number     INT             NULL,
    content         VARCHAR(MAX)    NOT NULL,
    achievements    VARCHAR(MAX)    NULL,
    difficulties    VARCHAR(MAX)    NULL,
    next_steps      VARCHAR(MAX)    NULL,
    file_path       VARCHAR(500)    NULL,
    file_name       VARCHAR(255)    NULL,
    file_size       BIGINT          NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'submitted'
                        CHECK (status IN ('submitted', 'reviewed', 'approved', 'revision_needed')),
    submitted_date  DATETIME2       NOT NULL DEFAULT GETDATE(),
    reviewed_date   DATETIME2       NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_progress_reports      PRIMARY KEY (id),
    CONSTRAINT FK_reports_project       FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
GO

-- =====================================================
-- TABLE: comments
-- =====================================================
CREATE TABLE comments (
    id              VARCHAR(36)     NOT NULL,
    report_id       VARCHAR(36)     NOT NULL,
    teacher_id      VARCHAR(36)     NOT NULL,
    content         VARCHAR(MAX)    NOT NULL,
    rating          INT             NULL CHECK (rating BETWEEN 1 AND 5),
    comment_date    DATETIME2       NOT NULL DEFAULT GETDATE(),
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_comments              PRIMARY KEY (id),
    CONSTRAINT FK_comments_report       FOREIGN KEY (report_id)  REFERENCES progress_reports(id) ON DELETE CASCADE,
    CONSTRAINT FK_comments_teacher      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);
GO

-- =====================================================
-- TABLE: announcements
-- =====================================================
CREATE TABLE announcements (
    id                  VARCHAR(36)     NOT NULL,
    title               VARCHAR(255)    NOT NULL,
    content             VARCHAR(MAX)    NOT NULL,
    semester            VARCHAR(20)     NOT NULL,
    academic_year       VARCHAR(20)     NOT NULL,
    registration_start  DATETIME2       NOT NULL,
    registration_end    DATETIME2       NOT NULL,
    proposal_deadline   DATETIME2       NULL,
    status              VARCHAR(10)     NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'published', 'closed')),
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_announcements         PRIMARY KEY (id)
);
GO

-- =====================================================
-- TABLE: meeting_slots
-- =====================================================
CREATE TABLE meeting_slots (
    id              VARCHAR(36)     NOT NULL,
    teacher_id      VARCHAR(36)     NOT NULL,
    start_time      DATETIME2       NOT NULL,
    end_time        DATETIME2       NOT NULL,
    location        VARCHAR(255)    NULL,
    max_students    INT             NOT NULL DEFAULT 1,
    is_booked       BIT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_meeting_slots         PRIMARY KEY (id),
    CONSTRAINT FK_slots_teacher         FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);
GO

-- =====================================================
-- TABLE: bookings
-- =====================================================
CREATE TABLE bookings (
    id          VARCHAR(36)     NOT NULL,
    slot_id     VARCHAR(36)     NOT NULL,
    student_id  VARCHAR(36)     NOT NULL,
    project_id  VARCHAR(36)     NULL,
    notes       VARCHAR(MAX)    NULL,
    status      VARCHAR(10)     NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_bookings              PRIMARY KEY (id),
    CONSTRAINT FK_bookings_slot         FOREIGN KEY (slot_id)    REFERENCES meeting_slots(id) ON DELETE CASCADE,
    CONSTRAINT FK_bookings_student      FOREIGN KEY (student_id) REFERENCES students(id)      ON DELETE NO ACTION,
    CONSTRAINT FK_bookings_project      FOREIGN KEY (project_id) REFERENCES projects(id)      ON DELETE SET NULL
);
GO

-- =====================================================
-- TABLE: notifications
-- =====================================================
CREATE TABLE notifications (
    id          VARCHAR(36)     NOT NULL,
    user_uid    VARCHAR(128)    NOT NULL,
    title       VARCHAR(255)    NOT NULL,
    message     VARCHAR(MAX)    NOT NULL,
    type        VARCHAR(10)     NOT NULL DEFAULT 'info'
                    CHECK (type IN ('info','success','warning','error','project','report','chat','system')),
    link        VARCHAR(500)    NULL,
    is_read     BIT             NOT NULL DEFAULT 0,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_notifications         PRIMARY KEY (id)
);
GO

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IX_users_role        ON users(role);
CREATE INDEX IX_users_uid         ON users(uid);

CREATE INDEX IX_students_class    ON students(class_name);
CREATE INDEX IX_students_year     ON students(academic_year);

CREATE INDEX IX_teachers_dept     ON teachers(department);

CREATE INDEX IX_topics_status     ON topics(status);
CREATE INDEX IX_topics_semester   ON topics(semester, academic_year);

CREATE INDEX IX_projects_status   ON projects(status);
CREATE INDEX IX_projects_student  ON projects(student_id);
CREATE INDEX IX_projects_archived ON projects(archived_at);

CREATE INDEX IX_reports_project   ON progress_reports(project_id);
CREATE INDEX IX_reports_status    ON progress_reports(status);
CREATE INDEX IX_reports_week      ON progress_reports(week_number);

CREATE INDEX IX_notif_uid         ON notifications(user_uid);
CREATE INDEX IX_notif_read        ON notifications(is_read);
GO
