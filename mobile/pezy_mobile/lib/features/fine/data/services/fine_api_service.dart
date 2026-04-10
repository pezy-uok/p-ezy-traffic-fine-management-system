import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../../domain/exceptions/max_fines_exception.dart';

class DriverLookupResponse {
  final bool success;
  final DriverInfo driver;
  final List<FineInfo> fines;

  DriverLookupResponse({
    required this.success,
    required this.driver,
    required this.fines,
  });

  factory DriverLookupResponse.fromJson(Map<String, dynamic> json) {
    return DriverLookupResponse(
      success: json['success'] ?? false,
      driver: DriverInfo.fromJson(json['driver'] ?? {}),
      fines: (json['fines'] as List?)?.map((f) => FineInfo.fromJson(f)).toList() ?? [],
    );
  }
}

class DriverInfo {
  final String driverId;
  final String licenseNumber;
  final String driverName;

  DriverInfo({
    required this.driverId,
    required this.licenseNumber,
    required this.driverName,
  });

  factory DriverInfo.fromJson(Map<String, dynamic> json) {
    return DriverInfo(
      driverId: json['driver_id'] ?? '',
      licenseNumber: json['license_number'] ?? '',
      driverName: json['driver_name'] ?? '',
    );
  }
}

class FineInfo {
  final String id;
  final String driverId;
  final String licenseNumber;
  final String driverName;
  final String issuedByOfficerId;
  final double amount;
  final String reason;
  final String violationCode;
  final String location;
  final String vehicleRegistration;
  final String status;
  final String issueDate;
  final String dueDate;
  final String? paymentDate;
  final String? paymentMethod;
  final String createdAt;
  final String updatedAt;

