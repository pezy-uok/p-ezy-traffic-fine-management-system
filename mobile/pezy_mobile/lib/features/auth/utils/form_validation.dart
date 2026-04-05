/// Form validation utilities for the auth forms
class FormValidation {
  /// Validate email or username
  /// Returns null if valid, error message string if invalid
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required';
    }

    // Check if it's an email format
    if (value.contains('@')) {
      // Email must be in pezy.gov domain
      final pezyEmailRegex = RegExp(
        r'^[a-zA-Z0-9._%+-]+@pezy\.gov$',
      );
      if (!pezyEmailRegex.hasMatch(value)) {
        return 'Email must be in @pezy.gov domain (e.g., officer.bandara@pezy.gov)';
      }
    } else {
      // ID number not supported for pezy officers
      return 'Please use your @pezy.gov email address';
    }

    return null;
  }

  /// Validate OTP
  /// Returns null if valid, error message string if invalid
  static String? validateOtp(String? value) {
    if (value == null || value.isEmpty) {
      return 'OTP is required';
    }

    if (value.length != 6) {
      return 'OTP must be 6 digits';
    }

    if (!RegExp(r'^[0-9]{6}$').hasMatch(value)) {
      return 'OTP must contain only digits';
    }

    return null;
  }

  /// Check if email/ID is in correct format (without full validation)
  static bool isValidEmailFormat(String value) {
    if (value.isEmpty) return false;

    if (value.contains('@')) {
      return RegExp(r'^[a-zA-Z0-9._%+-]+@pezy\.gov$').hasMatch(value);
    }
    return false; // Only pezy.gov emails allowed
  }

  /// Check if OTP is correctly formatted
  static bool isValidOtpFormat(String value) {
    return value.length == 6 && RegExp(r'^[0-9]{6}$').hasMatch(value);
  }
}
