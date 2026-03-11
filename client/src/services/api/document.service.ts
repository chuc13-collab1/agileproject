import { auth } from '../firebase/config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getProjectDocuments = async (projectId: string) => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/uploads/projects/${projectId}/documents`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch documents');
    }

    const result = await response.json();
    return result.data;
};

export const uploadDocument = async (projectId: string, file: File, category: string, description: string = '') => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('No authentication token');

    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('documentType', category);
    formData.append('description', description);
    formData.append('file', file);

    const response = await fetch(`${API_URL}/uploads/documents`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload document');
    }

    return response.json();
};

export const deleteDocument = async (documentId: string) => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${API_URL}/uploads/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete document');
    }

    return response.json();
};
