/// JWT Token Management Guide
///
/// This file documents how JWT tokens are saved, stored, and used in the PEZY mobile app.
///
/// ============================================================================
/// 1. TOKEN SAVING FLOW
/// ============================================================================
///
/// Step 1: OTP Verification
/// When user enters OTP in OtpVerificationScreen:
/// - Calls otpNotifier.verifyOtp()
/// - OTP notifier calls authRepository.verifyOtp(temporaryId, otp)
/// - Backend returns: { accessToken, refreshToken, user }
///
/// Step 2: Secure Storage
/// In auth_repository.dart, verifyOtp() method:
/// ```dart
/// await _tokenStorage.saveTokens(
///   accessToken: response.accessToken!,
///   refreshToken: response.refreshToken!,
///   userEmail: response.user!.email,
///   userId: response.user!.id,
///   userName: response.user!.name,
/// );
/// ```
/// - Uses flutter_secure_storage (encrypted on device)
/// - Saves: accessToken, refreshToken, userEmail, userId, userName
/// - Data persists across app restarts
///
/// Step 3: Auth State Update
/// In otp_verification_screen.dart, _handleVerifyOtp():
/// ```dart
/// final authNotifier = ref.read(authProvider.notifier);
/// authNotifier.setAuthenticatedUser(
///   id: userId,
///   email: userEmail,
///   name: userName,
///   role: 'police_officer',
///   accessToken: accessToken,
/// );
/// ```
/// - Updates global auth state
/// - Makes user data available throughout app
/// - Signals app that user is authenticated
///
/// ============================================================================
/// 2. TOKEN STORAGE LOCATION
/// ============================================================================
///
/// File: lib/features/auth/data/services/token_storage_service.dart
///
/// Keys stored in flutter_secure_storage:
/// - 'access_token'   → JWT access token (short-lived, 15 min default)
/// - 'refresh_token'  → JWT refresh token (long-lived, 7 days)
/// - 'user_email'     → Logged-in user's email
/// - 'user_id'        → Logged-in user's ID
/// - 'user_name'      → Logged-in user's name
///
/// Platform Implementation:
/// - iOS: Stored in Keychain (encrypted)
/// - Android: Stored in EncryptedSharedPreferences (encrypted)
/// - Web: localStorage (requires additional HTTPS + encryption)
/// - macOS: Stored in Keychain (encrypted)
///
/// ============================================================================
/// 3. ACCESSING TOKENS
/// ============================================================================
///
/// Option A: Using TokenStorageService directly
/// ```dart
/// final tokenStorage = ref.watch(tokenStorageServiceProvider);
/// final token = await tokenStorage.getAccessToken();
/// ```
///
/// Option B: Using Convenience Providers
/// ```dart
/// final accessToken = ref.watch(accessTokenProvider);
/// final user = ref.watch(currentUserProvider);
/// final isLoggedIn = ref.watch(isLoggedInProvider);
/// ```
///
/// Option C: Reading from AuthState
/// ```dart
/// final authState = ref.watch(authProvider);
/// final user = authState.user;
/// final token = authState.accessToken;
/// ```
///
/// ============================================================================
/// 4. USING TOKENS IN API CALLS
/// ============================================================================
///
/// Automatic Injection via AuthInterceptor:
/// File: lib/features/auth/data/services/auth_interceptor.dart
///
/// When making HTTP requests with authenticated Dio client:
/// 1. Create Dio with auth interceptor: `createAuthenticatedDio(tokenStorage)`
/// 2. Interceptor automatically:
///    - On every request: Adds 'Authorization: Bearer <token>' header
///    - On 401 error: Clears invalid tokens (token expired)
///
/// Example in API Service:
/// ```dart
/// final dio = createAuthenticatedDio(tokenStorage);
/// final response = await dio.get('/protected-endpoint');
/// // Token is automatically added to Authorization header
/// ```
///
/// ============================================================================
/// 5. CHECKING LOGIN STATUS ON APP STARTUP
/// ============================================================================
///
/// In main.dart or top-level widget:
/// ```dart
/// @override
/// void initState() {
///   super.initState();
///   Future.microtask(() {
///     ref.read(authProvider.notifier).checkAuthStatus();
///   });
/// }
/// ```
///
/// This method:
/// - Reads tokens from secure storage
/// - Checks if access token exists
/// - Updates global auth state if logged in
/// - Allows app to restore session on restart
///
/// ============================================================================
/// 6. LOGOUT
/// ============================================================================
///
/// Call logout:
/// ```dart
/// await ref.read(authProvider.notifier).logout();
/// ```
///
/// Effects:
/// - Calls authRepository.logout()
/// - Deletes all tokens from secure storage
/// - Clears global auth state
/// - User is redirected to login screen
///
/// ============================================================================
/// 7. TOKEN REFRESH (Optional - TODO)
/// ============================================================================
///
/// When access token expires (401 response):
/// Current: User must login again
/// Recommended implementation:
/// - Store refreshToken in secure storage (✓ already doing this)
/// - Implement refresh endpoint: POST /api/auth/refresh-token
/// - Create refresh interceptor to:
///   1. Catch 401 responses
///   2. Call refresh endpoint with refreshToken
///   3. Save new accessToken
///   4. Retry original request
///
/// ============================================================================
/// 8. SECURITY BEST PRACTICES IMPLEMENTED
/// ============================================================================
///
/// ✓ Tokens stored in encrypted secure storage (not SharedPreferences)
/// ✓ Tokens never logged or printed to console
/// ✓ Tokens automatically included in Authorization header
/// ✓ 401 responses trigger token deletion
/// ✓ Tokens cleared on logout
/// ✓ No tokens in URL parameters
/// ✓ No tokens in plain http://localhost (should use HTTPS in production)
///
/// TODO for Production:
/// - Use HTTPS instead of HTTP
/// - Implement token refresh mechanism
/// - Add token expiry checking
/// - Implement certificate pinning
/// - Add request/response logging with token redaction
///
/// ============================================================================
/// 9. DEPENDENCIES REQUIRED IN pubspec.yaml
/// ============================================================================
///
/// dependencies:
///   flutter:
///     sdk: flutter
///   flutter_riverpod: ^2.4.0
///   flutter_secure_storage: ^8.0.0
///   dio: ^5.0.0
///
/// ============================================================================
