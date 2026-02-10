# Firebase Firestore Database Design - Chi Tiết

## 🎯 Giải Thích Thiết Kế Database

### So Sánh với SQL

| SQL | Firestore | Ghi Chú |
|-----|-----------|---------|
| Database | Project | |
| Table | Collection | Top-level hoặc subcollection |
| Row | Document | JSON-like document |
| Column | Field | Key-value pairs |
| JOIN | Denormalization/References | Không có JOIN native |
| Transaction | Transaction/Batch | Có hỗ trợ |
| Index | Composite Index | Cần define trước |

---

## 📊 Collections Chi Tiết

### 1. USERS Collection

```typescript
// Path: /users/{userId}

interface User {
  uid: string;                    // Từ Firebase Auth
  email: string;                  // unique
  fullName: string;
  phone?: string;
  role: 'admin' | 'student' | 'teacher';
  isActive: boolean;
  avatar?: string;                // URL to Storage
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  uid: "abc123",
  email: "student@example.com",
  fullName: "Nguyen Van A",
  phone: "0123456789",
  role: "student",
  isActive: true,
  avatar: "https://storage.../avatars/abc123.jpg",
  createdAt: Timestamp(2024-01-15),
  updatedAt: Timestamp(2024-01-20)
}
```

**Indexes:**
```
- Single field: email (automatically indexed)
- Single field: role
- Composite: (role, isActive)
```

**Queries Thường Dùng:**
```typescript
// Get user by email
db.collection('users').where('email', '==', email).get()

// Get all active teachers
db.collection('users')
  .where('role', '==', 'teacher')
  .where('isActive', '==', true)
  .get()
```

---

### 2. STUDENTS Collection

```typescript
// Path: /students/{studentId}

interface Student {
  studentId: string;              // Auto-generated
  userId: string;                 // Reference to users/{userId}
  studentCode: string;            // unique (e.g., "SV001")
  className: string;
  major: string;
  academicYear: string;           // e.g., "2023-2024"
  gpa?: number;
  createdAt: Timestamp;
}

// Example Document
{
  studentId: "student_001",
  userId: "abc123",
  studentCode: "B20DCCN001",
  className: "D20CQCN01-B",
  major: "Computer Science",
  academicYear: "2020-2024",
  gpa: 3.45,
  createdAt: Timestamp(2024-01-15)
}
```

**Indexes:**
```
- Single field: userId (unique)
- Single field: studentCode (unique)
- Composite: (className, academicYear)
```

**Relationship:**
- One-to-One với Users (userId reference)
- One-to-Many với Projects

---

### 3. TEACHERS Collection

```typescript
// Path: /teachers/{teacherId}

interface Teacher {
  teacherId: string;
  userId: string;                 // Reference to users/{userId}
  teacherCode: string;            // unique (e.g., "GV001")
  department: string;
  degree: string;                 // "PhD", "Master", "Bachelor"
  specialization: string[];       // ["AI", "Web Development"]
  maxStudents: number;            // Default: 5
  currentStudents: number;        // Denormalized count
  createdAt: Timestamp;
}

// Example Document
{
  teacherId: "teacher_001",
  userId: "def456",
  teacherCode: "GV001",
  department: "Computer Science",
  degree: "PhD",
  specialization: ["Machine Learning", "Data Science"],
  maxStudents: 8,
  currentStudents: 3,
  createdAt: Timestamp(2024-01-15)
}
```

**Indexes:**
```
- Single field: userId (unique)
- Single field: teacherCode (unique)
- Composite: (department, specialization)
```

---

### 4. ANNOUNCEMENTS Collection

```typescript
// Path: /announcements/{announcementId}

interface Announcement {
  announcementId: string;
  title: string;
  content: string;                // HTML or Markdown
  semester: string;               // "1" or "2" or "summer"
  academicYear: string;           // "2024-2025"
  registrationStart: Timestamp;
  registrationEnd: Timestamp;
  reportDeadline: Timestamp;
  defenseDate?: Timestamp;
  createdBy: string;              // userId reference
  status: 'draft' | 'published' | 'closed';
  attachments?: string[];         // URLs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  announcementId: "announcement_001",
  title: "Thông báo đăng ký đồ án tốt nghiệp HK1 2024-2025",
  content: "<p>Sinh viên đăng ký từ ngày...</p>",
  semester: "1",
  academicYear: "2024-2025",
  registrationStart: Timestamp(2024-09-01),
  registrationEnd: Timestamp(2024-09-15),
  reportDeadline: Timestamp(2025-01-10),
  defenseDate: Timestamp(2025-01-25),
  createdBy: "admin_user_id",
  status: "published",
  createdAt: Timestamp(2024-08-20),
  updatedAt: Timestamp(2024-08-20)
}
```

