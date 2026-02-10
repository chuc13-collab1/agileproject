// Teacher Group Service
import { auth } from '../firebase/config';
import { TeacherGroup, TeacherGroupFormData, ClassGroupSummary } from '../../types/teacherGroup.types';

const API_URL = import.meta.env.VITE_API_URL;

export const createTeacherGroup = async (data: TeacherGroupFormData): Promise<TeacherGroup> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_URL}/teacher-groups`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create teacher group');
    }

    const result = await response.json();
    return result.data;
};

export const getTeacherGroups = async (teacherId: string): Promise<TeacherGroup[]> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_URL}/teacher-groups/teacher/${teacherId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch teacher groups');
    }

    const result = await response.json();
    return result.data;
};

export const getClassGroups = async (classCode: string): Promise<TeacherGroup[]> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_URL}/teacher-groups/class/${classCode}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch class groups');
    }

    const result = await response.json();
    return result.data;
};

export const getStudentTeacher = async (studentId: string): Promise<TeacherGroup | null> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_URL}/teacher-groups/student/${studentId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch student teacher');
    }

    const result = await response.json();
    return result.data;
};

export const deleteTeacherGroup = async (groupId: string): Promise<void> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_URL}/teacher-groups/${groupId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete teacher group');
    }
};

export const updateTeacherGroup = async (groupId: string, studentIds: string[]): Promise<void> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_URL}/teacher-groups/${groupId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentIds })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update teacher group');
    }
};
