import 'package:dio/dio.dart';

/// Auth interceptor for Dio client
///
/// Handles adding authentication tokens to requests.
/// Can be extended to refresh tokens if they expire.
class AuthInterceptor extends Interceptor {
  /// Current authentication token
  String? _authToken;

  /// Set the authentication token (called when user logs in)
  void setAuthToken(String token) {
    _authToken = token;
  }

  /// Clear the authentication token (called when user logs out)
  void clearAuthToken() {
    _authToken = null;
  }

  /// Get current authentication token
  String? getAuthToken() => _authToken;

  /// Check if user is authenticated
  bool isAuthenticated() => _authToken != null;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Add auth token to headers if available
    if (_authToken != null) {
      options.headers['Authorization'] = 'Bearer $_authToken';
    }

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Handle 401 Unauthorized errors
    // This could trigger a token refresh or logout
    if (err.response?.statusCode == 401) {
      // Token might be expired, clear it
      clearAuthToken();
      // In a real app, you might want to trigger a logout or refresh token
      // via Riverpod state management
    }

    handler.next(err);
  }
}
