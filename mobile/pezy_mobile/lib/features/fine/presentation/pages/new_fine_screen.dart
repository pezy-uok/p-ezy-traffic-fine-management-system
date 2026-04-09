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
class NewFineScreen extends ConsumerStatefulWidget {
  const NewFineScreen({super.key});

  @override
  ConsumerState<NewFineScreen> createState() => _NewFineScreenState();
}

class _NewFineScreenState extends ConsumerState<NewFineScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  
  // Preserve controllers across rebuilds
  late TextEditingController _licenseController;
  late TextEditingController _nameController;
  late TextEditingController _reasonController;
  late TextEditingController _amountController;
  late TextEditingController _amountConfirmController;
  late TextEditingController _extraAmountController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _animationController.forward();
    
    // Initialize controllers
    _licenseController = TextEditingController();
    _nameController = TextEditingController();
    _reasonController = TextEditingController();
    _amountController = TextEditingController();
    _amountConfirmController = TextEditingController();
    _extraAmountController = TextEditingController();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _licenseController.dispose();
    _nameController.dispose();
    _reasonController.dispose();
    _amountController.dispose();
    _amountConfirmController.dispose();
    _extraAmountController.dispose();
    super.dispose();
  }
  
  /// Sync controllers with state whenever state changes
  void _syncControllers(NewFineFormState formState) {
    _licenseController.text = formState.licenseNo;
    _nameController.text = formState.userName ?? '';
    _reasonController.text = formState.reason;
    _amountController.text = formState.amount;
    _amountConfirmController.text = formState.amountConfirm;
    _extraAmountController.text = formState.extraAmount;
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(newFineProvider);
    final notifier = ref.read(newFineProvider.notifier);
    
    // Sync controllers with state
    _syncControllers(formState);

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
            backgroundColor: AppColors.success,
            duration: const Duration(seconds: 3),
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.all(16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );

        // Ensure form resets after 2.5 seconds and navigate to home
        Future.delayed(const Duration(milliseconds: 2500), () {
          // Navigate to home tab (form reset happens automatically in provider)
          ref.read(navigationProvider.notifier).state = NavigationTab.home;
        });
      }
    });

    return FadeTransition(
      opacity: _fadeAnimation,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        bottomNavigationBar: formState.isSubmitted
            ? Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 6,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // Back button
                    Expanded(
                      child: PezyButton(
                        label: 'Back',
                        variant: PezyButtonVariant.outlined,
                        onPressed: () {
                          if (formState.isSubmitted) {
                            // Go back to license input step (keep lookup data)
                            notifier.goBackToLicenseStep();
                          }
                        },
                        textStyle: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    // Submit/Send button
                    Expanded(
                      child: PezyButton(
                        label: !formState.isOverdue ? 'Send' : 'Close',
                        variant: PezyButtonVariant.filled,
                        backgroundColor: AppColors.accentRed,
                        textColor: Colors.white,
                        isLoading: formState.isLoading,
                        isDisabled: formState.isLoading ||
                            (formState.isOverdue || !formState.isFormValid),
                        onPressed: (formState.isLoading ||
                                (formState.isOverdue ||
                                    !formState.isFormValid))
                            ? null
                            : () {
                                if (!formState.isOverdue) {
                                  // Submit fine details
                                  notifier.submitFine();
                                } else {
                                  // Close on overdue
                                  notifier.reset();
                                }
                              },
                        textStyle: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              )
            : null,
        body: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.screenPaddingHorizontal,
              vertical: AppSpacing.screenPaddingVertical,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Modern header with gradient
                Center(
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          AppColors.accentRed.withValues(alpha: 0.9),
                          AppColors.accentRed.withValues(alpha: 0.7),
                        ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.accentRed.withValues(alpha: 0.25),
                          blurRadius: 15,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            Icons.receipt,
                            size: 32,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'NEW FINE',
                          textAlign: TextAlign.center,
                          style: AppTextStyles.titleMedium.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.5,
                            fontSize: 18,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.xl),

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
                  controller: _licenseController,
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
                      color: AppColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.error.withValues(alpha: 0.3),
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

                // Submit button for license input (only shown before submission)
                if (!formState.isSubmitted) ...[
                  const SizedBox(height: AppSpacing.lg),
                  SizedBox(
                    width: double.infinity,
                    child: PezyButton(
                      label: 'Submit',
                      variant: PezyButtonVariant.filled,
                      backgroundColor: AppColors.accentRed,
                      textColor: Colors.white,
                      isLoading: formState.isLoading,
                      isDisabled: formState.licenseNo.isEmpty || formState.isLoading,
                      onPressed: formState.licenseNo.isEmpty || formState.isLoading
                          ? null
                          : () {
                              notifier.submitLicenseNo();
                            },
                      textStyle: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],

                // User name field (shown after submission)
                if (formState.isSubmitted) ...[
                  const SizedBox(height: AppSpacing.sectionGap),
                  PezyTextField(
                    label: 'Driver Name',
                    hint: 'Driver Name',
                    controller: _nameController,
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
                  // Modern form card wrapper
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.06),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        // Date picker field
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Date',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                                color: Colors.black54,
                              ),
                            ),
                            const SizedBox(height: 8),
                            GestureDetector(
                              onTap: () async {
                                // Parse current date or use today
                                DateTime initialDate = DateTime.now();
                                if (formState.date.isNotEmpty) {
                                  try {
                                    final parts = formState.date.split('/');
                                    if (parts.length == 3) {
                                      initialDate = DateTime(
                                        int.parse(parts[2]),
                                        int.parse(parts[1]),
                                        int.parse(parts[0]),
                                      );
                                    }
                                  } catch (e) {
                                    initialDate = DateTime.now();
                                  }
                                }

                                final selectedDate = await showDatePicker(
                                  context: context,
                                  initialDate: initialDate,
                                  firstDate: DateTime(1900),
                                  lastDate: DateTime.now(),
                                  builder: (BuildContext context, Widget? child) {
                                    return Theme(
                                      data: Theme.of(context).copyWith(
                                        colorScheme: ColorScheme.light(
                                          primary: AppColors.accentRed,
                                          onPrimary: Colors.white,
                                          surface: Colors.white,
                                          onSurface: Colors.black87,
                                        ),
                                      ),
                                      child: child!,
                                    );
                                  },
                                );

                                if (selectedDate != null) {
                                  final formattedDate =
                                      '${selectedDate.day.toString().padLeft(2, '0')}/${selectedDate.month.toString().padLeft(2, '0')}/${selectedDate.year}';
                                  notifier.setDate(formattedDate);
                                }
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.md,
                                  vertical: 12,
                                ),
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: Colors.grey.shade300,
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      formState.date.isEmpty
                                          ? 'Select a date'
                                          : formState.date,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: formState.date.isEmpty
                                            ? Colors.grey.shade600
                                            : Colors.black87,
                                        fontWeight: formState.date.isEmpty
                                            ? FontWeight.w400
                                            : FontWeight.w500,
                                      ),
                                    ),
                                    Icon(
                                      Icons.calendar_today,
                                      color: AppColors.accentRed,
                                      size: 20,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
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
                                color: const Color.fromARGB(255, 103, 103, 103),
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
                                    color: Color.fromARGB(221, 0, 0, 0),
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
                          controller: _reasonController,
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
                          controller: _amountController,
                          onChanged: (value) {
                            notifier.setAmount(value);
                          },
                          enabled: true,
                          keyboardType: TextInputType.number,
                          inputFormatter: (value) {
                            // Only allow digits and single decimal point
                            return value.replaceAll(RegExp(r'[^0-9.]'), '');
                          },
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
                          controller: _amountConfirmController,
                          onChanged: (value) {
                            notifier.setAmountConfirm(value);
                          },
                          enabled: true,
                          keyboardType: TextInputType.number,
                          inputFormatter: (value) {
                            // Only allow digits and single decimal point
                            return value.replaceAll(RegExp(r'[^0-9.]'), '');
                          },
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
                          controller: _extraAmountController,
                          onChanged: (value) {
                            notifier.setExtraAmount(value);
                          },
                          enabled: true,
                          keyboardType: TextInputType.number,
                          inputFormatter: (value) {
                            // Only allow digits and single decimal point
                            return value.replaceAll(RegExp(r'[^0-9.]'), '');
                          },
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
                      color: AppColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.error.withValues(alpha: 0.3),
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
                      color: AppColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.error.withValues(alpha: 0.3),
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

                const SizedBox(height: AppSpacing.lg),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
