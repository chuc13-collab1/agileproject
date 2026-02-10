import { auth } from '../firebase/config';
import { Class, ClassFormData } from '../../types/class.types';
import { Student } from '../../types/user.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthToken = async (): Promise<string> => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('No authentication token');
    return token;
};

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

export const getAllClasses = async (params?: {
    active?: boolean;
    academicYear?: string;
}): Promise<Class[]> => {
    let endpoint = 'classes';
    const queryParams = new URLSearchParams();

    if (params?.active !== undefined) {
        queryParams.append('active', params.active.toString());
    }
    if (params?.academicYear) {
        queryParams.append('academicYear', params.academicYear);
    }

    if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
    }

    const result = await apiCall(endpoint);
    return result.data.map((cls: any) => ({
        ...cls,
        createdAt: cls.createdAt ? new Date(cls.createdAt) : undefined,
        updatedAt: cls.updatedAt ? new Date(cls.updatedAt) : undefined,
    }));
};

export const createClass = async (data: ClassFormData): Promise<Class> => {
    const result = await apiCall('classes', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    return {
        ...result.data,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
};

export const updateClass = async (
    id: string,
    data: Partial<ClassFormData> & { isActive?: boolean }
): Promise<Class> => {
    const result = await apiCall(`classes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    return {
        ...result.data,
        updatedAt: new Date(),
    };
};

export const deleteClass = async (id: string): Promise<void> => {
    await apiCall(`classes/${id}`, {
        method: 'DELETE',
    });
};

export const getClassStudents = async (classCode: string): Promise<Student[]> => {
    const result = await apiCall(`classes/${classCode}/students`);
    return result.data.map((student: any) => ({
        ...student,
        createdAt: new Date(student.createdAt),
        updatedAt: new Date(student.updatedAt),
        isActive: student.isActive,
        displayName: student.displayName,
        photoURL: student.photoURL,
    }));
};
