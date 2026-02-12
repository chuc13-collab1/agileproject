
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
        return user.getIdToken();
    }
    return null;
};

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(async (config) => {
    const token = await getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface TopicProposal {
    id: string;
    title: string;
    description: string;
    requirements?: string;
    expected_results?: string; // Corrected field name
    proposed_by_student_id: string;
    requested_supervisor_id: string;
    status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
    teacher_feedback?: string;
    created_at: string;
    supervisor_name?: string;
    student_name?: string;
    student_email?: string;
    student_code?: string;
    class_name?: string;
}

export const topicProposalService = {
    create: async (data: {
        title: string;
        description: string;
        requirements?: string;
        expectedResults?: string; // Note: camelCase here as per input form usually
        requestedSupervisorId: string;
    }) => {
        const response = await axiosInstance.post('/topic-proposals', data);
        return response.data;
    },

    getMyProposals: async () => {
        const response = await axiosInstance.get<{ success: boolean; data: TopicProposal[] }>('/topic-proposals/my');
        return response.data;
    },

    getTeacherProposals: async () => {
        const response = await axiosInstance.get<{ success: boolean; data: TopicProposal[] }>('/topic-proposals/teacher');
        return response.data;
    },

    reviewProposal: async (id: string, action: 'approve' | 'reject' | 'request_revision', feedback?: string) => {
        const response = await axiosInstance.patch(`/topic-proposals/${id}/review`, { action, feedback });
        return response.data;
    },

    deleteProposal: async (id: string) => {
        const response = await axiosInstance.delete(`/topic-proposals/${id}`);
        return response.data;
    }
};
