import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../data/services/fine_api_service.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

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
  final bool isSuccess;

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
    this.isSuccess = false,
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
    bool? isSuccess,
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
      isSuccess: isSuccess ?? this.isSuccess,
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
  final Dio _dio;
  
  NewFineNotifier({Dio? dio})
      : _dio = dio ?? Dio(),
        super(const NewFineFormState());

  /// Update license number
  void setLicenseNo(String licenseNo) {
    state = state.copyWith(licenseNo: licenseNo, errorMessage: null);
  }

  /// Submit license number and fetch user details from backend
  Future<void> submitLicenseNo() async {
    // Validate license number format
    final licenseValidation = _validateLicenseNumber(state.licenseNo);
    if (licenseValidation != null) {
      state = state.copyWith(errorMessage: licenseValidation);
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      print('\n╔════════════════════════════════════════╗');
      print('║  NEW FINE: LICENSE NUMBER LOOKUP        ║');
      print('╠════════════════════════════════════════╣');
      print('║ License: ${state.licenseNo}');
      print('╚════════════════════════════════════════╝\n');

      // Create API service and fetch driver details
      final apiService = FineApiService(dio: _dio);
      final response = await apiService.getDriverByLicenseNumber(state.licenseNo);

      // Check if driver has any overdue fines
      bool isOverdue = _hasOverdueFines(response.fines);

      print('✅ Driver found: ${response.driver.driverName}');
      print('   Overdue: $isOverdue');
      print('   Active fines: ${response.fines.length}\n');

      state = state.copyWith(
        userName: response.driver.driverName,
        isOverdue: isOverdue,
        isSubmitted: true,
        isLoading: false,
        errorMessage: null,
      );
    } catch (e) {
      print('❌ Error: $e\n');
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceAll('Exception: ', ''),
      );
    }
  }

  /// Validate license number format
  /// Returns error message if invalid, null if valid
  String? _validateLicenseNumber(String licenseNo) {
    if (licenseNo.isEmpty) {
      return 'Please enter license number';
    }

    if (licenseNo.length < 4) {
      return 'License number must be at least 4 characters';
    }

    if (licenseNo.length > 20) {
      return 'License number is too long (max 20 characters)';
    }

    // Check for valid characters (alphanumeric and hyphens only)
    if (!RegExp(r'^[A-Za-z0-9\-]+$').hasMatch(licenseNo)) {
      return 'License number can only contain letters, numbers, and hyphens';
    }

    return null; // Valid
  }

  /// Check if any fines are overdue (past due date)
  bool _hasOverdueFines(List<FineInfo> fines) {
    if (fines.isEmpty) return false;

    final today = DateTime.now();
    // Check for unpaid fines with due date in the past
    return fines.any((fine) {
      if (fine.status != 'unpaid') return false;
      try {
        final dueDate = DateTime.parse(fine.dueDate);
        return dueDate.isBefore(today);
      } catch (_) {
        return false;
      }
    });
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
    // Validate date
    final dateValidation = _validateDate(state.date);
    if (dateValidation != null) {
      state = state.copyWith(errorMessage: dateValidation);
      return;
    }

    if (state.fineType.isEmpty) {
      state = state.copyWith(errorMessage: 'Please select fine type');
      return;
    }

    // Validate reason
    final reasonValidation = _validateReason(state.reason);
    if (reasonValidation != null) {
      state = state.copyWith(errorMessage: reasonValidation);
      return;
    }

    // Validate amount
    final amountValidation = _validateAmount(state.amount);
    if (amountValidation != null) {
      state = state.copyWith(errorMessage: amountValidation);
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
        isSuccess: true,
      );

      // Reset after 2.5 seconds to allow toast to be seen
      await Future.delayed(const Duration(milliseconds: 2500));
      reset();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Error submitting fine: ${e.toString()}',
      );
    }
  }

  /// Validate date format (DD/MM/YYYY)
  /// Returns error message if invalid, null if valid
  String? _validateDate(String date) {
    if (date.isEmpty) {
      return 'Please enter date (DD/MM/YYYY)';
    }

    // Check format DD/MM/YYYY
    if (!RegExp(r'^\d{2}/\d{2}/\d{4}$').hasMatch(date)) {
      return 'Date must be in DD/MM/YYYY format';
    }

    final parts = date.split('/');
    final day = int.tryParse(parts[0]);
    final month = int.tryParse(parts[1]);
    final year = int.tryParse(parts[2]);

    if (day == null || month == null || year == null) {
      return 'Date contains invalid numbers';
    }

    // Validate ranges
    if (day < 1 || day > 31) {
      return 'Day must be between 1 and 31';
    }

    if (month < 1 || month > 12) {
      return 'Month must be between 1 and 12';
    }

    if (year < 1900 || year > DateTime.now().year + 10) {
      return 'Year must be between 1900 and ${DateTime.now().year + 10}';
    }

    // Try parsing as DateTime to validate actual date
    try {
      final parsedDate = DateTime(year, month, day);
      
      // Check if date is in future
      if (parsedDate.isAfter(DateTime.now())) {
        return 'Date cannot be in the future';
      }
    } catch (e) {
      return 'Invalid date (e.g., Feb 30)';
    }

    return null; // Valid
  }

  /// Validate reason text
  /// Returns error message if invalid, null if valid
  String? _validateReason(String reason) {
    if (reason.isEmpty) {
      return 'Please enter reason for fine';
    }

    if (reason.length < 5) {
      return 'Reason must be at least 5 characters';
    }

    if (reason.length > 500) {
      return 'Reason must not exceed 500 characters';
    }

    return null; // Valid
  }

  /// Validate amount value
  /// Returns error message if invalid, null if valid
  String? _validateAmount(String amount) {
    if (amount.isEmpty) {
      return 'Please enter amount';
    }

    final parsedAmount = double.tryParse(amount);
    if (parsedAmount == null) {
      return 'Amount must be a valid number';
    }

    if (parsedAmount <= 0) {
      return 'Amount must be greater than 0';
    }

    if (parsedAmount > 999999) {
      return 'Amount must not exceed 999,999';
    }

    // Check decimal places (max 2)
    if (amount.contains('.')) {
      final decimalPlaces = amount.split('.')[1].length;
      if (decimalPlaces > 2) {
        return 'Amount can have maximum 2 decimal places';
      }
    }

    return null; // Valid
  }
}

/// Riverpod provider for new fine API service
final fineApiServiceProvider = Provider<FineApiService>((ref) {
  final authenticatedDio = ref.watch(authenticatedDioProvider);
  return FineApiService(dio: authenticatedDio);
});

/// Riverpod provider for new fine form state
final newFineProvider =
    StateNotifierProvider<NewFineNotifier, NewFineFormState>((ref) {
  final authenticatedDio = ref.watch(authenticatedDioProvider);
  return NewFineNotifier(dio: authenticatedDio);
});
