import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#dc2626' }}>Truy cập bị từ chối</h1>
                <p style={{ fontSize: '1.2rem', color: '#4b5563', marginBottom: '2rem', maxWidth: '500px' }}>
                    Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ với quản trị viên nếu bạn cho rằng đây là một lỗi.
                </p>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Trở về Trang chủ
                </button>
            </div>
        </MainLayout>
    );
};

export default Unauthorized;
