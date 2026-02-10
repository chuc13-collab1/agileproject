export interface Attachment {
  id: string;
  name: string;
  url: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  semester: string;
  academicYear: string;
  registrationStart: Date;
  registrationEnd: Date;
  status: 'draft' | 'published' | 'closed';
  reportDeadline?: Date;
  defenseDate?: Date;
  attachments?: Attachment[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  semester: string;
  academicYear: string;
  registrationStart: string; // YYYY-MM-DDTHH:mm
  registrationEnd: string;
  status: 'draft' | 'published' | 'closed';
  reportDeadline?: string;
  defenseDate?: string;
  attachments?: File[];
}
