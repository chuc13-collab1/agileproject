import { auth } from '../firebase/config';
import { Project } from '../../types/project.types';
// Remove PROJECTS_COLLECTION if not used


export interface CreateProjectRequest {
  topicId: string;
  studentId: string;
  supervisorId: string | null;
  studentEmail?: string;
  studentName?: string;
}

// Create Project (via API)
export const createProject = async (projectData: CreateProjectRequest): Promise<any> => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('No authentication token');

  const response = await fetch('http://localhost:3001/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(projectData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create project');
  }

  return response.json();
};

// Get All Projects
export const getAllProjects = async (): Promise<Project[]> => {
  const token = await auth.currentUser?.getIdToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('http://localhost:3001/api/projects', {
    headers
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  const projects = await response.json();

  return projects.map((p: any) => ({
    ...p,
    createdAt: new Date(p.createdAt),
    reportDeadline: new Date(p.reportDeadline)
  }));
};

// Get Project by ID
// Get Project by ID
export const getProjectById = async (projectId: string): Promise<Project | null> => {
  const token = await auth.currentUser?.getIdToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, { headers });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch project');
  }

  const result = await response.json();
  const data = result.data;

  return {
    ...data,
    registrationDate: data.registrationDate ? new Date(data.registrationDate) : new Date(),
    reportDeadline: data.reportDeadline ? new Date(data.reportDeadline) : new Date(),
    defenseDate: data.defenseDate ? new Date(data.defenseDate) : undefined,
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
  };
};
// Update Project
export const updateProject = async (
  projectId: string,
  updates: Partial<Project>
): Promise<void> => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('No authentication token');

  // If updating status, use the status endpoint
  if (updates.status) {
    await fetch(`http://localhost:3001/api/projects/${projectId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: updates.status })
    });
  }

  // If updating other fields, use the general PUT endpoint
  // Filter out status from general updates if it was handled above
  // Also filter out fields that belong to Topic and cannot be updated on Project (semester, academicYear, title, description, etc)
  const otherUpdates = { ...updates };
  delete otherUpdates.status;
  delete otherUpdates.updatedAt;
  delete otherUpdates.createdAt;

  // These fields are from Topic and cannot be updated via Project endpoint
  delete (otherUpdates as any).semester;
  delete (otherUpdates as any).academicYear;
  delete (otherUpdates as any).title;
  delete (otherUpdates as any).description;
  delete (otherUpdates as any).field;
  delete (otherUpdates as any).studentId; // Cannot change student of existing project

  if (Object.keys(otherUpdates).length > 0) {
    const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(otherUpdates)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update project');
    }
  }
};

// Assign Reviewer
export const assignReviewer = async (
  projectId: string,
  reviewer: { id: string; name: string }
): Promise<void> => {
  // Use the updateProject function which calls the PUT endpoint
  await updateProject(projectId, { reviewerId: reviewer.id } as any);
};

// Delete Project
export const deleteProject = async (projectId: string): Promise<void> => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('No authentication token');

  const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete project');
  }
};
