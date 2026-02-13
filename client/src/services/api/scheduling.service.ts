import { auth } from '../firebase/config';
// Remove import { MeetingSlot, Booking } from '../../types/scheduling.types'; if types are not defined yet or import them correctly if they are.
// Assuming types might not be perfectly defined in a separate file yet based on previous steps, 
// but let's try to import them if they exist or define them here for safety if I am not sure.
// I will define interfaces here to avoid import errors if the types file is missing.

export interface MeetingSlot {
    id: string;
    teacher_id: string;
    start_time: string;
    end_time: string;
    location: string;
    max_students: number;
    is_booked: boolean;
    teacher_name?: string;
}

export interface Booking {
    id: string;
    slot_id: string;
    student_id: string;
    project_id?: string;
    notes: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    start_time?: string;
    end_time?: string;
    location?: string;
    teacher_name?: string;
    student_name?: string;
    student_code?: string;
}

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Helper function for API calls
 */
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = await auth.currentUser?.getIdToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
};

// Get available slots
export const getSlots = async (params: { teacher_id?: string; from_date?: string; to_date?: string }): Promise<MeetingSlot[]> => {
    const queryParams = new URLSearchParams();
    if (params.teacher_id) queryParams.append('teacher_id', params.teacher_id);
    if (params.from_date) queryParams.append('from_date', params.from_date);
    if (params.to_date) queryParams.append('to_date', params.to_date);

    return await apiCall(`scheduling/slots?${queryParams.toString()}`);
};

// Create a slot (Teacher only)
export const createSlot = async (data: { start_time: string; end_time: string; location: string; max_students?: number }): Promise<any> => {
    return await apiCall('scheduling/slots', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// Delete a slot (Teacher only)
export const deleteSlot = async (id: string): Promise<void> => {
    await apiCall(`scheduling/slots/${id}`, {
        method: 'DELETE',
    });
};

// Book a slot (Student only)
export const bookSlot = async (data: { slot_id: string; project_id?: string; notes?: string }): Promise<any> => {
    return await apiCall('scheduling/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// Get my bookings (Student & Teacher)
export const getMyBookings = async (): Promise<Booking[]> => {
    return await apiCall('scheduling/my-bookings');
};

// Update booking status (Teacher/Student)
export const updateBookingStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<void> => {
    await apiCall(`scheduling/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};
