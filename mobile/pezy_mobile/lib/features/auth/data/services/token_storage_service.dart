/// Secure token storage service
/// Handles storing and retrieving JWT tokens using secure storage
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/utils/jwt_utils.dart';

class TokenStorageService {
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userEmailKey = 'user_email';
  static const String _userIdKey = 'user_id';
  static const String _userNameKey = 'user_name';

  // Use flutter_secure_storage for Android/iOS
  // For desktop/web, this will need different implementation
  final FlutterSecureStorage _secureStorage;

  TokenStorageService({FlutterSecureStorage? secureStorage})
      : _secureStorage = secureStorage ?? const FlutterSecureStorage();

  /// Save tokens to secure storage
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    required String userEmail,
    required String userId,
    required String userName,
  }) async {
    try {
      await Future.wait([
        _secureStorage.write(key: _accessTokenKey, value: accessToken),
        _secureStorage.write(key: _refreshTokenKey, value: refreshToken),
        _secureStorage.write(key: _userEmailKey, value: userEmail),
        _secureStorage.write(key: _userIdKey, value: userId),
        _secureStorage.write(key: _userNameKey, value: userName),
      ]);
    } catch (e) {
      throw Exception('Failed to save tokens: $e');
    }
  }

  /// Get access token from storage
  Future<String?> getAccessToken() async {
    try {
      return await _secureStorage.read(key: _accessTokenKey);
    } catch (e) {
      debugPrint('Error reading access token: $e');
      return null;
    }
  }

  /// Get refresh token from storage
  Future<String?> getRefreshToken() async {
    try {
      return await _secureStorage.read(key: _refreshTokenKey);
    } catch (e) {
      debugPrint('Error reading refresh token: $e');
      return null;
    }
  }

  /// Get user email from storage
  Future<String?> getUserEmail() async {
    try {
      return await _secureStorage.read(key: _userEmailKey);
    } catch (e) {
      debugPrint('Error reading user email: $e');
      return null;
    }
  }

  /// Get user ID from storage
  Future<String?> getUserId() async {
    try {
      return await _secureStorage.read(key: _userIdKey);
    } catch (e) {
      debugPrint('Error reading user ID: $e');
      return null;
    }
  }

  /// Get user name from storage
  Future<String?> getUserName() async {
    try {
      return await _secureStorage.read(key: _userNameKey);
    } catch (e) {
      debugPrint('Error reading user name: $e');
      return null;
    }
  }

  /// Check if user is logged in (has valid, non-expired access token)
  /// Validates JWT token expiration on the client side
  Future<bool> isLoggedIn() async {
    try {
      debugPrint('\n🔐 TOKEN STORAGE: Checking if logged in...');
      
      final token = await getAccessToken();
      
      if (token == null || token.isEmpty) {
        debugPrint('   ❌ No access token found in storage\n');
        return false;
      }

      debugPrint('   ✅ Access token found: ${token.substring(0, 20)}...');

      // Validate token format and expiration
      debugPrint('   🔍 Validating JWT format...');
      final payload = JwtUtils.decodeToken(token);
      if (payload == null) {
        debugPrint('   ❌ Invalid JWT format - clearing storage\n');
        await clearAll(); // Clear invalid token
        return false;
      }

      debugPrint('   ✅ JWT format valid. User ID: ${payload['id']}');

      // Check token expiration
      debugPrint('   ⏰ Checking token expiration...');
      final isExpired = JwtUtils.isTokenExpired(token);
      
      if (isExpired) {
        debugPrint('   ⏱️  Token has expired - clearing storage\n');
        await clearAll(); // Clear expired token
        return false;
      }

      // Get time remaining
      final secondsLeft = JwtUtils.getSecondsUntilExpiration(token);
      if (secondsLeft != null) {
        final minutes = secondsLeft ~/ 60;
        debugPrint('   ✅ Token valid - expires in ${minutes}min (${secondsLeft}s)\n');
      }

      return true;
    } catch (e) {
      debugPrint('   ❌ Error checking login status: $e\n');
      return false;
    }
  }

  /// Clear all tokens and user data (logout)
  Future<void> clearAll() async {
    try {
      await Future.wait([
        _secureStorage.delete(key: _accessTokenKey),
        _secureStorage.delete(key: _refreshTokenKey),
        _secureStorage.delete(key: _userEmailKey),
        _secureStorage.delete(key: _userIdKey),
        _secureStorage.delete(key: _userNameKey),
      ]);
    } catch (e) {
      throw Exception('Failed to clear tokens: $e');
    }
  }

  /// Delete access token only (for token refresh)
  Future<void> deleteAccessToken() async {
    try {
      await _secureStorage.delete(key: _accessTokenKey);
    } catch (e) {
      debugPrint('Error deleting access token: $e');
    }
  }

  /// Update access token (for token refresh)
  Future<void> updateAccessToken(String newAccessToken) async {
    try {
      await _secureStorage.write(key: _accessTokenKey, value: newAccessToken);
    } catch (e) {
      throw Exception('Failed to update access token: $e');
    }
  }
}
