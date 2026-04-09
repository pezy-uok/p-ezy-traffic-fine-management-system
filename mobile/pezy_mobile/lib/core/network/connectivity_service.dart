import 'package:connectivity_plus/connectivity_plus.dart';

/// Connectivity service to monitor network status
/// 
/// Provides real-time network connectivity monitoring and detection
/// of network type (WiFi, Mobile, None).
/// 
/// Usage:
/// ```dart
/// final service = ConnectivityService();
/// final stream = service.connectivityStream;
/// stream.listen((status) {
///   print('Connected: ${status.isConnected}');
///   print('Type: ${status.connectionType}');
/// });
/// ```
class ConnectivityService {
  // Singleton instance
  static final ConnectivityService _instance = ConnectivityService._internal();

  final Connectivity _connectivity = Connectivity();
  late Stream<ConnectivityResult> _connectivityStream;

  factory ConnectivityService() => _instance;

  ConnectivityService._internal() {
    _connectivityStream = _connectivity.onConnectivityChanged;
  }

  /// Get the connectivity stream
  Stream<ConnectivityResult> get connectivityStream => _connectivityStream;

  /// Get current connectivity status
  Future<ConnectivityResult> getConnectivityStatus() async {
    return await _connectivity.checkConnectivity();
  }

  /// Check if device has internet connection
  Future<bool> hasConnectivity() async {
    final result = await getConnectivityStatus();
    return result != ConnectivityResult.none;
  }

  /// Get readable connection type
  String getConnectionTypeName(ConnectivityResult result) {
    switch (result) {
      case ConnectivityResult.wifi:
        return 'WiFi';
      case ConnectivityResult.mobile:
        return 'Mobile Data';
      case ConnectivityResult.ethernet:
        return 'Ethernet';
      case ConnectivityResult.vpn:
        return 'VPN';
      case ConnectivityResult.none:
        return 'No Connection';
      default:
        return 'Unknown';
    }
  }
}

/// Model for connectivity status
class ConnectivityStatus {
  final bool isConnected;
  final ConnectivityResult connectionType;
  final String connectionTypeName;

  ConnectivityStatus({
    required this.isConnected,
    required this.connectionType,
    required this.connectionTypeName,
  });

  @override
  String toString() {
    return 'ConnectivityStatus(isConnected: $isConnected, type: $connectionTypeName)';
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ConnectivityStatus &&
          runtimeType == other.runtimeType &&
          isConnected == other.isConnected &&
          connectionType == other.connectionType;

  @override
  int get hashCode => isConnected.hashCode ^ connectionType.hashCode;
}
