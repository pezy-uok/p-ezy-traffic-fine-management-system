/// Application configuration constants
///
/// Centralized configuration for the Pezy Mobile app.
/// All environment-specific values should be defined here.
class AppConfig {
  // Private constructor to prevent instantiation
  AppConfig._();

  /// API Base URL
  /// Change this value to match your backend server URL
  ///
  /// Examples:
  /// - Development: 'http://localhost:8000/api'
  /// - Staging: 'https://staging-api.pezy.com/api'
  /// - Production: 'https://api.pezy.com/api'
  static const String apiBaseUrl = 'http://localhost:8000/api';

  /// API Timeout (in seconds)
  static const int apiTimeoutSeconds = 30;

  /// Enable debug logging
  static const bool enableDebugLogging = true;

  /// Authentication token storage key
  static const String authTokenKey = 'auth_token';

  /// User data storage key
  static const String userDataKey = 'user_data';

  /// API Version
  static const String apiVersion = 'v1';

  /// App version
  static const String appVersion = '1.0.0';

  /// Minimum version required
  static const String minimumVersion = '1.0.0';

  // ============ Environment Detection ============

  /// Check if running in debug mode
  static bool get isDebugMode {
    return enableDebugLogging;
  }

  // ============ API Endpoints ============
  // Define common API endpoints for easy access

  /// Authentication endpoints
  static const String loginEndpoint = '/auth/login';
  static const String signupEndpoint = '/auth/signup';
  static const String logoutEndpoint = '/auth/logout';
  static const String refreshTokenEndpoint = '/auth/refresh';
  static const String forgotPasswordEndpoint = '/auth/forgot-password';
  static const String resetPasswordEndpoint = '/auth/reset-password';

  /// User endpoints
  static const String userProfileEndpoint = '/users/profile';
  static const String updateProfileEndpoint = '/users/profile/update';
  static const String getUsersEndpoint = '/users';
  static const String getUserDetailEndpoint = '/users/{id}';

  /// Dashboard endpoints
  static const String dashboardEndpoint = '/dashboard';
  static const String dashboardStatsEndpoint = '/dashboard/stats';

  /// Messaging endpoints
  static const String messagesEndpoint = '/messages';
  static const String conversationsEndpoint = '/conversations';

  // ============ Network Configuration ============

  /// Network timeout configurations
  static const int connectionTimeoutMs = 30000;
  static const int receiveTimeoutMs = 30000;
  static const int sendTimeoutMs = 30000;

  /// Retry configuration
  static const int maxRetries = 3;
  static const int retryDelayMs = 1000;

  // ============ Feature Flags ============

  /// Enable offline support
  static const bool enableOfflineSupport = true;

  /// Enable analytics
  static const bool enableAnalytics = false;

  /// Enable crash reporting
  static const bool enableCrashReporting = false;

  /// Enable performance monitoring
  static const bool enablePerformanceMonitoring = false;
}
