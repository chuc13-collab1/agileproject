// Project Types
export interface Project {
  id: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  supervisor: { id: string; name: string };
  reviewer?: { id: string; name: string };
  status: 'pending' | 'approved' | 'in-progress' | 'submitted' | 'reviewing' | 'completed' | 'rejected';
  semester: string;
  academicYear: string;
  field: string;
  registrationDate: Date;
  reportDeadline: Date;
  defenseDate?: Date;
  score?: number;
  supervisorScore?: number; // Score from supervisor
  reviewerScore?: number; // Score from reviewer
  createdAt: Date;
  updatedAt: Date;
  supervisorComment?: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  studentId: string;
  supervisorId: string;
  reviewerId?: string;
  semester: string;
  academicYear: string;
  category: string;
  startDate: string;
  endDate: string;
}

export type ProjectStatus = Project['status'];

export interface ProjectFilters {
  status?: ProjectStatus;
  semester?: string;
  academicYear?: string;
  category?: string;
  search?: string;
}
