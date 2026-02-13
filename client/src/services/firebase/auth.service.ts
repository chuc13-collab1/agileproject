// Firebase Authentication Service
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './config';
import { LoginCredentials, RegisterData, User } from '../../types/auth.types';

// API Base URL  
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class AuthService {
  // Đăng nhập
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // 2. Get user info from MySQL via backend API
      const token = await userCredential.user.getIdToken();
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user information');
      }

      const { data } = await response.json();
      
      if (!data.is_active) {
        throw new Error('Tài khoản đã bị vô hiệu hóa');
      }

      return {
        uid: userCredential.user.uid,
        email: data.email,
        fullName: data.display_name,
        role: data.role,
        phone: data.phone,
        avatar: data.photo_url,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Đăng ký (Admin tạo tài khoản)
  async register(data: RegisterData): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // User data is managed in MySQL via backend API
      // This method is mainly for creating Firebase Auth account
      // The actual user record should be created in MySQL by the backend
      
      return {
        uid: userCredential.user.uid,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        phone: data.phone || '',
        avatar: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
    } catch (error: any) {
      console.error('Register error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Đăng xuất thất bại');
    }
  }

  // Quên mật khẩu
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser(): Promise<User | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
      // Get user info from MySQL via backend API
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to get user information');
        return null;
      }

      const { data } = await response.json();
      
      return {
        uid: currentUser.uid,
        email: data.email,
        fullName: data.display_name,
        role: data.role,
        phone: data.phone,
        avatar: data.photo_url,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Xử lý lỗi Firebase Auth
  private handleAuthError(error: any): Error {
    const errorCode = error.code;
    let message = 'Đã có lỗi xảy ra';

    switch (errorCode) {
      case 'auth/invalid-email':
        message = 'Email không hợp lệ';
        break;
      case 'auth/user-disabled':
        message = 'Tài khoản đã bị vô hiệu hóa';
        break;
      case 'auth/user-not-found':
        message = 'Email không tồn tại trong hệ thống';
        break;
      case 'auth/wrong-password':
        message = 'Mật khẩu không chính xác';
        break;
      case 'auth/email-already-in-use':
        message = 'Email đã được sử dụng';
        break;
      case 'auth/weak-password':
        message = 'Mật khẩu quá yếu (tối thiểu 6 ký tự)';
        break;
      case 'auth/network-request-failed':
        message = 'Lỗi kết nối mạng';
        break;
      case 'auth/too-many-requests':
        message = 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
        break;
      default:
        message = error.message || 'Đã có lỗi xảy ra';
    }

    return new Error(message);
  }
}

export default new AuthService();
