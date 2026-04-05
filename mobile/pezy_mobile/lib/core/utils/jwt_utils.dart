/// JWT Token Utilities
/// Handles JWT token decoding and validation
import 'dart:convert';
import 'package:flutter/foundation.dart';

class JwtUtils {
  /// Decode JWT token and extract payload
  /// Returns the decoded payload as Map<String, dynamic> or null if invalid
  static Map<String, dynamic>? decodeToken(String token) {
    try {
      // JWT format: header.payload.signature
      final parts = token.split('.');

      if (parts.length != 3) {
        debugPrint('Invalid JWT format - expected 3 parts, got ${parts.length}');
        return null;
      }

      // Decode the payload (second part)
      // Add padding if needed for base64url decoding
      String payload = parts[1];
      payload = payload.replaceAll('-', '+').replaceAll('_', '/');

      // Add padding
      final padLength = (4 - (payload.length % 4)) % 4;
      payload = payload + ('=' * padLength);

      final decodedBytes = base64.decode(payload);
      final decodedString = utf8.decode(decodedBytes);
      final decodedJson = jsonDecode(decodedString);

      if (decodedJson is! Map<String, dynamic>) {
        debugPrint('Decoded JWT payload is not a valid JSON object');
        return null;
      }

      return decodedJson;
    } catch (e) {
      debugPrint('Error decoding JWT: $e');
      return null;
    }
  }

  /// Check if token is expired
  /// Returns true if token is expired, false otherwise
  static bool isTokenExpired(String token) {
    try {
      final payload = decodeToken(token);

      if (payload == null) {
        return true; // Invalid token is considered expired
      }

      // Check for 'exp' claim (expiration time in seconds since epoch)
      if (payload.containsKey('exp')) {
        final exp = payload['exp'];

        if (exp is! int) {
          debugPrint('Invalid exp claim type: ${exp.runtimeType}');
          return true;
        }

        // Get current time in seconds
        final currentTime = DateTime.now().millisecondsSinceEpoch ~/ 1000;

        // Add 30 second buffer to avoid using token at the very end
        const int bufferSeconds = 30;

        final isExpired = currentTime >= (exp - bufferSeconds);

        if (isExpired) {
          final secondsOverdue = currentTime - exp;
          debugPrint('Token expired ${secondsOverdue}s ago');
        }

        return isExpired;
      }

      debugPrint('No exp claim found in token');
      return true;
    } catch (e) {
      debugPrint('Error checking token expiration: $e');
      return true;
    }
  }

  /// Get seconds until token expiration
  /// Returns remaining seconds or null if token is invalid/expired
  static int? getSecondsUntilExpiration(String token) {
    try {
      final payload = decodeToken(token);

      if (payload == null || !payload.containsKey('exp')) {
        return null;
      }

      final exp = payload['exp'] as int;
      final currentTime = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      final secondsLeft = exp - currentTime;

      if (secondsLeft <= 0) {
        return 0;
      }

      return secondsLeft;
    } catch (e) {
      debugPrint('Error getting token expiration time: $e');
      return null;
    }
  }

  /// Extract user ID from token
  /// Returns the user ID or null if not found
  static String? getUserIdFromToken(String token) {
    try {
      final payload = decodeToken(token);
      return payload?['id'] as String?;
    } catch (e) {
      debugPrint('Error extracting user ID from token: $e');
      return null;
    }
  }

  /// Extract email from token
  /// Returns the email or null if not found
  static String? getEmailFromToken(String token) {
    try {
      final payload = decodeToken(token);
      return payload?['email'] as String?;
    } catch (e) {
      debugPrint('Error extracting email from token: $e');
      return null;
    }
  }

  /// Extract role from token
  /// Returns the role or null if not found
  static String? getRoleFromToken(String token) {
    try {
      final payload = decodeToken(token);
      return payload?['role'] as String?;
    } catch (e) {
      debugPrint('Error extracting role from token: $e');
      return null;
    }
  }
}
