# Sơ Đồ Cơ Sở Dữ Liệu - Hệ Thống Quản Lý Đồ Án

## Entities (Các Thực Thể)

### 1. User (Người Dùng)
```sql
User {
  user_id: INT PRIMARY KEY AUTO_INCREMENT
  username: VARCHAR(50) UNIQUE NOT NULL
  password_hash: VARCHAR(255) NOT NULL
  email: VARCHAR(100) UNIQUE NOT NULL
  full_name: NVARCHAR(100) NOT NULL
  phone: VARCHAR(20)
  role: ENUM('admin', 'student', 'teacher') NOT NULL
  created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  is_active: BOOLEAN DEFAULT TRUE
}
```

### 2. Student (Sinh Viên)
```sql
Student {
  student_id: INT PRIMARY KEY AUTO_INCREMENT
  user_id: INT UNIQUE NOT NULL
  student_code: VARCHAR(20) UNIQUE NOT NULL
  class_name: VARCHAR(50)
  major: NVARCHAR(100)
  academic_year: VARCHAR(20)
  gpa: DECIMAL(3,2)
  FOREIGN KEY (user_id) REFERENCES User(user_id)
}
```

### 3. Teacher (Giáo Viên)
```sql
Teacher {
  teacher_id: INT PRIMARY KEY AUTO_INCREMENT
  user_id: INT UNIQUE NOT NULL
  teacher_code: VARCHAR(20) UNIQUE NOT NULL
  department: NVARCHAR(100)
  degree: NVARCHAR(50)
  specialization: NVARCHAR(200)
  max_students: INT DEFAULT 5
  FOREIGN KEY (user_id) REFERENCES User(user_id)
}
```

### 4. Announcement (Thông Báo Đồ Án)
```sql
Announcement {
  announcement_id: INT PRIMARY KEY AUTO_INCREMENT
  title: NVARCHAR(200) NOT NULL
  content: TEXT NOT NULL
  semester: VARCHAR(20) NOT NULL
  academic_year: VARCHAR(20) NOT NULL
  registration_start: DATE NOT NULL
  registration_end: DATE NOT NULL
  report_deadline: DATE
  defense_date: DATE
  created_by: INT NOT NULL
  created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  status: ENUM('draft', 'published', 'closed') DEFAULT 'draft'
  FOREIGN KEY (created_by) REFERENCES User(user_id)
}
```

### 5. Topic (Đề Tài)
```sql
Topic {
  topic_id: INT PRIMARY KEY AUTO_INCREMENT
  topic_code: VARCHAR(20) UNIQUE NOT NULL
  topic_name: NVARCHAR(255) NOT NULL
  description: TEXT
  requirements: TEXT
  max_students: INT DEFAULT 1
  category: NVARCHAR(100)
  proposed_by: INT NOT NULL
  announcement_id: INT NOT NULL
  status: ENUM('pending', 'approved', 'rejected', 'assigned') DEFAULT 'pending'
  approved_by: INT
  approved_at: TIMESTAMP
  created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  FOREIGN KEY (proposed_by) REFERENCES Teacher(teacher_id)
  FOREIGN KEY (announcement_id) REFERENCES Announcement(announcement_id)
  FOREIGN KEY (approved_by) REFERENCES User(user_id)
}
```

### 6. Project (Đồ Án)
```sql
Project {
  project_id: INT PRIMARY KEY AUTO_INCREMENT
  topic_id: INT NOT NULL
  group_name: NVARCHAR(100) -- Tên nhóm (nếu có)
  supervisor_id: INT NOT NULL
  reviewer_id: INT
  council_id: INT -- Phân vào hội đồng nào
  registration_date: DATE NOT NULL
  status: ENUM('registered', 'in_progress', 'submitted', 'reviewed', 'completed', 'failed') DEFAULT 'registered'
  supervisor_score: DECIMAL(4,2)
  reviewer_score: DECIMAL(4,2)
  council_score: DECIMAL(4,2) -- Điểm trung bình hội đồng
  final_score: DECIMAL(4,2)
  grade: VARCHAR(2)
  defense_date: DATE
  notes: TEXT
  FOREIGN KEY (topic_id) REFERENCES Topic(topic_id)
  FOREIGN KEY (supervisor_id) REFERENCES Teacher(teacher_id)
  FOREIGN KEY (reviewer_id) REFERENCES Teacher(teacher_id)
  FOREIGN KEY (council_id) REFERENCES Council(council_id)
}
```

### 6.1 Project_Member (Thành viên đồ án)
```sql
Project_Member {
  project_id: INT NOT NULL
  student_id: INT NOT NULL
  role: ENUM('leader', 'member') DEFAULT 'member'
  PRIMARY KEY (project_id, student_id)
  FOREIGN KEY (project_id) REFERENCES Project(project_id)
  FOREIGN KEY (student_id) REFERENCES Student(student_id)
}
```

### 7. Progress_Report (Báo Cáo Tiến Độ)
```sql
Progress_Report {
  report_id: INT PRIMARY KEY AUTO_INCREMENT
  project_id: INT NOT NULL
  report_title: NVARCHAR(200) NOT NULL
  content: TEXT NOT NULL
  file_path: VARCHAR(500)
  submitted_date: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  week_number: INT
  status: ENUM('submitted', 'reviewed', 'approved', 'revision_needed') DEFAULT 'submitted'
  FOREIGN KEY (project_id) REFERENCES Project(project_id)
}
```

