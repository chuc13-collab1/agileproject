import { auth } from '../firebase/config';
import {
  Student,
  Teacher,
  Admin,
  StudentFormData,
  TeacherFormData,
  AdminFormData,
  ExcelImportResult
} from '../../types/user.types';

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Helper function to get auth token
 */
const getAuthToken = async (): Promise<string> => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('No authentication token');
  return token;
};

/**
 * Helper function for API calls
 */
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// ============================================
// STUDENT API CALLS
// ============================================

export const getAllStudents = async (): Promise<Student[]> => {
  const result = await apiCall('students');
  return result.data.map((student: any) => ({
    ...student,
    createdAt: new Date(student.created_at),
    updatedAt: new Date(student.updated_at),
    isActive: student.is_active,
    displayName: student.display_name,
    photoURL: student.photo_url,
    studentId: student.student_id,
    className: student.class_name,
    academicYear: student.academic_year,
    major: student.major,
  }));
};

export const createStudent = async (data: StudentFormData): Promise<Student> => {
  const result = await apiCall('students', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return {
    ...result.data,
    role: 'student',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Student;
};

export const updateStudent = async (
  id: string,
  data: Partial<StudentFormData>
): Promise<void> => {
  await apiCall(`students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteStudent = async (id: string): Promise<void> => {
  await apiCall(`students/${id}`, {
    method: 'DELETE',
  });
};

export const toggleUserActive = async (
  id: string
): Promise<void> => {
  await apiCall(`students/${id}/toggle-active`, {
    method: 'PATCH',
  });
};

export const batchImportStudents = async (
  students: StudentFormData[]
): Promise<ExcelImportResult> => {
  const result = await apiCall('students/batch-import', {
    method: 'POST',
    body: JSON.stringify({ students }),
  });

  return result.data;
};

// ============================================
// TEACHER API CALLS
// ============================================

export const getAllTeachers = async (): Promise<Teacher[]> => {
  const result = await apiCall('teachers');
  return result.data.map((teacher: any) => ({
    ...teacher,
    createdAt: new Date(teacher.created_at),
    updatedAt: new Date(teacher.updated_at),
    isActive: teacher.is_active,
    displayName: teacher.display_name,
    photoURL: teacher.photo_url,
    maxStudents: teacher.max_students,
    currentStudents: teacher.current_students,
    canSupervise: teacher.can_supervise,
    canReview: teacher.can_review,
    role: 'teacher',
  }));
};

export const createTeacher = async (data: TeacherFormData): Promise<Teacher> => {
  const result = await apiCall('teachers', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return {
    ...result.data,
    role: 'teacher',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    maxStudents: data.maxStudents,
    currentStudents: 0,
    canSupervise: data.canSupervise,
    canReview: data.canReview,
  } as Teacher;
};

export const updateTeacher = async (
  id: string,
  data: Partial<TeacherFormData>
): Promise<void> => {
  await apiCall(`teachers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteTeacher = async (id: string): Promise<void> => {
  await apiCall(`teachers/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// ADMIN API CALLS
// ============================================

export const getAllAdmins = async (): Promise<Admin[]> => {
  const result = await apiCall('admins');
  return result.data.map((admin: any) => ({
    ...admin,
    createdAt: new Date(admin.created_at),
    updatedAt: new Date(admin.updated_at),
    isActive: admin.is_active,
    displayName: admin.display_name,
    photoURL: admin.photo_url,
    role: 'admin',
  }));
};

export const createAdmin = async (data: AdminFormData): Promise<Admin> => {
  const result = await apiCall('admins', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return {
    ...result.data,
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: data.permissions,
  } as Admin;
};

export const deleteAdmin = async (id: string): Promise<void> => {
  await apiCall(`admins/${id}`, {
    method: 'DELETE',
  });
};

export const updateAdmin = async (
  id: string,
  data: Partial<AdminFormData>
): Promise<void> => {
  await apiCall(`admins/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const resetPassword = async (email: string): Promise<void> => {
  await apiCall('auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

// ============================================
// BATCH OPERATIONS
// ============================================

export const batchDeleteStudents = async (studentIds: string[]): Promise<void> => {
  await apiCall('students/batch-delete', {
    method: 'POST',
    body: JSON.stringify({ studentIds }),
  });
};

export const batchUpdateStudentClass = async (
  studentIds: string[],
  className: string,
  academicYear: string
): Promise<void> => {
  await apiCall('students/batch-update-class', {
    method: 'POST',
    body: JSON.stringify({ studentIds, className, academicYear }),
  });
};
