import { Topic, TopicFormData } from '../../types/topic.types';
import { auth } from '../firebase/config';

// Helper to get token
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

// Create Topic
export const createTopic = async (
  data: TopicFormData
): Promise<Topic> => {
  const result = await apiCall('topics', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return mapBackendTopic(result.data);
};

// Get All Topics
export const getAllTopics = async (): Promise<Topic[]> => {
  const result = await apiCall('topics');
  return result.data.map(mapBackendTopic);
};

// Get Topic by ID
export const getTopicById = async (id: string): Promise<Topic> => {
  const result = await apiCall(`topics/${id}`);
  return mapBackendTopic(result.data);
};

// Get Topics by Status
export const getTopicsByStatus = async (status: string): Promise<Topic[]> => {
  const result = await apiCall(`topics?status=${status}`);
  return result.data.map(mapBackendTopic);
};

// Approve Topic
export const approveTopic = async (
  topicId: string
): Promise<void> => {
  await apiCall(`topics/${topicId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'approved' }),
  });
};

// Reject Topic
export const rejectTopic = async (
  topicId: string,
  reason: string
): Promise<void> => {
  await apiCall(`topics/${topicId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'rejected', rejectionReason: reason }),
  });
};

// Update Topic
export const updateTopic = async (
  topicId: string,
  updates: Partial<Topic>
): Promise<void> => {
  await apiCall(`topics/${topicId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

// Delete Topic
export const deleteTopic = async (topicId: string): Promise<void> => {
  await apiCall(`topics/${topicId}`, {
    method: 'DELETE',
  });
};

// Update Reviewer
export const updateReviewer = async (topicId: string, reviewerId: string): Promise<void> => {
  await apiCall(`topics/${topicId}/reviewer`, {
    method: 'PATCH',
    body: JSON.stringify({ reviewerId }),
  });
};

// Auto Assign Reviewers
export const autoAssignReviewers = async (): Promise<{ message: string; assigned: number }> => {
  return await apiCall('topics/auto-assign-reviewers', {
    method: 'POST',
  });
};

// Helper to map backend format to frontend type
const mapBackendTopic = (item: any): Topic => ({
  id: item.id,
  title: item.title,
  description: item.description,
  requirements: item.requirements || '',
  expectedResults: item.expectedResults || '',
  field: item.field || '',
  maxStudents: item.maxStudents,
  currentStudents: item.currentStudents,
  supervisorId: item.supervisorId,
  supervisorName: item.supervisorName,
  supervisorDepartment: item.supervisorDepartment || '',
  status: item.status,
  rejectionReason: item.rejectionReason,
  semester: item.semester,
  academicYear: item.academicYear,
  createdAt: new Date(item.createdAt),
  updatedAt: new Date(item.updatedAt),
  approvedAt: item.approvedAt ? new Date(item.approvedAt) : undefined,
  approvedBy: item.approvedBy,
  reviewerId: item.reviewerId,
  reviewerName: item.reviewerName,
});
