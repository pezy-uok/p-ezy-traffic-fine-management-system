import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../data/services/warning_api_service.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

/// Model for warning escalation state
class WarningEscalationState {
  final String licenseNo;
  final String driverName;
  final String reason;
  final String violationCode;
  final String location;
  final String vehicleRegistration;
  final String issueDate;
  final bool isLoading;
  final String? errorMessage;
  final bool isSuccess;

  const WarningEscalationState({
    this.licenseNo = '',
    this.driverName = '',
    this.reason = '',
    this.violationCode = '',
    this.location = '',
    this.vehicleRegistration = '',
    this.issueDate = '',
    this.isLoading = false,
    this.errorMessage,
    this.isSuccess = false,
  });

  /// Create a copy with modified fields
  WarningEscalationState copyWith({
    String? licenseNo,
    String? driverName,
    String? reason,
    String? violationCode,
    String? location,
    String? vehicleRegistration,
    String? issueDate,
    bool? isLoading,
    String? errorMessage,
    bool? isSuccess,
  }) {
    return WarningEscalationState(
      licenseNo: licenseNo ?? this.licenseNo,
      driverName: driverName ?? this.driverName,
      reason: reason ?? this.reason,
      violationCode: violationCode ?? this.violationCode,
      location: location ?? this.location,
      vehicleRegistration: vehicleRegistration ?? this.vehicleRegistration,
      issueDate: issueDate ?? this.issueDate,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

/// Notifier for managing warning escalation state
class WarningEscalationNotifier extends StateNotifier<WarningEscalationState> {
  final Dio _dio;

  WarningEscalationNotifier({Dio? dio})
      : _dio = dio ?? Dio(),
        super(const WarningEscalationState());

  /// Set warning data when escalation is needed
  void setWarningData({
    required String licenseNo,
    required String driverName,
    required String reason,
    required String violationCode,
    required String location,
    required String vehicleRegistration,
    required String issueDate,
  }) {
    state = state.copyWith(
      licenseNo: licenseNo,
      driverName: driverName,
      reason: reason,
      violationCode: violationCode,
      location: location,
      vehicleRegistration: vehicleRegistration,
      issueDate: issueDate,
    );
  }

  /// Submit warning escalation
  Future<void> submitWarning() async {
    if (state.licenseNo.isEmpty) {
      state = state.copyWith(errorMessage: 'License number is required');
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      print('\n╔════════════════════════════════════════╗');
      print('║  WARNING ESCALATION: SUBMIT WARNING     ║');
      print('╠════════════════════════════════════════╣');
      print('║ License: ${state.licenseNo}');
      print('║ Driver: ${state.driverName}');
      print('║ Reason: ${state.reason}');
      print('║ Violation: ${state.violationCode}');
      print('║ Severity: major');
      print('║ Issue Date: ${state.issueDate}');
      print('║ Location: ${state.location}');
      print('║ Vehicle Reg: ${state.vehicleRegistration}');
      print('╚════════════════════════════════════════╝\n');

      final apiService = WarningApiService(dio: _dio);

      final response = await apiService.createWarning(
        licenseNo: state.licenseNo,
        reason: state.reason,
        severity: 'major', // Default severity for max fines exceeded
        violationCode: state.violationCode,
        location: state.location,
        vehicleRegistration: state.vehicleRegistration,
        issueDate: state.issueDate,
      );

      print('✅ Warning submitted successfully');
      print('Response: $response\n');

      // Success - warning saved to backend
      state = state.copyWith(
        isLoading: false,
        isSuccess: true,
        errorMessage: null,
      );

      // Reset after 2 seconds
      await Future.delayed(const Duration(seconds: 2));
      reset();
    } catch (e) {
      print('❌ Error submitting warning: $e\n');
      final errorMsg = e.toString().replaceAll('Exception: ', '');
      print('Error message: $errorMsg\n');
      
      state = state.copyWith(
        isLoading: false,
        errorMessage: errorMsg,
      );
    }
  }

  /// Reset the warning state
  void reset() {
    state = const WarningEscalationState();
  }
}

/// Provider for the warning API service with authenticated Dio
final warningApiServiceProvider = Provider<WarningApiService>((ref) {
  final dio = ref.watch(authenticatedDioProvider);
  return WarningApiService(dio: dio);
});

/// Provider for the warning escalation state
final warningEscalationProvider =
    StateNotifierProvider<WarningEscalationNotifier, WarningEscalationState>(
  (ref) {
    final dio = ref.watch(authenticatedDioProvider);
    return WarningEscalationNotifier(dio: dio);
  },
);
