/// JWT Token validation utilities
/// Decodes and validates JWT tokens without external dependencies

class JwtUtils {
  /// Decode JWT payload without verification (for client-side checks only)
  /// JWT format: header.payload.signature
  static Map<String, dynamic>? decodeToken(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) {
        print('❌ JWT: Invalid format - expected 3 parts, got ${parts.length}');
        return null;
      }

      // Decode payload (second part)
      final payload = parts[1];
      
      // Add padding if needed
      final padded = payload + '=' * (4 - payload.length % 4);
      
      // Base64 URL decode
      final normalized = padded.replaceAll('-', '+').replaceAll('_', '/');
      final decoded = Uri.parse('data:application/octet-stream;base64,$normalized').data?.contentAsString();
      
      if (decoded == null) {
        print('❌ JWT: Failed to base64 decode payload');
        return null;
      }

      // Parse JSON
      final json = _parseJson(decoded);
      if (json == null) {
        print('❌ JWT: Failed to parse JSON payload');
        return null;
      }

      return json;
    } catch (e) {
      print('❌ JWT Decode Error: $e');
      return null;
    }
  }

  /// Check if token is expired
  /// Returns: true if expired, false if valid
  static bool isTokenExpired(String token) {
    try {
      final payload = decodeToken(token);
      if (payload == null) {
        print('❌ JWT: Could not decode token to check expiration');
        return true; // Treat as expired if can't decode
      }

      // Check for 'exp' claim (expiration time in seconds since epoch)
      final exp = payload['exp'];
      if (exp == null) {
        print('⚠️  JWT: No exp claim found - treating as valid');
        return false; // No expiration claim = always valid
      }

      final int expiresAt = exp is int ? exp : int.tryParse(exp.toString()) ?? 0;
      final int now = DateTime.now().millisecondsSinceEpoch ~/ 1000;

      final isExpired = now > expiresAt;
      
      if (isExpired) {
        final expireDate = DateTime.fromMillisecondsSinceEpoch(expiresAt * 1000);
        print('⏰ JWT: Token expired at $expireDate (was ${now - expiresAt} seconds ago)');
      } else {
        final expireDate = DateTime.fromMillisecondsSinceEpoch(expiresAt * 1000);
        final secondsLeft = expiresAt - now;
        print('✅ JWT: Token valid for ${secondsLeft}s (expires at $expireDate)');
      }

      return isExpired;
    } catch (e) {
      print('❌ JWT Expiration Check Error: $e');
      return true; // Treat as expired on error
    }
  }

  /// Get token expiration time as DateTime
  static DateTime? getTokenExpirationTime(String token) {
    try {
      final payload = decodeToken(token);
      if (payload == null) return null;

      final exp = payload['exp'];
      if (exp == null) return null;

      final int expiresAt = exp is int ? exp : int.tryParse(exp.toString()) ?? 0;
      return DateTime.fromMillisecondsSinceEpoch(expiresAt * 1000);
    } catch (e) {
      print('❌ JWT: Error getting expiration time: $e');
      return null;
    }
  }

  /// Get seconds remaining until token expires
  static int? getSecondsUntilExpiration(String token) {
    try {
      final payload = decodeToken(token);
      if (payload == null) return null;

      final exp = payload['exp'];
      if (exp == null) return null;

      final int expiresAt = exp is int ? exp : int.tryParse(exp.toString()) ?? 0;
      final int now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      
      return expiresAt - now;
    } catch (e) {
      print('❌ JWT: Error calculating seconds until expiration: $e');
      return null;
    }
  }

  /// Extract user ID from token
  static String? getUserIdFromToken(String token) {
    try {
      final payload = decodeToken(token);
      return payload?['id'] as String?;
    } catch (e) {
      print('❌ JWT: Error extracting user ID: $e');
      return null;
    }
  }

  /// Extract email from token
  static String? getEmailFromToken(String token) {
    try {
      final payload = decodeToken(token);
      return payload?['email'] as String?;
    } catch (e) {
      print('❌ JWT: Error extracting email: $e');
      return null;
    }
  }

  /// Simple JSON parser without external dependencies
  static Map<String, dynamic>? _parseJson(String jsonString) {
    try {
      // Remove outer braces
      final trimmed = jsonString.trim();
      if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
        return null;
      }

      final content = trimmed.substring(1, trimmed.length - 1);
      final map = <String, dynamic>{};

      // Simple key-value pair extraction
      // This is a basic parser for common JWT structures
      // For more complex JSON, consider using a real JSON library
      
      // Split by comma (basic, may not work for all JSON)
      final pairs = _smartSplit(content, ',');
      
      for (final pair in pairs) {
        final colonIndex = pair.indexOf(':');
        if (colonIndex == -1) continue;

        final keyPart = pair.substring(0, colonIndex).trim();
        final valuePart = pair.substring(colonIndex + 1).trim();

        // Extract key (remove quotes)
        final key = keyPart.replaceAll('"', '').replaceAll("'", '');

        // Parse value
        dynamic value;
        if (valuePart == 'null') {
          value = null;
        } else if (valuePart == 'true') {
          value = true;
        } else if (valuePart == 'false') {
          value = false;
        } else if (valuePart.startsWith('"') && valuePart.endsWith('"')) {
          value = valuePart.substring(1, valuePart.length - 1);
        } else if (valuePart.startsWith('[') || valuePart.startsWith('{')) {
          // Skip nested structures for now
          continue;
        } else {
          // Try parsing as number
          value = int.tryParse(valuePart) ?? double.tryParse(valuePart) ?? valuePart;
        }

        map[key] = value;
      }

      return map.isEmpty ? null : map;
    } catch (e) {
      print('❌ JSON Parse Error: $e');
      return null;
    }
  }

  /// Smart split that respects quotes
  static List<String> _smartSplit(String input, String delimiter) {
    final parts = <String>[];
    final buffer = StringBuffer();
    bool inQuotes = false;
    bool inBraces = false;

    for (int i = 0; i < input.length; i++) {
      final char = input[i];

      if (char == '"' && (i == 0 || input[i - 1] != '\\')) {
        inQuotes = !inQuotes;
      } else if (char == '{' && !inQuotes) {
        inBraces = true;
      } else if (char == '}' && !inQuotes) {
        inBraces = false;
      }

      if (char == delimiter && !inQuotes && !inBraces) {
        parts.add(buffer.toString());
        buffer.clear();
        continue;
      }

      buffer.write(char);
    }

    if (buffer.isNotEmpty) {
      parts.add(buffer.toString());
    }

    return parts;
  }
}