### 8. Comment (Nhận Xét)
```sql
Comment {
  comment_id: INT PRIMARY KEY AUTO_INCREMENT
  report_id: INT NOT NULL
  teacher_id: INT NOT NULL
  content: TEXT NOT NULL
  comment_date: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  rating: INT CHECK (rating >= 1 AND rating <= 5)
  FOREIGN KEY (report_id) REFERENCES Progress_Report(report_id)
  FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id)
}
```

### 9. Document (Tài Liệu)
```sql
Document {
  document_id: INT PRIMARY KEY AUTO_INCREMENT
  project_id: INT NOT NULL
  document_type: ENUM('proposal', 'report', 'presentation', 'source_code', 'other') NOT NULL
  file_name: NVARCHAR(255) NOT NULL
  file_path: VARCHAR(500) NOT NULL
  file_size: BIGINT
  version: INT DEFAULT 1 -- Phiên bản tài liệu
  uploaded_by: INT NOT NULL
  uploaded_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  description: TEXT
  FOREIGN KEY (project_id) REFERENCES Project(project_id)
  FOREIGN KEY (uploaded_by) REFERENCES User(user_id)
}
```

### 10. Council (Hội Đồng Bảo Vệ)
```sql
Council {
  council_id: INT PRIMARY KEY AUTO_INCREMENT
  council_name: NVARCHAR(100) NOT NULL
  location: NVARCHAR(100)
  defense_date: DATE
  semester: VARCHAR(20)
  academic_year: VARCHAR(20)
  status: ENUM('draft', 'official', 'closed') DEFAULT 'draft'
}
```

### 10.1 Council_Member (Thành viên Hội đồng)
```sql
Council_Member {
  council_id: INT NOT NULL
  teacher_id: INT NOT NULL
  position: ENUM('chairman', 'secretary', 'member') NOT NULL
  PRIMARY KEY (council_id, teacher_id)
  FOREIGN KEY (council_id) REFERENCES Council(council_id)
  FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id)
}
```

### 10. Evaluation (Đánh Giá)
```sql
Evaluation {
  evaluation_id: INT PRIMARY KEY AUTO_INCREMENT
  project_id: INT NOT NULL
  evaluator_id: INT NOT NULL
  evaluator_type: ENUM('supervisor', 'reviewer', 'council') NOT NULL
  criteria_score: JSON
  total_score: DECIMAL(4,2) NOT NULL
  comments: TEXT
  evaluation_date: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  FOREIGN KEY (project_id) REFERENCES Project(project_id)
  FOREIGN KEY (evaluator_id) REFERENCES Teacher(teacher_id)
}
```

### 11. Notification (Thông Báo Hệ Thống)
```sql
Notification {
  notification_id: INT PRIMARY KEY AUTO_INCREMENT
  user_id: INT NOT NULL
  title: NVARCHAR(200) NOT NULL
  message: TEXT NOT NULL
  notification_type: ENUM('announcement', 'comment', 'score', 'assignment', 'reminder') NOT NULL
  is_read: BOOLEAN DEFAULT FALSE
  created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  reference_id: INT
  reference_type: VARCHAR(50)
  FOREIGN KEY (user_id) REFERENCES User(user_id)
}
```

## Relationships (Mối Quan Hệ)

### One-to-One
- User (1) --- (1) Student
- User (1) --- (1) Teacher

### One-to-Many
- Announcement (1) --- (N) Topic
- Topic (1) --- (N) Project
- Student (1) --- (N) Project
- Teacher (1) --- (N) Project (as supervisor)
- Teacher (1) --- (N) Project (as reviewer)
- Teacher (1) --- (N) Topic
- Project (1) --- (N) Progress_Report
- Project (1) --- (N) Document
- Project (1) --- (N) Evaluation
- Progress_Report (1) --- (N) Comment
- User (1) --- (N) Notification

## Indexes (Chỉ Mục)

```sql
-- User indexes
CREATE INDEX idx_user_role ON User(role);
CREATE INDEX idx_user_email ON User(email);

-- Student indexes
CREATE INDEX idx_student_code ON Student(student_code);
CREATE INDEX idx_student_class ON Student(class_name);

-- Teacher indexes
CREATE INDEX idx_teacher_code ON Teacher(teacher_code);
CREATE INDEX idx_teacher_department ON Teacher(department);

-- Topic indexes
CREATE INDEX idx_topic_status ON Topic(status);
CREATE INDEX idx_topic_announcement ON Topic(announcement_id);

-- Project indexes
CREATE INDEX idx_project_status ON Project(status);
CREATE INDEX idx_project_student ON Project(student_id);
CREATE INDEX idx_project_supervisor ON Project(supervisor_id);
CREATE INDEX idx_project_reviewer ON Project(reviewer_id);

-- Progress Report indexes
CREATE INDEX idx_report_project ON Progress_Report(project_id);
CREATE INDEX idx_report_status ON Progress_Report(status);

-- Notification indexes
CREATE INDEX idx_notification_user ON Notification(user_id);
CREATE INDEX idx_notification_read ON Notification(is_read);
```

## Business Rules (Quy Tắc Nghiệp Vụ)

1. Một sinh viên chỉ được đăng ký 1 đồ án trong 1 kỳ
2. Một giáo viên hướng dẫn tối đa N sinh viên (max_students)
3. Giáo viên phản biện không được là giáo viên hướng dẫn của đồ án đó
4. Đề tài phải được phê duyệt trước khi sinh viên có thể đăng ký
5. Sinh viên chỉ được đăng ký trong thời gian cho phép (registration_start -> registration_end)
6. Điểm cuối cùng = (supervisor_score * 0.7 + reviewer_score * 0.3)
