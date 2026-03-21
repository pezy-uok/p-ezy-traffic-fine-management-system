import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Model for new fine form state
class NewFineFormState {
  final String licenseNo;
  final String? userName;
  final bool isOverdue;
  final bool isSubmitted;
  final bool isLoading;
  final String? errorMessage;
  final String date;
  final String amount;
  final String amountConfirm;
  final String fineType;
  final String reason;
  final String extraAmount;

  const NewFineFormState({
    this.licenseNo = '',
    this.userName,
    this.isOverdue = false,
    this.isSubmitted = false,
    this.isLoading = false,
    this.errorMessage,
    this.date = '',
    this.amount = '',
    this.amountConfirm = '',
    this.fineType = '',
    this.reason = '',
    this.extraAmount = '',
  });

  /// Create a copy with modified fields
  NewFineFormState copyWith({
    String? licenseNo,
    String? userName,
    bool? isOverdue,
    bool? isSubmitted,
    bool? isLoading,
    String? errorMessage,
    String? date,
    String? amount,
    String? amountConfirm,
    String? fineType,
    String? reason,
    String? extraAmount,
  }) {
    return NewFineFormState(
      licenseNo: licenseNo ?? this.licenseNo,
      userName: userName ?? this.userName,
      isOverdue: isOverdue ?? this.isOverdue,
      isSubmitted: isSubmitted ?? this.isSubmitted,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
      date: date ?? this.date,
      amount: amount ?? this.amount,
      amountConfirm: amountConfirm ?? this.amountConfirm,
      fineType: fineType ?? this.fineType,
      reason: reason ?? this.reason,
      extraAmount: extraAmount ?? this.extraAmount,
    );
  }

  /// Check if amounts match
  bool get amountsMatch {
    if (amount.isEmpty || amountConfirm.isEmpty) {
      return true; // Don't show error if either is empty
    }
    return amount == amountConfirm;
  }

  /// Check if form is valid for submission
  bool get isFormValid {
    return isSubmitted &&
        !isOverdue &&
        date.isNotEmpty &&
        fineType.isNotEmpty &&
        reason.isNotEmpty &&
        amount.isNotEmpty &&
        amountConfirm.isNotEmpty &&
        amountsMatch;
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

  /// Update fine date (DD/MM/YYYY format)
  void setDate(String date) {
    state = state.copyWith(date: date);
  }

  /// Update fine amount
  void setAmount(String amount) {
    state = state.copyWith(amount: amount);
    // Check if confirmation exists and doesn't match
    if (state.amountConfirm.isNotEmpty && amount != state.amountConfirm) {
      state = state.copyWith(
        errorMessage: 'Amounts do not match',
      );
    } else if (state.amountConfirm.isNotEmpty && amount == state.amountConfirm) {
      state = state.copyWith(errorMessage: null);
    }
  }

  /// Update amount confirmation
  void setAmountConfirm(String amountConfirm) {
    state = state.copyWith(amountConfirm: amountConfirm);
    // Check if confirmation doesn't match amount
    if (state.amount.isNotEmpty && amountConfirm != state.amount) {
      state = state.copyWith(
        errorMessage: 'Amounts do not match',
      );
    } else if (state.amount.isNotEmpty && amountConfirm == state.amount) {
      state = state.copyWith(errorMessage: null);
    }
  }

  /// Update fine type dropdown
  void setFineType(String fineType) {
    state = state.copyWith(fineType: fineType);
  }

  /// Update fine reason
  void setReason(String reason) {
    state = state.copyWith(reason: reason);
  }

  /// Update extra amount
  void setExtraAmount(String extraAmount) {
    state = state.copyWith(extraAmount: extraAmount);
  }

  /// Validate amounts match and submit fine
  Future<void> submitFine() async {
    if (state.date.isEmpty) {
      state = state.copyWith(errorMessage: 'Please select a date');
      return;
    }

    if (state.fineType.isEmpty) {
      state = state.copyWith(errorMessage: 'Please select fine type');
      return;
    }

    if (state.reason.isEmpty) {
      state = state.copyWith(errorMessage: 'Please enter reason');
      return;
    }

    if (state.amount.isEmpty) {
      state = state.copyWith(errorMessage: 'Please enter amount');
      return;
    }

    if (state.amountConfirm.isEmpty) {
      state = state.copyWith(errorMessage: 'Please confirm amount');
      return;
    }

    // Validate amounts match
    if (state.amount != state.amountConfirm) {
      state = state.copyWith(
        errorMessage: 'Amounts do not match. Please re-enter.',
      );
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      // Simulate API call to submit fine
      await Future.delayed(const Duration(seconds: 1));

      // Success - in production, this would save to backend
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Fine submitted successfully!',
      );

      // Reset after 2 seconds
      await Future.delayed(const Duration(seconds: 2));
      reset();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Error submitting fine: ${e.toString()}',
      );
    }
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
