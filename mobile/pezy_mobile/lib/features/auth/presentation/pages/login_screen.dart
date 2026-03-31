import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/index.dart';
import '../controllers/login_controller.dart';
import '../utils/form_validation.dart';
import 'otp_verification_screen.dart';

class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final loginState = ref.watch(loginProvider);
    final loginNotifier = ref.read(loginProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.primaryWhite,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: AppSpacing.xxxl),

              // PEZY Shield Logo
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.accentRed.withValues(alpha: 0.1),
                ),
                child: const Icon(
                  Icons.security,
                  size: 50,
                  color: AppColors.accentRed,
                ),
              ),

              const SizedBox(height: AppSpacing.sectionGap),

              // LOGIN Heading
              Text(
                'LOGIN',
                style: AppTextStyles.displaySmall.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w700,
                ),
              ),

              const SizedBox(height: AppSpacing.sectionGap),

              // Email/Username Input Field
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      borderRadius:
                          BorderRadius.circular(AppSpacing.cornerRadius),
                      border: Border.all(
                        color: loginState.emailTouched
                            ? (loginState
                                    .emailValidationError !=
                                null
                                ? AppColors.error
                                : AppColors.success)
                            : AppColors.mediumGray,
                        width: 1.5,
                      ),
                      color: loginState.emailTouched &&
                              loginState.emailValidationError == null
                          ? AppColors.success.withValues(alpha: 0.05)
                          : AppColors.primaryWhite,
                    ),
                    child: TextField(
                      onChanged: loginNotifier.setEmail,
                      onTap: () => loginNotifier.markEmailTouched(),
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textPrimary,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Email or ID Number',
                        hintStyle: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textTertiary,
                        ),
                        prefixIcon: Icon(
                          Icons.email_outlined,
                          color: loginState.emailTouched
                              ? (loginState.emailValidationError != null
                                  ? AppColors.error
                                  : AppColors.success)
                              : AppColors.textSecondary,
                        ),
                        suffixIcon: loginState.emailTouched
                            ? Icon(
                                loginState.emailValidationError == null
                                    ? Icons.check_circle
                                    : Icons.error,
                                color: loginState.emailValidationError == null
                                    ? AppColors.success
                                    : AppColors.error,
                              )
                            : null,
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.md,
                        ),
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                  ),
                  // Inline validation error
                  if (loginState.emailTouched &&
                      loginState.emailValidationError != null)
                    Padding(
                      padding: const EdgeInsets.only(
                        top: AppSpacing.sm,
                        left: AppSpacing.sm,
                      ),
                      child: Text(
                        loginState.emailValidationError!,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.error,
                        ),
                      ),
                    ),
                ],
              ),

              const SizedBox(height: AppSpacing.sectionGap),

              // Info text about OTP flow
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.accentRed.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
                  border: Border.all(
                    color: AppColors.accentRed.withValues(alpha: 0.2),
                  ),
                ),
                child: Text(
                  'We\'ll send a verification code (OTP) to your registered mobile number.',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),

              // Error Message
              if (loginState.error != null)
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.sm),
                  child: Text(
                    loginState.error!,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.error,
                    ),
                  ),
                ),

              const SizedBox(height: AppSpacing.sectionGap),

              // Request OTP Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: loginState.isLoading || !loginState.isFormValid
                      ? null
                      : () {
                          // Form is valid, request OTP
                          _handleRequestOtp(context, ref, loginNotifier,
                              loginState.email);
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accentRed,
                    disabledBackgroundColor: AppColors.mediumGray,
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppSpacing.cornerRadius),
                    ),
                  ),
                  child: loginState.isLoading
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
                          'Request OTP',
                          style: AppTextStyles.labelLarge.copyWith(
                            color: AppColors.primaryWhite,
                            fontSize: 16,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: AppSpacing.sectionGap),

              // Register Link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "Don't have an account? ",
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      // TODO: Navigate to registration screen
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Registration screen coming soon'),
                        ),
                      );
                    },
                    child: Text(
                      'Register',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.accentRed,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.sectionGap),
            ],
          ),
        ),
      ),
    );
  }

  void _handleRequestOtp(
    BuildContext context,
    WidgetRef ref,
    LoginNotifier loginNotifier,
    String email,
  ) async {
    try {
      // Call the controller's requestOtp method
      final temporaryId = await loginNotifier.requestOtp();

      // On success, navigate to OTP verification screen
      if (context.mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => OtpVerificationScreen(
              email: email,
              temporaryId: temporaryId,
            ),
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
