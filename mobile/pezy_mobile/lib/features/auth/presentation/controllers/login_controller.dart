import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Login state
class LoginState {
  final String email;
  final bool isLoading;
  final String? error;
  final bool otpRequested;

  LoginState({
    this.email = '',
    this.isLoading = false,
    this.error,
    this.otpRequested = false,
  });

  LoginState copyWith({
    String? email,
    bool? isLoading,
    String? error,
    bool? otpRequested,
  }) {
    return LoginState(
      email: email ?? this.email,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      otpRequested: otpRequested ?? this.otpRequested,
    );
  }
}

/// Login state notifier
class LoginNotifier extends StateNotifier<LoginState> {
  LoginNotifier() : super(LoginState());

  void setEmail(String email) {
    state = state.copyWith(email: email, error: null);
  }

  void setOtpRequested(bool requested) {
    state = state.copyWith(otpRequested: requested);
  }

  void setLoading(bool loading) {
    state = state.copyWith(isLoading: loading);
  }

  void setError(String error) {
    state = state.copyWith(error: error);
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  void reset() {
    state = LoginState();
  }
}

/// Login state provider
final loginProvider = StateNotifierProvider<LoginNotifier, LoginState>((ref) {
  return LoginNotifier();
});
