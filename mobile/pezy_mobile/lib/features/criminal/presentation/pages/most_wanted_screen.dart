import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../providers/most_wanted_provider.dart';
import 'criminal_profile_screen.dart';

/// Most Wanted criminals grid screen with modern design
///
/// This screen displays a 2-column grid of most wanted criminals with their
/// information for police officers to quickly identify high-priority targets.
class MostWantedScreen extends ConsumerStatefulWidget {
  const MostWantedScreen({super.key});

  @override
  ConsumerState<MostWantedScreen> createState() => _MostWantedScreenState();
}

class _MostWantedScreenState extends ConsumerState<MostWantedScreen>
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
    final criminalsState = ref.watch(mostWantedProvider);

    return Scaffold(
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: CustomScrollView(
          slivers: [
            // Modern gradient header
            SliverAppBar(
              expandedHeight: 180,
              pinned: true,
              elevation: 0,
              backgroundColor: Colors.transparent,
              leading: const SizedBox.shrink(),
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        AppColors.accentRed.withValues(alpha: 0.95),
                        AppColors.accentRed.withValues(alpha: 0.8),
                      ],
                    ),
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.screenPaddingHorizontal,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'MOST WANTED',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 28,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'High-Priority Criminals',
                                    style: TextStyle(
                                      color: Colors.white.withValues(alpha: 0.85),
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.25),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.warning_rounded,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      '${criminalsState.criminals.length}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w800,
                                        fontSize: 14,
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
                ),
              ),
              actions: [
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.15),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: IconButton(
                      onPressed: () {
                        ref.read(mostWantedProvider.notifier).refresh();
                      },
                      icon: Icon(
                        Icons.refresh,
                        color: AppColors.accentRed,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // Grid content
            SliverPadding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.screenPaddingHorizontal,
                vertical: 24,
              ),
              sliver: criminalsState.isLoading
                  ? SliverToBoxAdapter(
                      child: Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 60),
                          child: CircularProgressIndicator(
                            color: AppColors.accentRed,
                          ),
                        ),
                      ),
                    )
                  : criminalsState.criminals.isEmpty
                      ? SliverToBoxAdapter(
                          child: Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 60),
                              child: Column(
                                children: [
                                  Icon(
                                    Icons.check_circle,
                                    color: AppColors.success,
                                    size: 56,
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    'No Most Wanted Criminals',
                                    style: AppTextStyles.titleSmall.copyWith(
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'All clear!',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        )
                      : SliverGrid(
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 16,
                            childAspectRatio: 0.65,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final criminal = criminalsState.criminals[index];

                              return _CriminalCard(
                                criminal: criminal,
                                index: index,
                                onTap: () {
                                  debugPrint('\n🔵 CARD TAP DETECTED');
                                  debugPrint('Criminal: ${criminal.name}');
                                  debugPrint('Attempting to navigate...');

                                  try {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            CriminalProfileScreen(
                                          criminal: criminal,
                                        ),
                                      ),
                                    );
                                    debugPrint('✅ Navigation successful');
                                  } catch (e) {
                                    debugPrint('❌ Navigation error: $e');
                                  }
                                },
                              );
                            },
                            childCount: criminalsState.criminals.length,
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Criminal card widget with modern design and animations
class _CriminalCard extends StatefulWidget {
  final MostWantedCriminal criminal;
  final int index;
  final VoidCallback onTap;

  const _CriminalCard({
    required this.criminal,
    required this.index,
    required this.onTap,
  });

  @override
  State<_CriminalCard> createState() => _CriminalCardState();
}

class _CriminalCardState extends State<_CriminalCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.elasticOut),
    );
    Future.delayed(Duration(milliseconds: widget.index * 100), () {
      if (mounted) {
        _animationController.forward();
      }
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: GestureDetector(
        onTap: widget.onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: Stack(
              children: [
                // Main card with photo and info
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    color: Colors.white,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Photo section (70% of card)
                      Expanded(
                        flex: 7,
                        child: ClipRRect(
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(14),
                            topRight: Radius.circular(14),
                          ),
                          child: Container(
                            color: Colors.white12,
                            child: widget.criminal.photoPath != null && widget.criminal.photoPath!.isNotEmpty
                                ? Image.network(
                                    'http://localhost:8000${widget.criminal.photoPath}',
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Container(
                                        color: Colors.grey[200],
                                        child: Icon(
                                          Icons.person,
                                          color: Colors.grey[400],
                                          size: 56,
                                        ),
                                      );
                                    },
                                    loadingBuilder: (context, child, loadingProgress) {
                                      if (loadingProgress == null) return child;
                                      return Container(
                                        color: Colors.white12,
                                        child: Center(
                                          child: SizedBox(
                                            width: 40,
                                            height: 40,
                                            child: CircularProgressIndicator(
                                              value: loadingProgress.expectedTotalBytes != null
                                                  ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                                                  : null,
                                              strokeWidth: 2,
                                              valueColor: AlwaysStoppedAnimation<Color>(AppColors.accentRed),
                                            ),
                                          ),
                                        ),
                                      );
                                    },
                                  )
                                : Container(
                                    color: Colors.grey[200],
                                    child: Icon(
                                      Icons.person,
                                      color: Colors.grey[400],
                                      size: 56,
                                    ),
                                  ),
                          ),
                        ),
                      ),

                      // Info section (30% of card)
                      Expanded(
                        flex: 3,
                        child: Container(
                          color: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              // Name
                              Text(
                                widget.criminal.name,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.black87,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 6),

                              // Danger level badge
                              if (widget.criminal.dangerLevel != null && widget.criminal.dangerLevel!.isNotEmpty)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: _getDangerColor(widget.criminal.dangerLevel!).withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    widget.criminal.dangerLevel!.toUpperCase(),
                                    style: TextStyle(
                                      color: _getDangerColor(widget.criminal.dangerLevel!),
                                      fontSize: 9,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 0.4,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Wanted indicator badge - top right
                if (widget.criminal.isWanted)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.accentRed,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.accentRed.withValues(alpha: 0.4),
                            blurRadius: 6,
                          ),
                        ],
                      ),
                      child: const Text(
                        'WANTED',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

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