**Indexes:**
```
- Composite: (academicYear, semester, status)
- Composite: (status, registrationStart DESC)
```

---

### 5. TOPICS Collection

```typescript
// Path: /topics/{topicId}

interface Topic {
  topicId: string;
  topicCode: string;              // unique (e.g., "DA001")
  topicName: string;
  description: string;
  requirements: string;
  expectedResults?: string;
  maxStudents: number;            // Usually 1-2
  category: string;               // "Web", "Mobile", "AI"
  tags?: string[];
  proposedBy: string;             // teacherId reference
  announcementId: string;         // announcement reference
  status: 'pending' | 'approved' | 'rejected' | 'assigned';
  approvedBy?: string;            // userId reference
  approvedAt?: Timestamp;
  rejectionReason?: string;
  registeredCount: number;        // Denormalized
  availableSlots: number;         // maxStudents - registeredCount
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  topicId: "topic_001",
  topicCode: "DA2024001",
  topicName: "Xây dựng hệ thống quản lý đồ án",
  description: "Phát triển web app quản lý...",
  requirements: "- Biết React, Node.js\n- Có kinh nghiệm Firebase",
  expectedResults: "Website hoàn chỉnh với đầy đủ chức năng",
  maxStudents: 1,
  category: "Web Development",
  tags: ["React", "Node.js", "Firebase"],
  proposedBy: "teacher_001",
  announcementId: "announcement_001",
  status: "approved",
  approvedBy: "admin_user_id",
  approvedAt: Timestamp(2024-09-02),
  registeredCount: 0,
  availableSlots: 1,
  createdAt: Timestamp(2024-08-25),
  updatedAt: Timestamp(2024-09-02)
}
```

**Indexes:**
```
- Single field: topicCode (unique)
- Composite: (announcementId, status)
- Composite: (status, category)
- Composite: (proposedBy, announcementId)
- Composite: (announcementId, availableSlots DESC)
```

---

### 6. PROJECTS Collection

```typescript
// Path: /projects/{projectId}

interface Project {
  projectId: string;
  topicId: string;                // topic reference
  groupName?: string;             // Optional group name
  
  // Members
  members: {
    studentId: string;
    studentName: string;
    studentCode: string;
    role: 'leader' | 'member';
  }[];

  supervisorId: string;           // teacher reference
  reviewerId?: string;            // teacher reference
  councilId?: string;             // council reference
  
  registrationDate: Timestamp;
  status: 'registered' | 'in_progress' | 'submitted' | 
          'reviewed' | 'completed' | 'failed';
  
  // Denormalized for quick access
  topicName: string;
  supervisorName: string;
  
  // Scoring
  supervisorScore?: number;       // 0-10
  reviewerScore?: number;         // 0-10
  councilScore?: number;          // Average from council members
  finalScore?: number;            // Calculated
  grade?: string;                 // A, B+, B, C+, C, D+, D, F
  
  // Dates
  defenseDate?: Timestamp;
  completedDate?: Timestamp;
  
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Example Document
{
  projectId: "project_001",
  topicId: "topic_001",
  studentId: "student_001",
  supervisorId: "teacher_001",
  reviewerId: "teacher_002",
  registrationDate: Timestamp(2024-09-10),
  status: "in_progress",
  
  topicName: "Xây dựng hệ thống quản lý đồ án",
  studentName: "Nguyen Van A",
  studentCode: "B20DCCN001",
  supervisorName: "TS. Tran Thi B",
  
  createdAt: Timestamp(2024-09-10),
  updatedAt: Timestamp(2024-10-15)
}
```

**Indexes:**
```
- Composite: (studentId, status)
- Composite: (supervisorId, status)
- Composite: (reviewerId, status)
- Composite: (status, registrationDate DESC)
- Composite: (topicId, studentId) - unique constraint
```

