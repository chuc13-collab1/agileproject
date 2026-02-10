export interface Class {
    id: string;
    classCode: string;
    className?: string;
    academicYear: string;
    advisorTeacher?: {
        id: string;
        displayName: string;
        email?: string;
    };
    maxStudents: number;
    currentStudents: number;
    major?: string;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ClassFormData {
    classCode: string;
    className?: string;
    academicYear: string;
    advisorTeacherId?: string;
    maxStudents?: number;
    major?: string;
    description?: string;
}
