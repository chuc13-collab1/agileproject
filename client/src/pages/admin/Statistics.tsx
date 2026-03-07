import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './Dashboard.module.css';

interface Stats {
  users: { total: number; students: number; teachers: number; admins: number };
  topics: { total: number; approved: number; pending: number; rejected: number };
  projects: { total: number; registered: number; in_progress: number; submitted: number; graded: number; completed: number; failed: number; overdue: number };
  archive: { total: number };
}

const COLORS = {
  approved: '#10b981',
  pending: '#f59e0b',
  rejected: '#ef4444',
  registered: '#6366f1',
  in_progress: '#3b82f6',
  submitted: '#8b5cf6',
  graded: '#ec4899',
  completed: '#10b981',
  failed: '#ef4444',
};

const StatCard = ({ icon, label, value, sub, color }: { icon: string; label: string; value: number; sub?: string; color?: string }) => (
  <div style={{
    background: 'white', borderRadius: 12, padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '1rem',
    borderLeft: `4px solid ${color || '#6366f1'}`
  }}>
    <span style={{ fontSize: '2rem' }}>{icon}</span>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: color || '#1e293b', lineHeight: 1 }}>{value}</div>
      <div style={{ fontWeight: 600, color: '#334155', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

function Statistics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const { auth } = await import('../../services/firebase/config');
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stats/counts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MainLayout><div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#64748b' }}>⏳ Đang tải dữ liệu...</div></MainLayout>;
  if (!stats) return <MainLayout><div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>❌ Không thể tải dữ liệu thống kê</div></MainLayout>;

  const topicPieData = [
    { name: 'Đã duyệt', value: stats.topics.approved, color: COLORS.approved },
    { name: 'Chờ duyệt', value: stats.topics.pending, color: COLORS.pending },
    { name: 'Từ chối', value: stats.topics.rejected, color: COLORS.rejected },
  ].filter(d => d.value > 0);

  const projectBarData = [
    { name: 'Đăng ký', value: stats.projects.registered, fill: COLORS.registered },
    { name: 'Đang làm', value: stats.projects.in_progress, fill: COLORS.in_progress },
    { name: 'Đã nộp', value: stats.projects.submitted, fill: COLORS.submitted },
    { name: 'Đã chấm', value: stats.projects.graded, fill: COLORS.graded },
    { name: 'Hoàn thành', value: stats.projects.completed, fill: COLORS.completed },
    { name: 'Không đạt', value: stats.projects.failed, fill: COLORS.failed },
  ];

  return (
    <MainLayout>
      <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
            title="Quay lại Dashboard"
          >⬅️</button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>📊 Báo Cáo Thống Kê</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Tổng quan số liệu hệ thống</p>
          </div>
          <button
            onClick={fetchStats}
            style={{ marginLeft: 'auto', padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >🔄 Làm mới</button>
        </div>

        {/* Overview Cards */}
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#475569', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>TỔNG QUAN</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <StatCard icon="👥" label="Người dùng" value={stats.users.total} sub={`${stats.users.students} SV · ${stats.users.teachers} GV`} color="#6366f1" />
            <StatCard icon="📚" label="Đề tài" value={stats.topics.total} sub={`${stats.topics.approved} đã duyệt`} color="#3b82f6" />
            <StatCard icon="🗂️" label="Đồ án" value={stats.projects.total} sub={`${stats.projects.in_progress} đang thực hiện`} color="#10b981" />
            <StatCard icon="📦" label="Thư viện lưu trữ" value={stats.archive.total} sub="đồ án đã hoàn thành" color="#f59e0b" />
            {stats.projects.overdue > 0 && (
              <StatCard icon="🚨" label="Quá hạn" value={stats.projects.overdue} sub="chưa xử lý" color="#ef4444" />
            )}
          </div>
        </section>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Topic Pie */}
          <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>📋 Trạng thái đề tài</h3>
            {topicPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={topicPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {topicPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val} đề tài`]} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có dữ liệu</p>}
          </div>

          {/* User Breakdown */}
          <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>👥 Phân bổ người dùng</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { name: 'Sinh viên', value: stats.users.students, fill: '#6366f1' },
                { name: 'Giảng viên', value: stats.users.teachers, fill: '#10b981' },
                { name: 'Admin', value: stats.users.admins, fill: '#f59e0b' },
              ]} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val: any) => [`${val} người`]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {[{ fill: '#6366f1' }, { fill: '#10b981' }, { fill: '#f59e0b' }].map((c, i) => <Cell key={i} fill={c.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects Bar Chart */}
        <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>🗂️ Trạng thái đồ án</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={projectBarData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val: any) => [`${val} đồ án`]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {projectBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detail Numbers */}
        <section>
          <h3 style={{ margin: '0 0 1rem 0', color: '#475569', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>SỐ LIỆU CHI TIẾT</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: '👨‍🎓 Sinh viên', value: stats.users.students },
              { label: '👨‍🏫 Giảng viên', value: stats.users.teachers },
              { label: '✅ Đề tài duyệt', value: stats.topics.approved },
              { label: '⏳ Đề tài chờ', value: stats.topics.pending },
              { label: '🔄 Đang làm', value: stats.projects.in_progress },
              { label: '📮 Đã nộp', value: stats.projects.submitted },
              { label: '🏆 Hoàn thành', value: stats.projects.completed },
              { label: '❌ Không đạt', value: stats.projects.failed },
              { label: '🚨 Quá hạn', value: stats.projects.overdue },
              { label: '📦 Lưu trữ', value: stats.archive.total },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 10, padding: '1rem',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' }}>{item.value}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default Statistics;
