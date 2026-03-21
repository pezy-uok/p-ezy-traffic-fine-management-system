import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Model for new fine form state
class NewFineFormState {
  final String licenseNo;
  final String? userName;
  final bool isOverdue;
  final bool isSubmitted;
  final bool isLoading;
  final String? errorMessage;

  const NewFineFormState({
    this.licenseNo = '',
    this.userName,
    this.isOverdue = false,
    this.isSubmitted = false,
    this.isLoading = false,
    this.errorMessage,
  });

  /// Create a copy with modified fields
  NewFineFormState copyWith({
    String? licenseNo,
    String? userName,
    bool? isOverdue,
    bool? isSubmitted,
    bool? isLoading,
    String? errorMessage,
  }) {
    return NewFineFormState(
      licenseNo: licenseNo ?? this.licenseNo,
      userName: userName ?? this.userName,
      isOverdue: isOverdue ?? this.isOverdue,
      isSubmitted: isSubmitted ?? this.isSubmitted,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

/// Notifier for managing new fine form state
class NewFineNotifier extends StateNotifier<NewFineFormState> {
  NewFineNotifier() : super(const NewFineFormState());

  /// Update license number
  void setLicenseNo(String licenseNo) {
    state = state.copyWith(licenseNo: licenseNo, errorMessage: null);
  }

  /// Submit license number and fetch user details
  Future<void> submitLicenseNo() async {
    if (state.licenseNo.isEmpty) {
      state = state.copyWith(errorMessage: 'Please enter license number');
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      // Simulate API call to fetch user details by license number
      await Future.delayed(const Duration(seconds: 1));

      // Mock response - in production, this would be an API call
      final mockUserData = _getMockUserData(state.licenseNo);

      if (mockUserData == null) {
        state = state.copyWith(
          isLoading: false,
          errorMessage: 'Driver not found for this license number',
        );
        return;
      }

      state = state.copyWith(
        userName: mockUserData['name'],
        isOverdue: mockUserData['isOverdue'] ?? false,
        isSubmitted: true,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Error: ${e.toString()}',
      );
    }
  }

  /// Reset the form to initial state
  void reset() {
    state = const NewFineFormState();
  }

  /// Mock data for testing - replace with actual API call
  /// Simulates 404 error for certain license number patterns
  Map<String, dynamic>? _getMockUserData(String licenseNo) {
    if (licenseNo.isEmpty) {
      return null;
    }

    // Simulate 404 (driver not found) for specific test patterns
    // License numbers starting with '000' or '999' will return not found
    if (licenseNo.startsWith('000') || licenseNo.startsWith('999')) {
      return null; // Simulates 404 - driver not found
    }

    // Valid lookup - return mock user data
    return {
      'name': 'John Doe',
      'isOverdue': licenseNo.length > 10, // Mock: longer license numbers are overdue
    };
  }
}

/// Riverpod provider for new fine form state
final newFineProvider =
    StateNotifierProvider<NewFineNotifier, NewFineFormState>((ref) {
  return NewFineNotifier();
});
