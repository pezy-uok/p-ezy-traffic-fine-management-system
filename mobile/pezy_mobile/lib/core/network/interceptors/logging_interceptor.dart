import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// Logging interceptor for Dio client
///
/// Logs all HTTP requests and responses to the console for debugging purposes.
/// Only active in debug mode.
class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      print('━━━━━━━━━━━━━━━━━━ REQUEST ━━━━━━━━━━━━━━━━━━');
      print('🔹 Method: ${options.method}');
      print('🔹 URL: ${options.uri}');
      print('🔹 Headers: ${options.headers}');
      if (options.data != null) {
        print('🔹 Body: ${options.data}');
      }
      print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      print('━━━━━━━━━━━━━━━━━━ RESPONSE ━━━━━━━━━━━━━━━━━');
      print('✅ Status Code: ${response.statusCode}');
      print('✅ URL: ${response.requestOptions.uri}');
      print('✅ Headers: ${response.headers}');
      print('✅ Data: ${response.data}');
      print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      print('━━━━━━━━━━━━━━━━━━ ERROR ━━━━━━━━━━━━━━━━━━');
      print('❌ Error Type: ${err.type}');
      print('❌ Status Code: ${err.response?.statusCode}');
      print('❌ URL: ${err.requestOptions.uri}');
      print('❌ Message: ${err.message}');
      if (err.response?.data != null) {
        print('❌ Response: ${err.response?.data}');
      }
      print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    handler.next(err);
  }
}
