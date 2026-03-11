import React, { useEffect } from 'react';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';

const ForgotPasswordPage: React.FC = () => {
    useEffect(() => {
        document.title = 'Quên Mật Khẩu | Hệ thống Quản lý Đồ án';
    }, []);

    return <ForgotPasswordForm />;
};

export default ForgotPasswordPage;
