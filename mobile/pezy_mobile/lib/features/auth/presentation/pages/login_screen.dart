import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../controllers/login_controller.dart';
import 'otp_verification_screen.dart';

class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final loginState = ref.watch(loginProvider);
    final loginNotifier = ref.read(loginProvider.notifier);
    final isMobile = MediaQuery.of(context).size.width < 600;

    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isMobile ? AppSpacing.lg : 48,
              vertical: AppSpacing.xxl,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header Section
                Column(
                  children: [
                    // PEZY Logo Badge
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.accentRed,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.accentRed.withValues(alpha: 0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.security,
                        size: 60,
                        color: AppColors.primaryWhite,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sectionGap),

                    // Title
                    Text(
                      'PEZY',
                      style: AppTextStyles.displaySmall.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),

                    // Subtitle
                    Text(
                      'Police Officer Portal',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.xxxl),

                // Form Section
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(AppSpacing.xxl),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Section Title
                      Text(
                        'Login',
                        style: AppTextStyles.headlineSmall.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),

                      Text(
                        'Enter your email or ID number to get started',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sectionGap),

                      // Email Input Field
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Email or ID Number',
                            style: AppTextStyles.labelMedium.copyWith(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Container(
                            decoration: BoxDecoration(
                              borderRadius:
                                  BorderRadius.circular(AppSpacing.cornerRadius),
                              border: Border.all(
                                color: loginState.emailTouched
                                    ? (loginState.emailValidationError != null
                                        ? AppColors.error
                                        : AppColors.success)
                                    : AppColors.borderColor,
                                width: 2,
                              ),
                              color: loginState.emailTouched &&
                                      loginState.emailValidationError == null
                                  ? AppColors.success.withValues(alpha: 0.05)
                                  : AppColors.extraLightGray,
                            ),
                            child: TextField(
                              onChanged: loginNotifier.setEmail,
                              onTap: () => loginNotifier.markEmailTouched(),
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: const Color.fromARGB(255, 255, 255, 255),
                              ),
                              decoration: InputDecoration(
                                hintText: 'officer@example.com or 12345',
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
                                  size: 20,
                                ),
                                suffixIcon: loginState.emailTouched
                                    ? Icon(
                                        loginState.emailValidationError == null
                                            ? Icons.check_circle
                                            : Icons.error_outline,
                                        color: loginState
                                                    .emailValidationError ==
                                                null
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

                          // Inline Validation Error
                          if (loginState.emailTouched &&
                              loginState.emailValidationError != null)
                            Padding(
                              padding: const EdgeInsets.only(
                                top: AppSpacing.sm,
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.error_outline,
                                    size: 16,
                                    color: AppColors.error,
                                  ),
                                  const SizedBox(width: AppSpacing.sm),
                                  Expanded(
                                    child: Text(
                                      loginState.emailValidationError!,
                                      style: AppTextStyles.bodySmall.copyWith(
                                        color: AppColors.error,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),

                      const SizedBox(height: AppSpacing.sectionGap),

                      // Info Banner
                      // Container(
                      //   padding: const EdgeInsets.all(AppSpacing.md),
                      //   decoration: BoxDecoration(
                      //     color: AppColors.accentRed.withValues(alpha: 0.08),
                      //     borderRadius:
                      //         BorderRadius.circular(AppSpacing.cornerRadius),
                      //     border: Border.all(
                      //       color: AppColors.accentRed.withValues(alpha: 0.15),
                      //     ),
                      //   ),
                      //   child: Row(
                      //     children: [
                      //       Icon(
                      //         Icons.info_outline,
                      //         color: AppColors.accentRed,
                      //         size: 18,
                      //       ),
                      //       const SizedBox(width: AppSpacing.md),
                      //       Expanded(
                      //         child: Text(
                      //           '🔧 Development Mode: Use any email and OTP will be mocked',
                      //           style: AppTextStyles.bodySmall.copyWith(
                      //             color: AppColors.textSecondary,
                      //             height: 1.4,
                      //           ),
                      //         ),
                      //       ),
                      //     ],
                      //   ),
                      // ),

                      // // Error Message
                      if (loginState.error != null)
                        Padding(
                          padding: const EdgeInsets.only(top: AppSpacing.md),
                          child: Container(
                            padding: const EdgeInsets.all(AppSpacing.md),
                            decoration: BoxDecoration(
                              color: AppColors.error.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(
                                  AppSpacing.cornerRadius),
                              border: Border.all(
                                color: AppColors.error.withValues(alpha: 0.15),
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.error_outline,
                                  color: AppColors.error,
                                  size: 18,
                                ),
                                const SizedBox(width: AppSpacing.md),
                                Expanded(
                                  child: Text(
                                    loginState.error!,
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: AppColors.error,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                      const SizedBox(height: AppSpacing.sectionGap),

                      // Login Button
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: loginState.isLoading ||
                                  !loginState.isFormValid
                              ? null
                              : () {
                                  _handleRequestOtp(context, ref,
                                      loginNotifier, loginState.email);
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.accentRed,
                            disabledBackgroundColor:
                                AppColors.disabledColor,
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(
                                  AppSpacing.cornerRadius),
                            ),
                          ),
                          child: loginState.isLoading
                              ? const SizedBox(
                                  height: 24,
                                  width: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
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
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: AppSpacing.sectionGap),

                // Footer Links
                // Row(
                //   mainAxisAlignment: MainAxisAlignment.center,
                //   children: [
                //     Text(
                //       "Don't have an account? ",
                //       style: AppTextStyles.bodySmall.copyWith(
                //         color: AppColors.textSecondary,
                //       ),
                //     ),
                //     GestureDetector(
                //       onTap: () {
                //         ScaffoldMessenger.of(context).showSnackBar(
                //           const SnackBar(
                //             content: Text('Registration coming soon'),
                //             duration: Duration(seconds: 2),
                //           ),
                //         );
                //       },
                //       child: Text(
                //         'Register here',
                //         style: AppTextStyles.bodySmall.copyWith(
                //           color: AppColors.accentRed,
                //           fontWeight: FontWeight.w700,
                //           decoration: TextDecoration.underline,
                //         ),
                //       ),
                //     ),
                //   ],
                // ),

                const SizedBox(height: AppSpacing.sectionGap),

                // Development Guide
                // Container(
                //   padding: const EdgeInsets.all(AppSpacing.md),
                //   decoration: BoxDecoration(
                //     color: Colors.blue.withValues(alpha: 0.08),
                //     borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
                //     border: Border.all(
                //       color: Colors.blue.withValues(alpha: 0.15),
                //     ),
                //   ),
                //   child: Column(
                //     crossAxisAlignment: CrossAxisAlignment.start,
                //     children: [
                //       Text(
                //         '📝 Quick Test Guide:',
                //         style: AppTextStyles.labelMedium.copyWith(
                //           color: Colors.blue[900],
                //           fontWeight: FontWeight.w600,
                //         ),
                //       ),
                //       const SizedBox(height: AppSpacing.sm),
                //       Text(
                //         '1. Use @pezy.gov email (e.g., officer.bandara@pezy.gov)\n2. Click Request OTP\n3. Enter any 6-digit code (e.g., 123456)\n4. You\'ll be logged in!',
                //         style: AppTextStyles.bodySmall.copyWith(
                //           color: AppColors.textSecondary,
                //           height: 1.6,
                //         ),
                //       ),
                //     ],
                //   ),
                // ),
              ],
            ),
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
      print('\n🔴🔴🔴 DEBUG: Starting OTP request 🔴🔴🔴');
      // Call the controller's requestOtp method
      final temporaryId = await loginNotifier.requestOtp();
      print('✅ DEBUG: OTP request succeeded, temporary_id: $temporaryId');

      // On success, show success message and navigate to OTP verification screen
      if (context.mounted) {
        // Show success snackbar
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ OTP sent successfully! Check your phone.'),
            backgroundColor: AppColors.success,
            duration: Duration(seconds: 2),
          ),
        );

        // Navigate to OTP verification screen after a brief delay
        await Future.delayed(const Duration(milliseconds: 300));
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
      }
    } catch (e) {
      print('❌ DEBUG: OTP request FAILED with error: $e');
      // Error is already set in the controller
      // Show error in snackbar
      if (context.mounted) {
        final errorMessage = e.toString().replaceFirst('Exception: ', '');
        print('❌ DEBUG: Showing error snackbar: $errorMessage');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Error: $errorMessage'),
            backgroundColor: AppColors.error,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }
}
