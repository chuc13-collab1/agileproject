import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Topic } from '../../types/topic.types';
import { Teacher } from '../../types/user.types';
import * as topicService from '../../services/api/topic.service';
import * as userService from '../../services/api/user.service';
import styles from './UserManagement.module.css';

function ReviewerAssignment() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  // const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // setLoading(true);
    try {
      const [topicsData, teachersData] = await Promise.all([
        topicService.getAllTopics(),
        userService.getAllTeachers()
      ]);
      // Filter only approved topics
      setTopics(topicsData.filter(t => t.status === 'approved'));
      setTeachers(teachersData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Không thể tải dữ liệu');
    } finally {
      // setLoading(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!window.confirm('Hệ thống sẽ tự động gán ngẫu nhiên người phản biện cho các đề tài chưa có hoặc cập nhật lại toàn bộ. Bạn có chắc chắn?')) return;

    setAssigning(true);
    try {
      const result = await topicService.autoAssignReviewers();
      alert(result.message);
      await loadData();
    } catch (error) {
      console.error('Auto assign failed:', error);
      alert('Phân công thất bại');
    } finally {
      setAssigning(false);
    }
  };

  const handleReviewerChange = async (topicId: string, reviewerId: string) => {
    try {
      await topicService.updateReviewer(topicId, reviewerId);
      // Update local state to reflect change without full reload
      setTopics(prev => prev.map(t =>
        t.id === topicId
          ? { ...t, reviewerId, reviewerName: teachers.find(u => u.id === reviewerId)?.displayName }
          : t
      ));
    } catch (error) {
      console.error('Failed to update reviewer:', error);
      alert('Không thể cập nhật người phản biện');
      loadData(); // Revert on error
    }
  };

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.supervisorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className={styles.title}>Phân Công Phản Biện</h1>
              <p className={styles.subtitle}>Gán giảng viên phản biện cho các đề tài đã duyệt</p>
            </div>
          </div>
          <button
            className={styles.createButton}
            onClick={handleAutoAssign}
            disabled={assigning}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: assigning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: assigning ? 0.7 : 1
            }}
          >
            <span>⚡</span> {assigning ? 'Đang phân công...' : 'Phân Công Ngẫu Nhiên'}
          </button>
        </div>

        <div className={styles.filters}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm đề tài, GVHD..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div className={styles.content}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên Đề Tài</th>
                  <th>GV Hướng Dẫn</th>
                  <th>GV Phản Biện</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopics.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      Chưa có đề tài nào được duyệt hoặc không tìm thấy kết quả.
                    </td>
                  </tr>
                ) : (
                  filteredTopics.map((topic) => (
                    <tr key={topic.id}>
                      <td style={{ fontWeight: 500 }}>{topic.title}</td>
                      <td>{topic.supervisorName}</td>
                      <td>
                        <select
                          className={styles.pillsSelect}
                          value={topic.reviewerId || ''}
                          onChange={(e) => handleReviewerChange(topic.id, e.target.value)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            width: '100%',
                            maxWidth: '250px'
                          }}
                        >
                          <option value="">-- Chọn phản biện --</option>
                          {teachers
                            .filter(t => t.id !== topic.supervisorId) // Exclude supervisor
                            .map(teacher => (
                              <option key={teacher.id} value={teacher.id}>
                                {teacher.displayName}
                              </option>
                            ))
                          }
                        </select>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles.approved}`}>
                          {topic.reviewerId ? 'Đã phân công' : 'Chưa phân công'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ReviewerAssignment;
