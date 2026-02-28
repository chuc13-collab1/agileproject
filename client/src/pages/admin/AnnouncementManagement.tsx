import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Announcement, AnnouncementFormData } from '../../types/announcement.types';
import * as announcementService from '../../services/api/announcement.service';
import styles from './UserManagement.module.css'; // Reusing styles

function AnnouncementManagement() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  // const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  // Form State
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    semester: 'HK1',
    academicYear: '2024-2025',
    registrationStart: '',
    registrationEnd: '',
    status: 'draft'
  });
  const [sendEmail, setSendEmail] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await announcementService.getAllAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error(error);
      alert('Không thể tải danh sách thông báo');
    } finally {
      // setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      semester: 'HK1',
      academicYear: '2024-2025',
      registrationStart: '',
      registrationEnd: '',
      status: 'draft'
    });
    setSendEmail(false);
    setShowModal(true);
  };

  const handleEdit = (item: Announcement) => {
    setEditingItem(item);
    // Format dates for input (YYYY-MM-DDTHH:mm)
    const formatDate = (date: Date) => {
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    setFormData({
      title: item.title,
      content: item.content,
      semester: item.semester,
      academicYear: item.academicYear,
      registrationStart: formatDate(item.registrationStart),
      registrationEnd: formatDate(item.registrationEnd),
      status: item.status
    });
    setSendEmail(false);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa đợt đăng ký này?')) return;
    try {
      await announcementService.deleteAnnouncement(id);
      await loadAnnouncements();
    } catch (error) {
      alert('Không thể xóa');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sendEmail && formData.status === 'published') {
      const confirmed = window.confirm(
        'Bạn có chắc muốn gửi email thông báo đến TẤT CẢ sinh viên?\n\nEmail sẽ được gửi ngay sau khi lưu thông báo.'
      );
      if (!confirmed) return;
    }

    try {
      const payload = { ...formData, sendEmail: sendEmail && formData.status === 'published' };
      if (editingItem) {
        await announcementService.updateAnnouncement(editingItem.id, payload);
      } else {
        await announcementService.createAnnouncement(payload);
      }
      setShowModal(false);
      await loadAnnouncements();
      if (sendEmail && formData.status === 'published') {
        alert('✅ Thông báo đã được lưu và email đang được gửi đến sinh viên!');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Có lỗi xảy ra');
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
              <h1 className={styles.title}>Quản Lý Đợt Đồ Án</h1>
              <p className={styles.subtitle}>Tạo và quản lý các đợt đăng ký đồ án</p>
            </div>
          </div>
          <button className={styles.createButton} onClick={handleCreate}>+ Tạo đợt mới</button>
        </div>

        <div className={styles.content}>
          {announcements.map(item => (
            <div key={item.id} style={{
              background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem',
              border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
                      background: item.status === 'published' ? '#d1fae5' : item.status === 'closed' ? '#f1f5f9' : '#fff7ed',
                      color: item.status === 'published' ? '#065f46' : item.status === 'closed' ? '#64748b' : '#9a3412'
                    }}>
                      {item.status === 'published' ? 'Đang mở' : item.status === 'closed' ? 'Đã đóng' : 'Bản nháp'}
                    </span>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {item.semester} / {item.academicYear}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{item.title}</h3>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', display: 'flex', gap: '2rem' }}>
                    <span>📅 Đăng ký: <strong>{item.registrationStart.toLocaleString('vi-VN')}</strong> - <strong>{item.registrationEnd.toLocaleString('vi-VN')}</strong></span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(item)} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => handleDelete(item.id)} style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fee2e2', color: '#991b1b', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {announcements.length === 0 && <div className={styles.emptyState}>Chưa có đợt đồ án nào</div>}
        </div>

        {/* Simple Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50
          }} onClick={() => setShowModal(false)}>
            <div style={{
              background: 'white', padding: '2rem', borderRadius: '12px', width: '600px', maxWidth: '90%'
            }} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginTop: 0 }}>Let's Setup Project Period</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Tiêu đề</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    placeholder="Đồ án Chuyên ngành K22 - HK1"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Học kỳ</label>
                    <select value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="HK1">Học kỳ 1</option>
                      <option value="HK2">Học kỳ 2</option>
                      <option value="Hè">Học kỳ Hè</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Năm học</label>
                    <input required type="text" value={formData.academicYear} onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      placeholder="2024-2025"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Bắt đầu đăng ký</label>
                    <input required type="datetime-local" value={formData.registrationStart} onChange={e => setFormData({ ...formData, registrationStart: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Kết thúc đăng ký</label>
                    <input required type="datetime-local" value={formData.registrationEnd} onChange={e => setFormData({ ...formData, registrationEnd: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Nội dung / Ghi chú</label>
                  <textarea rows={4} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Trạng thái</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="draft">Bản nháp (Chưa công bố)</option>
                    <option value="published">Công bố (Cho phép xem)</option>
                    <option value="closed">Đã đóng</option>
                  </select>
                </div>

                {/* Email notification checkbox */}
                {formData.status === 'published' && (
                  <div style={{
                    marginBottom: '1.5rem', padding: '1rem', background: '#f0f9ff',
                    borderRadius: '8px', border: '1px solid #bae6fd'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={e => setSendEmail(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
                      />
                      <div>
                        <span style={{ fontWeight: 600, color: '#0369a1' }}>📧 Gửi email thông báo đến sinh viên</span>
                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                          Email sẽ được gửi đến tất cả sinh viên đang hoạt động trong hệ thống
                        </p>
                      </div>
                    </label>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>Hủy</button>
                  <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    {editingItem ? 'Lưu thay đổi' : 'Tạo đợt mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default AnnouncementManagement;
