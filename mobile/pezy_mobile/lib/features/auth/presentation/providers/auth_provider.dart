/// Authentication state and notifier
/// Manages the overall authentication state of the app
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/auth_api_service.dart';
import '../../data/services/token_storage_service.dart';
import '../../data/services/auth_interceptor.dart';

/// User data model
class AuthUser {
  final String id;
  final String email;
  final String name;
  final String role; // admin, police_officer
  final String? department;
  final String? phone;
  final String? badge;

  const AuthUser({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.department,
    this.phone,
    this.badge,
  });

  /// Create from JSON
  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? 'police_officer',
      department: json['department'],
      phone: json['phone'],
      badge: json['badge'],
    );
  }

  /// Convert to JSON
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

/// Overall authentication state
class AuthState {
  final bool isLoading;
  final bool isLoggedIn;
  final AuthUser? user;
  final String? error;
  final String? accessToken;

  const AuthState({
    this.isLoading = false,
    this.isLoggedIn = false,
    this.user,
    this.error,
    this.accessToken,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isLoggedIn,
    AuthUser? user,
    String? error,
    String? accessToken,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      user: user ?? this.user,
      error: error,
      accessToken: accessToken ?? this.accessToken,
    );
  }
}

/// Authentication notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;
  final TokenStorageService _tokenStorage;

  AuthNotifier(
    this._authRepository,
    this._tokenStorage,
  ) : super(const AuthState());

  /// Check if user is already logged in (on app startup)
  Future<void> checkAuthStatus() async {
    // If already logged in, don't override by doing another check
    if (state.isLoggedIn) {
      debugPrint('\n╔════════════════════════════════════════╗');
      debugPrint('║  AUTH PROVIDER: checkAuthStatus()      ║');
      debugPrint('║ ⏭️  User already logged in - skipping   ║');
      debugPrint('╚════════════════════════════════════════╝\n');
      return;
    }

    state = state.copyWith(isLoading: true);

    try {
      debugPrint('\n╔════════════════════════════════════════╗');
      debugPrint('║  AUTH PROVIDER: checkAuthStatus()      ║');
      debugPrint('╠════════════════════════════════════════╣');
      debugPrint('║ 📱 Checking token validity...');

      // Check if tokens are valid (works on all platforms)
      final isLoggedIn = await _authRepository
          .isLoggedIn()
          .timeout(const Duration(seconds: 3), onTimeout: () => false);

      debugPrint('║ Token check result: ${isLoggedIn ? '✅ VALID' : '❌ INVALID'}');

      if (isLoggedIn) {
        debugPrint('║ Retrieving stored user data...');
        final accessToken = await _tokenStorage.getAccessToken();
        final userId = await _tokenStorage.getUserId();
        final userEmail = await _tokenStorage.getUserEmail();
        final userName = await _tokenStorage.getUserName();

        debugPrint('║ User Data:');
        debugPrint('║   ID: ${userId ?? '❌ null'}');
        debugPrint('║   Email: ${userEmail ?? '❌ null'}');
        debugPrint('║   Name: ${userName ?? '❌ null'}');
        debugPrint('║   Token: ${accessToken != null ? '✅ Found' : '❌ null'}');

        if (accessToken != null &&
            userId != null &&
            userEmail != null &&
            userName != null) {
          final user = AuthUser(
            id: userId,
            email: userEmail,
            name: userName,
            role: 'police_officer', // Default, could be stored too
          );

          debugPrint('║ ✅ All data present - setting logged in state');
          state = state.copyWith(
            isLoading: false,
            isLoggedIn: true,
            user: user,
            accessToken: accessToken,
          );
          debugPrint('╚════════════════════════════════════════╝\n');
          return;
        } else {
          debugPrint('║ ❌ Some user data missing - clearing state');
        }
      } else {
        debugPrint('║ ❌ Token invalid or expired');
      }

      debugPrint('║ Setting logged out state');
      state = state.copyWith(
        isLoading: false,
        isLoggedIn: false,
      );
      debugPrint('╚════════════════════════════════════════╝\n');
    } catch (e) {
      debugPrint('║ ❌ ERROR: $e');
      debugPrint('╚════════════════════════════════════════╝\n');
      state = state.copyWith(
        isLoading: false,
        isLoggedIn: false,
        error: e.toString(),
      );
    }
  }

  /// Logout
  Future<void> logout() async {
    print('\n🚀 AUTH NOTIFIER: logout() called\n');
    state = state.copyWith(isLoading: true);

    try {
      print('╔════════════════════════════════════════╗');
      print('║  AUTH NOTIFIER: logout               ║');
      print('╚════════════════════════════════════════╝\n');

      print('🔄 State: isLoading = true');
      print('📞 Calling _authRepository.logout()...\n');
      await _authRepository.logout();
      print('\n✅ Repository logout completed successfully');

      // Clear auth state
      print('🗑️  Clearing auth state...');
      state = const AuthState();
      print('✅ Auth state cleared (isLoggedIn = false)\n');
    } catch (e) {
      print('\n❌ Logout error in notifier: $e\n');
      print('Stack trace: $e');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  /// Called after successful OTP verification
  /// Updates auth state with user and tokens
  void setAuthenticatedUser({
    required String id,
    required String email,
    required String name,
    required String role,
    required String accessToken,
    String? department,
    String? phone,
    String? badge,
  }) {
    debugPrint('\n╔════════════════════════════════════════╗');
    debugPrint('║  AUTH NOTIFIER: setAuthenticatedUser   ║');
    debugPrint('╠════════════════════════════════════════╣');
    debugPrint('║ Setting logged-in state');
    debugPrint('║ User: $name ($email)');
    debugPrint('║ Token: ${accessToken.substring(0, 20)}...');
    debugPrint('╚════════════════════════════════════════╝\n');

    final user = AuthUser(
      id: id,
      email: email,
      name: name,
      role: role,
      department: department,
      phone: phone,
      badge: badge,
    );

    state = state.copyWith(
      isLoading: false,
      isLoggedIn: true,
      user: user,
      accessToken: accessToken,
      error: null,
    );

    debugPrint('✅ Auth state updated: isLoading=false, isLoggedIn=true\n');
  }

  /// Clear auth state (for logout or error)
  void clearAuth() {
    state = const AuthState();
  }
}

/// Providers

/// Token storage service provider
final tokenStorageServiceProvider = Provider<TokenStorageService>((ref) {
  return TokenStorageService();
});

/// Auth repository provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final tokenStorage = ref.watch(tokenStorageServiceProvider);
  return AuthRepository(
    apiService: AuthApiService(),
    tokenStorage: tokenStorage,
  );
});

/// Auth state provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  final tokenStorage = ref.watch(tokenStorageServiceProvider);
  return AuthNotifier(authRepository, tokenStorage);
});

/// Convenience provider - check if user is logged in
final isLoggedInProvider = Provider<bool>((ref) {
  final authState = ref.watch(authProvider);
  return authState.isLoggedIn;
});

/// Convenience provider - get current user
final currentUserProvider = Provider<AuthUser?>((ref) {
  final authState = ref.watch(authProvider);
  return authState.user;
});

/// Convenience provider - get access token
final accessTokenProvider = Provider<String?>((ref) {
  final authState = ref.watch(authProvider);
  return authState.accessToken;
});

/// Authenticated Dio provider - used for all API calls requiring auth
final authenticatedDioProvider = Provider<Dio>((ref) {
  final tokenStorage = ref.watch(tokenStorageServiceProvider);
  return createAuthenticatedDio(tokenStorage);
});
