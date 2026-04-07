import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../providers/most_wanted_provider.dart';

/// Most Wanted criminals grid screen
///
/// This screen displays a 2-column grid of most wanted criminals with their
/// information for police officers to quickly identify high-priority targets.
class MostWantedScreen extends ConsumerWidget {
  const MostWantedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final criminalsState = ref.watch(mostWantedProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // PEZY logo and header
          Padding(
            padding: const EdgeInsets.only(
              top: AppSpacing.screenPaddingVertical,
              bottom: AppSpacing.lg,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Center(
                    child: Icon(
                      Icons.security,
                      size: 40,
                      color: AppColors.primaryBlack,
                    ),
                  ),
                ),
                // Refresh button
                Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.lg),
                  child: IconButton(
                    onPressed: () {
                      ref.read(mostWantedProvider.notifier).refresh();
                    },
                    icon: const Icon(Icons.refresh),
                    color: AppColors.accentRed,
                  ),
                ),
              ],
            ),
          ),

          // Red MOST WANTED header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.screenPaddingHorizontal,
              vertical: 12,
            ),
            color: AppColors.accentRed,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'MOST WANTED',
                  style: AppTextStyles.titleMedium.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 2,
                    fontSize: 16,
                  ),
                ),
                // Wanted count badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    criminalsState.criminals.length.toString(),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 2-column grid of criminals
          Expanded(
            child: criminalsState.isLoading
                ? const Center(
                    child: CircularProgressIndicator(),
                  )
                : criminalsState.criminals.isEmpty
                    ? Center(
                        child: Text(
                          'No most wanted criminals',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.screenPaddingHorizontal,
                          vertical: AppSpacing.screenPaddingVertical,
                        ),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: AppSpacing.lg,
                          mainAxisSpacing: AppSpacing.xl,
                          childAspectRatio: 0.85,
                        ),
                        itemCount: criminalsState.criminals.length,
                        itemBuilder: (context, index) {
                          final criminal = criminalsState.criminals[index];

                          return _CriminalCard(
                            criminal: criminal,
                            onTap: () {
                              // Navigate to criminal profile
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('${criminal.name} details'),
                                  duration: const Duration(seconds: 2),
                                ),
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
}

/// Criminal card widget with avatar and name
class _CriminalCard extends StatelessWidget {
  final MostWantedCriminal criminal;
  final VoidCallback onTap;

  const _CriminalCard({
    required this.criminal,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.accentRed.withValues(alpha: 0.3),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Circular avatar with initials
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.accentRed.withValues(alpha: 0.15),
                border: Border.all(
                  color: AppColors.accentRed,
                  width: 2,
                ),
              ),
              child: Center(
                child: Icon(
                  Icons.person,
                  color: AppColors.accentRed,
                  size: 48,
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Criminal name
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
              ),
              child: Text(
                criminal.name,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: AppTextStyles.bodySmall.copyWith(
                  color: Colors.black87,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  height: 1.3,
                ),
              ),
            ),

            const SizedBox(height: AppSpacing.sm),

            // Criminal ID if available
            if (criminal.identificationNumber != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                child: Text(
                  'ID: ${criminal.identificationNumber}',
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: Colors.grey[600],
                    fontSize: 10,
                  ),
                ),
              ),

            // Danger level badge if available
            if (criminal.dangerLevel != null && criminal.dangerLevel!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(
                  top: AppSpacing.sm,
                  left: AppSpacing.sm,
                  right: AppSpacing.sm,
                ),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: _getDangerColor(criminal.dangerLevel!).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '⚠️ ${criminal.dangerLevel}',
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: _getDangerColor(criminal.dangerLevel!),
                      fontSize: 9,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  /// Get color based on danger level
  Color _getDangerColor(String dangerLevel) {
    switch (dangerLevel.toLowerCase()) {
      case 'critical':
      case 'high':
        return AppColors.error;
      case 'medium':
        return Colors.orange;
      case 'low':
        return AppColors.success;
      default:
        return AppColors.textSecondary;
    }
  }
}
