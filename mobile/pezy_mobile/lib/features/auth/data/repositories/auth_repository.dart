/// Authentication repository
/// Handles business logic and state management for authentication
import 'auth_api_service.dart';
import 'token_storage_service.dart';

class AuthRepository {
  final AuthApiService _apiService;
  final TokenStorageService _tokenStorage;

  AuthRepository({
    required AuthApiService apiService,
    required TokenStorageService tokenStorage,
  })  : _apiService = apiService,
        _tokenStorage = tokenStorage;

  /// Verify email - Step 1 of login
  /// Returns true if email exists and is eligible
  Future<bool> verifyEmail(String email) async {
    final response = await _apiService.verifyEmail(email);

    if (!response.success) {
      throw Exception(response.message);
    }

    if (!response.exists) {
      throw Exception(response.message);
    }

    if (response.active == false) {
      throw Exception(response.message);
    }

    return true; // Email is valid and eligible for login
  }

  /// Request OTP - Step 2 of login
  /// Returns temporary_id to be used in verifyOtp
  Future<String> requestOtp(String email) async {
    final response = await _apiService.requestOtp(email);

    if (!response.success) {
      throw Exception(response.message);
    }

    return response.temporaryId;
  }

  /// Verify OTP and login - Step 3 of login (final step)
  /// Returns user data and saves tokens to secure storage
  Future<void> verifyOtp(String temporaryId, String otp) async {
    final response = await _apiService.verifyOtp(temporaryId, otp);

    if (!response.success) {
      throw Exception(response.message);
    }

    // Save tokens and user data securely
    if (response.accessToken != null &&
        response.refreshToken != null &&
        response.user != null) {
      await _tokenStorage.saveTokens(
        accessToken: response.accessToken!,
        refreshToken: response.refreshToken!,
        userEmail: response.user!.email,
        userId: response.user!.id,
        userName: response.user!.name,
      );
    } else {
      throw Exception('Invalid response from server');
    }
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    return await _tokenStorage.isLoggedIn();
  }

  /// Get current access token
  Future<String?> getAccessToken() async {
    return await _tokenStorage.getAccessToken();
  }

  /// Get current refresh token
  Future<String?> getRefreshToken() async {
    return await _tokenStorage.getRefreshToken();
  }

  /// Get logged-in user email
  Future<String?> getUserEmail() async {
    return await _tokenStorage.getUserEmail();
  }

  /// Get logged-in user ID
  Future<String?> getUserId() async {
    return await _tokenStorage.getUserId();
  }

  /// Get logged-in user name
  Future<String?> getUserName() async {
    return await _tokenStorage.getUserName();
  }

  /// Logout - Clear all tokens
  Future<void> logout() async {
    await _tokenStorage.clearAll();
  }
}
