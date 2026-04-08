import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../../../../shared/widgets/index.dart';
import '../providers/criminal_list_controller.dart';
import '../providers/most_wanted_provider.dart';
import 'criminal_profile_screen.dart';

/// Criminal Records screen - Lists all criminals in the database
class CriminalRecordsScreen extends ConsumerStatefulWidget {
  const CriminalRecordsScreen({super.key});

  @override
  ConsumerState<CriminalRecordsScreen> createState() => _CriminalRecordsScreenState();
}

class _CriminalRecordsScreenState extends ConsumerState<CriminalRecordsScreen>
    with SingleTickerProviderStateMixin {
  late ScrollController _scrollController;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _animationController.forward();
    
    debugPrint('\n╔════════════════════════════════════════╗');
    debugPrint('║  CRIMINAL RECORDS SCREEN: initState    ║');
    debugPrint('╠════════════════════════════════════════╣');
    debugPrint('║ Scheduling fetchCriminals() call...');
    
    // Fetch criminals on first load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      debugPrint('║ ✅ Post frame callback triggered');
      debugPrint('║ Calling ref.read(criminalListProvider.notifier).fetchCriminals()');
      ref.read(criminalListProvider.notifier).fetchCriminals();
    });
    
    debugPrint('╚════════════════════════════════════════╝\n');
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  /// Handle scroll to load more criminals (pagination)
  void _onScroll() {
    if (_scrollController.position.pixels == _scrollController.position.maxScrollExtent) {
      ref.read(criminalListProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final criminalListState = ref.watch(criminalListProvider);
    final wantedCount = ref.watch(wantedCriminalsCountProvider);
    final isLoading = criminalListState.isLoading;
    final error = criminalListState.error;
    final criminals = criminalListState.criminals;

    return FadeTransition(
      opacity: _fadeAnimation,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: PezyAppBar(
          title: 'Criminal Records',
          showLogo: true,
          actions: [
            PezyAppBarAction(
              icon: Icons.refresh,
              onPressed: () {
                ref.read(criminalListProvider.notifier).refreshCriminals();
              },
            ),
          ],
        ),
        body: isLoading && criminals.isEmpty
            ? _buildLoadingState()
            : error != null && criminals.isEmpty
                ? _buildErrorState(error)
                : _buildCriminalsList(
                    criminals: criminals,
                    totalCount: criminalListState.total,
                    wantedCount: wantedCount,
                    isLoadingMore: criminalListState.isLoadingMore,
                  ),
      ),
    );
  }

  /// Loading state UI
  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            color: AppColors.accentRed,
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Loading criminals...',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  /// Error state UI
  Widget _buildErrorState(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 48,
            color: AppColors.error,
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Failed to load criminals',
            style: AppTextStyles.titleSmall,
          ),
          const SizedBox(height: AppSpacing.sm),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPaddingHorizontal),
            child: Text(
              error,
              textAlign: TextAlign.center,
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          ElevatedButton(
            onPressed: () {
              ref.read(criminalListProvider.notifier).refreshCriminals();
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  /// Build criminals list
  Widget _buildCriminalsList({
    required List<dynamic> criminals,
    required int totalCount,
    required int wantedCount,
    required bool isLoadingMore,
  }) {
    return CustomScrollView(
      controller: _scrollController,
      slivers: [
        // Modern header with stats
        SliverToBoxAdapter(
          child: Container(
            margin: const EdgeInsets.all(AppSpacing.screenPaddingHorizontal),
            padding: const EdgeInsets.all(AppSpacing.lg),
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Total Records',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: Colors.white70,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            totalCount.toString(),
                            style: AppTextStyles.titleSmall.copyWith(
                              color: Colors.white,
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.people,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  height: 1,
                  color: Colors.white.withValues(alpha: 0.2),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Wanted',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: Colors.white70,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            wantedCount.toString(),
                            style: AppTextStyles.titleSmall.copyWith(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.warning_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        if (criminals.isEmpty)
          SliverFillRemaining(
            child: Center(
              child: Text(
                'No criminals found',
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              ),
            ),
          )
        else ...[
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.7, // Make cards taller to show photos
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  // Show loading indicator at end if loading more
                  if (index == criminals.length) {
                    return Center(
                      child: CircularProgressIndicator(
                        color: AppColors.accentRed,
                      ),
                    );
                  }

                  final criminal = criminals[index];
                  return _CriminalGridCard(
                    criminal: criminal,
                    index: index,
                    onTap: () {
                      final mostWantedCriminal = MostWantedCriminal.fromCriminal(criminal);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => CriminalProfileScreen(
                            criminal: mostWantedCriminal,
                          ),
                        ),
                      );
                    },
                    getDangerColor: _getDangerColor,
                  );
                },
                childCount: criminals.length + (isLoadingMore ? 1 : 0),
              ),
            ),
          ),
        ],
      ],
    );
  }

  /// Get danger level color
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

/// Simple grid card for criminals
class _CriminalGridCard extends StatelessWidget {
  final MostWantedCriminal criminal;
  final int index;
  final VoidCallback onTap;
  final Color Function(String) getDangerColor;

  const _CriminalGridCard({
    required this.criminal,
    required this.index,
    required this.onTap,
    required this.getDangerColor,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 6,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Photo section (main focal point)
            Expanded(
              flex: 3,
              child: ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
                child: Container(
                  color: Colors.white10,
                  child: criminal.photoPath != null && criminal.photoPath!.isNotEmpty
                      ? Image.network(
                          'http://localhost:8000${criminal.photoPath}',
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            print('Image load error: $error');
                            return Container(
                              color: Colors.white12,
                              child: Icon(
                                Icons.person,
                                color: Colors.grey[400],
                                size: 60,
                              ),
                            );
                          },
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Container(
                              color: Colors.white10,
                              child: Center(
                                child: SizedBox(
                                  width: 40,
                                  height: 40,
                                  child: CircularProgressIndicator(
                                    value: loadingProgress.expectedTotalBytes != null
                                        ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                                        : null,
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.error),
                                  ),
                                ),
                              ),
                            );
                          },
                        )
                      : Container(
                          color: Colors.white10,
                          child: Icon(
                            Icons.person,
                            color: Colors.grey[400],
                            size: 60,
                          ),
                        ),
                ),
              ),
            ),
            // Info section
            Expanded(
              flex: 2,
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Name
                    Text(
                      criminal.name,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    // ID
                    if (criminal.identificationNumber != null)
                      Text(
                        criminal.identificationNumber!,
                        style: const TextStyle(
                          fontSize: 10,
                          color: Colors.grey,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const Spacer(),
                    // Badges
                    Wrap(
                      spacing: 4,
                      runSpacing: 4,
                      children: [
                        if (criminal.isWanted)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.error,
                              borderRadius: BorderRadius.circular(3),
                            ),
                            child: const Text(
                              'WANTED',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        if (criminal.dangerLevel != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                            decoration: BoxDecoration(
                              color: getDangerColor(criminal.dangerLevel!),
                              borderRadius: BorderRadius.circular(3),
                            ),
                            child: Text(
                              criminal.dangerLevel!.toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
  final dynamic criminal;
  final int index;
  final VoidCallback onTap;
  final Color Function(String) getStatusColor;
  final Color Function(String) getDangerColor;

  const _AnimatedCriminalCard({
    required this.criminal,
    required this.index,
    required this.onTap,
    required this.getStatusColor,
    required this.getDangerColor,
  });

  @override
  State<_AnimatedCriminalCard> createState() => _AnimatedCriminalCardState();
}

class _AnimatedCriminalCardState extends State<_AnimatedCriminalCard>
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
          height: 240, // Explicit height for card
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
              if (widget.criminal.wanted)
                BoxShadow(
                  color: AppColors.error.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
            ],
          ),
          child: Stack(
            fit: StackFit.expand, // Make stack take full container size
            children: [
              // Photo background (main focal point)
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  color: Colors.grey[300],
                  child: widget.criminal.photoPath != null && widget.criminal.photoPath!.isNotEmpty
                      ? Image.network(
                          'http://localhost:8000${widget.criminal.photoPath}',
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: Colors.grey[400],
                              child: Center(
                                child: Icon(
                                  Icons.person,
                                  color: Colors.grey[600],
                                  size: 80,
                                ),
                              ),
                            );
                          },
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Container(
                              color: Colors.grey[300],
                              child: Center(
                                child: CircularProgressIndicator(
                                  value: loadingProgress.expectedTotalBytes != null
                                      ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                                      : null,
                                  strokeWidth: 3,
                                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.error),
                                ),
                              ),
                            );
                          },
                        )
                      : Container(
                          color: Colors.grey[400],
                          child: Center(
                            child: Icon(
                              Icons.person,
                              color: Colors.grey[600],
                              size: 80,
                            ),
                          ),
                        ),
                ),
              ),

              // Gradient overlay at bottom for text readability
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  height: 140,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.7),
                      ],
                    ),
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(16),
                      bottomRight: Radius.circular(16),
                    ),
                  ),
                ),
              ),

              // Info overlay at bottom
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Name
                      Text(
                        widget.criminal.fullName,
                        style: AppTextStyles.titleSmall.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      // ID
                      if (widget.criminal.identificationNumber != null)
                        Text(
                          'ID: ${widget.criminal.identificationNumber}',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: Colors.white70,
                            fontSize: 11,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      const SizedBox(height: 8),
                      // Badges row
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (widget.criminal.wanted)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.error,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.warning, size: 12, color: Colors.white),
                                  const SizedBox(width: 3),
                                  Text(
                                    'WANTED',
                                    style: AppTextStyles.labelSmall.copyWith(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          const SizedBox(width: 6),
                          if (widget.criminal.dangerLevel != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: widget.getDangerColor(widget.criminal.dangerLevel!),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                widget.criminal.dangerLevel!.toUpperCase(),
                                style: AppTextStyles.labelSmall.copyWith(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Wanted red badge in top right corner
              if (widget.criminal.wanted)
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.error,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.3),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.warning,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: widget.getStatusColor(widget.criminal.status).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            widget.criminal.status.substring(0, 1).toUpperCase() +
                                widget.criminal.status.substring(1),
                            style: AppTextStyles.labelSmall.copyWith(
                              color: widget.getStatusColor(widget.criminal.status),
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),

              // Info row: Gender, DOB, Arrest count
              Row(
                children: [
                  if (widget.criminal.gender != null) ...[
                    Expanded(
                      child: _buildInfoChip(
                        icon: Icons.person,
                        label: widget.criminal.gender,
                      ),
                    ),
                  ],
                  if (widget.criminal.arrestCount > 0) ...[
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: _buildInfoChip(
                        icon: Icons.gavel,
                        label: 'Arrests: ${widget.criminal.arrestCount}',
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: AppSpacing.md),

              // Wanted and Danger level badges
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: [
                  if (widget.criminal.wanted)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.error.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: AppColors.error.withValues(alpha: 0.3),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.warning,
                            size: 14,
                            color: AppColors.error,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'WANTED',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.error,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  if (widget.criminal.dangerLevel != null &&
                      widget.criminal.dangerLevel!.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: widget.getDangerColor(widget.criminal.dangerLevel!)
                            .withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: widget.getDangerColor(widget.criminal.dangerLevel!)
                              .withValues(alpha: 0.3),
                          width: 1,
                        ),
                      ),
                      child: Text(
                        'Danger: ${widget.criminal.dangerLevel}',
                        style: AppTextStyles.labelSmall.copyWith(
                          color: widget.getDangerColor(widget.criminal.dangerLevel!),
                          fontSize: 10,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Build info chip for criminal details
  Widget _buildInfoChip({
    required IconData icon,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.lightGray,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.textSecondary),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              label,
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.textSecondary,
                fontSize: 11,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
