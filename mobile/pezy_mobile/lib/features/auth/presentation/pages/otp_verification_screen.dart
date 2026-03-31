import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/index.dart';
import '../controllers/otp_controller.dart';
import '../utils/form_validation.dart';

class OtpVerificationScreen extends ConsumerStatefulWidget {
  final String email;

  const OtpVerificationScreen({
    super.key,
    required this.email,
  });

  @override
  ConsumerState<OtpVerificationScreen> createState() =>
      _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends ConsumerState<OtpVerificationScreen> {
  late Timer _resendTimer;
  int _resendCountdown = 60; // 60 seconds before can resend

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  void _startResendTimer() {
    _resendCountdown = 60;
    ref.read(otpProvider(widget.email).notifier).setResendCountdown(60);

    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _resendCountdown--;
      });
      ref
          .read(otpProvider(widget.email).notifier)
          .setResendCountdown(_resendCountdown);

      if (_resendCountdown <= 0) {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _resendTimer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final otpState = ref.watch(otpProvider(widget.email));
    final otpNotifier = ref.read(otpProvider(widget.email).notifier);

    return Scaffold(
      backgroundColor: AppColors.primaryWhite,
      appBar: AppBar(
        backgroundColor: AppColors.primaryWhite,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: AppSpacing.lg),

              // Icon
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.accentRed.withValues(alpha: 0.1),
                ),
                child: const Icon(
                  Icons.mail_outline,
                  size: 50,
                  color: AppColors.accentRed,
                ),
              ),

              const SizedBox(height: AppSpacing.sectionGap),

              // Heading
              Text(
                'Verify OTP',
                style: AppTextStyles.displaySmall.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w700,
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // Subtitle
              Text(
                'We\'ve sent a verification code to',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),

              const SizedBox(height: AppSpacing.sm),

              // Email Display
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.sm,
                ),
                decoration: BoxDecoration(
                  color: AppColors.lightGray,
                  borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
                  border: Border.all(color: AppColors.mediumGray),
                ),
                child: Text(
                  widget.email,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),

              const SizedBox(height: AppSpacing.sectionGap),

              // OTP Input Field with Validation
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      borderRadius:
                          BorderRadius.circular(AppSpacing.cornerRadius),
                      border: Border.all(
                        color: otpState.otpTouched
                            ? (otpState.otpValidationError != null
                                ? AppColors.error
                                : AppColors.success)
                            : AppColors.mediumGray,
                        width: 1.5,
                      ),
                      color: otpState.otpTouched &&
                              otpState.otpValidationError == null
                          ? AppColors.success.withValues(alpha: 0.05)
                          : AppColors.primaryWhite,
                    ),
                    child: TextField(
                      onChanged: otpNotifier.setOtp,
                      onTap: () => otpNotifier.markOtpTouched(),
                      maxLength: 6,
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      style: AppTextStyles.headlineSmall.copyWith(
                        color: AppColors.textPrimary,
                        letterSpacing: 12,
                      ),
                      decoration: InputDecoration(
                        hintText: '000000',
                        hintStyle: AppTextStyles.headlineSmall.copyWith(
                          color: AppColors.textTertiary,
                          letterSpacing: 12,
                        ),
                        suffixIcon: otpState.otpTouched
                            ? Icon(
                                otpState.otpValidationError == null
                                    ? Icons.check_circle
                                    : Icons.error,
                                color: otpState.otpValidationError == null
                                    ? AppColors.success
                                    : AppColors.error,
                              )
                            : null,
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.md,
                        ),
                        counterText: '', // Hide character counter
                      ),
                    ),
                  ),
                  // Inline validation error
                  if (otpState.otpTouched && otpState.otpValidationError != null)
                    Padding(
                      padding: const EdgeInsets.only(
                        top: AppSpacing.sm,
                        left: AppSpacing.sm,
                      ),
                      child: Text(
                        otpState.otpValidationError!,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.error,
                        ),
                      ),
                    ),
                ],
              ),

              const SizedBox(height: AppSpacing.sectionGap),

              // Verify Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: otpState.isLoading || !otpState.isFormValid
                      ? null
                      : () {
                          // Form is valid, verify OTP
                          _handleVerifyOtp(context, ref, otpNotifier,
                              widget.email, otpState.otp);
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accentRed,
                    disabledBackgroundColor: AppColors.mediumGray,
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppSpacing.cornerRadius),
                    ),
                  ),
                  child: otpState.isLoading
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              AppColors.primaryWhite,
                            ),
                          ),
                        )
                      : Text(
                          'Verify OTP',
                          style: AppTextStyles.labelLarge.copyWith(
                            color: AppColors.primaryWhite,
                            fontSize: 16,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              // Resend OTP Section
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "Didn't receive code? ",
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  if (otpState.canResend)
                    GestureDetector(
                      onTap: otpState.isResending
                          ? null
                          : () {
                              _handleResendOtp(context, ref, otpNotifier);
                            },
                      child: Text(
                        'Resend',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.accentRed,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    )
                  else
                    Text(
                      'Resend in ${otpState.resendCountdown}s',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textTertiary,
                      ),
                    ),
                ],
              ),

              const SizedBox(height: AppSpacing.sectionGap),

              // Change Email Link
              Center(
                child: GestureDetector(
                  onTap: () {
                    Navigator.pop(context);
                  },
                  child: Text(
                    'Use different email',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: AppSpacing.sectionGap),
            ],
          ),
        ),
      ),
    );
  }

  void _handleVerifyOtp(
    BuildContext context,
    WidgetRef ref,
    OtpNotifier otpNotifier,
    String email,
    String otp,
  ) {
    // TODO: Implement OTP verification API call using the backend endpoint:
    // POST /api/auth/verify-otp with { email, otp }
    // On success:
    // - Store JWT tokens (accessToken, refreshToken)
    // - Navigate to home/dashboard screen
    // On error:
    // - Display error message

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('OTP verification functionality coming soon'),
      ),
    );
  }

  void _handleResendOtp(
    BuildContext context,
    WidgetRef ref,
    OtpNotifier otpNotifier,
  ) {
    // TODO: Implement resend OTP API call using the backend endpoint:
    // POST /api/auth/request-otp with { email }
    // On success:
    // - Restart the 60-second countdown timer
    // - Clear any previous error messages
    // On error:
    // - Display error message

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Resend OTP functionality coming soon'),
      ),
    );

    // Restart the countdown timer
    _resendTimer.cancel();
    _startResendTimer();
  }
}
