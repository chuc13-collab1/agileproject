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
  const [topics, setTopics] = useState<any[]>([]); // Store all topics
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Import * as topicService is not standard if we use named exports, so ensure consistency
      // Assuming topicService is imported or import functions directly
      // Let's assume we need to import getAllTopics.
      // But wait, the file imports * as projectService, * as userService.
      // I need to add import * as topicService
      const [projectsData, studentsData, teachersData, topicsData] = await Promise.all([
        projectService.getAllProjects(),
        userService.getAllStudents(),
        userService.getAllTeachers(),
        import('../../services/api/topic.service').then(m => m.getAllTopics())
      ]);
      setProjects(projectsData);
      setStudents(studentsData);
      setTeachers(teachersData);
      setTopics(topicsData);

      console.log('Loaded Data:', {
        projectsCount: projectsData.length,
        studentsCount: studentsData.length,
        teachersCount: teachersData.length,
        topicsCount: topicsData.length
      });
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
    console.log('Editing project:', project);
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

  const handleApproveProject = async (project: Project) => {
    if (!window.confirm(`Duyệt đồ án "${project.title}"?`)) return;
    try {
      await projectService.updateProject(project.id, { status: 'in_progress' });
      alert('✅ Đã duyệt đồ án! Trạng thái: Đang thực hiện');
      await loadData();
    } catch (error) {
      console.error('Failed to approve project:', error);
      alert('Lỗi khi duyệt đồ án');
    }
  };

  const handleRejectProject = async (project: Project) => {
    if (!window.confirm(`Từ chối đồ án "${project.title}"?`)) return;
    try {
      await projectService.updateProject(project.id, { status: 'failed' });
      alert('❌ Đã từ chối đồ án! Trạng thái: Thất bại');
      await loadData();
    } catch (error) {
      console.error('Failed to reject project:', error);
      alert('Lỗi khi từ chối đồ án');
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

      if (!student) {
        alert('Thông tin sinh viên không hợp lệ');
        return;
      }

      if (selectedProject) {
        // UPDATE MODE: Only send fields that can be updated via API
        const updateData: any = {};

        // Only add supervisor if changed - use teacherDbId for database foreign key
        if (supervisor && supervisor.teacherDbId && supervisor.teacherDbId !== selectedProject.supervisor?.id) {
          updateData.supervisorId = supervisor.teacherDbId;
        }

        // Only add reviewer if changed - use teacherDbId for database foreign key
        if (reviewer && reviewer.teacherDbId && reviewer.teacherDbId !== selectedProject.reviewer?.id) {
          updateData.reviewerId = reviewer.teacherDbId;
        } else if (!reviewer && selectedProject.reviewer) {
          updateData.reviewerId = null; // Remove reviewer
        }

        // Add reportDeadline if changed
        const newDeadline = new Date(formData.endDate);
        if (newDeadline.getTime() !== new Date(selectedProject.reportDeadline).getTime()) {
          updateData.reportDeadline = newDeadline;
        }

        // Check if there are any changes
        if (Object.keys(updateData).length === 0) {
          alert('Không có thay đổi nào để cập nhật');
          handleCloseModal();
          return;
        }

        await projectService.updateProject(selectedProject.id, updateData);
        alert('✅ Đã cập nhật đồ án thành công!');
      } else {
        // CREATE MODE: Need topic and all required fields
        if (!supervisor) {
          alert('Vui lòng chọn giảng viên hướng dẫn');
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
          status: 'registered' as any,
          semester: formData.semester,
          academicYear: formData.academicYear,
          field: formData.category,
          registrationDate: new Date(formData.startDate),
          reportDeadline: new Date(formData.endDate),
          supervisorId: supervisor.teacherDbId || supervisor.id, // Use teacherDbId if available
          topicId: '', // TODO: Need to select or create topic
        };

        await projectService.createProject(projectData);
        alert('✅ Đã tạo đồ án mới thành công!');
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Không thể lưu đồ án: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
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
              <option value="registered">Đã đăng ký</option>
              <option value="in_progress">Đang thực hiện</option>
              <option value="submitted">Đã nộp</option>
              <option value="graded">Đã chấm điểm</option>
              <option value="completed">Hoàn thành</option>
              <option value="failed">Không đạt/Từ chối</option>
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
              {projects.filter(p => p.status === 'in_progress').length}
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
            onApprove={handleApproveProject}
            onReject={handleRejectProject}
          />
        )}

        {showModal && (
          <ProjectModal
            project={selectedProject}
            students={students}
            teachers={teachers}
            topics={topics} // Pass topics for auto-fill
            onClose={handleCloseModal}
            onSave={handleSaveProject}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectManagement;
