import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../../../../core/navigation/navigation_tab.dart';
import '../../../../core/providers/navigation_providers.dart';
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

    // Handle success - show toast and navigate
    ref.listen(newFineProvider, (previous, next) {
      if (next.isSuccess && (previous?.isSuccess ?? false) == false) {
        // Show success toast
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Fine submitted successfully!',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 3),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.all(16),
          ),
        );

        // Ensure form resets after 2.5 seconds and navigate to home
        Future.delayed(const Duration(milliseconds: 2500), () {
          // Navigate to home tab (form reset happens automatically in provider)
          ref.read(navigationProvider.notifier).state = NavigationTab.home;
        });
      }
    });

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
                  color: AppColors.primaryBlack,
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
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.md),
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
                        Icons.error_outline,
                        color: AppColors.error,
                        size: 20,
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Text(
                          formState.errorMessage!,
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

              // Fine details form (shown if driver found and not overdue)
              if (formState.isSubmitted && !formState.isOverdue) ...[
                const SizedBox(height: AppSpacing.sectionGap),
                // Date field
                PezyTextField(
                  label: 'Date',
                  hint: 'DD / MM / YYYY',
                  controller: _DateTextController(formState.date),
                  onChanged: (value) {
                    notifier.setDate(value);
                  },
                  enabled: true,
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
                const SizedBox(height: AppSpacing.lg),

                // Fine Type dropdown
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: DropdownButton<String>(
                    isExpanded: true,
                    underline: const SizedBox(),
                    hint: Text(
                      'Select Fine Type',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    value: formState.fineType.isEmpty ? null : formState.fineType,
                    onChanged: (String? newValue) {
                      if (newValue != null) {
                        notifier.setFineType(newValue);
                      }
                    },
                    items: <String>[
                      'Speeding',
                      'Traffic Signal',
                      'Parking Violation',
                      'Lane Change',
                      'No Helmet',
                      'Rash Driving',
                      'Other',
                    ].map<DropdownMenuItem<String>>((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(
                          value,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.black87,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),

                // Reason field
                PezyTextField(
                  label: 'Reason',
                  hint: 'Enter reason for fine',
                  controller: _ReasonTextController(formState.reason),
                  onChanged: (value) {
                    notifier.setReason(value);
                  },
                  enabled: true,
                  keyboardType: TextInputType.text,
                  variant: PezyTextFieldVariant.outlined,
                  borderRadius: 12,
                  maxLines: 3,
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
                const SizedBox(height: AppSpacing.lg),

                // Amount field
                PezyTextField(
                  label: 'Amount',
                  hint: 'Amount',
                  controller: _AmountTextController(formState.amount),
                  onChanged: (value) {
                    notifier.setAmount(value);
                  },
                  enabled: true,
                  keyboardType: TextInputType.number,
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
                const SizedBox(height: AppSpacing.lg),

                // Re-enter Amount field
                PezyTextField(
                  label: 'Re-enter Amount',
                  hint: 'Re-enter Amount',
                  controller: _AmountConfirmTextController(formState.amountConfirm),
                  onChanged: (value) {
                    notifier.setAmountConfirm(value);
                  },
                  enabled: true,
                  keyboardType: TextInputType.number,
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
                const SizedBox(height: AppSpacing.lg),

                // Extra Amount field (optional)
                PezyTextField(
                  label: 'Extra Amount (Optional)',
                  hint: 'Extra Amount',
                  controller: _ExtraAmountTextController(formState.extraAmount),
                  onChanged: (value) {
                    notifier.setExtraAmount(value);
                  },
                  enabled: true,
                  keyboardType: TextInputType.number,
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

              // Amount mismatch error
              if (formState.isSubmitted &&
                  !formState.isOverdue &&
                  formState.amount.isNotEmpty &&
                  formState.amountConfirm.isNotEmpty &&
                  !formState.amountsMatch) ...[
                const SizedBox(height: AppSpacing.md),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.md),
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
                        Icons.error_outline,
                        color: AppColors.error,
                        size: 20,
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Text(
                          'Amounts do not match',
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
                  onPressed: (formState.isLoading ||
                          (!formState.isSubmitted
                              ? false
                              : formState.isOverdue ||
                                  !formState.isFormValid))
                      ? null
                      : () {
                          if (!formState.isSubmitted) {
                            // First step: submit license number
                            notifier.submitLicenseNo();
                          } else if (!formState.isOverdue) {
                            // Second step: submit fine details
                            notifier.submitFine();
                          }
                        },
                  label: !formState.isSubmitted
                      ? 'Submit'
                      : !formState.isOverdue
                          ? 'Submit'
                          : 'Back',
                  variant: PezyButtonVariant.outlined,
                  isLoading: formState.isLoading,
                  isDisabled: formState.isSubmitted &&
                      !formState.isOverdue &&
                      !formState.isFormValid,
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

/// Simple text controller wrapper for date field
class _DateTextController extends TextEditingController {
  _DateTextController(String initialValue) : super(text: initialValue);
}

/// Simple text controller wrapper for amount field
class _AmountTextController extends TextEditingController {
  _AmountTextController(String initialValue) : super(text: initialValue);
}

/// Simple text controller wrapper for amount confirmation field
class _AmountConfirmTextController extends TextEditingController {
  _AmountConfirmTextController(String initialValue) : super(text: initialValue);
}

/// Simple text controller wrapper for reason field
class _ReasonTextController extends TextEditingController {
  _ReasonTextController(String initialValue) : super(text: initialValue);
}

/// Simple text controller wrapper for extra amount field
class _ExtraAmountTextController extends TextEditingController {
  _ExtraAmountTextController(String initialValue) : super(text: initialValue);
}
