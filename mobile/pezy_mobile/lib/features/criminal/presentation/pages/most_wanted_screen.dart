import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../providers/most_wanted_provider.dart';
import 'criminal_profile_screen.dart';

/// Most Wanted criminals grid screen
///
/// This screen displays a 2-column grid of most wanted criminals with their
/// avatars and names for police officers to quickly identify high-priority targets.
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

          // Red MOST WANTED header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.screenPaddingHorizontal,
              vertical: 12,
            ),
            color: AppColors.accentRed,
            child: Text(
              'MOST WANTED',
              style: AppTextStyles.titleMedium.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                letterSpacing: 2,
                fontSize: 16,
              ),
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
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      CriminalProfileScreen(criminal: criminal),
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
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Circular avatar
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.grey[300],
                border: Border.all(
                  color: Colors.grey[400]!,
                  width: 2,
                ),
              ),
              child: ClipOval(
                child: Image.network(
                  criminal.avatarUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    // Fallback to avatar icon with dark background
                    return Container(
                      color: Colors.grey[700],
                      child: Icon(
                        Icons.person,
                        color: Colors.white,
                        size: 48,
                      ),
                    );
                  },
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
          ],
        ),
      ),
    );
  }
}
