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
  // Use localStorage fallback for web
  final FlutterSecureStorage _secureStorage;
  
  // In-memory storage fallback (for web and desktop)
  static final Map<String, String> _memoryStorage = {};

  TokenStorageService({FlutterSecureStorage? secureStorage})
      : _secureStorage = secureStorage ?? const FlutterSecureStorage();

  /// Helper to write to appropriate storage backend
  Future<void> _writeToStorage(String key, String value) async {
    if (kIsWeb) {
      debugPrint('💾 [WEB] Saving to memory storage: $key');
      try {
        _memoryStorage[key] = value;
        debugPrint('   ✅ Memory storage write successful');
      } catch (e) {
        debugPrint('   ❌ Memory storage write failed: $e');
      }
    } else {
      // Mobile/Desktop: use secure storage
      await _secureStorage.write(key: key, value: value);
    }
  }

  /// Helper to read from appropriate storage backend
  Future<String?> _readFromStorage(String key) async {
    if (kIsWeb) {
      debugPrint('📖 [WEB] Reading from memory storage: $key');
      try {
        if (_memoryStorage.containsKey(key)) {
          final value = _memoryStorage[key];
          if (value != null) {
            debugPrint('   ✅ Memory storage read successful (${value.length} chars)');
            return value;
          }
        }
        debugPrint('   ❌ Memory storage key not found');
        return null;
      } catch (e) {
        debugPrint('   ❌ Memory storage read failed: $e');
        return null;
      }
    } else {
      // Mobile/Desktop: use secure storage
      return await _secureStorage.read(key: key);
    }
  }

  /// Helper to delete from appropriate storage backend
  Future<void> _deleteFromStorage(String key) async {
    if (kIsWeb) {
      try {
        _memoryStorage.remove(key);
        debugPrint('✅ Deleted $key from memory storage');
      } catch (e) {
        debugPrint('❌ Failed to delete $key from storage: $e');
      }
    } else {
      await _secureStorage.delete(key: key);
    }
  }

  /// Save tokens to secure storage
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    required String userEmail,
    required String userId,
    required String userName,
  }) async {
    try {
      debugPrint('\n💾 TOKEN STORAGE: Saving tokens...');
      await Future.wait([
        _writeToStorage(_accessTokenKey, accessToken),
        _writeToStorage(_refreshTokenKey, refreshToken),
        _writeToStorage(_userEmailKey, userEmail),
        _writeToStorage(_userIdKey, userId),
        _writeToStorage(_userNameKey, userName),
      ]);
      debugPrint('✅ All tokens saved successfully\n');
    } catch (e) {
      debugPrint('❌ Failed to save tokens: $e\n');
      throw Exception('Failed to save tokens: $e');
    }
  }

  /// Get access token from storage
  Future<String?> getAccessToken() async {
    try {
      return await _readFromStorage(_accessTokenKey);
    } catch (e) {
      debugPrint('Error reading access token: $e');
      return null;
    }
  }

  /// Get refresh token from storage
  Future<String?> getRefreshToken() async {
    try {
      return await _readFromStorage(_refreshTokenKey);
    } catch (e) {
      debugPrint('Error reading refresh token: $e');
      return null;
    }
  }

  /// Get user email from storage
  Future<String?> getUserEmail() async {
    try {
      return await _readFromStorage(_userEmailKey);
    } catch (e) {
      debugPrint('Error reading user email: $e');
      return null;
    }
  }

  /// Get user ID from storage
  Future<String?> getUserId() async {
    try {
      return await _readFromStorage(_userIdKey);
    } catch (e) {
      debugPrint('Error reading user ID: $e');
      return null;
    }
  }

  /// Get user name from storage
  Future<String?> getUserName() async {
    try {
      return await _readFromStorage(_userNameKey);
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
      debugPrint('\n🗑️  Clearing all tokens from storage...');
      await Future.wait([
        _deleteFromStorage(_accessTokenKey),
        _deleteFromStorage(_refreshTokenKey),
        _deleteFromStorage(_userEmailKey),
        _deleteFromStorage(_userIdKey),
        _deleteFromStorage(_userNameKey),
      ]);
      debugPrint('✅ All tokens cleared successfully\n');
    } catch (e) {
      debugPrint('❌ Failed to clear tokens: $e\n');
      throw Exception('Failed to clear tokens: $e');
    }
  }

  /// Delete access token only (for token refresh)
  Future<void> deleteAccessToken() async {
    try {
      await _deleteFromStorage(_accessTokenKey);
    } catch (e) {
      debugPrint('Error deleting access token: $e');
    }
  }

  /// Update access token (for token refresh)
  Future<void> updateAccessToken(String newAccessToken) async {
    try {
      await _writeToStorage(_accessTokenKey, newAccessToken);
    } catch (e) {
      throw Exception('Failed to update access token: $e');
    }
  }
}
