import { auth } from '../firebase/config';
import { Announcement, AnnouncementFormData } from '../../types/announcement.types';

const getAuthToken = async (): Promise<string> => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('No authentication token');
  return token;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

export const getAllAnnouncements = async (): Promise<Announcement[]> => {
  const result = await apiCall('announcements');
  return result.data.map((item: any) => ({
    ...item,
    academicYear: item.academic_year,
    registrationStart: new Date(item.registration_start),
    registrationEnd: new Date(item.registration_end),
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  }));
};

export const createAnnouncement = async (data: AnnouncementFormData): Promise<Announcement> => {
  const result = await apiCall('announcements', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      // Backend expects camelCase if I updated it? 
      // Check backend: const { title, content, semester, academicYear, ... } = req.body;
      // Yes, backend usage matches camelCase keys from body.
      // But Date strings need to be passed as is.
    }),
  });
  return result.data;
};

export const updateAnnouncement = async (id: string, data: Partial<AnnouncementFormData>): Promise<Announcement> => {
  const result = await apiCall(`announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return result.data;
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await apiCall(`announcements/${id}`, {
    method: 'DELETE',
  });
};
