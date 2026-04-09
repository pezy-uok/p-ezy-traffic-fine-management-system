/// Criminal API service provider
/// Provides CriminalApiService with authenticated Dio client
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/services/criminal_api_service.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

/// Criminal API service provider - uses authenticated Dio
final criminalApiServiceProvider = Provider<CriminalApiService>((ref) {
  debugPrint('\n╔════════════════════════════════════════╗');
  debugPrint('║  CRIMINAL API SERVICE PROVIDER         ║');
  debugPrint('╠════════════════════════════════════════╣');
  debugPrint('║ Creating CriminalApiService...');
  
  final authenticatedDio = ref.watch(authenticatedDioProvider);
  
  debugPrint('║ ✅ Authenticated Dio obtained');
  debugPrint('║ Creating CriminalApiService with Dio...');
  
  final service = CriminalApiService(dio: authenticatedDio);
  
  debugPrint('║ ✅ CriminalApiService created');
  debugPrint('╚════════════════════════════════════════╝\n');
  
  return service;
});
