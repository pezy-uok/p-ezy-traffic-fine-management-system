/// Authentication repository
/// Handles business logic and state management for authentication
import '../services/auth_api_service.dart';
import '../services/token_storage_service.dart';

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
    try {
      print('\n📡 REPOSITORY: requestOtp called with email: $email');
      final response = await _apiService.requestOtp(email);
      print('📡 REPOSITORY: API response success: ${response.success}');

      if (!response.success) {
        print('❌ REPOSITORY: API response was not successful: ${response.message}');
        throw Exception(response.message);
      }

      print('✅ REPOSITORY: requestOtp returning temporary_id: ${response.temporaryId}');
      return response.temporaryId;
    } catch (e) {
      print('❌ REPOSITORY: requestOtp exception: $e');
      rethrow;
    }
  }

  /// Verify OTP and login - Step 3 of login (final step)
  /// Returns user data and saves tokens to secure storage
  Future<void> verifyOtp(String temporaryId, String otp) async {
    print('\n📡 REPOSITORY: verifyOtp called');
    print('   Temporary ID: $temporaryId');
    print('   OTP: $otp');

    try {
      print('📞 Calling API service...');
      final response = await _apiService.verifyOtp(temporaryId, otp);

      print('✅ API response received:');
      print('   Success: ${response.success}');
      print('   Message: ${response.message}');
      print('   Has Access Token: ${response.accessToken != null}');
      print('   Has User: ${response.user != null}');

      if (!response.success) {
        print('❌ REPOSITORY: API returned success=false');
        throw Exception(response.message);
      }

      // Save tokens and user data securely
      if (response.accessToken != null &&
          response.refreshToken != null &&
          response.user != null) {
        print('💾 Saving tokens to secure storage...');
        await _tokenStorage.saveTokens(
          accessToken: response.accessToken!,
          refreshToken: response.refreshToken!,
          userEmail: response.user!.email,
          userId: response.user!.id,
          userName: response.user!.name,
        );
        print('✅ Tokens saved successfully\n');
      } else {
        print('❌ REPOSITORY: Missing required response data');
        throw Exception('Invalid response from server');
      }
    } catch (e) {
      print('❌ REPOSITORY: verifyOtp exception: $e\n');
      rethrow;
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

  /// Logout - Clear all tokens and notify backend
  Future<void> logout() async {
    try {
      print('\n╔════════════════════════════════════════╗');
      print('║  AUTH REPOSITORY: logout             ║');
      print('╚════════════════════════════════════════╝\n');

      // Get access token before clearing storage
      print('📥 Getting access token from storage...');
      final accessToken = await _tokenStorage.getAccessToken();
      
      if (accessToken != null && accessToken.isNotEmpty) {
        print('✅ Access token found: ${accessToken.substring(0, 30)}...');
        print('🔐 Token length: ${accessToken.length}');
        print('📡 Calling backend logout endpoint...');
        // Notify backend that user is logging out
        await _apiService.logout(accessToken);
        print('✅ Backend notified successfully\n');
      } else {
        print('⚠️  No access token found (null or empty)');
        print('   Skipping backend notification\n');
      }

      // Clear all tokens and user data from storage
      print('🗑️  Clearing local storage...');
      await _tokenStorage.clearAll();
      print('✅ Storage cleared successfully\n');
    } catch (e) {
      print('❌ Logout error: $e\n');
      print('Stack trace: $e');
      // Even if backend call fails, still clear tokens locally
      print('🗑️  Force clearing storage due to error...');
      await _tokenStorage.clearAll();
      rethrow;
    }
  }
}