**Status Flow:**
```
registered → in_progress → submitted → reviewed → completed/failed
```

---

### 7. PROGRESS_REPORTS Collection + Subcollection

```typescript
// Path: /progressReports/{reportId}

interface ProgressReport {
  reportId: string;
  projectId: string;              // project reference
  reportTitle: string;
  content: string;
  fileUrl?: string;               // URL to Storage
  fileName?: string;
  submittedDate: Timestamp;
  weekNumber: number;
  status: 'submitted' | 'reviewed' | 'approved' | 'revision_needed';
  
  // Denormalized
  studentId: string;
  studentName: string;
  supervisorId: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Subcollection: /progressReports/{reportId}/comments/{commentId}
interface Comment {
  commentId: string;
  teacherId: string;              // teacher reference
  teacherName: string;            // Denormalized
  content: string;
  rating: number;                 // 1-5 stars
  createdAt: Timestamp;
}

// Example Document
{
  reportId: "report_001",
  projectId: "project_001",
  reportTitle: "Báo cáo tiến độ tuần 1",
  content: "Đã hoàn thành phân tích yêu cầu...",
  fileUrl: "https://storage.../reports/report_001.pdf",
  fileName: "bao_cao_tuan_1.pdf",
  submittedDate: Timestamp(2024-09-20),
  weekNumber: 1,
  status: "reviewed",
  studentId: "student_001",
  studentName: "Nguyen Van A",
  supervisorId: "teacher_001",
  createdAt: Timestamp(2024-09-20),
  updatedAt: Timestamp(2024-09-22)
}

// Example Comment Document
{
  commentId: "comment_001",
  teacherId: "teacher_001",
  teacherName: "TS. Tran Thi B",
  content: "Báo cáo tốt, cần bổ sung phần database design",
  rating: 4,
  createdAt: Timestamp(2024-09-22)
}
```

**Indexes:**
```
- Composite: (projectId, weekNumber)
- Composite: (projectId, status)
- Composite: (supervisorId, status)
```

---

### 8. DOCUMENTS Collection

```typescript
// Path: /documents/{documentId}

interface Document {
  documentId: string;
  projectId: string;              // project reference
  documentType: 'proposal' | 'report' | 'presentation' | 
                'source_code' | 'other';
  fileName: string;
  fileUrl: string;                // URL to Firebase Storage
  fileSize: number;               // bytes
  mimeType: string;
  uploadedBy: string;             // userId reference
  uploaderName: string;           // Denormalized
  description?: string;
  version: number;                // v1, v2, v3...
  uploadedAt: Timestamp;
}

// Example Document
{
  documentId: "doc_001",
  projectId: "project_001",
  documentType: "report",
  fileName: "bao_cao_cuoi_ky.pdf",
  fileUrl: "https://storage.../documents/doc_001.pdf",
  fileSize: 2048576,
  mimeType: "application/pdf",
  uploadedBy: "student_001",
  uploaderName: "Nguyen Van A",
  description: "Báo cáo cuối kỳ đầy đủ",
  version: 1,
  uploadedAt: Timestamp(2024-12-15)
}
```

**Indexes:**
```
- Composite: (projectId, documentType)
- Composite: (projectId, uploadedAt DESC)
```

---

### 9. EVALUATIONS Collection

```typescript
// Path: /evaluations/{evaluationId}

interface Evaluation {
  evaluationId: string;
  projectId: string;              // project reference
  evaluatorId: string;            // teacher reference
  evaluatorName: string;          // Denormalized
  evaluatorType: 'supervisor' | 'reviewer' | 'council';
  
  // Criteria scores (customizable)
  criteriaScores: {
    content: number;              // 0-10
    technique: number;            // 0-10
    presentation: number;         // 0-10
    defense?: number;             // 0-10
  };
  
  weights?: {
    content: number;              // 0.4
    technique: number;            // 0.3
    presentation: number;         // 0.2
    defense: number;              // 0.1
  };
  
  totalScore: number;             // Weighted average
  comments: string;
  strengths?: string;
  weaknesses?: string;
  suggestions?: string;
  
  evaluationDate: Timestamp;
  createdAt: Timestamp;
}

// Example Document
{
  evaluationId: "eval_001",
  projectId: "project_001",
  evaluatorId: "teacher_001",
  evaluatorName: "TS. Tran Thi B",
  evaluatorType: "supervisor",
  
  criteriaScores: {
    content: 8.5,
    technique: 8.0,
    presentation: 7.5,
    defense: 8.0
  },
  
  weights: {
    content: 0.4,
    technique: 0.3,
    presentation: 0.2,
    defense: 0.1
  },
  
  totalScore: 8.1,
  comments: "Sinh viên làm việc chăm chỉ, kết quả tốt",
  strengths: "Code chất lượng, UI/UX đẹp",
  weaknesses: "Thiếu unit tests",
  suggestions: "Nên bổ sung documentation",
  
  evaluationDate: Timestamp(2025-01-20),
  createdAt: Timestamp(2025-01-20)
}
```