  FineInfo({
    required this.id,
    required this.driverId,
    required this.licenseNumber,
    required this.driverName,
    required this.issuedByOfficerId,
    required this.amount,
    required this.reason,
    required this.violationCode,
    required this.location,
    required this.vehicleRegistration,
    required this.status,
    required this.issueDate,
    required this.dueDate,
    this.paymentDate,
    this.paymentMethod,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FineInfo.fromJson(Map<String, dynamic> json) {
    return FineInfo(
      id: json['id'] ?? '',
      driverId: json['driver_id'] ?? '',
      licenseNumber: json['license_number'] ?? '',
      driverName: json['driver_name'] ?? '',
      issuedByOfficerId: json['issued_by_officer_id'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      reason: json['reason'] ?? '',
      violationCode: json['violation_code'] ?? '',
      location: json['location'] ?? '',
      vehicleRegistration: json['vehicle_registration'] ?? '',
      status: json['status'] ?? '',
      issueDate: json['issue_date'] ?? '',
      dueDate: json['due_date'] ?? '',
      paymentDate: json['payment_date'],
      paymentMethod: json['payment_method'],
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
    );
  }
}

class FineApiService {
  final Dio _dio;

  FineApiService({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: 'http://127.0.0.1:8000/api',
                connectTimeout: const Duration(seconds: 10),
                receiveTimeout: const Duration(seconds: 10),
                contentType: 'application/json',
              ),
            ) {
    debugPrint('\n╔════════════════════════════════════════╗');
    debugPrint('║  FINE API SERVICE: CONSTRUCTOR         ║');
    debugPrint('╠════════════════════════════════════════╣');
    debugPrint('║ Dio provided: ${dio != null ? '✅ YES' : '❌ NO (new instance)'}');
    debugPrint('║ Base URL: ${_dio.options.baseUrl}');
    debugPrint('║ Interceptors: ${_dio.interceptors.length}');
    debugPrint('╚════════════════════════════════════════╝\n');
  }

  /// Lookup driver by license number and get their fines
  /// GET /api/fines/driver/:licenseNo
  /// Returns: { success, driver: {driver_id, license_number, driver_name}, fines: Array }
  Future<DriverLookupResponse> getDriverByLicenseNumber(String licenseNo) async {
    if (licenseNo.isEmpty) {
      throw Exception('License number cannot be empty');
    }

    try {
      debugPrint('\n╔════════════════════════════════════════╗');
      debugPrint('║  FINE API: LOOKUP DRIVER               ║');
      debugPrint('╠════════════════════════════════════════╣');
      debugPrint('║ License Number: $licenseNo');
      debugPrint('║ Endpoint: GET /fines/driver/$licenseNo');
      debugPrint('╚════════════════════════════════════════╝\n');

      final response = await _dio.get('/fines/driver/$licenseNo');

      debugPrint('✅ Driver lookup successful');
      debugPrint('Status Code: ${response.statusCode}');
      debugPrint('Response: ${response.data}\n');

      if (response.statusCode == 200) {
        return DriverLookupResponse.fromJson(response.data);
      } else {
        throw Exception('Failed to lookup driver. Status: ${response.statusCode}');
      }
    } on DioException catch (e) {
      debugPrint('❌ Driver lookup error: ${e.message}');
      debugPrint('Status Code: ${e.response?.statusCode}');
      debugPrint('Response: ${e.response?.data}\n');

      if (e.response?.statusCode == 404) {
        throw Exception('Driver not found for this license number');
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

  /// Create a new fine
  /// POST /api/fines
  /// Payload: { license_number, driver_name, date, amount, issued_by_officer_id, reason, violation_code, location, vehicle_registration }
  /// Returns: { success, fine: {id, ...} }
  Future<Map<String, dynamic>> createFine({
    required String licenseNumber,
    required String driverName,
    required String date,
    required double amount,
    required String officerId,
    required String reason,
    String violationCode = 'GENERAL',
    String location = '',
    String vehicleRegistration = '',
  }) async {
    if (licenseNumber.isEmpty || driverName.isEmpty || date.isEmpty) {
      throw Exception('License number, driver name, and date are required');
    }

    if (amount <= 0) {
      throw Exception('Amount must be greater than 0');
    }

    try {
      debugPrint('\n╔════════════════════════════════════════╗');
      debugPrint('║  FINE API: CREATE FINE                 ║');
      debugPrint('╠════════════════════════════════════════╣');
      debugPrint('║ License: $licenseNumber');
      debugPrint('║ Driver: $driverName');
      debugPrint('║ Date: $date');
      debugPrint('║ Amount: $amount');
      debugPrint('║ Reason: $reason');
      debugPrint('╚════════════════════════════════════════╝\n');

      final payload = {
        'licenseNo': licenseNumber,
        'driver_name': driverName,
        'issue_date': date, // Convert DD/MM/YYYY to YYYY-MM-DD format
        'amount': amount,
        'issued_by_officer_id': officerId,
        'reason': reason,
        'violation_code': violationCode,
        'location': location,
        'vehicle_registration': vehicleRegistration,
      };
      
      debugPrint('📤 JSON Payload:');
      payload.forEach((key, value) {
        debugPrint('   $key: $value (${value.runtimeType})');
      });
      debugPrint('');

      final response = await _dio.post('/fines', data: payload);

      debugPrint('✅ Fine created successfully');
      debugPrint('Status Code: ${response.statusCode}');
      debugPrint('Response: ${response.data}\n');

      if (response.statusCode == 201 || response.statusCode == 200) {
        return response.data ?? {'success': true};
      } else {
        throw Exception('Failed to create fine. Status: ${response.statusCode}');
      }
    } on DioException catch (e) {
      debugPrint('❌ Create fine error: ${e.message}');
      debugPrint('Status Code: ${e.response?.statusCode}');
      debugPrint('Response Headers: ${e.response?.headers}');
      debugPrint('Response Data Type: ${e.response?.data.runtimeType}');
      debugPrint('Response: ${e.response?.data}\n');

      if (e.response?.statusCode == 400 || e.response?.statusCode == 409) {
        final errorData = e.response?.data;
        String errorMessage = '';
        
        debugPrint('🔍 Processing error response (status: ${e.response!.statusCode})');
        debugPrint('   Error data is Map: ${errorData is Map}');
        
        if (errorData is Map) {
          errorMessage = (errorData['message'] ?? '').toString();
          debugPrint('   Extracted message: $errorMessage');
          
          // Check if max fines exceeded (case-insensitive check with multiple keywords)
          final lowerMessage = errorMessage.toLowerCase();
          debugPrint('   Lowercase message: $lowerMessage');
          
          final hasMaxKeyword = lowerMessage.contains('max') || lowerMessage.contains('maximum');
          final hasFineKeyword = lowerMessage.contains('fine');
          final isFineError = hasMaxKeyword && hasFineKeyword;
          
          debugPrint('   Keyword check: hasMax=$hasMaxKeyword, hasFine=$hasFineKeyword, combined=$isFineError');
          
          if (isFineError) {
            debugPrint('🚨 MAX FINES EXCEEDED DETECTED in API: $errorMessage');
            throw MaxFinesExceededException(errorMessage);
          }
          
          if (errorMessage.isNotEmpty) {
            throw Exception(errorMessage);
          }
        } else {
          debugPrint('   Error data is NOT a Map, it is: $errorData');
        }
        
        throw Exception('Invalid fine data. Please check your inputs.');
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
      rethrow;
    }
  }
}
