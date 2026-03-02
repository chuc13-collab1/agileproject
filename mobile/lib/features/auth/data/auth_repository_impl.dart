import 'package:firebase_auth/firebase_auth.dart';

import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../domain/auth_repository.dart';
import '../domain/user_model.dart';

/// Auth repository implementation using Firebase Auth + backend API
class AuthRepositoryImpl implements AuthRepository {
  final FirebaseAuth _firebaseAuth;
  final DioClient _dioClient;

  AuthRepositoryImpl({FirebaseAuth? firebaseAuth, required DioClient dioClient})
    : _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance,
      _dioClient = dioClient;

  @override
  bool get isAuthenticated => _firebaseAuth.currentUser != null;

  @override
  Future<UserModel> login(String email, String password) async {
    try {
      // 1. Login with Firebase
      print('[AUTH] Attempting Firebase login with: $email');
      final credential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      print('[AUTH] Firebase login success: ${credential.user?.uid}');

      // 2. Get user info from backend
      final user = await getCurrentUser();
      if (user == null) {
        throw Exception('User not found in database');
      }

      return user;
    } on FirebaseAuthException catch (e) {
      print(
        '[AUTH] FirebaseAuthException: code=${e.code}, message=${e.message}',
      );
      throw _mapFirebaseError(e);
    } catch (e) {
      print('[AUTH] Generic error: $e');
      rethrow;
    }
  }

  @override
  Future<void> logout() async {
    await _firebaseAuth.signOut();
  }

  @override
  Future<UserModel?> getCurrentUser() async {
    if (!isAuthenticated) return null;

    try {
      final response = await _dioClient.get(ApiEndpoints.authMe);
      final data = response.data;

      if (data['success'] == true && data['data'] != null) {
        return UserModel.fromJson(data['data']);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Map Firebase auth errors to user-friendly messages
  Exception _mapFirebaseError(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return Exception('Email không tồn tại trong hệ thống');
      case 'wrong-password':
        return Exception('Mật khẩu không đúng');
      case 'invalid-email':
        return Exception('Email không hợp lệ');
      case 'user-disabled':
        return Exception('Tài khoản đã bị vô hiệu hóa');
      case 'too-many-requests':
        return Exception('Quá nhiều lần thử. Vui lòng thử lại sau');
      case 'invalid-credential':
        return Exception('Email hoặc mật khẩu không đúng');
      default:
        return Exception('Đăng nhập thất bại: ${e.message}');
    }
  }
}
