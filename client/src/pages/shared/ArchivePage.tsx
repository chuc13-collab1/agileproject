// Project Archive Page — Library/Repository
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase/config';
import styles from './Archive.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ArchivedProject {
    id: number;
    project_id: string;
    topic_title: string;
    topic_field: string | null;
    student_name: string;
    student_code: string | null;
    class_name: string | null;
    supervisor_name: string | null;
    reviewer_name: string | null;
    academic_year: string;
    semester: string | null;
    final_score: number | null;
    grade: string | null;
    status: string;
    description: string | null;
    document_url: string | null;
    archived_at: string;
}

interface Filters {
    fields: string[];
    years: string[];
    grades: string[];
}

const ArchivePage: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [projects, setProjects] = useState<ArchivedProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [archiving, setArchiving] = useState(false);
    const [archiveMsg, setArchiveMsg] = useState('');
    const [search, setSearch] = useState('');
    const [field, setField] = useState('');
    const [year, setYear] = useState('');
    const [grade, setGrade] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState<Filters>({ fields: [], years: [], grades: [] });
    const [stats, setStats] = useState<{ total: number; byYear: any[]; byField: any[] }>({
        total: 0, byYear: [], byField: [],
    });

    const getHeaders = async () => {
        const token = await auth.currentUser?.getIdToken();
        return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    };

    const handleBatchArchive = async () => {
        const academicYear = prompt('Nhập năm học (VD: 2025-2026):');
        if (!academicYear) return;
        const semester = prompt('Nhập học kỳ (1 hoặc 2, bỏ trống nếu không cần):') || '';

        try {
            setArchiving(true);
            setArchiveMsg('');
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/archive/batch`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ academicYear, semester: semester || undefined }),
            });
            const data = await res.json();
            if (data.success) {
                setArchiveMsg(`✅ Đã lưu trữ ${data.data.archived} đồ án (tổng: ${data.data.total} hoàn thành)`);
                fetchProjects();
                fetchStats();
            } else {
                setArchiveMsg(`❌ ${data.message}`);
            }
        } catch (err) {
            setArchiveMsg('❌ Lỗi khi lưu trữ');
        } finally {
            setArchiving(false);
        }
    };

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            const headers = await getHeaders();
            const params = new URLSearchParams({
                page: String(page),
                limit: '12',
                sort,
            });
            if (search) params.set('search', search);
            if (field) params.set('field', field);
            if (year) params.set('year', year);
            if (grade) params.set('grade', grade);

            const res = await fetch(`${API_URL}/archive?${params}`, { headers });
            const data = await res.json();

            if (data.success) {
                setProjects(data.data);
                setTotalPages(data.pagination.totalPages);
                setTotal(data.pagination.total);
                setFilters(data.filters);
            }
        } catch (err) {
            console.error('Failed to fetch archive:', err);
        } finally {
            setLoading(false);
        }
    }, [page, search, field, year, grade, sort]);

    const fetchStats = useCallback(async () => {
        try {
            const headers = await getHeaders();
            const res = await fetch(`${API_URL}/archive/stats/summary`, { headers });
            const data = await res.json();
            if (data.success) setStats(data.data);
        } catch { /* noop */ }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);
    useEffect(() => { fetchStats(); }, [fetchStats]);

    // Debounced search
    const [searchDebounce, setSearchDebounce] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchDebounce);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchDebounce]);

    const getGradeClass = (g: string | null) => {
        if (!g) return '';
        const letter = g.charAt(0).toUpperCase();
        switch (letter) {
            case 'A': return styles.gradeA;
            case 'B': return styles.gradeB;
            case 'C': return styles.gradeC;
            case 'D': return styles.gradeD;
            default: return styles.gradeF;
        }
    };

    return (
        <div className={styles.archivePage}>
            <div className={styles.archiveHeader}>
                <div>
                    <h1>📚 Thư viện đồ án</h1>
                    <p>Kho lưu trữ các đồ án đã hoàn thành qua các năm học</p>
                </div>
                {isAdmin && (
                    <button
                        className={styles.archiveArchiveBtn}
                        onClick={handleBatchArchive}
                        disabled={archiving}
                    >
                        {archiving ? '⏳ Đang lưu trữ...' : '📥 Lưu trữ đồ án hoàn thành'}
                    </button>
                )}
            </div>
            {archiveMsg && (
                <div style={{
                    padding: '12px 16px', marginBottom: 16, borderRadius: 8,
                    background: archiveMsg.startsWith('✅') ? '#e6f8e0' : '#fde8e8',
                    fontSize: 14, fontWeight: 600,
                }}>
                    {archiveMsg}
                </div>
            )}

            {/* Stats */}
            <div className={styles.archiveStats}>
                <div className={styles.archiveStatCard}>
                    <span className={styles.archiveStatNumber}>{stats.total}</span>
                    <span className={styles.archiveStatLabel}>Tổng đồ án</span>
                </div>
                {stats.byYear?.slice(0, 3).map((y: any) => (
                    <div key={y.academic_year} className={styles.archiveStatCard}>
                        <span className={styles.archiveStatNumber}>{y.count}</span>
                        <span className={styles.archiveStatLabel}>{y.academic_year}</span>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className={styles.archiveToolbar}>
                <input
                    className={styles.archiveSearch}
                    type="text"
                    placeholder="🔍 Tìm kiếm đồ án, sinh viên, giảng viên..."
                    value={searchDebounce}
                    onChange={(e) => setSearchDebounce(e.target.value)}
                />
                <select
                    className={styles.archiveSelect}
                    value={field}
                    onChange={(e) => { setField(e.target.value); setPage(1); }}
                >
                    <option value="">Tất cả lĩnh vực</option>
                    {filters.fields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <select
                    className={styles.archiveSelect}
                    value={year}
                    onChange={(e) => { setYear(e.target.value); setPage(1); }}
                >
                    <option value="">Tất cả năm học</option>
                    {filters.years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select
                    className={styles.archiveSelect}
                    value={grade}
                    onChange={(e) => { setGrade(e.target.value); setPage(1); }}
                >
                    <option value="">Tất cả loại</option>
                    {filters.grades.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <select
                    className={styles.archiveSelect}
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="score_high">Điểm cao → thấp</option>
                    <option value="score_low">Điểm thấp → cao</option>
                    <option value="alpha">A → Z</option>
                </select>
            </div>

            {/* Results */}
            {loading ? (
                <div className={styles.archiveLoading}>
                    <div className={styles.archiveSpinner} />
                </div>
            ) : projects.length === 0 ? (
                <div className={styles.archiveEmpty}>
                    <div className={styles.archiveEmptyIcon}>📚</div>
                    <p className={styles.archiveEmptyText}>Không tìm thấy đồ án</p>
                    <p className={styles.archiveEmptySubtext}>
                        {search || field || year || grade
                            ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                            : 'Chưa có đồ án nào được lưu trữ'}
                    </p>
                </div>
            ) : (
                <>
                    <p style={{ fontSize: 13, color: '#65676b', marginBottom: 12 }}>
                        Tìm thấy <strong>{total}</strong> đồ án
                    </p>
                    <div className={styles.archiveGrid}>
                        {projects.map((project) => (
                            <div key={project.id} className={styles.archiveCard}>
                                <div className={styles.archiveCardHeader}>
                                    {project.topic_field && (
                                        <div className={styles.archiveCardField}>{project.topic_field}</div>
                                    )}
                                    <div className={styles.archiveCardTitle}>{project.topic_title}</div>
                                </div>
                                <div className={styles.archiveCardBody}>
                                    <div className={styles.archiveCardRow}>
                                        <span>👤</span>
                                        <span>{project.student_name} {project.student_code ? `(${project.student_code})` : ''}</span>
                                    </div>
                                    {project.class_name && (
                                        <div className={styles.archiveCardRow}>
                                            <span>🏫</span>
                                            <span>{project.class_name}</span>
                                        </div>
                                    )}
                                    {project.supervisor_name && (
                                        <div className={styles.archiveCardRow}>
                                            <span>👨‍🏫</span>
                                            <span>GVHD: {project.supervisor_name}</span>
                                        </div>
                                    )}
                                    {project.reviewer_name && (
                                        <div className={styles.archiveCardRow}>
                                            <span>📖</span>
                                            <span>GVPB: {project.reviewer_name}</span>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.archiveCardFooter}>
                                    <span className={styles.archiveCardYear}>
                                        📅 {project.academic_year}
                                        {project.semester ? ` - HK${project.semester}` : ''}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {project.final_score != null && (
                                            <span className={styles.archiveCardScore}>
                                                {project.final_score.toFixed(1)}
                                            </span>
                                        )}
                                        {project.grade && (
                                            <span className={`${styles.archiveCardGrade} ${getGradeClass(project.grade)}`}>
                                                {project.grade}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className={styles.archivePagination}>
                            <button
                                className={styles.archivePageBtn}
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                            >
                                ← Trước
                            </button>
                            <span className={styles.archivePageInfo}>
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                className={styles.archivePageBtn}
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Sau →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ArchivePage;
