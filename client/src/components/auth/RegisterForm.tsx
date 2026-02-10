// Register Form Component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './auth.module.css';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role,
      });
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formHeader}>
          <h2>Đăng Ký Tài Khoản</h2>
          <p>Hệ Thống Quản Lý Đồ Án</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="fullName">
            Họ và tên <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            className={styles.input}
            disabled={loading}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">
            Email <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@university.edu.vn"
            className={styles.input}
            disabled={loading}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Số điện thoại</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0123456789"
            className={styles.input}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="role">
            Vai trò <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={styles.input}
            disabled={loading}
            required
          >
            <option value="student">Sinh viên</option>
            <option value="teacher">Giảng viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">
            Mật khẩu <span style={{ color: 'red' }}>*</span>
          </label>
          <div className={styles.passwordInput}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ít nhất 6 ký tự"
              className={styles.input}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.togglePassword}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">
            Xác nhận mật khẩu <span style={{ color: 'red' }}>*</span>
          </label>
          <div className={styles.passwordInput}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              className={styles.input}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.togglePassword}
              disabled={loading}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              <span>Đang đăng ký...</span>
            </>
          ) : (
            'Đăng Ký'
          )}
        </button>

        <div className={styles.formFooter}>
          <span>Đã có tài khoản?</span>
          <a href="/login" className={styles.registerLink}>
            Đăng nhập ngay
          </a>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
