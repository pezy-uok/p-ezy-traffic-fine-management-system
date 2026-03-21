import 'package:dio/dio.dart';
import '../../../config/app_config.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/error_interceptor.dart';
import 'interceptors/logging_interceptor.dart';

/// HTTP client for making network requests using Dio
///
/// Provides a configured Dio instance with:
/// - Base URL configuration
/// - Request/response logging
/// - Error handling and standardization
/// - Authentication token management
/// - Timeout configurations
///
/// Usage:
/// ```dart
/// final dio = DioClient.instance.dio;
/// final response = await dio.get('/users');
/// ```
class DioClient {
  // Singleton instance
  static final DioClient _instance = DioClient._internal();

  // Private Dio instance
  late final Dio _dio;

  // Interceptor instances for token management
  final AuthInterceptor _authInterceptor = AuthInterceptor();

  factory DioClient() => _instance;

  DioClient._internal() {
    _initializeDio();
  }

  /// Initialize Dio with base URL and interceptors
  void _initializeDio() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 30),
        contentType: 'application/json',
        responseType: ResponseType.json,
        validateStatus: (status) {
          // Don't throw on any status code, handle manually
          return true;
        },
      ),
    );

    // Add interceptors in order
    _dio.interceptors.add(LoggingInterceptor());
    _dio.interceptors.add(ErrorInterceptor());
    _dio.interceptors.add(_authInterceptor);
  }

  /// Get Dio instance for making requests
  Dio get dio => _dio;

  /// Get auth interceptor for token management
  AuthInterceptor get authInterceptor => _authInterceptor;

  /// Set authentication token
  void setAuthToken(String token) {
    _authInterceptor.setAuthToken(token);
  }

  /// Clear authentication token
  void clearAuthToken() {
    _authInterceptor.clearAuthToken();
  }

  /// Check if user is authenticated
  bool isAuthenticated() => _authInterceptor.isAuthenticated();

  /// Get current auth token
  String? getAuthToken() => _authInterceptor.getAuthToken();

  /// Update base URL (useful for switching environments)
  void setBaseUrl(String baseUrl) {
    _dio.options.baseUrl = baseUrl;
  }

  /// Add custom interceptor
  void addInterceptor(Interceptor interceptor) {
    _dio.interceptors.add(interceptor);
  }

  /// Remove interceptor
  void removeInterceptor(Interceptor interceptor) {
    _dio.interceptors.remove(interceptor);
  }

  /// Close Dio client (cleanup)
  void close() {
    _dio.close();
  }

  /// Helper method for GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onReceiveProgress: onReceiveProgress,
    );
  }

  /// Helper method for POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );
  }

  /// Helper method for PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );
  }

  /// Helper method for PATCH request
  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.patch<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );
  }

  /// Helper method for DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  /// Helper method for multipart/form-data requests (file uploads)
  Future<Response<T>> uploadFile<T>(
    String path, {
    required String filePath,
    required String fileKey,
    String? fileName,
    Map<String, dynamic>? otherData,
    ProgressCallback? onSendProgress,
  }) async {
    final file = await MultipartFile.fromFile(
      filePath,
      filename: fileName,
    );

    final formData = FormData.fromMap({
      fileKey: file,
      ...?otherData,
    });

    return _dio.post<T>(
      path,
      data: formData,
      onSendProgress: onSendProgress,
    );
  }

  /// Helper method for downloading files
  Future<void> downloadFile(
    String path, {
    required String savePath,
    ProgressCallback? onReceiveProgress,
    CancelToken? cancelToken,
  }) {
    return _dio.download(
      path,
      savePath,
      onReceiveProgress: onReceiveProgress,
      cancelToken: cancelToken,
    );
  }
}
