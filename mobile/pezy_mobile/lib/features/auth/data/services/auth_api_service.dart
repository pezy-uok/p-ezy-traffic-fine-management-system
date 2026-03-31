/// Authentication API service
/// Handles all API calls to backend auth endpoints
import 'package:dio/dio.dart';

class AuthApiService {
  final Dio _dio;
  static const String _baseUrl = 'http://localhost:3001/api/auth';

  AuthApiService({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: _baseUrl,
                connectTimeout: const Duration(seconds: 10),
                receiveTimeout: const Duration(seconds: 10),
                contentType: 'application/json',
              ),
            );

  /// Verify if email exists and is eligible for login
  /// POST /api/auth/verify
  /// Returns: { success, exists, active, message, user: {...} }
  Future<VerifyEmailResponse> verifyEmail(String email) async {
    try {
      final response = await _dio.post(
        '/verify',
        data: {'email': email},
      );

      return VerifyEmailResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to verify email: $e');
    }
  }

  /// Request OTP - Sends OTP to registered phone number
  /// POST /api/auth/request-otp
  /// Returns: { success, message, temporary_id }
  Future<RequestOtpResponse> requestOtp(String email) async {
    try {
      final response = await _dio.post(
        '/request-otp',
        data: {'email': email},
      );

      return RequestOtpResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to request OTP: $e');
    }
  }

  /// Verify OTP and get JWT tokens
  /// POST /api/auth/verify-otp
  /// Returns: { success, message, accessToken, refreshToken, user: {...} }
  Future<VerifyOtpResponse> verifyOtp(
    String temporaryId,
    String otp,
  ) async {
    try {
      final response = await _dio.post(
        '/verify-otp',
        data: {
          'temporary_id': temporaryId,
          'otp': otp,
        },
      );

      return VerifyOtpResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to verify OTP: $e');
    }
  }

  /// Handle DioException and convert to user-friendly error messages
  String _handleDioError(DioException error) {
    if (error.response != null) {
      // Server returned error response
      final data = error.response!.data;
      if (data is Map && data.containsKey('message')) {
        return data['message'] as String;
      }
      return 'Server error: ${error.response!.statusCode}';
    } else if (error.type == DioExceptionType.connectionTimeout) {
      return 'Connection timeout. Please check your internet connection.';
    } else if (error.type == DioExceptionType.receiveTimeout) {
      return 'Request timeout. Please try again.';
    } else if (error.type == DioExceptionType.unknown) {
      return 'Network error. Please check your internet connection.';
    }
    return 'An error occurred. Please try again.';
  }
}

/// Response models

class VerifyEmailResponse {
  final bool success;
  final bool exists;
  final bool? active;
  final String message;
  final UserData? user;

  VerifyEmailResponse({
    required this.success,
    required this.exists,
    this.active,
    required this.message,
    this.user,
  });

  factory VerifyEmailResponse.fromJson(Map<String, dynamic> json) {
    return VerifyEmailResponse(
      success: json['success'] ?? false,
      exists: json['exists'] ?? false,
      active: json['active'],
      message: json['message'] ?? '',
      user: json['user'] != null ? UserData.fromJson(json['user']) : null,
    );
  }
}

class RequestOtpResponse {
  final bool success;
  final String message;
  final String temporaryId;
  final int? retryAfter; // In case of rate limiting

  RequestOtpResponse({
    required this.success,
    required this.message,
    required this.temporaryId,
    this.retryAfter,
  });

  factory RequestOtpResponse.fromJson(Map<String, dynamic> json) {
    return RequestOtpResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      temporaryId: json['temporary_id'] ?? '',
      retryAfter: json['retryAfter'],
    );
  }
}

class VerifyOtpResponse {
  final bool success;
  final String message;
  final String? accessToken;
  final String? refreshToken;
  final UserData? user;

  VerifyOtpResponse({
    required this.success,
    required this.message,
    this.accessToken,
    this.refreshToken,
    this.user,
  });

  factory VerifyOtpResponse.fromJson(Map<String, dynamic> json) {
    return VerifyOtpResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      accessToken: json['accessToken'],
      refreshToken: json['refreshToken'],
      user: json['user'] != null ? UserData.fromJson(json['user']) : null,
    );
  }
}

class UserData {
  final String id;
  final String email;
  final String name;
  final String role; // admin, police_officer
  final String? department;
  final String? phone;
  final String? badge;

  UserData({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.department,
    this.phone,
    this.badge,
  });

  factory UserData.fromJson(Map<String, dynamic> json) {
    return UserData(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? 'police_officer',
      department: json['department'],
      phone: json['phone'],
      badge: json['badge'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'department': department,
      'phone': phone,
      'badge': badge,
    };
  }
}
