import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../config/env_config.dart';

/// Dio HTTP client with Firebase auth interceptor.
/// Automatically attaches Bearer token to every request.
class DioClient {
  late final Dio _dio;

  DioClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: EnvConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          try {
            final user = FirebaseAuth.instance.currentUser;
            if (user != null) {
              final token = await user.getIdToken();
              options.headers['Authorization'] = 'Bearer $token';
            }
          } catch (e) {
            // Continue without token if error
          }
          handler.next(options);
        },
        onError: (error, handler) {
          handler.next(error);
        },
      ),
    );
  }

  Dio get dio => _dio;

  /// GET request
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }

  /// POST request
  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }

  /// PUT request
  Future<Response> put(String path, {dynamic data}) {
    return _dio.put(path, data: data);
  }

  /// PATCH request
  Future<Response> patch(String path, {dynamic data}) {
    return _dio.patch(path, data: data);
  }

  /// DELETE request
  Future<Response> delete(String path) {
    return _dio.delete(path);
  }
}
