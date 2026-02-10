// Project Management Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import ProjectList from '../../components/admin/ProjectList';
import ProjectModal from '../../components/admin/ProjectModal';
import { Project, ProjectFormData } from '../../types/project.types';
import { Student, Teacher } from '../../types/user.types';
import * as projectService from '../../services/api/project.service';
import * as userService from '../../services/api/user.service';
import styles from './ProjectManagement.module.css';

const ProjectManagement = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsData, studentsData, teachersData] = await Promise.all([
        projectService.getAllProjects(),
        userService.getAllStudents(),
        userService.getAllTeachers()
      ]);
      setProjects(projectsData);
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setShowModal(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleDeleteProject = async (project: Project) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đồ án "${project.title}"?`)) return;

    try {
      await projectService.deleteProject(project.id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Không thể xóa đồ án');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  const handleSaveProject = async (formData: ProjectFormData) => {
    try {
      const student = students.find(s => s.id === formData.studentId);
      const supervisor = teachers.find(t => t.id === formData.supervisorId);
      const reviewer = formData.reviewerId ? teachers.find(t => t.id === formData.reviewerId) : undefined;

      if (!student || !supervisor) {
        alert('Thông tin sinh viên hoặc giảng viên không hợp lệ');
        return;
      }

      const projectData = {
        title: formData.title,
        description: formData.description,
        studentId: student.id,
        studentName: student.displayName,
        studentEmail: student.email,
        supervisor: {
          id: supervisor.id,
          name: supervisor.displayName
        },
        reviewer: reviewer ? {
          id: reviewer.id,
          name: reviewer.displayName
        } : undefined,
        status: (selectedProject?.status || 'pending') as any, // Keep existing status or default to pending
        semester: formData.semester,
        academicYear: formData.academicYear,
        field: formData.category,
        registrationDate: new Date(formData.startDate),
        reportDeadline: new Date(formData.endDate),
      };

      if (selectedProject) {
        await projectService.updateProject(selectedProject.id, projectData);
      } else {
        await projectService.createProject(projectData);
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Không thể lưu đồ án');
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
            <div className={styles.titleSection}>
              <h1>📚 Quản Lý Đồ Án</h1>
              <p>Quản lý tất cả đồ án trong hệ thống</p>
            </div>
          </div>
          <button className={styles.createButton} onClick={handleCreateProject}>
            + Tạo đồ án mới
          </button>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo tên đồ án, sinh viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="in-progress">Đang thực hiện</option>
              <option value="submitted">Đã nộp</option>
              <option value="reviewing">Đang chấm</option>
              <option value="completed">Hoàn thành</option>
              <option value="rejected">Từ chối</option>
            </select>

            <select className={styles.filterSelect}>
              <option value="">Tất cả học kỳ</option>
              <option value="1">Học kỳ 1</option>
              <option value="2">Học kỳ 2</option>
              <option value="3">Học kỳ 3</option>
            </select>

            <select className={styles.filterSelect}>
              <option value="">Tất cả năm học</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>
        </div>

        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Tổng đồ án:</span>
            <span className={styles.statValue}>{projects.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Đang thực hiện:</span>
            <span className={styles.statValue}>
              {projects.filter(p => p.status === 'in-progress').length}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Hoàn thành:</span>
            <span className={styles.statValue}>
              {projects.filter(p => p.status === 'completed').length}
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</div>
        ) : (
          <ProjectList
            projects={projects}
            onEdit={handleEditProject}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onDelete={handleDeleteProject}
          />
        )}

        {showModal && (
          <ProjectModal
            project={selectedProject}
            students={students}
            teachers={teachers}
            onClose={handleCloseModal}
            onSave={handleSaveProject}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectManagement;
