import { auth } from '../firebase/config';

const API_URL = 'http://localhost:3001/api';

export const getStudentReports = async (studentId: string) => {
    const token = await auth.currentUser?.getIdToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/progress-reports/students/${studentId}/reports`, {
        headers
    });

    if (!response.ok) {
        throw new Error('Failed to fetch reports');
    }

    const result = await response.json();
    return result.data;
};