---

### 10. NOTIFICATIONS Collection

```typescript
// Path: /notifications/{notificationId}

interface Notification {
  notificationId: string;
  userId: string;                 // recipient
  title: string;
  message: string;
  type: 'announcement' | 'comment' | 'score' | 
        'assignment' | 'reminder' | 'system';
  isRead: boolean;
  priority: 'low' | 'normal' | 'high';
  
  // Reference to related entity
  referenceId?: string;
  referenceType?: 'project' | 'topic' | 'report' | 'announcement';
  
  // Action URL
  actionUrl?: string;
  
  createdAt: Timestamp;
  readAt?: Timestamp;
}

// Example Document
{
  notificationId: "notif_001",
  userId: "student_001",
  title: "Nhận xét mới từ giáo viên",
  message: "TS. Tran Thi B đã nhận xét báo cáo tuần 1 của bạn",
  type: "comment",
  isRead: false,
  priority: "high",
  referenceId: "report_001",
  referenceType: "report",
  actionUrl: "/student/progress/report_001",
  createdAt: Timestamp(2024-09-22)
}
```

**Indexes:**
```
- Composite: (userId, isRead, createdAt DESC)
- Composite: (userId, type, createdAt DESC)
```

---

## 🔄 Denormalization Strategy

### Lý do Denormalization trong Firestore:

1. **No JOIN**: Firestore không có JOIN như SQL
2. **Performance**: Giảm số lần query
3. **Cost**: Mỗi document read tính tiền

### Ví dụ Denormalization:

```typescript
// ❌ BAD: Need 3 reads
// Read project → Read student → Read topic

// ✅ GOOD: Only 1 read
interface Project {
  projectId: string;
  
  // Original references
  topicId: string;
  studentId: string;
  supervisorId: string;
  
  // Denormalized data (duplicated)
  topicName: string;              // From topics/{topicId}
  studentName: string;            // From students/{studentId}
  studentCode: string;            // From students/{studentId}
  supervisorName: string;         // From teachers/{supervisorId}
}
```

### Khi nào Update Denormalized Data?

```typescript
// Cloud Function: Update denormalized data when source changes
exports.onStudentUpdate = functions.firestore
  .document('students/{studentId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const studentId = context.params.studentId;
    
    // Update all projects with this student
    const projectsRef = db.collection('projects');
    const snapshot = await projectsRef
      .where('studentId', '==', studentId)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        studentName: newData.fullName,
        studentCode: newData.studentCode
      });
    });
    
    await batch.commit();
  });
```

---

## 📈 Composite Indexes

### firestore.indexes.json

```json
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "supervisorId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "topics",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "announcementId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "availableSlots", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isRead", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "progressReports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "weekNumber", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 🔐 Data Validation

### Firestore Rules với Validation

```javascript
match /projects/{projectId} {
  allow create: if isStudent() && 
    // Validate required fields
    request.resource.data.keys().hasAll([
      'topicId', 'studentId', 'supervisorId', 
      'registrationDate', 'status'
    ]) &&
    // Validate data types
    request.resource.data.status in [
      'registered', 'in_progress', 'submitted', 
      'reviewed', 'completed', 'failed'
    ] &&
    // Validate score range
    (!request.resource.data.keys().hasAny(['supervisorScore']) ||
     (request.resource.data.supervisorScore >= 0 && 
      request.resource.data.supervisorScore <= 10));
}
```

---

Cấu trúc database Firebase Firestore đã được thiết kế tối ưu cho hệ thống quản lý đồ án! 🚀