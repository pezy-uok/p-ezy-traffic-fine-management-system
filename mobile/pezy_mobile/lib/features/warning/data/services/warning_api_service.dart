import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';

class WarningApiService {
  final Dio _dio;

  WarningApiService({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: 'http://127.0.0.1:8000/api',
                connectTimeout: const Duration(seconds: 10),
                receiveTimeout: const Duration(seconds: 10),
                contentType: 'application/json',
              ),
            );

  /// Create a driver warning
  /// POST /api/warnings
  /// Payload: { licenseNo, reason, severity, violation_code, location, vehicleRegistration, issueDate }
  /// Returns: { success, warning: {id, ...} }
  Future<Map<String, dynamic>> createWarning({
    required String licenseNo,
    required String reason,
    required String severity,
    required String violationCode,
    required String location,
    required String vehicleRegistration,
    required String issueDate,
  }) async {
    if (licenseNo.isEmpty) {
      throw Exception('License number is required');
    }

    try {
      debugPrint('\n╔════════════════════════════════════════╗');
      debugPrint('║  WARNING API: CREATE WARNING            ║');
      debugPrint('╠════════════════════════════════════════╣');
      debugPrint('║ License: $licenseNo');
      debugPrint('║ Reason: $reason');
      debugPrint('║ Severity: $severity');
      debugPrint('║ Violation: $violationCode');
      debugPrint('╚════════════════════════════════════════╝\n');

      final payload = {
        'licenseNo': licenseNo,
        'reason': reason,
        'severity': severity,
        'violation_code': violationCode,
        'location': location,
        'vehicle_registration': vehicleRegistration,
        'issue_date': issueDate,
      };

      debugPrint('📤 JSON Payload:');
      payload.forEach((key, value) {
        debugPrint('   $key: $value (${value.runtimeType})');
      });
      debugPrint('');

      final response = await _dio.post('/warnings', data: payload);

      debugPrint('✅ Warning created successfully');
      debugPrint('Status Code: ${response.statusCode}');
      debugPrint('Response: ${response.data}\n');

      if (response.statusCode == 201 || response.statusCode == 200) {
        return response.data ?? {'success': true};
      } else {
        throw Exception('Failed to create warning. Status: ${response.statusCode}');
      }
    } on DioException catch (e) {
      debugPrint('❌ Create warning error: ${e.message}');
      debugPrint('Status Code: ${e.response?.statusCode}');
      debugPrint('Response: ${e.response?.data}\n');

      if (e.response?.statusCode == 400) {
        final errorData = e.response?.data;
        if (errorData is Map && errorData.containsKey('message')) {
          throw Exception(errorData['message']);
        }
        throw Exception('Invalid warning data. Please check your inputs.');
      } else if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized. Please login again.');
      } else if (e.type == DioExceptionType.connectionTimeout) {
        throw Exception('Connection timeout - please check your internet connection');
      } else if (e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Request timeout - please try again');
      } else {
        throw Exception('Error: ${e.message}');
      }
    } catch (e) {
      debugPrint('❌ Unexpected error: $e\n');
      throw Exception('Unexpected error: $e');
    }
  }
}
