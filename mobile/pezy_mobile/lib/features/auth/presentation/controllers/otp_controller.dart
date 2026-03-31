import 'package:flutter_riverpod/flutter_riverpod.dart';
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
  OtpNotifier({required String email})
      : super(OtpState(email: email));

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

/// OTP state provider - requires email parameter
final otpProvider =
    StateNotifierProvider.family<OtpNotifier, OtpState, String>((ref, email) {
  return OtpNotifier(email: email);
});
