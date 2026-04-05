/// Authenticated HTTP client with automatic JWT token injection
/// All requests made through this client will automatically include the access token
import 'package:dio/dio.dart';
import 'token_storage_service.dart';

class AuthInterceptor extends Interceptor {
  final TokenStorageService _tokenStorage;

  AuthInterceptor(this._tokenStorage);

  /// Add access token to all outgoing requests
  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final accessToken = await _tokenStorage.getAccessToken();

    if (accessToken != null && accessToken.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }

    return handler.next(options);
  }

  /// Handle 401 Unauthorized - token expired
  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      // Token expired or invalid
      // TODO: Implement token refresh or redirect to login
      await _tokenStorage.clearAll();
    }

    return handler.next(err);
  }
}

/// Create authenticated Dio instance with token injection
Dio createAuthenticatedDio(TokenStorageService tokenStorage) {
  final dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:3001/api',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      contentType: 'application/json',
      validateStatus: (status) {
        // Don't throw on any status code - let handlers manage them
        return true;
      },
    ),
  );

  // Add auth interceptor
  dio.interceptors.add(AuthInterceptor(tokenStorage));

  return dio;
}
