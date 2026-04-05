import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/auth_api_service.dart';
import '../../data/services/token_storage_service.dart';
import '../../utils/form_validation.dart';

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
      emailValidationError: emailValidationError,
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
    print('\n╔════════════════════════════════════════╗');
    print('║  LOGIN CONTROLLER: requestOtp START  ║');
    print('╚════════════════════════════════════════╝');
    setLoading(true);
    clearError();

    try {
      // Step 1: Verify email exists
      print('📧 Step 1: Verifying email: ${state.email}');
      await _authRepository.verifyEmail(state.email);
      print('✅ Step 1: Email verification successful');

      // Step 2: Request OTP
      print('📱 Step 2: Requesting OTP...');
      final temporaryId = await _authRepository.requestOtp(state.email);
      print('✅ Step 2: OTP request successful, temporary_id: $temporaryId');

      setLoading(false);
      setOtpRequested(true);
      print('╔════════════════════════════════════════╗');
      print('║  LOGIN CONTROLLER: requestOtp SUCCESS ║');
      print('╚════════════════════════════════════════╝\n');
      return temporaryId;
    } catch (e) {
      print('❌ Exception in requestOtp: $e');
      setLoading(false);
      final errorMsg = e.toString().replaceFirst('Exception: ', '');
      setError(errorMsg);
      print('╔════════════════════════════════════════╗');
      print('║  LOGIN CONTROLLER: requestOtp FAILED  ║');
      print('║  Error: $errorMsg');
      print('╚════════════════════════════════════════╝\n');
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
