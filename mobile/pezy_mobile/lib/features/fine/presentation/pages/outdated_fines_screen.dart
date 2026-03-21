import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../providers/outdated_fines_provider.dart';

/// Outdated Fines list screen
///
/// This screen displays a list of outdated fines with license number,
/// driver name, and amount due (in red).
class OutdatedFinesScreen extends ConsumerWidget {
  const OutdatedFinesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final finesState = ref.watch(outdatedFinesProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // PEZY logo
          Padding(
            padding: const EdgeInsets.only(
              top: AppSpacing.screenPaddingVertical,
              bottom: AppSpacing.lg,
            ),
            child: Center(
              child: Icon(
                Icons.security,
                size: 40,
                color: AppColors.primaryBlack,
              ),
            ),
          ),

          // Black OUTDATED FINES header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.screenPaddingHorizontal,
              vertical: 12,
            ),
            color: AppColors.primaryBlack,
            child: Text(
              'OUTDATED FINES',
              style: AppTextStyles.titleMedium.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                letterSpacing: 1.5,
                fontSize: 15,
              ),
            ),
          ),

          // Scrollable list of fines
          Expanded(
            child: finesState.isLoading
                ? const Center(
                    child: CircularProgressIndicator(),
                  )
                : finesState.fines.isEmpty
                    ? Center(
                        child: Text(
                          'No outdated fines',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.screenPaddingHorizontal,
                          vertical: AppSpacing.screenPaddingVertical,
                        ),
                        itemCount: finesState.fines.length,
                        itemBuilder: (context, index) {
                          final fine = finesState.fines[index];

                          return _FineCard(
                            licenseNo: fine.licenseNo,
                            driverName: fine.driverName,
                            amount: fine.amount,
                            onTap: () {
                              _showFineDetailModal(
                                context,
                                fine.licenseNo,
                                fine.driverName,
                                fine.amount,
                              );
                            },
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  /// Show fine details in a modal
  void _showFineDetailModal(
    BuildContext context,
    String licenseNo,
    String driverName,
    double amount,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _FineDetailModal(
        licenseNo: licenseNo,
        driverName: driverName,
        amount: amount,
      ),
    );
  }
}

/// Fine card widget showing license, driver name, and amount
class _FineCard extends StatelessWidget {
  final String licenseNo;
  final String driverName;
  final double amount;
  final VoidCallback onTap;

  const _FineCard({
    required this.licenseNo,
    required this.driverName,
    required this.amount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.lg),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.borderColor,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Left side: License and Driver Name
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // License number in red
                  Text(
                    licenseNo,
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: AppColors.error,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  // Driver name in black
                  Text(
                    driverName,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: Colors.black87,
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),

            // Right side: Amount in red
            Text(
              amount.toStringAsFixed(0),
              style: AppTextStyles.headlineSmall.copyWith(
                color: AppColors.error,
                fontWeight: FontWeight.w700,
                fontSize: 20,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Fine detail modal showing full information
class _FineDetailModal extends StatelessWidget {
  final String licenseNo;
  final String driverName;
  final double amount;

  const _FineDetailModal({
    required this.licenseNo,
    required this.driverName,
    required this.amount,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(24),
        ),
      ),
      child: Padding(
        padding: EdgeInsets.only(
          left: AppSpacing.screenPaddingHorizontal,
          right: AppSpacing.screenPaddingHorizontal,
          top: AppSpacing.xl,
          bottom: MediaQuery.of(context).viewInsets.bottom +
              AppSpacing.screenPaddingVertical,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Fine Details',
                  style: AppTextStyles.headlineSmall.copyWith(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.close,
                      size: 18,
                      color: Colors.grey[600],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),

            // License Number
            _DetailField(
              label: 'License Number',
              value: licenseNo,
              valueColor: AppColors.error,
            ),
            const SizedBox(height: AppSpacing.xl),

            // Driver Name
            _DetailField(
              label: 'Driver Name',
              value: driverName,
            ),
            const SizedBox(height: AppSpacing.xl),

            // Amount Due
            _DetailField(
              label: 'Amount Due',
              value: '₹${amount.toStringAsFixed(2)}',
              valueColor: AppColors.error,
            ),
            const SizedBox(height: AppSpacing.xxxl),
          ],
        ),
      ),
    );
  }
}

/// Detail field widget for displaying label and value
class _DetailField extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _DetailField({
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.bodySmall.copyWith(
            color: Colors.grey[600],
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          value,
          style: AppTextStyles.bodyLarge.copyWith(
            color: valueColor ?? Colors.black87,
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
      ],
    );
  }
}
