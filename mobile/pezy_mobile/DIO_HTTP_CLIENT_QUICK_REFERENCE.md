# Dio HTTP Client - Quick Reference

## Instant Setup

The DioClient is a **singleton** - no initialization needed! Just start using it.

```dart
import 'lib/core/network/index.dart';

final dioClient = DioClient();
```

That's it! Base URL, interceptors, and error handling are already configured.

## All HTTP Methods in 30 Seconds

```dart
// GET
final response = await dioClient.get('/users');

// GET with parameters
await dioClient.get('/users', queryParameters: {'page': 1, 'limit': 10});

// POST
await dioClient.post('/users', data: {'name': 'John', 'email': 'john@example.com'});

// PUT
await dioClient.put('/users/123', data: {'name': 'Jane'});

// PATCH
await dioClient.patch('/users/123', data: {'status': 'active'});

// DELETE
await dioClient.delete('/users/123');
```

## Authentication

```dart
// Login
final response = await dioClient.post('/auth/login', data: {
  'email': 'user@example.com',
  'password': 'password123',
});
final token = response.data['token'];

// Set token
dioClient.setAuthToken(token);

// All requests now include "Authorization: Bearer <token>"

// Check if authenticated
if (dioClient.isAuthenticated()) {
  print('User is logged in');
}

// Logout
dioClient.clearAuthToken();
```

## Error Handling

```dart
try {
  final response = await dioClient.get('/users');
  
  if (response.statusCode == 200) {
    print('Success: ${response.data}');
  } else {
    // Error response from server
    final error = response.data as NetworkError;
    print('Error: ${error.message}');
    print('Type: ${error.errorType}');
  }
} on DioException catch (e) {
  // Network/client errors
  print('Network error: ${e.message}');
}
```

## File Operations

```dart
// Upload file
await dioClient.uploadFile(
  '/upload',
  filePath: '/path/to/file.jpg',
  fileKey: 'profile_picture',
  onSendProgress: (sent, total) {
    print('Upload: ${(sent / total * 100).toStringAsFixed(0)}%');
  },
);

// Download file
await dioClient.downloadFile(
  '/download/document.pdf',
  savePath: '/path/to/save/document.pdf',
  onReceiveProgress: (received, total) {
    print('Download: ${(received / total * 100).toStringAsFixed(0)}%');
  },
);
```

## With Riverpod

```dart
import 'lib/core/providers/network_providers.dart';

class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dioClient = ref.watch(dioClientProvider);
    final isAuthenticated = ref.watch(isAuthenticatedProvider);
    
    return Text(isAuthenticated ? 'Logged in' : 'Logged out');
  }
}
```

## In Repositories

```dart
class UserRepository {
  final DioClient _dioClient;
  
  UserRepository(this._dioClient);
  
  Future<List<User>> getUsers() async {
    try {
      final response = await _dioClient.get('/users');
      if (response.statusCode == 200) {
        return (response.data as List)
            .map((json) => User.fromJson(json))
            .toList();
      }
      throw Exception('Failed to load users');
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    }
  }
}
```

## Type-Safe Requests

```dart
// With model
final response = await dioClient.get<User>('/users/123');
final user = response.data; // Already typed as User

// With list
final response = await dioClient.get<List<User>>('/users');
final users = response.data; // List<User>
```

## Custom Options

```dart
// Custom timeout
await dioClient.get(
  '/long-operation',
  options: Options(
    receiveTimeout: const Duration(minutes: 5),
  ),
);

// Custom headers
await dioClient.post(
  '/api/endpoint',
  data: {...},
  options: Options(
    headers: {'X-Custom-Header': 'value'},
  ),
);
```

## Change Base URL

```dart
// Switch to different server
dioClient.setBaseUrl('https://staging-api.pezy.com/api');

// All subsequent requests use new URL
final response = await dioClient.get('/users');
```

## Debug Logging

Check console output when running in debug mode:

```
━━━━━━━━━━━━━━━━━━ REQUEST ━━━━━━━━━━━━━━━━━━
🔹 Method: GET
🔹 URL: http://localhost:3000/api/users
🔹 Headers: {Authorization: Bearer ...}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Disable logging in production via `lib/config/app_config.dart`:
```dart
static const bool enableDebugLogging = false;
```

## Common Error Messages

| Error | Solution |
| ----- | --------- |
| Connection refused | Check backend is running and base URL is correct |
| Unauthorized (401) | Token expired or invalid - login again |
| Not Found (404) | Check endpoint URL |
| Too Many Requests (429) | Wait before retrying |
| Service Unavailable (503) | Server is down - retry later |

## API Endpoints

See `lib/config/app_config.dart` for all available endpoint constants:

```dart
AppConfig.loginEndpoint              // '/auth/login'
AppConfig.signupEndpoint             // '/auth/signup'
AppConfig.userProfileEndpoint        // '/users/profile'
AppConfig.dashboardEndpoint          // '/dashboard'
// ... and more
```

## Singleton Guarantee

```dart
final dioClient1 = DioClient();
final dioClient2 = DioClient();

// Same instance!
assert(identical(dioClient1, dioClient2)); // ✅ true
```

## Timeout Configuration

```dart
// Current: 30 seconds for all operations
// Change in lib/config/app_config.dart:

static const int connectionTimeoutMs = 30000;
static const int receiveTimeoutMs = 30000;
static const int sendTimeoutMs = 30000;
```

## Features at a Glance

- ✅ Singleton pattern
- ✅ Base URL pre-configured
- ✅ Automatic logging (debug mode)
- ✅ Automatic error standardization
- ✅ Automatic token management
- ✅ Type-safe responses
- ✅ File upload/download
- ✅ Progress tracking
- ✅ Request cancellation
- ✅ Custom headers/options
- ✅ Riverpod integration ready

## See Also

- **Full Documentation:** `DIO_HTTP_CLIENT.md`
- **Implementation Details:** `DIO_HTTP_CLIENT_SUMMARY.md`
- **Config Reference:** `lib/config/app_config.dart`
- **Network Providers:** `lib/core/providers/network_providers.dart`

---

**Quick Tip:** Most common task is `const response = await DioClient().get('/users');` - that's it!
