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
import { db } from '../firebase/config';
import { Project } from '../../types/project.types';

const PROJECTS_COLLECTION = 'projects';

// Create Project
export const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
  const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
    ...projectData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    registrationDate: Timestamp.fromDate(projectData.registrationDate),
    reportDeadline: Timestamp.fromDate(projectData.reportDeadline),
    defenseDate: projectData.defenseDate ? Timestamp.fromDate(projectData.defenseDate) : null,
  });

  const now = new Date();
  return {
    id: docRef.id,
    ...projectData,
    createdAt: now,
    updatedAt: now
  };
};

// Get All Projects
export const getAllProjects = async (): Promise<Project[]> => {
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      registrationDate: data.registrationDate?.toDate() || new Date(),
      reportDeadline: data.reportDeadline?.toDate() || new Date(),
      defenseDate: data.defenseDate?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }) as Project[];
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
