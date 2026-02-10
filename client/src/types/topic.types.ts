// Topic Management Types

export type TopicStatus = 'pending' | 'approved' | 'rejected';
export type Semester = '1' | '2' | 'summer';

export interface Topic {
  id: string;
  title: string;
  description: string;
  requirements: string;
  expectedResults: string;
  field: string;
  maxStudents: 1 | 2;
  currentStudents: number;
  registeredStudents?: number; // Alias for currentStudents

  // Supervisor info
  supervisorId: string;
  supervisorName: string;
  supervisorDepartment: string;

  // Status
  status: TopicStatus;
  rejectionReason?: string;

  // Semester info
  semester: Semester;
  academicYear: string;

  // Attachments
  attachments?: TopicAttachment[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  reviewerId?: string;
  reviewerName?: string;
}

export interface TopicAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

export interface TopicFormData {
  title: string;
  description: string;
  requirements: string;
  expectedResults: string;
  field: string;
  maxStudents: 1 | 2;
  semester: Semester;
  academicYear: string;
  attachments?: File[];
}

export interface TopicApproval {
  topicId: string;
  action: 'approve' | 'reject';
  reason?: string;
  adminId: string;
  adminName: string;
  timestamp: Date;
}

export const FIELD_OPTIONS = [
  'Web Development',
  'Mobile Development',
  'AI & Machine Learning',
  'Data Science',
  'IoT',
  'Blockchain',
  'Cloud Computing',
  'Cybersecurity',
  'Game Development',
  'DevOps',
  'Other',
];

export const SEMESTER_LABELS: Record<Semester, string> = {
  '1': 'Học kỳ 1',
  '2': 'Học kỳ 2',
  'summer': 'Học kỳ hè',
};

export const STATUS_LABELS: Record<TopicStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Bị từ chối',
};
