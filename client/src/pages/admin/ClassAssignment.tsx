import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import * as teacherGroupService from '../../services/api/teacherGroup.service';
import * as userService from '../../services/api/user.service';
import { Teacher, Student } from '../../types/user.types';
import { TeacherGroup } from '../../types/teacherGroup.types';
import styles from './ClassAssignment.module.css';

interface ClassInfo {
    classCode: string;
    major: string;
    academicYear: string;
    students: Student[];
    groups: TeacherGroup[];
}

const ClassAssignment = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [studentsData, teachersData] = await Promise.all([
                userService.getAllStudents(),
                userService.getAllTeachers()
            ]);

            // Group students by class
            const classMap = new Map<string, ClassInfo>();

            studentsData.forEach(student => {
                const key = student.className;
                if (!classMap.has(key)) {
                    classMap.set(key, {
                        classCode: student.className,
                        major: student.major || 'N/A',
                        academicYear: student.academicYear,
                        students: [],
                        groups: []
                    });
                }
                classMap.get(key)!.students.push(student);
            });

            // Load groups for each class
            const classesArray = Array.from(classMap.values());
            for (const classInfo of classesArray) {
                const groups = await teacherGroupService.getClassGroups(classInfo.classCode);
                classInfo.groups = groups;
            }

            setClasses(classesArray);
            setTeachers(teachersData);
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignGroup = async () => {
        if (!selectedClass || !selectedTeacher || selectedStudents.length === 0) {
            alert('Vui lòng chọn giảng viên và sinh viên');
            return;
        }

        const classInfo = classes.find(c => c.classCode === selectedClass);
        if (!classInfo) return;

        const nextGroupNumber = classInfo.groups.length > 0
            ? Math.max(...classInfo.groups.map(g => g.groupNumber)) + 1
            : 1;

        try {
            await teacherGroupService.createTeacherGroup({
                teacherId: selectedTeacher,
                classCode: selectedClass,
                groupNumber: nextGroupNumber,
                studentIds: selectedStudents
            });

            setSelectedTeacher('');
            setSelectedStudents([]);
            await loadData();
            alert('Phân công thành công!');
        } catch (error: any) {
            console.error('Failed to assign:', error);
            alert(error.message || 'Không thể phân công');
        }
    };

    const handleRemoveGroup = async (groupId: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa phân công này?')) return;

        try {
            await teacherGroupService.deleteTeacherGroup(groupId);
            await loadData();
            alert('Đã xóa phân công');
        } catch (error: any) {
            console.error('Failed to remove:', error);
            alert(error.message || 'Không thể xóa phân công');
        }
    };

    const toggleStudentSelection = (studentId: string) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const getAssignedStudentIds = (classCode: string): string[] => {
        const classInfo = classes.find(c => c.classCode === classCode);
        if (!classInfo) return [];

        const assigned = new Set<string>();
        classInfo.groups.forEach(group => {
            group.studentIds.forEach(sid => assigned.add(sid));
        });
        return Array.from(assigned);
    };

    const getUnassignedStudents = (classCode: string): Student[] => {
        const classInfo = classes.find(c => c.classCode === classCode);
        if (!classInfo) return [];

        const assignedIds = getAssignedStudentIds(classCode);
        return classInfo.students.filter(s => !assignedIds.includes(s.id));
    };

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                color: '#64748b'
                            }}
                            title="Quay lại Dashboard"
                        >
                            ⬅️
                        </button>
                        <div>
                            <h1 className={styles.title}>Phân Công Lớp (Theo Nhóm)</h1>
                            <p className={styles.subtitle}>Gán giảng viên phụ trách từng nhóm sinh viên trong lớp</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.emptyState}>Đang tải...</div>
                ) : (
                    <div className={styles.classListGrid}>
                        {classes.map(classInfo => (
                            <div key={classInfo.classCode} className={styles.classCard}>
                                <div
                                    className={styles.classHeader}
                                    onClick={() => setSelectedClass(
                                        selectedClass === classInfo.classCode ? null : classInfo.classCode
                                    )}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div>
                                        <div className={styles.classCode}>{classInfo.classCode}</div>
                                        <div className={styles.classMeta}>
                                            <span>📚 {classInfo.major}</span> •
                                            <span>📅 {classInfo.academicYear}</span> •
                                            <span>👥 {classInfo.students.length} SV</span>
                                        </div>
                                    </div>
                                    <div className={styles.expandIcon}>
                                        {selectedClass === classInfo.classCode ? '▼' : '▶'}
                                    </div>
                                </div>

                                {selectedClass === classInfo.classCode && (
                                    <div className={styles.classDetail}>
                                        {/* Existing Groups */}
                                        {classInfo.groups.length > 0 && (
                                            <div className={styles.groupsList}>
                                                <h4>📋 Phân công hiện tại:</h4>
                                                {classInfo.groups.map(group => (
                                                    <div key={group.id} className={styles.groupItem}>
                                                        <div>
                                                            <strong>Nhóm {group.groupNumber}:</strong> {group.teacherName}
                                                            <span className={styles.badge}>{group.studentIds.length} SV</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveGroup(group.id)}
                                                            className={styles.removeButton}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Unassigned Students */}
                                        {getUnassignedStudents(classInfo.classCode).length > 0 ? (
                                            <div className={styles.assignSection}>
                                                <h4>➕ Thêm nhóm mới:</h4>

                                                <div className={styles.formGroup}>
                                                    <label>Chọn giảng viên:</label>
                                                    <select
                                                        value={selectedTeacher}
                                                        onChange={(e) => setSelectedTeacher(e.target.value)}
                                                        className={styles.select}
                                                    >
                                                        <option value="">-- Chọn giảng viên --</option>
                                                        {teachers.filter(t => t.canSupervise).map(teacher => (
                                                            <option key={teacher.id} value={teacher.id}>
                                                                {teacher.displayName} ({teacher.teacherId})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className={styles.formGroup}>
                                                    <label>
                                                        Chọn sinh viên ({selectedStudents.length} đã chọn):
                                                    </label>
                                                    <div className={styles.studentList}>
                                                        {getUnassignedStudents(classInfo.classCode).map(student => (
                                                            <div
                                                                key={student.id}
                                                                className={`${styles.studentItem} ${selectedStudents.includes(student.id) ? styles.selected : ''
                                                                    }`}
                                                                onClick={() => toggleStudentSelection(student.id)}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedStudents.includes(student.id)}
                                                                    onChange={() => { }}
                                                                />
                                                                <span>{student.displayName} ({student.studentId})</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleAssignGroup}
                                                    className={styles.assignButton}
                                                    disabled={!selectedTeacher || selectedStudents.length === 0}
                                                >
                                                    Gán Nhóm
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.emptyState}>
                                                ✅ Tất cả sinh viên đã được phân công
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default ClassAssignment;
