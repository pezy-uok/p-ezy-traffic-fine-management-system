import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/index.dart';

/// Dio client provider
/// 
/// Provides a singleton instance of DioClient across the app.
/// 
/// Usage:
/// ```dart
/// final dioClient = ref.watch(dioClientProvider);
/// final response = await dioClient.get('/users');
/// ```
final dioClientProvider = Provider<DioClient>((ref) {
  return DioClient();
});

/// Auth token state provider
/// 
/// Manages the authentication token state.
/// 
/// Usage:
/// ```dart
/// // Get current token
/// final token = ref.watch(authTokenProvider);
/// 
/// // Set token
/// ref.read(authTokenProvider.notifier).state = 'new_token';
/// ```
final authTokenProvider = StateProvider<String?>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return dioClient.getAuthToken();
});

/// Auth status provider
/// 
/// Provides the current authentication status.
/// 
/// Usage:
/// ```dart
/// final isAuthenticated = ref.watch(isAuthenticatedProvider);
/// ```
final isAuthenticatedProvider = Provider<bool>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return dioClient.isAuthenticated();
});
