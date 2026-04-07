import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../../../../shared/widgets/index.dart';
import '../providers/criminal_list_controller.dart';

/// Criminal Records screen - Lists all criminals in the database
class CriminalRecordsScreen extends ConsumerStatefulWidget {
  const CriminalRecordsScreen({super.key});

  @override
  ConsumerState<CriminalRecordsScreen> createState() => _CriminalRecordsScreenState();
}

class _CriminalRecordsScreenState extends ConsumerState<CriminalRecordsScreen> {
  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
    
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

    return Scaffold(
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
    return Column(
      children: [
        // Summary stats
        Container(
          margin: const EdgeInsets.all(AppSpacing.screenPaddingHorizontal),
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: AppColors.accentRed.withValues(alpha: 0.2),
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total Records',
                    style: AppTextStyles.titleSmall.copyWith(color: Colors.black87, fontSize: 15),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.accentRed.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      totalCount.toString(),
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.accentRed,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Wanted Criminals',
                    style: AppTextStyles.titleSmall.copyWith(color: Colors.black87, fontSize: 15),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      wantedCount.toString(),
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.error,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),

        // Criminals list
        if (criminals.isEmpty)
          Expanded(
            child: Center(
              child: Text(
                'No criminals found',
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              ),
            ),
          )
        else
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPaddingHorizontal),
              itemCount: criminals.length + (isLoadingMore ? 1 : 0),
              itemBuilder: (context, index) {
                // Show loading indicator at end if loading more
                if (index == criminals.length) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                    child: Center(
                      child: CircularProgressIndicator(
                        color: AppColors.accentRed,
                      ),
                    ),
                  );
                }

                final criminal = criminals[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.md),
                  child: _buildCriminalCard(criminal),
                );
              },
            ),
          ),
      ],
    );
  }

  /// Build individual criminal card
  Widget _buildCriminalCard(dynamic criminal) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: criminal.wanted ? AppColors.error.withValues(alpha: 0.3) : Colors.grey.withValues(alpha: 0.1),
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
                      criminal.fullName,
                      style: AppTextStyles.titleSmall.copyWith(
                        color: Colors.black87,
                        fontWeight: FontWeight.w700,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    if (criminal.identificationNumber != null)
                      Text(
                        'ID: ${criminal.identificationNumber}',
                        style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                      ),
                  ],
                ),
              ),
              // Status badge
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: _getStatusColor(criminal.status).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  criminal.status.substring(0, 1).toUpperCase() + criminal.status.substring(1),
                  style: AppTextStyles.labelSmall.copyWith(
                    color: _getStatusColor(criminal.status),
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),

          // Info row: Gender, DOB, Arrest count
          Row(
            children: [
              if (criminal.gender != null) ...[
                Expanded(
                  child: _buildInfoChip(
                    icon: Icons.person,
                    label: criminal.gender,
                  ),
                ),
              ],
              if (criminal.arrestCount > 0) ...[
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: _buildInfoChip(
                    icon: Icons.gavel,
                    label: 'Arrests: ${criminal.arrestCount}',
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
              if (criminal.wanted)
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
              if (criminal.dangerLevel != null && criminal.dangerLevel!.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: _getDangerColor(criminal.dangerLevel!).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: _getDangerColor(criminal.dangerLevel!).withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: Text(
                    'Danger: ${criminal.dangerLevel}',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: _getDangerColor(criminal.dangerLevel!),
                      fontSize: 10,
                    ),
                  ),
                ),
            ],
          ),
        ],
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

  /// Get status badge color
  Color _getStatusColor(String status) {
    switch (status) {
      case 'active':
        return AppColors.success;
      case 'inactive':
        return Colors.orange;
      case 'deceased':
      case 'deported':
        return Colors.grey;
      default:
        return AppColors.textSecondary;
    }
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
