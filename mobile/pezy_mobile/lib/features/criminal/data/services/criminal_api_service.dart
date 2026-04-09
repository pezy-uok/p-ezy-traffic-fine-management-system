/// Criminal API service.
/// Handles all API calls to backend criminal endpoints.
library criminal_api_service;

import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../models/criminal_model.dart';

// Development mode flag - set to true to test without backend
const bool _isDevelopmentMode = false;

class CriminalApiService {
  final Dio _dio;
  
  // Note: When using authenticated Dio, baseUrl is set via the provider
  // The Dio instance is configured with baseUrl: http://127.0.0.1:8000/api
  // So relative paths will be: /criminals, /criminals/:id, etc.

  CriminalApiService({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: 'http://127.0.0.1:8000/api',
                connectTimeout: const Duration(seconds: 10),
                receiveTimeout: const Duration(seconds: 10),
                contentType: 'application/json',
              ),
            ) {
    // Debug: Show which Dio instance is being used
    debugPrint('\n╔════════════════════════════════════════╗');
    debugPrint('║  CRIMINAL API SERVICE: CONSTRUCTOR     ║');
    debugPrint('╠════════════════════════════════════════╣');
    debugPrint('║ Dio provided: ${dio != null ? '✅ YES (using passed Dio)' : '❌ NO (creating new Dio)'}');
    debugPrint('║ Base URL: ${_dio.options.baseUrl}');
    debugPrint('║ Interceptors: ${_dio.interceptors.length}');
    debugPrint('╚════════════════════════════════════════╝\n');
  }

  /// Get all criminals with optional filters and pagination
  /// GET /api/criminals
  /// Query parameters:
  ///   - limit: number (default: 50, max: 1000)
  ///   - offset: number (default: 0)
  ///   - status: 'active' | 'inactive' | 'deceased' | 'deported'
  ///   - wanted: boolean
  ///   - search: string (search in first_name or last_name)
  ///   - orderBy: string (default: 'created_at')
  ///   - orderDirection: 'asc' | 'desc' (default: 'desc')
  /// Returns: { success, criminals: Array, total, limit, offset }
  Future<GetCriminalsResponse> getAllCriminals({
    int limit = 50,
    int offset = 0,
    String? status,
    bool? wanted,
    String? search,
    String orderBy = 'created_at',
    String orderDirection = 'desc',
  }) async {
    // Development mode - mock response
    if (_isDevelopmentMode) {
      await Future.delayed(const Duration(milliseconds: 500));
      return GetCriminalsResponse(
        success: true,
        criminals: [
          Criminal(
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-15',
            gender: 'Male',
            physicalDescription: 'Tall, muscular build, black hair',
            identificationNumber: 'ID123456',
            status: 'active',
            wanted: true,
            dangerLevel: 'High',
            knownAliases: ['Johnny D', 'JD'],
            arrestedBefore: true,
            arrestCount: 3,
            createdAt: DateTime.now().subtract(const Duration(days: 30)),
          ),
          Criminal(
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: '1992-05-20',
            gender: 'Female',
            physicalDescription: 'Medium height, brown hair',
            identificationNumber: 'ID789012',
            status: 'active',
            wanted: false,
            dangerLevel: 'Medium',
            knownAliases: ['J Smith'],
            arrestedBefore: true,
            arrestCount: 2,
            createdAt: DateTime.now().subtract(const Duration(days: 15)),
          ),
        ],
        total: 2,
        limit: limit,
        offset: offset,
      );
    }

    try {
      debugPrint('\n═══════════════════════════════════════');
      debugPrint('🚔 FETCHING CRIMINALS');
      debugPrint('═══════════════════════════════════════');
      debugPrint('📍 Base URL: ${_dio.options.baseUrl}');
      debugPrint('📍 Limit: $limit, Offset: $offset');
      if (status != null) debugPrint('📍 Status Filter: $status');
      if (wanted != null) debugPrint('📍 Wanted Filter: $wanted');
      if (search != null) debugPrint('📍 Search: $search');
      debugPrint('─────────────────────────────────────');

      final Map<String, dynamic> queryParams = {
        'limit': limit,
        'offset': offset,
        'orderBy': orderBy,
        'orderDirection': orderDirection,
      };

      // Add optional filters
      if (status != null) queryParams['status'] = status;
      if (wanted != null) queryParams['wanted'] = wanted;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final response = await _dio.get(
        '/criminals',
        queryParameters: queryParams,
      );

      debugPrint('✅ Response Status: ${response.statusCode}');
      debugPrint('✅ Total Criminals: ${response.data['total']}');
      debugPrint('═══════════════════════════════════════\n');

      final result = GetCriminalsResponse.fromJson(response.data);
      
      // Client-side validation: ensure no deleted criminals in response
      final deletedCount = result.criminals.where((c) => c.isDeleted).length;
      if (deletedCount > 0) {
        debugPrint('⚠️  WARNING: $deletedCount deleted criminals found in response!');
        // Filter out deleted criminals as safety measure
        result.criminals.removeWhere((c) => c.isDeleted);
        debugPrint('✅ Filtered out deleted criminals. Remaining: ${result.criminals.length}');
      }
      
      return result;
    } on DioException catch (e) {
      debugPrint('\n❌ DioException during criminals fetch:');
      debugPrint('   Type: ${e.type}');
      debugPrint('   Message: ${e.message}');
      debugPrint('   Status Code: ${e.response?.statusCode}');
      debugPrint('   URL: ${e.requestOptions.uri}');
      debugPrint('   Response Body: ${e.response?.data}');
      debugPrint('═══════════════════════════════════════\n');
      throw _handleDioError(e);
    } catch (e) {
      debugPrint('\n❌ Unexpected error during criminals fetch: $e');
      debugPrint('   Type: ${e.runtimeType}');
      debugPrint('═══════════════════════════════════════\n');
      throw Exception('Failed to fetch criminals: $e');
    }
  }

