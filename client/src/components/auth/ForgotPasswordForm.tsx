import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/firebase/auth.service';
import styles from './auth.module.css';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await authService.resetPassword(email);
      setSuccess('Thư đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
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
              <div className={styles.brandLogo} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <img src="/logo.jpg" alt="Logo" style={{ height: '150px', borderRadius: '10px' }} />
                QUANLYDOAN
              </div>
              <h2>Quên Mật Khẩu</h2>
              <p>Nhập email của bạn để nhận liên kết đặt lại mật khẩu</p>
            </div>

            {error && (
              <div className={styles.errorAlert}>
                <span className={styles.errorIcon}>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className={styles.successAlert} style={{ padding: '12px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email đã đăng ký</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@university.edu.vn"
                    className={styles.input}
                    disabled={loading || !!success}
                    required
                  />
                </div>
              </div>

              {!success ? (
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                  style={{ marginBottom: '16px' }}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner}></span>
                      Đang xử lý...
                    </>
                  ) : (
                    'GỬI YÊU CẦU'
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className={styles.submitButton}
                  style={{ marginBottom: '16px' }}
                >
                  QUAY LẠI ĐĂNG NHẬP
                </button>
              )}
              
              <div style={{ textAlign: 'center' }}>
                <Link to="/login" className={styles.forgotLink} style={{ display: 'inline-block' }}>
                  &larr; Quay lại Đăng nhập
                </Link>
              </div>
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
              <h3>Hỗ Trợ Nhanh Chóng</h3>
              <p>Khôi phục quyền truy cập vào hệ thống dễ dàng và bảo mật với email của bạn.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
