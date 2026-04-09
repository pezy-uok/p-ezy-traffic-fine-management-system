import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/connectivity_service.dart';

/// Connectivity status provider
/// 
/// Monitors and provides real-time network connectivity status.
/// Returns ConnectivityStatus with isConnected and connectionType info.
/// 
/// Usage:
/// ```dart
/// final status = ref.watch(connectivityProvider);
/// if (status.isConnected) {
///   print('Connected via ${status.connectionTypeName}');
/// } else {
///   print('No connection');
/// }
/// ```
final connectivityProvider = StreamProvider<ConnectivityStatus>((ref) async* {
  final service = ConnectivityService();
  
  // First emit current status
  final currentResult = await service.getConnectivityStatus();
  yield ConnectivityStatus(
    isConnected: currentResult != ConnectivityResult.none,
    connectionType: currentResult,
    connectionTypeName: service.getConnectionTypeName(currentResult),
  );
  
  // Then listen to changes
  await for (final result in service.connectivityStream) {
    yield ConnectivityStatus(
      isConnected: result != ConnectivityResult.none,
      connectionType: result,
      connectionTypeName: service.getConnectionTypeName(result),
    );
  }
});

/// Connectivity service provider
/// 
/// Provides singleton instance of ConnectivityService.
final connectivityServiceProvider = Provider<ConnectivityService>((ref) {
  return ConnectivityService();
});

/// Simple boolean provider for connectivity status
/// 
/// Returns true if device has internet connection, false otherwise.
/// 
/// Usage:
/// ```dart
/// final isOnline = ref.watch(isOnlineProvider);
/// ```
final isOnlineProvider = Provider<bool>((ref) {
  final status = ref.watch(connectivityProvider);
  return status.maybeWhen(
    data: (data) => data.isConnected,
    orElse: () => true, // Assume online if loading initially
  );
});

/// Connection type provider
/// 
/// Returns the current connection type (WiFi, Mobile, etc).
final connectionTypeProvider = Provider<String>((ref) {
  final status = ref.watch(connectivityProvider);
  return status.maybeWhen(
    data: (data) => data.connectionTypeName,
    orElse: () => 'Unknown',
  );
});
