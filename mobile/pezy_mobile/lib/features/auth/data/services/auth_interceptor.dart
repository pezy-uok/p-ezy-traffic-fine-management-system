/// Authenticated HTTP client with automatic JWT token injection
/// All requests made through this client will automatically include the access token
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
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
    debugPrint('\n╔════════════════════════════════════════╗');
    debugPrint('║  AUTH INTERCEPTOR: onRequest           ║');
    debugPrint('╠════════════════════════════════════════╣');
    debugPrint('║ URL: ${options.path}');
    debugPrint('║ Method: ${options.method}');
    
    final accessToken = await _tokenStorage.getAccessToken();

    debugPrint('║ Token Found: ${accessToken != null ? '✅ YES' : '❌ NO'}');
    if (accessToken != null) {
      debugPrint('║ Token Length: ${accessToken.length}');
      debugPrint('║ Token Prefix: ${accessToken.substring(0, 30)}...');
    }

    if (accessToken != null && accessToken.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $accessToken';
      debugPrint('║ Authorization Header: ✅ ADDED');
    } else {
      debugPrint('║ Authorization Header: ❌ NOT ADDED (token is null/empty)');
    }
    
    debugPrint('╚════════════════════════════════════════╝\n');

    return handler.next(options);
  }

  /// Handle 401 Unauthorized - token expired
  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    debugPrint('\n❌ AUTH INTERCEPTOR ERROR: ${err.response?.statusCode}');
    if (err.response?.statusCode == 401) {
      // Token expired or invalid
      debugPrint('🔄 Clearing tokens due to 401 Unauthorized');
      await _tokenStorage.clearAll();
    }

    return handler.next(err);
  }
}

/// Create authenticated Dio instance with token injection
Dio createAuthenticatedDio(TokenStorageService tokenStorage) {
  debugPrint('\n╔════════════════════════════════════════╗');
  debugPrint('║  Creating Authenticated Dio Instance    ║');
  debugPrint('╠════════════════════════════════════════╣');
  debugPrint('║ Base URL: http://localhost:8000/api');
  debugPrint('╚════════════════════════════════════════╝\n');
  
  final dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:8000/api',
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
  debugPrint('✅ AuthInterceptor added to Dio\n');

  return dio;
}
