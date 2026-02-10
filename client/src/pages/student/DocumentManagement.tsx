import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import * as projectService from '../../services/api/project.service';
import styles from './Student.module.css';

interface Document {
    id: string;
    name: string;
    category: 'outline' | 'report' | 'slides' | 'code' | 'other';
    url: string;
    size: number;
    uploadedAt: Date;
    version: number;
}

const DocumentManagement: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadCategory, setUploadCategory] = useState<string>('other');

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const allProjects = await projectService.getAllProjects();
            const myProject = allProjects.find(p => p.studentId === user?.uid);
            setProject(myProject || null);

            // In real app, fetch documents from API
            // const docs = await documentService.getDocuments(myProject.id);
            setDocuments([]);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !project) return;

        setUploading(true);
        try {
            // In real app: await documentService.uploadDocument(project.id, selectedFile, uploadCategory);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload

            alert('Upload tài liệu thành công!');
            setSelectedFile(null);
            loadData();
        } catch (error) {
            console.error('Failed to upload:', error);
            alert('Upload thất bại. Vui lòng thử lại.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (_docId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;

        try {
            // await documentService.deleteDocument(_docId);
            alert('Đã xóa tài liệu');
            loadData();
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Xóa thất bại');
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: { [key: string]: string } = {
            'outline': 'Đề cương',
            'report': 'Báo cáo',
            'slides': 'Slide thuyết trình',
            'code': 'Source code',
            'other': 'Khác'
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'outline': '#3b82f6',
            'report': '#10b981',
            'slides': '#f59e0b',
            'code': '#8b5cf6',
            'other': '#64748b'
        };
        return colors[category] || '#64748b';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const filteredDocs = selectedCategory === 'all'
        ? documents
        : documents.filter(d => d.category === selectedCategory);

    if (loading) {
        return <MainLayout><div style={{ padding: '2rem' }}>Đang tải...</div></MainLayout>;
    }

    if (!project) {
        return (
            <MainLayout>
                <div className={styles.container}>
                    <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</p>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Chưa có đồ án</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            Bạn cần đăng ký đề tài trước khi quản lý tài liệu
                        </p>
                        <button
                            onClick={() => navigate('/student/topics')}
                            className={styles.button}
                            style={{ background: '#3b82f6', color: 'white' }}
                        >
                            Đăng ký đề tài ngay
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/student/my-project')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                padding: '0.5rem'
                            }}
                        >
                            ⬅️
                        </button>
                        <div>
                            <h1 className={styles.title}>📁 Quản Lý Tài Liệu</h1>
                            <p className={styles.subtitle}>Upload và quản lý tài liệu đồ án</p>
                        </div>
                    </div>
                </div>

                {/* Project Info */}
                <div
                    style={{
                        background: '#f8fafc',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        borderLeft: '4px solid #3b82f6'
                    }}
                >
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        Đồ án:
                    </div>
                    <div style={{ fontWeight: 600 }}>{project.title}</div>
                </div>

                {/* Upload Section */}
                <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
                    <h3 className={styles.sectionTitle}>📤 Upload Tài Liệu</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'end' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Chọn file</label>
                            <input
                                type="file"
                                onChange={handleFileSelect}
                                className={styles.formInput}
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                            />
                            {selectedFile && (
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Loại tài liệu</label>
                            <select
                                value={uploadCategory}
                                onChange={(e) => setUploadCategory(e.target.value)}
                                className={styles.formSelect}
                            >
                                <option value="outline">Đề cương</option>
                                <option value="report">Báo cáo</option>
                                <option value="slides">Slide thuyết trình</option>
                                <option value="code">Source code</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            className={styles.button}
                            style={{
                                background: (!selectedFile || uploading) ? '#94a3b8' : '#10b981',
                                color: 'white',
                                padding: '0.75rem 1.5rem'
                            }}
                        >
                            {uploading ? '⏳ Đang upload...' : '📤 Upload'}
                        </button>
                    </div>
                </div>

                {/* Filter */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'outline', label: 'Đề cương' },
                        { value: 'report', label: 'Báo cáo' },
                        { value: 'slides', label: 'Slide' },
                        { value: 'code', label: 'Source code' },
                        { value: 'other', label: 'Khác' }
                    ].map(item => (
                        <button
                            key={item.value}
                            onClick={() => setSelectedCategory(item.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                border: 'none',
                                borderRadius: '0.5rem',
                                background: selectedCategory === item.value ? '#3b82f6' : '#f1f5f9',
                                color: selectedCategory === item.value ? 'white' : '#475569',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Documents List */}
                {filteredDocs.length === 0 ? (
                    <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</p>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Chưa có tài liệu</h2>
                        <p style={{ color: '#64748b' }}>Upload tài liệu đầu tiên của bạn</p>
                    </div>
                ) : (
                    <div className={styles.card}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Tên file</th>
                                    <th>Loại</th>
                                    <th>Kích thước</th>
                                    <th>Ngày upload</th>
                                    <th>Phiên bản</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.map(doc => (
                                    <tr key={doc.id}>
                                        <td style={{ fontWeight: 500 }}>{doc.name}</td>
                                        <td>
                                            <span
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    background: getCategoryColor(doc.category) + '20',
                                                    color: getCategoryColor(doc.category)
                                                }}
                                            >
                                                {getCategoryLabel(doc.category)}
                                            </span>
                                        </td>
                                        <td>{formatFileSize(doc.size)}</td>
                                        <td>{new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}</td>
                                        <td>v{doc.version}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => window.open(doc.url, '_blank')}
                                                    style={{
                                                        padding: '0.25rem 0.75rem',
                                                        background: '#3b82f6',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '0.375rem',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    📥 Tải về
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(doc.id)}
                                                    style={{
                                                        padding: '0.25rem 0.75rem',
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '0.375rem',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    🗑️ Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default DocumentManagement;
