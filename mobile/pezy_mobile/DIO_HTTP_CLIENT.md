# Dio HTTP Client Documentation

## Overview

The Dio HTTP client is the network layer of the Pezy Mobile app. It provides a configured HTTP client with base URL, interceptors for logging, error handling, and authentication token management.

**Key Files:**
- `lib/core/network/dio_client.dart` - Main Dio client
- `lib/core/network/interceptors/logging_interceptor.dart` - Request/response logging
- `lib/core/network/interceptors/error_interceptor.dart` - Error handling
- `lib/core/network/interceptors/auth_interceptor.dart` - Authentication token management
- `lib/config/app_config.dart` - Configuration constants
- `lib/core/providers/network_providers.dart` - Riverpod providers

## Architecture

```
DioClient (Singleton)
├── Dio Instance
├── LoggingInterceptor (Debug logging)
├── ErrorInterceptor (Error handling)
└── AuthInterceptor (Token management)
```

## Setup

### 1. Configure Base URL

Edit `lib/config/app_config.dart` to set your API base URL:

```dart
static const String apiBaseUrl = 'http://localhost:3000/api';
```

Supported formats:
- Development: `http://localhost:3000/api`
- Staging: `https://staging-api.pezy.com/api`
- Production: `https://api.pezy.com/api`

### 2. Configure Timeouts

Adjust timeout values in `lib/config/app_config.dart`:

```dart
static const int connectionTimeoutMs = 30000;  // 30 seconds
static const int receiveTimeoutMs = 30000;
static const int sendTimeoutMs = 30000;
```

### 3. Initialize in Main App

The DioClient is a singleton and automatically initializes on first access. No additional setup needed!

## Usage

### Basic GET Request

```dart
import 'lib/core/network/index.dart';

final dioClient = DioClient();
final response = await dioClient.get('/users');
print(response.data);
```

### POST Request with Data

```dart
final response = await dioClient.post(
  '/auth/login',
  data: {
    'email': 'user@example.com',
    'password': 'password123',
  },
);
```

### With Query Parameters

```dart
final response = await dioClient.get(
  '/users',
  queryParameters: {
    'page': 1,
    'limit': 10,
    'search': 'john',
  },
);
```

### All HTTP Methods

```dart
// GET
final get = await dioClient.get('/path');

// POST
final post = await dioClient.post('/path', data: {...});

// PUT
final put = await dioClient.put('/path', data: {...});

// PATCH
final patch = await dioClient.patch('/path', data: {...});

// DELETE
final delete = await dioClient.delete('/path');
```

### File Upload

```dart
await dioClient.uploadFile(
  '/upload',
  filePath: '/path/to/file.jpg',
  fileKey: 'profile_picture',
  fileName: 'avatar.jpg',
  otherData: {
    'user_id': '123',
  },
  onSendProgress: (sent, total) {
    print('Upload progress: ${(sent / total * 100).toStringAsFixed(2)}%');
  },
);
```

### File Download

```dart
await dioClient.downloadFile(
  '/download/document.pdf',
  savePath: '/path/to/save/document.pdf',
  onReceiveProgress: (received, total) {
    print('Download progress: ${(received / total * 100).toStringAsFixed(2)}%');
  },
);
```

## Interceptors

### LoggingInterceptor

Automatically logs all HTTP requests and responses in debug mode.

**Output Example:**
```
━━━━━━━━━━━━━━━━━━ REQUEST ━━━━━━━━━━━━━━━━━━
🔹 Method: GET
🔹 URL: http://localhost:3000/api/users
🔹 Headers: {Authorization: Bearer token...}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━ RESPONSE ━━━━━━━━━━━━━━━━━
✅ Status Code: 200
✅ URL: http://localhost:3000/api/users
✅ Data: [...]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━ ERROR ━━━━━━━━━━━━━━━━━━
❌ Error Type: badResponse
❌ Status Code: 404
❌ URL: http://localhost:3000/api/users/999
❌ Message: Not Found
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ErrorInterceptor

Standardizes all network errors into `NetworkError` instances.

**Handled Error Types:**

| HTTP Code | Error Type | Message |
| --------- | ---------- | ------- |
| 400 | BAD_REQUEST | Invalid request. Please check your input. |
| 401 | UNAUTHORIZED | Unauthorized. Please login again. |
| 403 | FORBIDDEN | You do not have permission to access this resource. |
| 404 | NOT_FOUND | The requested resource was not found. |
| 409 | CONFLICT | The request conflicts with existing data. |
| 422 | UNPROCESSABLE_ENTITY | Validation failed. Please check your input. |
| 429 | TOO_MANY_REQUESTS | Too many requests. Please try again later. |
| 500 | INTERNAL_SERVER_ERROR | Server error. Please try again later. |
| 502 | BAD_GATEWAY | Service temporarily unavailable. Please try again. |
| 503 | SERVICE_UNAVAILABLE | Service unavailable. Please try again later. |

**Network Error Types:**

- `CONNECTION_TIMEOUT` - Connection timed out
- `SEND_TIMEOUT` - Request send timed out
- `RECEIVE_TIMEOUT` - Response receive timed out
- `REQUEST_CANCELLED` - Request was cancelled
- `UNKNOWN_ERROR` - Unknown error occurred
- `BAD_CERTIFICATE` - SSL certificate validation failed
- `CONNECTION_ERROR` - Connection error

### AuthInterceptor

Manages authentication tokens and automatically adds them to requests.

```dart
// Set token after login
final dioClient = DioClient();
dioClient.setAuthToken('your_jwt_token');

