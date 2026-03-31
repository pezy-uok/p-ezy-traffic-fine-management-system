/// Form validation utilities for the auth forms
class FormValidation {
  /// Validate email or username
  /// Returns null if valid, error message string if invalid
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email or ID number is required';
    }

    // Check if it's an email format
    if (value.contains('@')) {
      // Simple email validation
      final emailRegex = RegExp(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
      );
      if (!emailRegex.hasMatch(value)) {
        return 'Please enter a valid email address';
      }
    } else {
      // Validate as ID number (digits only, typically 5-10 digits)
      if (!RegExp(r'^[0-9]{5,10}$').hasMatch(value)) {
        return 'ID number must be 5-10 digits';
      }
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
      return RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
          .hasMatch(value);
    } else {
      return RegExp(r'^[0-9]{5,10}$').hasMatch(value);
    }
  }

  /// Check if OTP is correctly formatted
  static bool isValidOtpFormat(String value) {
    return value.length == 6 && RegExp(r'^[0-9]{6}$').hasMatch(value);
  }
}
