import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { Project } from '../../types/project.types';

const PROJECTS_COLLECTION = 'projects';

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
export const getProjectById = async (projectId: string): Promise<Project | null> => {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      registrationDate: data.registrationDate?.toDate() || new Date(),
      reportDeadline: data.reportDeadline?.toDate() || new Date(),
      defenseDate: data.defenseDate?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Project;
  } else {
    return null;
  }
};
export const updateProject = async (
  projectId: string,
  updates: Partial<Project>
): Promise<void> => {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  const updateData: any = { ...updates, updatedAt: Timestamp.now() };

  if (updates.reportDeadline) {
    updateData.reportDeadline = Timestamp.fromDate(updates.reportDeadline);
  }
  if (updates.defenseDate) {
    updateData.defenseDate = Timestamp.fromDate(updates.defenseDate);
  }

  await updateDoc(docRef, updateData);
};

// Assign Reviewer
export const assignReviewer = async (
  projectId: string,
  reviewer: { id: string; name: string }
): Promise<void> => {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await updateDoc(docRef, {
    reviewer,
    updatedAt: Timestamp.now(),
  });
};

// Delete Project
export const deleteProject = async (projectId: string): Promise<void> => {
  await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
};
