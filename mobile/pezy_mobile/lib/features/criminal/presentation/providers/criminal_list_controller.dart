/// Criminal list state management
library criminal_list_controller;

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/criminal_model.dart';
import '../../data/services/criminal_api_service.dart';
import 'criminal_providers.dart';

part 'criminal_list_state.dart';

class CriminalListController extends StateNotifier<CriminalListState> {
  final CriminalApiService _apiService;

  CriminalListController({required CriminalApiService apiService})
      : _apiService = apiService,
        super(const CriminalListState()) {
    debugPrint('\n╔════════════════════════════════════════╗');
    debugPrint('║  CRIMINAL LIST CONTROLLER Created      ║');
    debugPrint('╠════════════════════════════════════════╣');
    debugPrint('║ API Service provided: ✅ YES');
    debugPrint('║ Initial State: isLoading=false');
    debugPrint('╚════════════════════════════════════════╝\n');
  }

  /// Fetch criminals list with pagination and filters
  Future<void> fetchCriminals({
    int limit = 50,
    int offset = 0,
    String? status,
    bool? wanted,
    String? search,
    String orderBy = 'created_at',
    String orderDirection = 'desc',
  }) async {
    debugPrint('\n╔════════════════════════════════════════╗');
    debugPrint('║  CRIMINAL LIST: fetchCriminals()       ║');
    debugPrint('╠════════════════════════════════════════╣');
    debugPrint('║ Setting state: isLoading=true');
    
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      debugPrint('║ Calling API service...');
      final response = await _apiService.getAllCriminals(
        limit: limit,
        offset: offset,
        status: status,
        wanted: wanted,
        search: search,
        orderBy: orderBy,
        orderDirection: orderDirection,
      );

      debugPrint('║ ✅ API response received');
      debugPrint('║ Criminals returned: ${response.criminals.length}');
      debugPrint('║ Total count: ${response.total}');

      // Validate: check for deleted criminals (should not happen due to backend filtering)
      final deletedCount = response.criminals.where((c) => c.isDeleted).length;
      if (deletedCount > 0) {
        debugPrint('║ ⚠️  WARNING: $deletedCount deleted criminal(s) found!');
      }
      
      // Filter out any deleted criminals as safety measure
      final activeRecords = response.criminals.where((c) => !c.isDeleted).toList();
      debugPrint('║ Active records: ${activeRecords.length} (deleted filtered: $deletedCount)');

      state = state.copyWith(
        isLoading: false,
        criminals: activeRecords,
        total: response.total,
        limit: limit,
        offset: offset,
        error: null,
      );
      
      debugPrint('║ ✅ State updated successfully');
      debugPrint('╚════════════════════════════════════════╝\n');
    } catch (e) {
      debugPrint('║ ❌ ERROR: $e');
      debugPrint('╚════════════════════════════════════════╝\n');
      
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  /// Refresh criminals list (refetch from beginning)
  Future<void> refreshCriminals({
    String? status,
    bool? wanted,
    String? search,
  }) async {
    await fetchCriminals(
      limit: state.limit,
      offset: 0,
      status: status,
      wanted: wanted,
      search: search,
    );
  }

  /// Load more criminals (pagination)
  Future<void> loadMore({
    String? status,
    bool? wanted,
    String? search,
  }) async {
    if (state.isLoadingMore || !state.hasMore) return;

    state = state.copyWith(isLoadingMore: true);

    try {
      final newOffset = state.offset + state.limit;
      final response = await _apiService.getAllCriminals(
        limit: state.limit,
        offset: newOffset,
        status: status,
        wanted: wanted,
        search: search,
      );

      state = state.copyWith(
        isLoadingMore: false,
        criminals: [...state.criminals, ...response.criminals],
        offset: newOffset,
        error: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoadingMore: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  /// Filter criminals by status
  Future<void> filterByStatus(String status) async {
    await refreshCriminals(status: status);
  }

  /// Filter criminals by wanted status
  Future<void> filterByWanted(bool wanted) async {
    await refreshCriminals(wanted: wanted);
  }

  /// Search criminals by name or ID
  Future<void> searchCriminals(String query) async {
    await refreshCriminals(search: query);
  }

  /// Clear all filters and fetch all criminals
  Future<void> clearFilters() async {
    await refreshCriminals();
  }

  /// Reset state to initial
  void reset() {
    state = const CriminalListState();
  }
}

// Providers
final criminalListProvider = StateNotifierProvider.autoDispose<
    CriminalListController,
    CriminalListState>((ref) {
  final apiService = ref.watch(criminalApiServiceProvider);
  return CriminalListController(apiService: apiService);
});

// Convenience provider for criminals list
final criminalsListProvider = Provider.autoDispose<List<Criminal>>((ref) {
  final state = ref.watch(criminalListProvider);
  return state.criminals;
});

// Convenience provider for wanted criminals
final wantedCriminalsProvider = Provider.autoDispose<List<Criminal>>((ref) {
  final criminals = ref.watch(criminalsListProvider);
  return criminals.where((c) => c.wanted).toList();
});

// Convenience provider for active criminals
final activeCriminalsProvider = Provider.autoDispose<List<Criminal>>((ref) {
  final criminals = ref.watch(criminalsListProvider);
  return criminals.where((c) => c.isActive).toList();
});

// Convenience provider for total criminals count
final criminalsTotalProvider = Provider.autoDispose<int>((ref) {
  final state = ref.watch(criminalListProvider);
  return state.total;
});

// Convenience provider for wanted criminals count
final wantedCriminalsCountProvider = Provider.autoDispose<int>((ref) {
  final criminals = ref.watch(criminalsListProvider);
  return criminals.where((c) => c.wanted).length;
});

// Convenience provider for loading state
final criminalsLoadingProvider = Provider.autoDispose<bool>((ref) {
  final state = ref.watch(criminalListProvider);
  return state.isLoading;
});