// Check if authenticated
if (dioClient.isAuthenticated()) {
  print('User is authenticated');
}

// Clear token on logout
dioClient.clearAuthToken();

// Get current token
final token = dioClient.getAuthToken();
```

**Token Header Format:**
```
Authorization: Bearer <token>
```

**How it works:**
1. Token is added to all requests automatically
2. On 401 response, token is cleared
3. Login/signup endpoints return new token
4. Token is stored in memory (not persistent - handle in your auth service)

## Using with Riverpod

### Access DioClient

```dart
import 'lib/core/providers/network_providers.dart';

// In a widget or provider
final dioClient = ref.watch(dioClientProvider);
await dioClient.get('/users');
```

### Check Authentication Status

```dart
final isAuthenticated = ref.watch(isAuthenticatedProvider);

if (isAuthenticated) {
  // Show authenticated UI
} else {
  // Show login UI
}
```

### Get Auth Token

```dart
final token = ref.watch(authTokenProvider);
print('Current token: $token');
```

## Error Handling

### Catch and Handle Errors

```dart
try {
  final response = await dioClient.get('/users');
  if (response.statusCode == 200) {
    print('Success: ${response.data}');
  } else {
    // Handle error response
    final error = response.data as NetworkError;
    print('Error: ${error.message}');
  }
} on DioException catch (e) {
  if (e.error is NetworkError) {
    final networkError = e.error as NetworkError;
    print('Network error: ${networkError.message}');
    print('Error type: ${networkError.errorType}');
  }
}
```

### In Repositories

```dart
class UserRepository {
  final DioClient _dioClient;

  UserRepository(this._dioClient);

  Future<List<User>> getUsers() async {
    try {
      final response = await _dioClient.get('/users');
      
      if (response.statusCode == 200) {
        // Parse users
        return (response.data as List)
            .map((json) => User.fromJson(json))
            .toList();
      } else {
        throw Exception('Failed to load users');
      }
    } on DioException catch (e) {
      if (e.error is NetworkError) {
        final error = e.error as NetworkError;
        rethrow; // Or handle it
      }
      rethrow;
    }
  }
}
```

## Configuration Examples

### Development Environment

```dart
// lib/config/app_config.dart
static const String apiBaseUrl = 'http://localhost:3000/api';
static const bool enableDebugLogging = true;
```

### Production Environment

```dart
// lib/config/app_config.dart
static const String apiBaseUrl = 'https://api.pezy.com/api';
static const bool enableDebugLogging = false;
```

### Custom Timeout

```dart
// For a specific request with custom timeout
final response = await dioClient.get(
  '/long-running-operation',
  options: Options(
    receiveTimeout: const Duration(seconds: 60),
    sendTimeout: const Duration(seconds: 60),
  ),
);
```

## Adding Custom Interceptors

### Create Custom Interceptor

```dart
class CustomInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Add custom header
    options.headers['X-Custom-Header'] = 'value';
    handler.next(options);
  }
}
```

### Register with DioClient

```dart
final dioClient = DioClient();
dioClient.addInterceptor(CustomInterceptor());
```

## Common Patterns

### Authentication Flow

```dart
// 1. User logs in
final loginResponse = await dioClient.post(
  '/auth/login',
  data: {'email': email, 'password': password},
);

if (loginResponse.statusCode == 200) {
  final token = loginResponse.data['token'];
  
  // 2. Store token
  dioClient.setAuthToken(token);
  
  // 3. All subsequent requests include token automatically
  final userResponse = await dioClient.get('/users/profile');
}
```

### Logout Flow

```dart
// Clear token
dioClient.clearAuthToken();

