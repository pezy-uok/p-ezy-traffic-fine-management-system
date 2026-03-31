/// Authentication state and notifier
/// Manages the overall authentication state of the app
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/auth_api_service.dart';
import '../../data/services/token_storage_service.dart';

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
    state = state.copyWith(isLoading: true);

    try {
      final isLoggedIn = await _authRepository.isLoggedIn();

      if (isLoggedIn) {
        final accessToken = await _tokenStorage.getAccessToken();
        final userId = await _tokenStorage.getUserId();
        final userEmail = await _tokenStorage.getUserEmail();
        final userName = await _tokenStorage.getUserName();

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

          state = state.copyWith(
            isLoading: false,
            isLoggedIn: true,
            user: user,
            accessToken: accessToken,
          );
          return;
        }
      }

      state = state.copyWith(
        isLoading: false,
        isLoggedIn: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        isLoggedIn: false,
        error: e.toString(),
      );
    }
  }

  /// Logout
  Future<void> logout() async {
    state = state.copyWith(isLoading: true);

    try {
      await _authRepository.logout();
      state = const AuthState();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
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
      isLoggedIn: true,
      user: user,
      accessToken: accessToken,
      error: null,
    );
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
