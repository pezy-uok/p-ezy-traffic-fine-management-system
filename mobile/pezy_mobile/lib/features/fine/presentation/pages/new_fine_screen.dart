import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../../../../shared/widgets/index.dart';
import '../providers/new_fine_provider.dart';

/// Add New Fine initial screen with license number input
///
/// This screen allows users to enter a license number to lookup driver details.
/// Once submitted, it displays the driver's name and shows a warning if there
/// are overdue fines.
class NewFineScreen extends ConsumerWidget {
  const NewFineScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formState = ref.watch(newFineProvider);
    final notifier = ref.read(newFineProvider.notifier);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.screenPaddingHorizontal,
            vertical: AppSpacing.screenPaddingVertical,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // PEZY logo
              Center(
                child: Icon(
                  Icons.security,
                  size: 40,
                  color: AppColors.primaryBlue,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // NEW FINE header bar
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: const BoxDecoration(
                  color: Color(0xFF0A5DA8),
                  borderRadius: BorderRadius.all(Radius.circular(4)),
                ),
                child: Text(
                  'NEW FINE',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.titleMedium.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 2,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sectionGap),

              // Form title
              Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: Text(
                  'ADD NEW FINE',
                  style: AppTextStyles.headlineSmall.copyWith(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),

              // License number input field
              PezyTextField(
                label: 'License No',
                hint: 'License No',
                controller: _LicenseTextController(formState.licenseNo),
                onChanged: (value) {
                  notifier.setLicenseNo(value);
                },
                enabled: !formState.isSubmitted,
                keyboardType: TextInputType.text,
                variant: PezyTextFieldVariant.outlined,
                borderRadius: 12,
                labelColor: Colors.black54,
                hintTextColor: Colors.grey.shade600,
                textColor: Colors.black87,
                labelStyle: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
                hintStyle: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                ),
              ),

              // Error message
              if (formState.errorMessage != null) ...[
                const SizedBox(height: AppSpacing.md),
                Text(
                  formState.errorMessage!,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.error,
                  ),
                ),
              ],

              // User name field (shown after submission)
              if (formState.isSubmitted) ...[
                const SizedBox(height: AppSpacing.sectionGap),
                PezyTextField(
                  label: 'Driver Name',
                  hint: 'Driver Name',
                  controller: _NameTextController(formState.userName ?? ''),
                  enabled: false,
                  keyboardType: TextInputType.text,
                  variant: PezyTextFieldVariant.outlined,
                  borderRadius: 12,
                  labelColor: Colors.black54,
                  hintTextColor: Colors.grey.shade600,
                  textColor: Colors.black87,
                  labelStyle: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                  hintStyle: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],

              // Overdue warning
              if (formState.isSubmitted && formState.isOverdue) ...[
                const SizedBox(height: AppSpacing.sectionGap),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppColors.error,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.warning_rounded,
                        color: AppColors.error,
                        size: 24,
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Text(
                          'Warning: This driver has overdue fines',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.error,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // Submit button
              const SizedBox(height: AppSpacing.sectionGap),
              Align(
                alignment: Alignment.bottomRight,
                child: PezyButton(
                  onPressed: formState.isSubmitted
                      ? notifier.reset
                      : () => notifier.submitLicenseNo(),
                  label: formState.isSubmitted ? 'Reset' : 'Submit',
                  variant: PezyButtonVariant.outlined,
                  isLoading: formState.isLoading,
                  textStyle: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Simple text controller wrapper to manage state synchronization
class _LicenseTextController extends TextEditingController {
  _LicenseTextController(String initialValue) : super(text: initialValue);
}

/// Simple text controller wrapper for name field
class _NameTextController extends TextEditingController {
  _NameTextController(String initialValue) : super(text: initialValue);
}
