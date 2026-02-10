// Teacher Group Types - For class assignment with multiple teachers per class

export interface TeacherGroup {
    id: string;
    teacherId: string;
    teacherName: string;
    classCode: string;
    groupNumber: number;
    studentIds: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TeacherGroupFormData {
    teacherId: string;
    classCode: string;
    groupNumber: number;
    studentIds: string[];
}

export interface ClassGroupSummary {
    classCode: string;
    groups: {
        groupNumber: number;
        teacherId: string;
        teacherName: string;
        studentCount: number;
    }[];
    totalStudents: number;
    unassignedStudents: number;
}
