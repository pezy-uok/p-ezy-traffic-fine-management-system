import 'package:dio/dio.dart';
import '../connectivity_service.dart';

/// Network connectivity interceptor
/// 
/// Checks internet connectivity before making API requests.
/// Throws a custom exception if no connection is available.
/// 
/// Usage:
/// ```dart
/// dio.interceptors.add(ConnectivityInterceptor());
/// ```
class ConnectivityInterceptor extends Interceptor {
  final ConnectivityService _connectivityService = ConnectivityService();

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Check if device has internet connection
    final hasConnection = await _connectivityService.hasConnectivity();

    if (!hasConnection) {
      // Return a custom error instead of making the request
      handler.reject(
        DioException(
          requestOptions: options,
          error: 'No internet connection',
          type: DioExceptionType.unknown,
          message: 'Please check your internet connection',
        ),
      );
      return;
    }

    // Continue with the request if connected
    handler.next(options);
  }
}

/// Custom exception for connectivity errors
class ConnectivityException implements Exception {
  final String message;

  ConnectivityException(this.message);

  @override
  String toString() => 'ConnectivityException: $message';
}
