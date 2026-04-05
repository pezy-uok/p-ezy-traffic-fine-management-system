import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../controllers/otp_controller.dart';
import '../../utils/form_validation.dart';
import '../providers/auth_provider.dart';

class OtpVerificationScreen extends ConsumerStatefulWidget {
  final String email;
  final String temporaryId;

  const OtpVerificationScreen({
    super.key,
    required this.email,
    required this.temporaryId,
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
    // Use addPostFrameCallback to avoid modifying provider during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startResendTimer();
    });
  }

  void _startResendTimer() {
    _resendCountdown = 60;

    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      
      setState(() {
        _resendCountdown--;
      });

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
    final otpState = ref.watch(otpProvider((email: widget.email, temporaryId: widget.temporaryId)));
    final otpNotifier = ref.read(otpProvider((email: widget.email, temporaryId: widget.temporaryId)).notifier);

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

              // DEBUG: Show API Response Info
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.lightGray,
                  borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
                  border: Border.all(color: AppColors.mediumGray),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ℹ️ DEBUG INFO (Remove in Production)',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Temporary ID:',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textTertiary,
                      ),
                    ),
                    SelectableText(
                      widget.temporaryId,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textPrimary,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
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
                  if (_resendCountdown <= 0)
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
                      'Resend in ${_resendCountdown}s',
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
  ) async {
    try {
      // DEBUG: Check form state before sending request
      print('\n╔════════════════════════════════════════╗');
      print('║  OTP VERIFICATION - DEBUG START      ║');
      print('╠════════════════════════════════════════╣');
      print('║ Email: $email');
      print('║ OTP Entered: $otp');
      print('║ OTP Length: ${otp.length}');
      print('║ Is Numeric: ${RegExp(r"^\d+$").hasMatch(otp)}');
      print('║ Form Valid: ${otpNotifier.state.isFormValid}');
      print('╚════════════════════════════════════════╝\n');

      // Call the controller's verifyOtp method
      print('🚀 Calling otpNotifier.verifyOtp()...');
      await otpNotifier.verifyOtp();
      print('✅ verifyOtp() completed successfully\n');

      // Get the updated auth state (tokens and user data are now saved)
      final tokenStorage = ref.read(tokenStorageServiceProvider);
      final accessToken = await tokenStorage.getAccessToken();
      final userId = await tokenStorage.getUserId();
      final userEmail = await tokenStorage.getUserEmail();
      final userName = await tokenStorage.getUserName();

      print('📦 Tokens retrieved from storage:');
      print('   Access Token: ${accessToken != null ? '✅ Found' : '❌ Not found'}');
      print('   User ID: ${userId ?? '❌ null'}');
      print('   Email: ${userEmail ?? '❌ null'}');
      print('   Name: ${userName ?? '❌ null'}\n');

      // Update global auth state
      if (accessToken != null &&
          userId != null &&
          userEmail != null &&
          userName != null) {
        print('🔄 Updating global auth state...');
        final authNotifier = ref.read(authProvider.notifier);
        authNotifier.setAuthenticatedUser(
          id: userId,
          email: userEmail,
          name: userName,
          role: 'police_officer', // Default - could store actual role
          accessToken: accessToken,
        );
        print('✅ Global auth state updated\n');
      } else {
        print('⚠️  ERROR: Some token data is missing!\n');
      }

      // On success, show message and navigate to home app
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Login successful! Redirecting to home...'),
            backgroundColor: AppColors.success,
          ),
        );

        // Wait briefly for snackbar to show, then pop back to AppShell
        // This removes LoginScreen and OtpVerificationScreen from the stack
        await Future.delayed(const Duration(milliseconds: 800));
        if (context.mounted) {
          // Pop all the way back to AppShell (the root widget)
          // AppShell will rebuild and automatically render MainNavigationScreen
          // because authProvider.isLoggedIn is now true
          Navigator.of(context).popUntil((route) => route.isFirst);
        }
      }
    } catch (e) {
      // Error is already set in the controller
      // Show error in snackbar
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _handleResendOtp(
    BuildContext context,
    WidgetRef ref,
    OtpNotifier otpNotifier,
  ) async {
    try {
      // Call the controller's resendOtp method
      await otpNotifier.resendOtp();

      // On success, restart the countdown timer
      _resendTimer.cancel();
      _startResendTimer();

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('OTP sent again to your registered mobile number'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      // Error is already set in the controller
      // Show error in snackbar
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }
}
