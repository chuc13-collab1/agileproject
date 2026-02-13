// User Management Types

export type UserRole = 'student' | 'teacher' | 'admin' | 'supervisor' | 'reviewer';

export interface BaseUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student extends BaseUser {
  role: 'student';
  studentId: string;
  className: string;
  phone?: string;
  major?: string;
  academicYear: string;
  projectHistory?: ProjectHistoryItem[];
}

export interface Teacher extends BaseUser {
  role: 'teacher' | 'supervisor' | 'reviewer';
  teacherId: string;
  teacherDbId?: string; // Database ID for foreign key references
  department: string;
  specialization: string[];
  maxStudents: number;
  currentStudents: number;
  phone?: string;
  canSupervise: boolean;
  canReview: boolean;
}

export interface Admin extends BaseUser {
  role: 'admin';
  adminId: string;
  permissions: AdminPermission[];
}

export interface ProjectHistoryItem {
  semester: string;
  academicYear: string;
  topicTitle: string;
  supervisor: string;
  grade?: string;
  status: 'completed' | 'in-progress' | 'failed';
}

export type AdminPermission =
  | 'manage_users'
  | 'manage_projects'
  | 'manage_topics'
  | 'manage_grades'
  | 'manage_system'
  | 'view_reports';

export interface StudentFormData {
  email: string;
  displayName: string;
  studentId: string;
  className: string;
  phone?: string;
  major?: string;
  academicYear: string;
  password?: string;
}

export interface TeacherFormData {
  email: string;
  displayName: string;
  teacherId: string;
  department: string;
  specialization: string[];
  maxStudents: number;
  phone?: string;
  canSupervise: boolean;
  canReview: boolean;
  password?: string;
}

export interface AdminFormData {
  email: string;
  displayName: string;
  adminId: string;
  permissions: AdminPermission[];
  password?: string;
}

export interface ExcelImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    email: string;
    reason: string;
  }>;
}
