import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../providers/most_wanted_provider.dart';

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
      backgroundColor: const Color(0xFFF8FAFC),
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
                color: AppColors.primaryBlue,
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
            color: const Color(0xFFB91C1C), // Red color matching design
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
                            name: criminal.name,
                            avatarUrl: criminal.avatarUrl,
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
  final String name;
  final String avatarUrl;

  const _CriminalCard({
    required this.name,
    required this.avatarUrl,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
        border: Border.all(
          color: Colors.grey[200]!,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 2,
            offset: const Offset(0, 1),
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
                avatarUrl,
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
              name,
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
    );
  }
}
