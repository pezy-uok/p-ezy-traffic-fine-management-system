/// Secure token storage service
/// Handles storing and retrieving JWT tokens using secure storage
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

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

  /// Check if user is logged in (has access token)
  Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
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
