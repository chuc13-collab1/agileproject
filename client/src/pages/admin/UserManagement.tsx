import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import StudentList from '../../components/admin/StudentList';
import TeacherList from '../../components/admin/TeacherList';
import AdminList from '../../components/admin/AdminList';
import StudentModal from '../../components/admin/StudentModal';
import TeacherModal from '../../components/admin/TeacherModal';
import AdminModal from '../../components/admin/AdminModal';
import ImportExcelModal from '../../components/admin/ImportExcelModal';
import ClassModal from '../../components/admin/ClassModal';
import BatchClassModal from '../../components/admin/BatchClassModal';
import { Student, Teacher, Admin, StudentFormData, ExcelImportResult } from '../../types/user.types';
import { Class, ClassFormData } from '../../types/class.types';
import * as userService from '../../services/api/user.service';
import * as classService from '../../services/api/class.service';
import styles from './UserManagement.module.css';

type TabType = 'classes' | 'students' | 'teachers' | 'admins';

function UserManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importTargetClass, setImportTargetClass] = useState<string>('');
  const [showClassModal, setShowClassModal] = useState(false);
  const [showBatchClassModal, setShowBatchClassModal] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  // Data
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);


  // Load data from Firestore
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, teachersData, adminsData, classesData] = await Promise.all([
        userService.getAllStudents(),
        userService.getAllTeachers(),
        userService.getAllAdmins(),
        classService.getAllClasses({ active: true }),
      ]);
      setStudents(studentsData);
      setTeachers(teachersData);
      setAdmins(adminsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Không thể tải dữ liệu');
    } finally {
      // setLoading(false);
    }
  };

  const handleCreateStudent = () => {
    setEditingStudent(null);
    setShowStudentModal(true);
  };

  const handleCreateTeacher = () => {
    setEditingTeacher(null);
    setShowTeacherModal(true);
  };

  const handleCreateAdmin = () => {
    setEditingAdmin(null);
    setShowAdminModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowStudentModal(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowTeacherModal(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
    setShowAdminModal(true);
  };

  const handleToggleActive = async (userId: string) => {
    try {
      await userService.toggleUserActive(userId);
      await loadData();
    } catch (error) {
      console.error('Failed to toggle active:', error);
      alert('Không thể cập nhật trạng thái');
    }
  };

  // Class Management Handlers
  const handleCreateClass = () => {
    setEditingClass(null);
    setShowClassModal(true);
  };

  const handleEditClass = (cls: Class) => {
    setEditingClass(cls);
    setShowClassModal(true);
  };

  const handleSaveClass = async (data: ClassFormData) => {
    try {
      if (editingClass) {
        await classService.updateClass(editingClass.id, data);
      } else {
        await classService.createClass(data);
      }
      await loadData();
      setShowClassModal(false);
    } catch (error: any) {
      alert(error.message || 'Không thể lưu lớp học');
    }
  };

  const handleDeleteClass = async (cls: Class) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lớp ${cls.classCode}?\n\nChỉ xóa được lớp không có sinh viên.`)) {
      return;
    }
    try {
      await classService.deleteClass(cls.id);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Không thể xóa lớp học');
    }
  };

  const handleToggleClassActive = async (cls: Class) => {
    try {
      await classService.updateClass(cls.id, { isActive: !cls.isActive });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Không thể thay đổi trạng thái');
    }
  };

  const handleViewClassStudents = (classCode: string) => {
    setSearchTerm(classCode);
    setActiveTab('students');
  };

  const handleResetPassword = async (userId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn gửi email đặt lại mật khẩu cho người dùng này?')) return;
    try {
      // Find user email
      let email = '';
      const student = students.find(s => s.id === userId);
      if (student) email = student.email;
      else {
        const teacher = teachers.find(t => t.id === userId);
        if (teacher) email = teacher.email;
        else {
          const admin = admins.find(a => a.id === userId);
          if (admin) email = admin.email;
        }
      }

      if (!email) {
        alert('Không tìm thấy email người dùng');
        return;
      }

      await userService.resetPassword(email);
      alert(`Đã gửi email đặt lại mật khẩu tới ${email}`);
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      alert(error.message || 'Không thể đặt lại mật khẩu');
    }
  };

  const handleDeleteStudent = async (userId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa sinh viên này?')) return;

    try {
      await userService.deleteStudent(userId);
      await loadData();
      alert('Xóa thành công');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Không thể xóa sinh viên');
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa giáo viên này?')) return;
    try {
      await userService.deleteTeacher(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      alert('Không thể xóa giáo viên');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa admin này?')) {
      try {
        await userService.deleteAdmin(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete admin:', error);
      }
    }
  };

  const handleBatchDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedStudentIds.size} sinh viên đã chọn? Hành động này không thể hoàn tác.`)) return;
    try {
      await userService.batchDeleteStudents(Array.from(selectedStudentIds));
      setSelectedStudentIds(new Set());
      loadData();
      alert('Đã xóa thành công');
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  const handleBatchUpdateClass = async (classCode: string, academicYear: string) => {
    try {
      await userService.batchUpdateStudentClass(Array.from(selectedStudentIds), classCode, academicYear);
      setSelectedStudentIds(new Set());
      setShowBatchClassModal(false);
      loadData();
      alert('Đã cập nhật lớp thành công');
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi cập nhật');
    }
  };

  const handleImportExcel = async (studentsData: StudentFormData[]): Promise<ExcelImportResult> => {
    try {
      const result = await userService.batchImportStudents(studentsData);
      await loadData(); // Reload data after import
      return result;
    } catch (error: any) {
      console.error('Import failed:', error);
      return {
        success: 0,
        failed: studentsData.length,
        errors: studentsData.map((s, i) => ({
          row: i + 2,
          email: s.email,
          reason: error.message || 'Unknown error'
        }))
      };
    }
  };

  const handleSaveStudent = async (data: StudentFormData) => {
    try {
      if (editingStudent) {
        await userService.updateStudent(editingStudent.id, data);
        alert('Cập nhật sinh viên thành công!');
      } else {
        const result = await userService.createStudent(data);
        // Show generated password if available
        if (result.generatedPassword) {
          alert(
            `Tạo sinh viên thành công!\n\n` +
            `Email: ${result.email}\n` +
            `Mật khẩu tạm thời: ${result.generatedPassword}\n\n` +
            `Vui lòng lưu lại mật khẩu này và thông báo cho sinh viên.\n` +
            `Sinh viên có thể đổi mật khẩu sau khi đăng nhập.`
          );
        } else {
          alert('Tạo sinh viên thành công!');
        }
      }
      await loadData();
      setShowStudentModal(false);
    } catch (error: any) {
      console.error('Failed to save student:', error);
      alert(error.message || 'Không thể lưu sinh viên');
    }
  };

  const handleSaveTeacher = async (data: any) => {
    try {
      if (editingTeacher) {
        await userService.updateTeacher(editingTeacher.id, data);
        alert('Cập nhật giáo viên thành công!');
      } else {
        const result = await userService.createTeacher(data);
        // Show generated password if available
        if (result.generatedPassword) {
          alert(
            `Tạo giáo viên thành công!\n\n` +
            `Email: ${result.email}\n` +
            `Mật khẩu tạm thời: ${result.generatedPassword}\n\n` +
            `Vui lòng lưu lại mật khẩu này và thông báo cho giáo viên.\n` +
            `Giáo viên có thể đổi mật khẩu sau khi đăng nhập hoặc dùng chức năng "Quên mật khẩu".`
          );
        } else {
          alert('Tạo giáo viên thành công!');
        }
      }
      await loadData();
      setShowTeacherModal(false);
    } catch (error: any) {
      console.error('Failed to save teacher:', error);
      alert(error.message || 'Không thể lưu giảng viên');
    }
  };

  const handleSaveAdmin = async (data: any) => {
    try {
      if (editingAdmin) {
        await userService.updateAdmin(editingAdmin.id, data);
        alert('Cập nhật admin thành công!');
      } else {
        const result = await userService.createAdmin(data);
        // Show generated password if available
        if (result.generatedPassword) {
          alert(
            `Tạo admin thành công!\n\n` +
            `Email: ${result.email}\n` +
            `Mật khẩu tạm thời: ${result.generatedPassword}\n\n` +
            `Vui lòng lưu lại mật khẩu này và thông báo cho admin.\n` +
            `Admin có thể đổi mật khẩu sau khi đăng nhập.`
          );
        } else {
          alert('Tạo admin thành công!');
        }
      }
      await loadData();
      setShowAdminModal(false);
    } catch (error: any) {
      console.error('Failed to save admin:', error);
      alert(error.message || 'Không thể lưu admin');
    }
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
              <h1 className={styles.title}>Quản Lý {activeTab === 'classes' ? 'Lớp Học' : 'Người Dùng'}</h1>
              <p className={styles.subtitle}>
                {activeTab === 'classes'
                  ? 'Quản lý thông tin lớp, GVCN và sĩ số'
                  : 'Quản lý sinh viên, giáo viên, admin và lớp học'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'classes' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('classes')}
          >
            📁 Lớp Học ({classes.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'students' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('students')}
          >
            👨‍🎓 Sinh Viên ({students.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'teachers' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('teachers')}
          >
            👨‍🏫 Giáo Viên ({teachers.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'admins' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            👨‍💼 Admin ({admins.length})
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <input
            type="text"
            placeholder={activeTab === 'classes' ? "🔍 Tìm theo mã lớp, tên lớp..." : "🔍 Tìm kiếm theo tên, email, mã số..."}
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as any)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã vô hiệu hóa</option>
          </select>
          {activeTab === 'students' && (
            <button
              className={styles.importButton}
              onClick={() => setShowImportModal(true)}
            >
              📥 Import Excel
            </button>
          )}
          <button
            className={styles.createButton}
            onClick={
              activeTab === 'classes' ? handleCreateClass :
                activeTab === 'students' ? handleCreateStudent :
                  activeTab === 'teachers' ? handleCreateTeacher :
                    handleCreateAdmin
            }
          >
            + Thêm mới
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {activeTab === 'classes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', padding: '1rem 0' }}>
              {classes.filter(cls => {
                const matchesSearch = cls.classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  cls.className?.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesActive = filterActive === 'all' ||
                  (filterActive === 'active' ? cls.isActive : !cls.isActive);
                return matchesSearch && matchesActive;
              }).map(cls => (
                <div key={cls.id} style={{
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>📁 {cls.classCode}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>{cls.className}</p>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                      background: cls.isActive ? '#d1fae5' : '#fee2e2', color: cls.isActive ? '#065f46' : '#991b1b'
                    }}>{cls.isActive ? 'Hoạt động' : 'Vô hiệu'}</span>
                  </div>
                  <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', marginBottom: '0.5rem' }}>
                      <span>Sĩ số:</span>
                      <strong style={{ color: cls.currentStudents >= cls.maxStudents ? '#dc2626' : '#059669' }}>
                        {cls.currentStudents}/{cls.maxStudents}
                      </strong>
                    </div>
                    <div>📅 Năm học: <strong>{cls.academicYear}</strong></div>
                    {cls.advisorTeacher && <div>👨‍🏫 GVCN: <strong>{cls.advisorTeacher.displayName}</strong></div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <button
                      style={{ flex: 1, padding: '0.5rem', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => handleViewClassStudents(cls.classCode)}
                    >
                      👥 Xem DS
                    </button>
                    <button
                      style={{ flex: 1, padding: '0.5rem', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => {
                        setImportTargetClass(cls.classCode);
                        setShowImportModal(true);
                      }}
                    >
                      📥 Import
                    </button>
                    <button
                      style={{ flex: 1, padding: '0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => handleEditClass(cls)}
                    >✏️ Sửa</button>
                    <button
                      style={{ width: '40px', padding: '0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => handleToggleClassActive(cls)}
                    >{cls.isActive ? '🔒' : '🔓'}</button>
                    <button
                      style={{ width: '40px', padding: '0.5rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => handleDeleteClass(cls)}
                    >🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'students' && (
            <StudentList
              students={students}
              searchTerm={searchTerm}
              filterActive={filterActive}
              selectedIds={selectedStudentIds}
              onSelectionChange={setSelectedStudentIds}
              onEdit={handleEditStudent}
              onToggleActive={handleToggleActive}
              onResetPassword={handleResetPassword}
              onDelete={handleDeleteStudent}
            />
          )}
          {activeTab === 'teachers' && (
            <TeacherList
              teachers={teachers}
              searchTerm={searchTerm}
              filterActive={filterActive}
              onEdit={handleEditTeacher}
              onToggleActive={handleToggleActive}
              onResetPassword={handleResetPassword}
              onDelete={handleDeleteTeacher}
            />
          )}
          {activeTab === 'admins' && (
            <AdminList
              admins={admins}
              searchTerm={searchTerm}
              filterActive={filterActive}
              onEdit={handleEditAdmin}
              onToggleActive={handleToggleActive}
              onResetPassword={handleResetPassword}
              onDelete={handleDeleteAdmin}
            />
          )}
        </div>

        {/* Modals */}
        {showStudentModal && (
          <StudentModal
            classes={classes}
            student={editingStudent}
            onClose={() => setShowStudentModal(false)}
            onSave={handleSaveStudent}
          />
        )}
        {showTeacherModal && (
          <TeacherModal
            teacher={editingTeacher}
            onClose={() => setShowTeacherModal(false)}
            onSave={handleSaveTeacher}
          />
        )}
        {showAdminModal && (
          <AdminModal
            admin={editingAdmin}
            onClose={() => setShowAdminModal(false)}
            onSave={handleSaveAdmin}
          />
        )}
        {showClassModal && (
          <ClassModal
            cls={editingClass || undefined}
            teachers={teachers}
            onClose={() => setShowClassModal(false)}
            onSave={handleSaveClass}
          />
        )}
        {showImportModal && (
          <ImportExcelModal
            targetClassCode={importTargetClass || undefined}
            classes={classes}
            onClose={() => {
              setShowImportModal(false);
              setImportTargetClass('');
            }}
            onImport={handleImportExcel}
          />
        )}
        {showBatchClassModal && (
          <BatchClassModal
            classes={classes}
            count={selectedStudentIds.size}
            onClose={() => setShowBatchClassModal(false)}
            onSave={handleBatchUpdateClass}
          />
        )}

        {/* Batch Action Floating Bar */}
        {selectedStudentIds.size > 0 && activeTab === 'students' && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            padding: '1rem 2rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            zIndex: 100,
            border: '1px solid #e2e8f0'
          }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>{selectedStudentIds.size} sinh viên đã chọn</span>
            <div style={{ height: '24px', width: '1px', background: '#cbd5e1' }}></div>
            <button
              onClick={() => setShowBatchClassModal(true)}
              style={{
                background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem'
              }}
            >
              ✏️ Chuyển lớp
            </button>
            <button
              onClick={handleBatchDelete}
              style={{
                background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem'
              }}
            >
              🗑️ Xóa
            </button>
            <button
              onClick={() => setSelectedStudentIds(new Set())}
              style={{
                background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '0.875rem'
              }}
            >
              Hủy chọn
            </button>
          </div>
        )}
      </div>
    </MainLayout >
  );
}

export default UserManagement;
