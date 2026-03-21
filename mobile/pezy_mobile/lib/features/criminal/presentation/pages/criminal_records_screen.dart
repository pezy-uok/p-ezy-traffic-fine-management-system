import 'package:flutter/material.dart';
import '../../../../core/theme/index.dart';
import '../../../../shared/widgets/index.dart';

/// Criminal Records screen
class CriminalRecordsScreen extends StatelessWidget {
  const CriminalRecordsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF8FAFC),
      appBar: PezyAppBar(
        title: 'Criminal Records',
        showLogo: true,
        actions: [
          PezyAppBarAction(
            icon: Icons.filter_list,
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Filter pressed')),
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
              // Summary
              Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: AppColors.success.withValues(alpha: 0.2),
                    width: 2,
                  ),
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
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Status', style: AppTextStyles.titleSmall.copyWith(color: Colors.black87, fontSize: 15)),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.success.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Clean',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.success,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Text(
                      'No active criminal records found in your profile.',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textMuted,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // Information
              Text(
                'About Criminal Records',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              _buildInfoCard(
                title: 'What is included?',
                content:
                    'Criminal records include any offenses, violations, and pending cases.',
              ),
              const SizedBox(height: AppSpacing.md),
              _buildInfoCard(
                title: 'When is it updated?',
                content:
                    'Records are updated in real-time when new cases are filed or resolved.',
              ),
              const SizedBox(height: AppSpacing.md),
              _buildInfoCard(
                title: 'How to appeal?',
                content:
                    'You can appeal any record through the app or contact support directly.',
              ),
              const SizedBox(height: AppSpacing.xl),

              // Documents section
              Text(
                'Related Documents',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              _buildDocumentCard(
                title: 'Clearance Certificate',
                type: 'PDF',
                date: 'Mar 20, 2026',
              ),
              const SizedBox(height: AppSpacing.md),
              _buildDocumentCard(
                title: 'Records Verification',
                type: 'PDF',
                date: 'Mar 15, 2026',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required String title,
    required String content,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.backgroundDarkerNavy,
        borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppTextStyles.titleSmall),
          const SizedBox(height: AppSpacing.sm),
          Text(
            content,
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentCard({
    required String title,
    required String type,
    required String date,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.backgroundDarkerNavy,
        borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: AppColors.accentAmber.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(AppSpacing.cornerRadius / 2),
            ),
            child: Icon(
              Icons.description,
              color: AppColors.accentAmber,
              size: AppSpacing.iconSizeMedium,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.titleSmall),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  '$type • $date',
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          Icon(
            Icons.download_rounded,
            color: AppColors.accentAmber,
            size: AppSpacing.iconSizeMedium,
          ),
        ],
      ),
    );
  }
}