  /// Get a single criminal by ID
  /// GET /api/criminals/:id
  /// Returns: { success, criminal }
  Future<Criminal> getCriminalById(String criminalId) async {
    try {
      debugPrint('\n═══════════════════════════════════════');
      debugPrint('🚔 FETCHING CRIMINAL BY ID');
      debugPrint('═══════════════════════════════════════');
      debugPrint('📍 Criminal ID: $criminalId');
      debugPrint('─────────────────────────────────────');

      final response = await _dio.get('/criminals/$criminalId');

      debugPrint('✅ Response Status: ${response.statusCode}');
      debugPrint('✅ Criminal: ${response.data['criminal']['first_name']} ${response.data['criminal']['last_name']}');
      debugPrint('═══════════════════════════════════════\n');

      final criminal = Criminal.fromJson(response.data['criminal'] as Map<String, dynamic>);
      
      // Validate: criminal should not be deleted
      if (criminal.isDeleted) {
        debugPrint('❌ ERROR: Criminal $criminalId is marked as deleted!');
        throw Exception('This criminal record has been deleted');
      }
      
      return criminal;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to fetch criminal: $e');
    }
  }

  /// Handle DioException and convert to user-friendly error messages
  String _handleDioError(DioException error) {
    debugPrint('🔴 DIO Error Type: ${error.type}');
    debugPrint('🔴 DIO Error Message: ${error.message}');

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        return 'Connection timeout. Please check your internet connection.';
      case DioExceptionType.receiveTimeout:
        return 'Request timeout. Server is taking too long to respond.';
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final responseData = error.response?.data;
        
        if (statusCode == 401) {
          return 'Unauthorized. Please login again.';
        } else if (statusCode == 403) {
          return 'You do not have permission to view criminal records.';
        } else if (statusCode == 404) {
          return 'Criminal record not found.';
        } else if (statusCode == 500) {
          return 'Server error. Please try again later.';
        }
        
        // Try to get error message from response
        if (responseData is Map && responseData.containsKey('message')) {
          return responseData['message'] as String;
        }
        return 'Error: Server returned status $statusCode';
        
      case DioExceptionType.cancel:
        return 'Request was cancelled.';
      case DioExceptionType.unknown:
        if (error.message?.contains('Network is unreachable') ?? false) {
          return 'Network is unreachable. Please check your internet connection.';
        }
        return 'An unexpected error occurred: ${error.message}';
      case DioExceptionType.badCertificate:
        return 'SSL certificate error. Please check your connection.';
      case DioExceptionType.connectionError:
        return 'Connection error. Please check your network.';
      case DioExceptionType.sendTimeout:
        return 'Request send timeout. Please check your internet connection.';
    }
  }

  /// Set custom Dio instance (useful for injecting authenticated Dio)
  void setDio(Dio dio) {
    _dio.httpClientAdapter = dio.httpClientAdapter;
    _dio.transformer = dio.transformer;
    _dio.interceptors.clear();
    _dio.interceptors.addAll(dio.interceptors);
  }
}
