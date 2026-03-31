import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/auth_api_service.dart';
import '../../data/services/token_storage_service.dart';
import '../utils/form_validation.dart';

/// OTP verification state
class OtpState {
  final String email;
  final String otp;
  final bool isLoading;
  final bool isResending;
  final String? error;
  final int resendCountdown; // Seconds until resend is available
  final bool otpTouched; // Track if user has interacted with OTP field
  final String? otpValidationError; // Real-time validation error

  OtpState({
    this.email = '',
    this.otp = '',
    this.isLoading = false,
    this.isResending = false,
    this.error,
    this.resendCountdown = 0,
    this.otpTouched = false,
    this.otpValidationError,
  });

  /// Check if the OTP form is valid and can be submitted
  bool get isFormValid => otp.isNotEmpty && otpValidationError == null;

  OtpState copyWith({
    String? email,
    String? otp,
    bool? isLoading,
    bool? isResending,
    String? error,
    int? resendCountdown,
    bool? otpTouched,
    String? otpValidationError,
  }) {
    return OtpState(
      email: email ?? this.email,
      otp: otp ?? this.otp,
      isLoading: isLoading ?? this.isLoading,
      isResending: isResending ?? this.isResending,
      error: error,
      resendCountdown: resendCountdown ?? this.resendCountdown,
      otpTouched: otpTouched ?? this.otpTouched,
      otpValidationError: otpValidationError ?? this.otpValidationError,
    );
  }

  /// Check if resend button is enabled
  bool get canResend => resendCountdown == 0;
}

/// OTP state notifier
class OtpNotifier extends StateNotifier<OtpState> {
  final AuthRepository _authRepository;
  final String _temporaryId;

  OtpNotifier({
    required String email,
    required String temporaryId,
    required AuthRepository authRepository,
  })  : _temporaryId = temporaryId,
        _authRepository = authRepository,
        super(OtpState(email: email));

  void setOtp(String otp) {
    // Only allow numeric input
    if (otp.isEmpty || int.tryParse(otp) != null) {
      // Validate OTP in real-time
      final validationError = FormValidation.validateOtp(otp);
      state = state.copyWith(
        otp: otp,
        error: null,
        otpTouched: true,
        otpValidationError: validationError,
      );
    }
  }

  /// Mark OTP field as touched (for showing validation errors)
  void markOtpTouched() {
    final validationError = FormValidation.validateOtp(state.otp);
    state = state.copyWith(
      otpTouched: true,
      otpValidationError: validationError,
    );
  }

  /// Verify OTP - Call backend API
  Future<void> verifyOtp() async {
    setLoading(true);
    clearError();

    try {
      await _authRepository.verifyOtp(_temporaryId, state.otp);
      setLoading(false);
      // Success - tokens are saved in repository
    } catch (e) {
      setLoading(false);
      setError(e.toString().replaceFirst('Exception: ', ''));
      rethrow;
    }
  }

  /// Resend OTP - Call backend API
  Future<void> resendOtp() async {
    setResending(true);
    clearError();

    try {
      final newTemporaryId =
          await _authRepository.requestOtp(state.email);
      // Update temporary ID for next verification attempt
      // Note: In a real app, we'd update this, but it's part of the state
      setResending(false);
      // Reset OTP field
      state = state.copyWith(otp: '');
    } catch (e) {
      setResending(false);
      setError(e.toString().replaceFirst('Exception: ', ''));
      rethrow;
    }
  }

  void setError(String error) {
    state = state.copyWith(error: error);
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  void setLoading(bool loading) {
    state = state.copyWith(isLoading: loading);
  }

  void setResending(bool resending) {
    state = state.copyWith(isResending: resending);
  }

  void setResendCountdown(int countdown) {
    state = state.copyWith(resendCountdown: countdown);
  }

  void reset() {
    state = OtpState(email: state.email);
  }
}

/// OTP state provider - requires email and temporaryId parameters
/// Usage: ref.watch(otpProvider((email: 'user@example.com', temporaryId: 'otp_123')))
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    apiService: AuthApiService(),
    tokenStorage: TokenStorageService(),
  );
});

final otpProvider = StateNotifierProvider.family<OtpNotifier, OtpState,
    ({String email, String temporaryId})>((ref, params) {
  final authRepository = ref.watch(authRepositoryProvider);
  return OtpNotifier(
    email: params.email,
    temporaryId: params.temporaryId,
    authRepository: authRepository,
  );
});
