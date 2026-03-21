import 'package:flutter/material.dart';
import '../../../../core/theme/index.dart';
import '../../../../shared/widgets/index.dart';

/// Home screen - Fines
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF8FAFC),
      appBar: PezyAppBar(
        title: 'My Fines',
        showLogo: true,
        actions: [
          PezyAppBarAction(
            icon: Icons.search,
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Search pressed')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.screenPaddingHorizontal),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Stats cards
              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      title: 'Total Fines',
                      value: '₹5,400',
                      icon: Icons.receipt_long,
                      color: AppColors.error,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xl),
                  Expanded(
                    child: _buildStatCard(
                      title: 'Pending',
                      value: '2',
                      icon: Icons.pending_actions,
                      color: AppColors.warning,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sectionGap),

              // Recent fines
              Text(
                'Recent Fines',
                style: AppTextStyles.headlineSmall.copyWith(color: Colors.black87),
              ),
              const SizedBox(height: AppSpacing.xl),
              _buildFineItem(
                title: 'Speeding',
                amount: '₹1,000',
                date: 'Mar 20, 2026',
                status: 'Paid',
              ),
              const SizedBox(height: AppSpacing.xl),
              _buildFineItem(
                title: 'Traffic Signal',
                amount: '₹500',
                date: 'Mar 15, 2026',
                status: 'Pending',
              ),
              const SizedBox(height: AppSpacing.xl),
              _buildFineItem(
                title: 'Parking Violation',
                amount: '₹800',
                date: 'Mar 10, 2026',
                status: 'Paid',
              ),
              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: color.withValues(alpha: 0.15),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.08),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: AppSpacing.iconSizeLarge),
          const SizedBox(height: AppSpacing.lg),
          Text(value, style: AppTextStyles.headlineSmall.copyWith(color: color, fontWeight: FontWeight.w700, fontSize: 24)),
          const SizedBox(height: AppSpacing.sm),
          Text(
            title,
            style: AppTextStyles.bodySmall.copyWith(color: Color(0xFF64748B), fontSize: 13),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildFineItem({
    required String title,
    required String amount,
    required String date,
    required String status,
  }) {
    return Container(
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
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.accentRed.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              Icons.receipt_long,
              color: AppColors.accentRed,
              size: 24,
            ),
          ),
          const SizedBox(width: AppSpacing.lg),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.titleSmall.copyWith(color: Colors.black87, fontWeight: FontWeight.w600, fontSize: 15)),
                const SizedBox(height: AppSpacing.sm),
                Text(date, style: AppTextStyles.bodySmall.copyWith(color: Color(0xFF94A3B8), fontSize: 13)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(amount, style: AppTextStyles.titleSmall.copyWith(color: AppColors.error, fontWeight: FontWeight.w700, fontSize: 15)),
              const SizedBox(height: AppSpacing.sm),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: status == 'Paid'
                      ? AppColors.success.withValues(alpha: 0.1)
                      : AppColors.warning.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: status == 'Paid' ? AppColors.success : AppColors.warning,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
