import 'package:dio/dio.dart';

/// Network error model for standardized error handling
class NetworkError {
  final String message;
  final int? statusCode;
  final dynamic originalError;
  final String? errorType;

  NetworkError({
    required this.message,
    this.statusCode,
    this.originalError,
    this.errorType,
  });

  @override
  String toString() => 'NetworkError(message: $message, statusCode: $statusCode)';
}

/// Error interceptor for Dio client
///
/// Handles all network errors and converts them to standardized [NetworkError]
/// instances for consistent error handling across the app.
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final networkError = _handleError(err);
    
    // Convert DioException to custom error response
    final errorResponse = Response(
      statusCode: networkError.statusCode ?? 500,
      data: networkError,
      requestOptions: err.requestOptions,
    );

    handler.reject(
      DioException(
        type: err.type,
        error: networkError,
        stackTrace: err.stackTrace,
        requestOptions: err.requestOptions,
        response: errorResponse,
      ),
    );
  }

  /// Handles different types of errors and returns standardized [NetworkError]
  NetworkError _handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        return NetworkError(
          message: 'Connection timeout. Please check your internet connection.',
          errorType: 'CONNECTION_TIMEOUT',
          originalError: error,
        );

      case DioExceptionType.sendTimeout:
        return NetworkError(
          message: 'Send timeout. Please try again.',
          errorType: 'SEND_TIMEOUT',
          originalError: error,
        );

      case DioExceptionType.receiveTimeout:
        return NetworkError(
          message: 'Receive timeout. Please try again.',
          errorType: 'RECEIVE_TIMEOUT',
          originalError: error,
        );

      case DioExceptionType.badResponse:
        return _handleBadResponse(error);

      case DioExceptionType.cancel:
        return NetworkError(
          message: 'Request cancelled.',
          errorType: 'REQUEST_CANCELLED',
          originalError: error,
        );

      case DioExceptionType.unknown:
        return NetworkError(
          message: 'An unexpected error occurred. Please try again.',
          errorType: 'UNKNOWN_ERROR',
          originalError: error,
        );

      case DioExceptionType.badCertificate:
        return NetworkError(
          message: 'Certificate validation failed.',
          errorType: 'BAD_CERTIFICATE',
          originalError: error,
        );

      case DioExceptionType.connectionError:
        return NetworkError(
          message: 'Connection error. Please check your internet connection.',
          errorType: 'CONNECTION_ERROR',
          originalError: error,
        );
    }
  }

  /// Handles bad response status codes (4xx, 5xx)
  NetworkError _handleBadResponse(DioException error) {
    final statusCode = error.response?.statusCode ?? 500;
    final responseData = error.response?.data;

    String message = 'An error occurred.';
    String? errorType;

    // Try to extract error message from response data
    if (responseData is Map<String, dynamic>) {
      message = responseData['message'] ?? responseData['error'] ?? message;
    }

    switch (statusCode) {
      case 400:
        errorType = 'BAD_REQUEST';
        message = 'Invalid request. Please check your input.';
        break;
      case 401:
        errorType = 'UNAUTHORIZED';
        message = 'Unauthorized. Please login again.';
        break;
      case 403:
        errorType = 'FORBIDDEN';
        message = 'You do not have permission to access this resource.';
        break;
      case 404:
        errorType = 'NOT_FOUND';
        message = 'The requested resource was not found.';
        break;
      case 409:
        errorType = 'CONFLICT';
        message = 'The request conflicts with existing data.';
        break;
      case 422:
        errorType = 'UNPROCESSABLE_ENTITY';
        message = 'Validation failed. Please check your input.';
        break;
      case 429:
        errorType = 'TOO_MANY_REQUESTS';
        message = 'Too many requests. Please try again later.';
        break;
      case 500:
        errorType = 'INTERNAL_SERVER_ERROR';
        message = 'Server error. Please try again later.';
        break;
      case 502:
        errorType = 'BAD_GATEWAY';
        message = 'Service temporarily unavailable. Please try again.';
        break;
      case 503:
        errorType = 'SERVICE_UNAVAILABLE';
        message = 'Service unavailable. Please try again later.';
        break;
      default:
        errorType = 'HTTP_ERROR_$statusCode';
        if (message == 'An error occurred.') {
          message = 'HTTP Error: $statusCode';
        }
    }

    return NetworkError(
      message: message,
      statusCode: statusCode,
      errorType: errorType,
      originalError: error,
    );
  }
}
