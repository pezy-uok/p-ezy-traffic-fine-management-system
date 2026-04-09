import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../providers/outdated_fines_provider.dart';

/// Outdated Fines list screen
///
/// This screen displays a list of outdated fines with license number,
/// driver name, and amount due (in red).
class OutdatedFinesScreen extends ConsumerStatefulWidget {
  const OutdatedFinesScreen({super.key});

  @override
  ConsumerState<OutdatedFinesScreen> createState() => _OutdatedFinesScreenState();
}

class _OutdatedFinesScreenState extends ConsumerState<OutdatedFinesScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

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
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final finesState = ref.watch(outdatedFinesProvider);

    return FadeTransition(
      opacity: _fadeAnimation,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: CustomScrollView(
          slivers: [
            // Modern header with gradient
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.screenPaddingHorizontal,
                  vertical: AppSpacing.screenPaddingVertical,
                ),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.error.withValues(alpha: 0.9),
                      AppColors.error.withValues(alpha: 0.7),
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.error.withValues(alpha: 0.25),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.warning_rounded,
                            color: Colors.white,
                            size: 28,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'OUTDATED FINES',
                                style: AppTextStyles.titleMedium.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Pending overdue payments',
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Fines list
            if (finesState.isLoading)
              SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(
                    color: AppColors.accentRed,
                  ),
                ),
              )
            else if (finesState.fines.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.check_circle,
                        size: 64,
                        color: AppColors.success.withValues(alpha: 0.5),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      Text(
                        'No outdated fines',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        'All fines are up to date',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.screenPaddingHorizontal,
                  vertical: AppSpacing.screenPaddingVertical,
                ),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final fine = finesState.fines[index];

                      return Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.md),
                        child: _AnimatedFineCard(
                          licenseNo: fine.licenseNo,
                          driverName: fine.driverName,
                          amount: fine.amount,
                          index: index,
                          onTap: () {
                            _showFineDetailModal(
                              context,
                              fine.licenseNo,
                              fine.driverName,
                              fine.amount,
                            );
                          },
                        ),
                      );
                    },
                    childCount: finesState.fines.length,
                  ),
                ),
              ),
          ],
        ),
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

/// Fine card widget showing license, driver name, and amount with animation
class _AnimatedFineCard extends StatefulWidget {
  final String licenseNo;
  final String driverName;
  final double amount;
  final int index;
  final VoidCallback onTap;

  const _AnimatedFineCard({
    required this.licenseNo,
    required this.driverName,
    required this.amount,
    required this.index,
    required this.onTap,
  });

  @override
  State<_AnimatedFineCard> createState() => _AnimatedFineCardState();
}

class _AnimatedFineCardState extends State<_AnimatedFineCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _scaleController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.easeOut),
    );
    // Stagger animation based on index
    Future.delayed(Duration(milliseconds: 50 * widget.index), () {
      if (mounted) {
        _scaleController.forward();
      }
    });
  }

  @override
  void dispose() {
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: GestureDetector(
        onTap: widget.onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: AppColors.error.withValues(alpha: 0.2),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
              BoxShadow(
                color: AppColors.error.withValues(alpha: 0.1),
                blurRadius: 12,
                offset: const Offset(0, 4),
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
                    Row(
                      children: [
                        Icon(
                          Icons.warning_rounded,
                          size: 16,
                          color: AppColors.error,
                        ),
                        const SizedBox(width: 6),
                        // License number in red
                        Text(
                          widget.licenseNo,
                          style: AppTextStyles.bodyLarge.copyWith(
                            color: AppColors.error,
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    // Driver name in black
                    Text(
                      widget.driverName,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: Colors.black87,
                        fontWeight: FontWeight.w500,
                        fontSize: 14,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              // Right side: Amount in red
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '₹${widget.amount.toStringAsFixed(0)}',
                  style: AppTextStyles.headlineSmall.copyWith(
                    color: AppColors.error,
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
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
