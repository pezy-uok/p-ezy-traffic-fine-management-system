import 'package:flutter_riverpod/flutter_riverpod.dart';

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
  OutdatedFinesNotifier() : super(const OutdatedFinesState()) {
    // Load fines on initialization
    loadOutdatedFines();
  }

  /// Load outdated fines from API
  Future<void> loadOutdatedFines() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      // Simulate API call to fetch outdated fines
      await Future.delayed(const Duration(seconds: 1));

      // Mock data for outdated fines
      final mockFines = _getMockOutdatedFines();

      state = state.copyWith(
        fines: mockFines,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Error loading outdated fines: ${e.toString()}',
      );
    }
  }

  /// Mock data for testing - replace with actual API call
  List<OutdatedFine> _getMockOutdatedFines() {
    return [
      OutdatedFine(
        licenseNo: 'DL0001',
        driverName: 'John Doe',
        amount: 5000.0,
      ),
      OutdatedFine(
        licenseNo: 'DL0002',
        driverName: 'Jane Smith',
        amount: 7500.0,
      ),
      OutdatedFine(
        licenseNo: 'DL0003',
        driverName: 'Robert Johnson',
        amount: 3200.0,
      ),
      OutdatedFine(
        licenseNo: 'DL0004',
        driverName: 'Emily Williams',
        amount: 6800.0,
      ),
      OutdatedFine(
        licenseNo: 'DL0005',
        driverName: 'Michael Brown',
        amount: 4500.0,
      ),
      OutdatedFine(
        licenseNo: 'DL0006',
        driverName: 'Sarah Davis',
        amount: 8200.0,
      ),
    ];
  }
}

/// Riverpod provider for outdated fines state
final outdatedFinesProvider =
    StateNotifierProvider<OutdatedFinesNotifier, OutdatedFinesState>((ref) {
  return OutdatedFinesNotifier();
});
