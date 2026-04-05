/// Authentication API service.
/// Handles all API calls to backend auth endpoints.
library auth_api_service;

import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';

// Development mode flag - set to true to test without backend
const bool _isDevelopmentMode = false;

class AuthApiService {
  final Dio _dio;
  static const String _baseUrl = 'http://127.0.0.1:8000/api/auth';

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
    // Development mode - mock response
    if (_isDevelopmentMode) {
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Validate pezy.gov domain
      if (!email.endsWith('@pezy.gov')) {
        throw Exception('Only @pezy.gov emails are allowed. Use officer.bandara@pezy.gov');
      }
      
      // Extract name safely from email (e.g., officer.bandara@pezy.gov -> Officer Bandara)
      final namePart = email.split('@')[0]; // officer.bandara
      final nameWords = namePart.split('.').map((word) => word[0].toUpperCase() + word.substring(1)).toList().join(' ');
      
      return VerifyEmailResponse(
        success: true,
        exists: true,
        active: true,
        message: 'Email verified successfully',
        user: UserData(
          id: '12345',
          email: email,
          name: nameWords,
          role: 'police_officer',
        ),
      );
    }

    try {
      debugPrint('📧 Verifying email: $email');
      debugPrint('📧 Full URL: $_baseUrl/verify');
      
      final response = await _dio.post(
        '/verify',
        data: {'email': email},
      );

      debugPrint('✅ Email verification successful');
      return VerifyEmailResponse.fromJson(response.data);
    } on DioException catch (e) {
      debugPrint('❌ DioException during email verification: $e');
      throw _handleDioError(e);
    } catch (e) {
      debugPrint('❌ Unexpected error during email verification: $e');
      throw Exception('Failed to verify email: $e');
    }
  }

  /// Request OTP - Sends OTP to registered phone number
  /// POST /api/auth/request-otp
  /// Returns: { success, message, temporary_id }
  Future<RequestOtpResponse> requestOtp(String email) async {
    // Development mode - mock response
    if (_isDevelopmentMode) {
      await Future.delayed(const Duration(milliseconds: 500));
      return RequestOtpResponse(
        success: true,
        message: 'OTP sent to your registered mobile (Development Mode)',
        temporaryId: 'temp_${DateTime.now().millisecondsSinceEpoch}',
      );
    }

    try {
      debugPrint('\n═══════════════════════════════════════');
      debugPrint('📱 REQUESTING OTP');
      debugPrint('═══════════════════════════════════════');
      debugPrint('📧 Email: $email');
      debugPrint('🔗 Base URL: $_baseUrl');
      debugPrint('📍 Full URL: $_baseUrl/request-otp');
      debugPrint('─────────────────────────────────────');
      
      final response = await _dio.post(
        '/request-otp',
        data: {'email': email},
      );

      debugPrint('✅ Response Status: ${response.statusCode}');
      debugPrint('✅ Response Data: ${response.data}');
      debugPrint('═══════════════════════════════════════\n');
      return RequestOtpResponse.fromJson(response.data);
    } on DioException catch (e) {
      debugPrint('\n❌ DioException during OTP request:');
      debugPrint('  Type: ${e.type}');
      debugPrint('  Message: ${e.message}');
      debugPrint('  Status Code: ${e.response?.statusCode}');
      debugPrint('  Response: ${e.response?.data}');
      debugPrint('═══════════════════════════════════════\n');
      throw _handleDioError(e);
    } catch (e) {
      debugPrint('❌ Unexpected error during OTP request: $e\n');
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
    // Development mode - mock response (accept any 6-digit OTP)
    if (_isDevelopmentMode) {
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Validate OTP format
      if (otp.length != 6 || !RegExp(r'^\d{6}$').hasMatch(otp)) {
        throw Exception('Invalid OTP format. Please enter 6 digits.');
      }
      
      return VerifyOtpResponse(
        success: true,
        message: 'Authentication successful (Development Mode)',
        accessToken: 'dev_access_token_${DateTime.now().millisecondsSinceEpoch}',
        refreshToken: 'dev_refresh_token_${DateTime.now().millisecondsSinceEpoch}',
        user: UserData(
          id: '12345',
          email: 'officer@pezy.local',
          name: 'Officer',
          role: 'police_officer',
        ),
      );
    }

    try {
      debugPrint('\n═══════════════════════════════════════');
      debugPrint('🔐 API SERVICE: VERIFY OTP START');
      debugPrint('═══════════════════════════════════════');
      debugPrint('📍 Base URL: $_baseUrl');
      debugPrint('📍 Endpoint: /verify-otp');
      debugPrint('📍 Full URL: $_baseUrl/verify-otp');
      debugPrint('📦 Request Data:');
      debugPrint('   • temporary_id: $temporaryId');
      debugPrint('   • otp: $otp');
      debugPrint('─────────────────────────────────────');
      debugPrint('🚀 Sending POST request...');
      
      final response = await _dio.post(
        '/verify-otp',
        data: {
          'temporary_id': temporaryId,
          'otp': otp,
        },
      );

      debugPrint('✅ Response Received');
      debugPrint('   Status Code: ${response.statusCode}');
      debugPrint('   Data: ${response.data}');
      debugPrint('═══════════════════════════════════════\n');
      
      return VerifyOtpResponse.fromJson(response.data);
    } on DioException catch (e) {
      debugPrint('\n❌ DioException during OTP verification:');
      debugPrint('   Type: ${e.type}');
      debugPrint('   Message: ${e.message}');
      debugPrint('   Request URL: ${e.requestOptions.uri}');
      debugPrint('   Status Code: ${e.response?.statusCode}');
      debugPrint('   Response: ${e.response?.data}');
      debugPrint('═══════════════════════════════════════\n');
      throw _handleDioError(e);
    } catch (e) {
      debugPrint('\n❌ Unexpected error during OTP verification: $e');
      debugPrint('═══════════════════════════════════════\n');
      throw Exception('Failed to verify OTP: $e');
    }
  }

  /// Logout - Call backend to mark user offline
  /// POST /api/auth/logout
  /// Headers: { Authorization: Bearer <token> }
  /// Returns: { success, message }
  Future<void> logout(String accessToken) async {
    try {
      debugPrint('\n╔════════════════════════════════════════╗');
      debugPrint('║  AUTH API SERVICE: logout            ║');
      debugPrint('╠════════════════════════════════════════╣');
      debugPrint('║ Token: ${accessToken.substring(0, 20)}...');
      debugPrint('║ Base URL: $_baseUrl');
      debugPrint('║ Full URL: $_baseUrl/logout');
      debugPrint('╚════════════════════════════════════════╝\n');

      debugPrint('🚀 Preparing logout request...');
      debugPrint('   Bearer Token: ${accessToken.substring(0, 30)}...');
      debugPrint('   Headers: Authorization: Bearer <token>');
      
      final response = await _dio.post(
        '/logout',
        options: Options(
          headers: {
            'Authorization': 'Bearer $accessToken',
            'Content-Type': 'application/json',
          },
        ),
      );

      debugPrint('✅ Logout Response Received');
      debugPrint('   Status Code: ${response.statusCode}');
      debugPrint('   Data: ${response.data}');
      debugPrint('   URL: ${response.requestOptions.baseUrl}${response.requestOptions.path}\n');
    } on DioException catch (e) {
      debugPrint('\n❌ DioException during logout:');
      debugPrint('   Type: ${e.type}');
      debugPrint('   Message: ${e.message}');
      debugPrint('   Request URL: ${e.requestOptions.baseUrl}${e.requestOptions.path}');
      // Don't throw - logout should succeed even if API call fails
      // Token will be cleared locally anyway
    } catch (e) {
      debugPrint('\n❌ Unexpected error during logout: $e\n');
      debugPrint('Stack trace: $e');
      // Don't throw - logout should succeed even if API call fails
    }
  }

  /// Handle DioException and convert to user-friendly error messages
  String _handleDioError(DioException error) {
    // Log detailed error information for debugging
    debugPrint('🔴 DIO Error Type: ${error.type}');
    debugPrint('🔴 DIO Error Message: ${error.message}');
    debugPrint('🔴 DIO Error Request URL: ${error.requestOptions.path}');
    if (error.response != null) {
      debugPrint('🔴 DIO Response Status: ${error.response!.statusCode}');
      debugPrint('🔴 DIO Response Data: ${error.response!.data}');
    }
    
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
