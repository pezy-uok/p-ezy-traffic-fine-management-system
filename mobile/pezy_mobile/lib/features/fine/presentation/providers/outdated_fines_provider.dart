import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../data/services/fine_api_service.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

/// Model for a single outdated fine
class OutdatedFine {
  final String licenseNo;
  final String driverName;
  final double amount;

  OutdatedFine({
    required this.licenseNo,
    required this.driverName,
    required this.amount,
  });
}

/// State for outdated fines list
class OutdatedFinesState {
  final List<OutdatedFine> fines;
  final bool isLoading;
  final String? errorMessage;

  const OutdatedFinesState({
    this.fines = const [],
    this.isLoading = false,
    this.errorMessage,
  });

  /// Create a copy with modified fields
  OutdatedFinesState copyWith({
    List<OutdatedFine>? fines,
    bool? isLoading,
    String? errorMessage,
  }) {
    return OutdatedFinesState(
      fines: fines ?? this.fines,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

/// Notifier for managing outdated fines state
class OutdatedFinesNotifier extends StateNotifier<OutdatedFinesState> {
  final Dio _dio;

  OutdatedFinesNotifier(this._dio) : super(const OutdatedFinesState()) {
    // Load fines on initialization
    loadOutdatedFines();
  }

  /// Load outdated fines from API
  Future<void> loadOutdatedFines() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      print('\n╔════════════════════════════════════════╗');
      print('║  OUTDATED FINES PROVIDER: LOAD         ║');
      print('╚════════════════════════════════════════╝\n');

      // Use the authenticated Dio instance
      final apiService = FineApiService(dio: _dio);
      final finesList = await apiService.getOutdatedFines();

      print('✅ Loaded ${finesList.length} outdated fines');

      // Convert FineInfo to OutdatedFine
      final outdatedFines = finesList.map((fine) {
        return OutdatedFine(
          licenseNo: fine.licenseNumber,
          driverName: fine.driverName,
          amount: fine.amount,
        );
      }).toList();

      state = state.copyWith(
        fines: outdatedFines,
        isLoading: false,
      );
    } catch (e) {
      print('❌ Error loading outdated fines: $e\n');
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Error loading outdated fines: ${e.toString().replaceAll('Exception: ', '')}',
      );
    }
  }
}

/// Riverpod provider for outdated fines state
final outdatedFinesProvider =
    StateNotifierProvider<OutdatedFinesNotifier, OutdatedFinesState>((ref) {
  final authenticatedDio = ref.watch(authenticatedDioProvider);
  return OutdatedFinesNotifier(authenticatedDio);
});
