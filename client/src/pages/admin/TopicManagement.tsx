import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import TopicList from '../../components/admin/TopicList';
import TopicDetailModal from '../../components/admin/TopicDetailModal';
import TopicModal from '../../components/admin/TopicModal';
import { Topic, TopicStatus, Semester, TopicFormData } from '../../types/topic.types';
import * as topicService from '../../services/api/topic.service';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase/config';
import styles from './UserManagement.module.css';

function TopicManagement() {
  const navigate = useNavigate();
  // const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TopicStatus | 'all'>('all');
  const [filterSemester, setFilterSemester] = useState<Semester | 'all'>('all');
  const [filterField, setFilterField] = useState<string>('all');

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    // setLoading(true);
    try {
      const data = await topicService.getAllTopics();
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics:', error);
      alert('Không thể tải danh sách đề tài');
    } finally {
      // setLoading(false);
    }
  };

  const handleCreateTopic = async (data: TopicFormData) => {
    try {
      await topicService.createTopic(
        data
      );
      await loadTopics();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create topic:', error);
      alert('Không thể tạo đề tài');
    }
  };

  const handleApprove = async (topicId: string) => {
    try {
      await topicService.approveTopic(
        topicId
      );
      await loadTopics();
      setSelectedTopic(null);
    } catch (error) {
      console.error('Failed to approve topic:', error);
      alert('Không thể duyệt đề tài');
    }
  };

  const handleReject = async (topicId: string, reason: string) => {
    try {
      await topicService.rejectTopic(topicId, reason);
      await loadTopics();
      setSelectedTopic(null);
    } catch (error) {
      console.error('Failed to reject topic:', error);
      alert('Không thể từ chối đề tài');
    }
  };

  const handleEdit = async (topicId: string, updates: Partial<Topic>) => {
    try {
      await topicService.updateTopic(topicId, updates);
      await loadTopics();
    } catch (error) {
      console.error('Failed to edit topic:', error);
      alert('Không thể cập nhật đề tài');
    }
  };

  const handleDelete = async (topicId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa đề tài này?')) return;

    try {
      await topicService.deleteTopic(topicId);
      await loadTopics();
    } catch (error) {
      console.error('Failed to delete topic:', error);
      alert('Không thể xóa đề tài');
    }
  };

  const handleResetCounts = async () => {
    if (!window.confirm('⚠️ Reset tất cả current_students về 0? Dùng để fix bug data.')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No auth token');
      const response = await fetch('http://localhost:3001/api/debug/reset-topic-counts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await (window as any).firebase?.auth?.currentUser?.getIdToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Reset thành công!');
        await loadTopics();
      } else {
        alert('❌ Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to reset:', error);
      alert('❌ Không thể reset');
    }
  };

  const handleCreateTable = async () => {
    if (!window.confirm('🔧 Tạo bảng projects trong database?')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No auth token');
      const response = await fetch('http://localhost:3001/api/debug/create-projects-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await (window as any).firebase?.auth?.currentUser?.getIdToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Đã tạo bảng projects thành công!');
      } else {
        alert('❌ Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to create table:', error);
      alert('❌ Không thể tạo bảng');
    }
  };

  const handleAddColumns = async () => {
    if (!window.confirm('🔧 Thêm cột requirements & expected_results vào bảng topics?')) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No auth token');
      const response = await fetch('http://localhost:3001/api/debug/add-topic-columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await (window as any).firebase?.auth?.currentUser?.getIdToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Đã thêm cột thành công!');
      } else {
        alert('❌ Lỗi: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to add columns:', error);
      alert('❌ Không thể thêm cột');
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.supervisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.field.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || topic.status === filterStatus;
    const matchesSemester = filterSemester === 'all' || topic.semester === filterSemester;
    const matchesField = filterField === 'all' || topic.field === filterField;

    return matchesSearch && matchesStatus && matchesSemester && matchesField;
  });

  const pendingCount = topics.filter(t => t.status === 'pending').length;
  const approvedCount = topics.filter(t => t.status === 'approved').length;
  const rejectedCount = topics.filter(t => t.status === 'rejected').length;

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
              <h1 className={styles.title}>Quản Lý Đề Tài</h1>
              <p className={styles.subtitle}>Phê duyệt và quản lý các đề tài đồ án</p>
            </div>
          </div>
          <button
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>+</span> Thêm Đề Tài
          </button>
          <button
            onClick={handleResetCounts}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
            title="Debug: Reset current_students về 0"
          >
            🔧 Reset Counts
          </button>
          <button
            onClick={handleCreateTable}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
            title="Debug: Tạo bảng projects"
          >
            🗄️ Create Table
          </button>
          <button
            onClick={handleAddColumns}
            style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
            title="Debug: Thêm cột requirements & expected_results"
          >
            ➕ Add Columns
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#667eea' }}>
              {topics.length}
            </div>
            <div style={{ color: '#64748b', marginTop: '0.5rem' }}>
              Tổng đề tài
            </div>
          </div>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
              {pendingCount}
            </div>
            <div style={{ color: '#64748b', marginTop: '0.5rem' }}>
              Chờ duyệt
            </div>
          </div>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
              {approvedCount}
            </div>
            <div style={{ color: '#64748b', marginTop: '0.5rem' }}>
              Đã duyệt
            </div>
          </div>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>
              {rejectedCount}
            </div>
            <div style={{ color: '#64748b', marginTop: '0.5rem' }}>
              Bị từ chối
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm đề tài, giáo viên, lĩnh vực..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Bị từ chối</option>
          </select>
          <select
            className={styles.filterSelect}
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value as any)}
          >
            <option value="all">Tất cả học kỳ</option>
            <option value="1">Học kỳ 1</option>
            <option value="2">Học kỳ 2</option>
            <option value="summer">Học kỳ hè</option>
          </select>
          <select
            className={styles.filterSelect}
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
          >
            <option value="all">Tất cả lĩnh vực</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="AI & Machine Learning">AI & Machine Learning</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <TopicList
            topics={filteredTopics}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetail={setSelectedTopic}
          />
        </div>

        {/* Detail Modal */}
        {selectedTopic && (
          <TopicDetailModal
            topic={selectedTopic}
            onClose={() => setSelectedTopic(null)}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <TopicModal
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateTopic}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default TopicManagement;
