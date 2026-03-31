import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/auth_api_service.dart';
import '../../data/services/token_storage_service.dart';
import '../utils/form_validation.dart';

/// Login state
class LoginState {
  final String email;
  final bool isLoading;
  final String? error;
  final bool otpRequested;
  final bool emailTouched; // Track if user has interacted with email field
  final String? emailValidationError; // Real-time validation error

  LoginState({
    this.email = '',
    this.isLoading = false,
    this.error,
    this.otpRequested = false,
    this.emailTouched = false,
    this.emailValidationError,
  });

  /// Check if the form is valid and can be submitted
  bool get isFormValid => email.isNotEmpty && emailValidationError == null;

  LoginState copyWith({
    String? email,
    bool? isLoading,
    String? error,
    bool? otpRequested,
    bool? emailTouched,
    String? emailValidationError,
  }) {
    return LoginState(
      email: email ?? this.email,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      otpRequested: otpRequested ?? this.otpRequested,
      emailTouched: emailTouched ?? this.emailTouched,
      emailValidationError:
          emailValidationError ?? this.emailValidationError,
    );
  }
}

/// Login state notifier
class LoginNotifier extends StateNotifier<LoginState> {
  final AuthRepository _authRepository;

  LoginNotifier(this._authRepository) : super(LoginState());

  void setEmail(String email) {
    // Validate email in real-time
    final validationError = FormValidation.validateEmail(email);
    state = state.copyWith(
      email: email,
      error: null,
      emailTouched: true,
      emailValidationError: validationError,
    );
  }

  /// Mark email field as touched (for showing validation errors)
  void markEmailTouched() {
    final validationError = FormValidation.validateEmail(state.email);
    state = state.copyWith(
      emailTouched: true,
      emailValidationError: validationError,
    );
  }

  /// Request OTP - Call backend API
  /// Returns temporary_id if successful
  Future<String> requestOtp() async {
    setLoading(true);
    clearError();

    try {
      // Step 1: Verify email exists
      await _authRepository.verifyEmail(state.email);

      // Step 2: Request OTP
      final temporaryId = await _authRepository.requestOtp(state.email);

      setLoading(false);
      setOtpRequested(true);
      return temporaryId;
    } catch (e) {
      setLoading(false);
      setError(e.toString().replaceFirst('Exception: ', ''));
      rethrow;
    }
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

/// Auth repository provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    apiService: AuthApiService(),
    tokenStorage: TokenStorageService(),
  );
});

/// Login state provider
final loginProvider = StateNotifierProvider<LoginNotifier, LoginState>((ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return LoginNotifier(authRepository);
});
