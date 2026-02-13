// Login Form Component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './auth.module.css';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login({ email, password });

      // Redirect based on role will be handled by App routing
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authCard}>
        {/* Left Side - Form */}
        <div className={styles.formSide}>
          <div className={styles.formWrapper}>
            <div className={styles.formHeader}>
              <div className={styles.brandLogo}>QUANLYDOAN</div>
              <h2>Đăng Nhập</h2>
              <p>Chào mừng bạn quay trở lại hệ thống</p>
            </div>

            {error && (
              <div className={styles.errorAlert}>
                <span className={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@university.edu.vn"
                    className={styles.input}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Mật khẩu</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn"
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

              <div className={styles.formOptions}>
                <label className={styles.checkbox}>
                  <input type="checkbox" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <a href="/forgot-password" className={styles.forgotLink}>
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Đang đăng nhập...
                  </>
                ) : (
                  'ĐĂNG NHẬP'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className={styles.imageSide}>
          <div className={styles.illustrationContainer}>
            <img
              src="/images/login-illustration-new.jpg"
              alt="Login Illustration"
              className={styles.illustration}
            />
            <div className={styles.overlayText}>
              <h3>Quản Lý Đồ Án Hiệu Quả</h3>
              <p>Kết nối sinh viên và giảng viên, theo dõi tiến độ dễ dàng và thuận tiện.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
