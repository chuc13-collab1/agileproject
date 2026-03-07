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

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [studentsData, teachersData] = await Promise.all([
                userService.getAllStudents(),
                userService.getAllTeachers(),
            ]);

            const classMap = new Map<string, ClassInfo>();
            studentsData.forEach((student) => {
                const key = student.className;
                if (!classMap.has(key)) {
                    classMap.set(key, {
                        classCode: student.className,
                        major: student.major || 'N/A',
                        academicYear: student.academicYear,
                        students: [],
                        groups: [],
                    });
                }
                classMap.get(key)!.students.push(student);
            });

            const classesArray = Array.from(classMap.values());
            await Promise.all(
                classesArray.map(async (classInfo) => {
                    try {
                        classInfo.groups = await teacherGroupService.getClassGroups(classInfo.classCode);
                    } catch (err) {
                        console.warn(`Could not load groups for ${classInfo.classCode}:`, err);
                        classInfo.groups = [];
                    }
                })
            );

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
        const classInfo = classes.find((c) => c.classCode === selectedClass);
        if (!classInfo) return;

        const nextGroupNumber =
            classInfo.groups.length > 0
                ? Math.max(...classInfo.groups.map((g) => g.groupNumber)) + 1
                : 1;

        try {
            await teacherGroupService.createTeacherGroup({
                teacherId: selectedTeacher,
                classCode: selectedClass,
                groupNumber: nextGroupNumber,
                studentIds: selectedStudents,
            });
            setSelectedTeacher('');
            setSelectedStudents([]);
            await loadData();
            alert('Phân công thành công!');
        } catch (error: any) {
            alert(error.message || 'Không thể phân công');
        }
    };

    const handleRemoveGroup = async (groupId: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa phân công này?')) return;
        try {
            await teacherGroupService.deleteTeacherGroup(groupId);
            await loadData();
        } catch (error: any) {
            alert(error.message || 'Không thể xóa phân công');
        }
    };

    const toggleStudentSelection = (studentId: string) => {
        setSelectedStudents((prev) =>
            prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
        );
    };

    const getAssignedStudentIds = (classCode: string): string[] => {
        const classInfo = classes.find((c) => c.classCode === classCode);
        if (!classInfo) return [];
        const assigned = new Set<string>();
        classInfo.groups.forEach((g) => g.studentIds.forEach((sid) => assigned.add(sid)));
        return Array.from(assigned);
    };

    const getUnassignedStudents = (classCode: string): Student[] => {
        const classInfo = classes.find((c) => c.classCode === classCode);
        if (!classInfo) return [];
        const assignedIds = getAssignedStudentIds(classCode);
        return classInfo.students.filter((s) => !assignedIds.includes(s.id));
    };

    // Summary stats
    const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0);
    const totalGroups = classes.reduce((sum, c) => sum + c.groups.length, 0);

    return (
        <MainLayout>
            <div className={styles.container}>

                {/* ── Page Header ── */}
                <div className={styles.pageHeader}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)} title="Quay lại">
                        ←
                    </button>
                    <div className={styles.pageHeaderText}>
                        <h1>Phân Công Lớp Học</h1>
                        <p>Gán giảng viên phụ trách từng nhóm sinh viên trong lớp</p>
                    </div>
                </div>

                {/* ── Summary Cards ── */}
                <div className={styles.summaryRow}>
                    <div className={styles.summaryCard}>
                        <div className={`${styles.summaryIcon} ${styles.purple}`}>🏫</div>
                        <div className={styles.summaryInfo}>
                            <span>Tổng lớp học</span>
                            <strong>{classes.length}</strong>
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={`${styles.summaryIcon} ${styles.blue}`}>👨‍🎓</div>
                        <div className={styles.summaryInfo}>
                            <span>Tổng sinh viên</span>
                            <strong>{totalStudents}</strong>
                        </div>
                    </div>
                    <div className={styles.summaryCard}>
                        <div className={`${styles.summaryIcon} ${styles.green}`}>👥</div>
                        <div className={styles.summaryInfo}>
                            <span>Nhóm đã phân công</span>
                            <strong>{totalGroups}</strong>
                        </div>
                    </div>
                </div>

                {/* ── Class Grid ── */}
                {loading ? (
                    <div className={styles.loadingWrapper}>
                        <div className={styles.spinner} />
                        <span>Đang tải dữ liệu...</span>
                    </div>
                ) : classes.length === 0 ? (
                    <div className={styles.emptyState}>📭 Chưa có lớp học nào</div>
                ) : (
                    <div className={styles.classGrid}>
                        {classes.map((classInfo) => {
                            const isActive = selectedClass === classInfo.classCode;
                            const unassigned = getUnassignedStudents(classInfo.classCode);

                            return (
                                <div
                                    key={classInfo.classCode}
                                    className={`${styles.classCard} ${isActive ? styles.active : ''}`}
                                >
                                    {/* Card Header */}
                                    <div
                                        className={styles.classCardHeader}
                                        onClick={() =>
                                            setSelectedClass(isActive ? null : classInfo.classCode)
                                        }
                                    >
                                        <div className={styles.classCardHeaderLeft}>
                                            <div className={styles.classAvatar}>🏫</div>
                                            <div>
                                                <div className={styles.classCode}>{classInfo.classCode}</div>
                                                <div className={styles.classMeta}>
                                                    <span className={styles.metaChip}>📚 {classInfo.major}</span>
                                                    <span className={styles.metaChip}>📅 {classInfo.academicYear}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.classCardHeaderRight}>
                                            <span className={styles.studentCountBadge}>
                                                👥 {classInfo.students.length} SV
                                            </span>
                                            <span className={`${styles.chevron} ${isActive ? styles.chevronOpen : ''}`}>
                                                ▼
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expanded Detail */}
                                    {isActive && (
                                        <div className={styles.classDetail}>

                                            {/* Existing Groups */}
                                            {classInfo.groups.length > 0 && (
                                                <div className={styles.groupsSection}>
                                                    <h4>📋 Phân công hiện tại</h4>
                                                    {classInfo.groups.map((group) => (
                                                        <div key={group.id} className={styles.groupItem}>
                                                            <div className={styles.groupItemLeft}>
                                                                <div className={styles.groupNumber}>{group.groupNumber}</div>
                                                                <div>
                                                                    <div className={styles.groupTeacher}>{group.teacherName}</div>
                                                                    <div className={styles.groupStudentCount}>
                                                                        {group.studentIds.length} sinh viên
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <span className={styles.groupBadge}>
                                                                    {group.studentIds.length} SV
                                                                </span>
                                                                <button
                                                                    className={styles.removeBtn}
                                                                    onClick={() => handleRemoveGroup(group.id)}
                                                                    title="Xóa phân công"
                                                                >
                                                                    🗑
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Assign New Group */}
                                            {unassigned.length > 0 ? (
                                                <div className={styles.assignSection}>
                                                    <p className={styles.assignTitle}>➕ Thêm nhóm mới</p>

                                                    <div className={styles.formGroup}>
                                                        <label>Chọn giảng viên</label>
                                                        <select
                                                            className={styles.select}
                                                            value={selectedTeacher}
                                                            onChange={(e) => setSelectedTeacher(e.target.value)}
                                                        >
                                                            <option value="">-- Chọn giảng viên --</option>
                                                            {teachers
                                                                .filter((t) => t.canSupervise)
                                                                .map((teacher) => (
                                                                    <option key={teacher.id} value={teacher.id}>
                                                                        {teacher.displayName} ({teacher.teacherId})
                                                                    </option>
                                                                ))}
                                                        </select>
                                                    </div>

                                                    <div className={styles.formGroup}>
                                                        <label>
                                                            Chọn sinh viên{' '}
                                                            {selectedStudents.length > 0 && `(${selectedStudents.length} đã chọn)`}
                                                        </label>
                                                        <div className={styles.studentList}>
                                                            {unassigned.map((student) => (
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
                                                                    <span>
                                                                        {student.displayName}{' '}
                                                                        <span style={{ color: '#94a3b8', fontWeight: 400 }}>
                                                                            ({student.studentId})
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <button
                                                        className={styles.assignBtn}
                                                        onClick={handleAssignGroup}
                                                        disabled={!selectedTeacher || selectedStudents.length === 0}
                                                    >
                                                        ✓ Gán Nhóm ({selectedStudents.length} sinh viên)
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={styles.allAssigned}>
                                                    ✅ Tất cả sinh viên đã được phân công
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default ClassAssignment;
