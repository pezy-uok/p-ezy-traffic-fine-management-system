/// Criminal list state model
part of 'criminal_list_controller.dart';

class CriminalListState {
  final List<Criminal> criminals;
  final int total;
  final int limit;
  final int offset;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;

  const CriminalListState({
    this.criminals = const [],
    this.total = 0,
    this.limit = 50,
    this.offset = 0,
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
  });

  /// Check if there are more records to fetch
  bool get hasMore => (offset + criminals.length) < total;

  /// Get number of wanted criminals
  int get wantedCount => criminals.where((c) => c.wanted).length;

  /// Get number of active criminals
  int get activeCount => criminals.where((c) => c.isActive).length;

  CriminalListState copyWith({
    List<Criminal>? criminals,
    int? total,
    int? limit,
    int? offset,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
  }) {
    return CriminalListState(
      criminals: criminals ?? this.criminals,
      total: total ?? this.total,
      limit: limit ?? this.limit,
      offset: offset ?? this.offset,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error,
    );
  }

  @override
  String toString() => 'CriminalListState(total: $total, count: ${criminals.length}, wanted: $wantedCount, isLoading: $isLoading)';
}
