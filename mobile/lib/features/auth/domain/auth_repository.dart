import '../domain/user_model.dart';

/// Auth repository interface
abstract class AuthRepository {
  /// Login with email and password
  Future<UserModel> login(String email, String password);

  /// Logout current user
  Future<void> logout();

  /// Get current user info from backend
  Future<UserModel?> getCurrentUser();

  /// Check if user is authenticated
  bool get isAuthenticated;
}