// All subsequent requests will NOT include token
// Server returns 401 for protected endpoints
```

### Retry Failed Requests

```dart
import 'package:dio/dio.dart';

Future<Response> retryRequest(
  Future<Response> Function() request, {
  int maxRetries = 3,
}) async {
  int retries = 0;
  
  while (true) {
    try {
      return await request();
    } catch (e) {
      retries++;
      if (retries >= maxRetries) rethrow;
      
      // Wait before retrying
      await Future.delayed(Duration(milliseconds: 1000 * retries));
    }
  }
}

// Usage
final response = await retryRequest(
  () => dioClient.get('/users'),
  maxRetries: 3,
);
```

### Rate Limiting

```dart
// The error interceptor already handles 429 (Too Many Requests)
// Implementation will depend on your app's needs

// Example: Implement exponential backoff
Future<Response> requestWithBackoff(
  Future<Response> Function() request,
) async {
  int delay = 1000; // Start with 1 second
  
  while (true) {
    try {
      return await request();
    } on DioException catch (e) {
      if (e.response?.statusCode == 429) {
        await Future.delayed(Duration(milliseconds: delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      rethrow;
    }
  }
}
```

## Best Practices

1. **Always Use DioClient Singleton**
   ```dart
   final dioClient = DioClient(); // Returns same instance every time
   ```

2. **Handle NetworkError Specifically**
   ```dart
   if (error is NetworkError) {
     print('${error.errorType}: ${error.message}');
   }
   ```

3. **Use Riverpod Providers**
   ```dart
   // Access through providers, not directly
   final dioClient = ref.watch(dioClientProvider);
   ```

4. **Check Response Status Code**
   ```dart
   // Don't assume 200 means success
   if (response.statusCode == 200) { /* ... */ }
   ```

5. **Implement Proper Token Refresh**
   ```dart
   // In your auth service/provider
   // Refresh token when near expiry, not just on 401
   ```

6. **Use Type-Safe Responses**
   ```dart
   // Define models for responses
   final response = await dioClient.get<List<User>>('/users');
   ```

7. **Log Important Information**
   ```dart
   // LoggingInterceptor handles this in debug mode
   // Don't log sensitive data in production
   ```

8. **Validate Input Before Requests**
   ```dart
   // Validate email, password, etc before sending
   if (!email.contains('@')) return;
   ```

## Troubleshooting

### "Connection refused" Error

- Check if backend server is running
- Verify correct base URL in `AppConfig`
- Check firewall/network settings

### "Unauthorized" (401) Error

- Token might be expired
- Implement token refresh logic
- Check token format: `Bearer <token>`

### "Too many requests" (429) Error

- Implement exponential backoff
- Check API rate limits
- Limit concurrent requests

### No Debug Logs Appearing

- Check `enableDebugLogging` in `AppConfig`
- Ensure running in debug mode
- Check console output (not just IDE)

### Timeout Errors

- Increase timeout values if endpoint is slow
- Check network connection
- Verify request size for large uploads

## API Endpoints Reference

```dart
// See lib/config/app_config.dart for full list

// Auth
POST   /auth/login
POST   /auth/signup
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password

// Users
GET    /users/profile
PUT    /users/profile/update
GET    /users
GET    /users/{id}

// Dashboard
GET    /dashboard
GET    /dashboard/stats

// Messages
GET    /messages
GET    /conversations
```

## Performance Tips

1. **Use CancelToken for Cancellable Requests**
   ```dart
   final cancelToken = CancelToken();
   
   final response = await dioClient.get(
     '/users',
     cancelToken: cancelToken,
   );
   
   // Cancel if needed
   cancelToken.cancel('Request cancelled');
   ```

2. **Monitor Progress for Large Uploads/Downloads**
   ```dart
   // See "File Upload" and "File Download" sections
   ```

3. **Use Appropriate HTTP Methods**
   - GET for fetching data
   - POST for creating
   - PUT/PATCH for updating
   - DELETE for removal

4. **Batch API Calls Efficiently**
   ```dart
   // Sequential
   final user = await dioClient.get('/users/123');
   final posts = await dioClient.get('/users/123/posts');
   
   // Parallel
   final results = await Future.wait([
     dioClient.get('/users/123'),
     dioClient.get('/users/123/posts'),
   ]);
   ```

## Next Steps

1. Create Repository classes that use DioClient
2. Implement authentication service with token management
3. Create API models for type-safe responses
4. Add error recovery strategies
5. Integrate with Riverpod for state management

---

**Last Updated:** March 2026  
**Version:** 1.0  
**Status:** Production Ready
