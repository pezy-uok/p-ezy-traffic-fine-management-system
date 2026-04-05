# Mobile-to-Backend Network Issue - macOS Debug Summary

## Problem Statement
The Flutter mobile app cannot make HTTP requests to the Node.js backend server running on port 8000 from the macOS desktop environment.

## Error Details
```
DioException [connection error]: The connection errored: Connection failed
SocketException: Connection failed (OS Error: Operation not permitted, errno = 1), 
address = 127.0.0.1, port = 8000
```

### Error Code: errno 1 (EPERM - Operation not Permitted)
This indicates the **macOS system is blocking socket creation** from the Flutter app, not a network connectivity issue.

## Root Cause
**macOS restricts network access for unsigned/unentitled desktop applications.**

When running `flutter run -d macos` in debug mode, the app runs without proper code signing and entitlements, so the system blocks outbound socket connections.

## Attempted Solutions & Results
| Solution | Result | Conclusion |
|----------|--------|-----------|
| Changed to 127.0.0.1 | Same EPERM error | Not hostname-specific |
| Changed to machine IP (192.168.1.62) | Same EPERM error | Not network routing issue |
| Backend bound to 0.0.0.0 | Socket still blocked | Not backend binding |
| Increased timeout to 10s | Same error, no timeout | True system block, not timeout |

## Conclusion
The issue is **not** a backend problem. The issue is macOS system-level security blocking the Flutter app process from making socket calls.

## Solutions

### ✅ Solution 1: Run Through Xcode (RECOMMENDED)
Running the app through Xcode applies proper entitlements and code signing:

```bash
cd mobile/pezy_mobile
open macos/Runner.xcworkspace
```

Then build and run from Xcode. This gives the app proper network permissions.

### ✅ Solution 2: Build Release Version
Release builds have proper signing:

```bash
flutter build macos
./build/macos/Build/Products/Release/pezy_mobile.app/Contents/MacOS/pezy_mobile
```

### ✅ Solution 3: Temporary Development Mode (Current)
Currently enabled `_isDevelopmentMode = true` so the app works with mock responses while you fix the signing issue.

To re-enable real backend, change in `lib/features/auth/data/services/auth_api_service.dart`:
```dart
const bool _isDevelopmentMode = true;  // ← Change to false when ready
```

### ⚠️ Solution 4: Manual Entitlements (Advanced)
Add network entitlements to `macos/Runner/DebugProfile.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
</dict>
</plist>
```

## API Configuration
The app is configured to call:
- **Base URL**: `http://localhost:8000/api/auth`
- **Endpoints**:
  - `POST /verify` - Email verification
  - `POST /request-otp` - Request OTP
  - `POST /verify-otp` - Verify OTP code

## Backend Status
✅ Running on port 8000  
✅ Listening on 0.0.0.0 (all interfaces)  
✅ Users exist in Supabase database  
✅ CORS enabled  

## Current App Status
- ✅ UI: Login and OTP screens functional  
- ✅ Validation: @pezy.gov email domain enforced  
- ✅ State Management: Riverpod correctly managing auth state  
- ⏳ Real API: Blocked by macOS security (using mocks for now)  

## Next Steps
1. **Try Solution 1** (Xcode) immediately - this should resolve the network issue
2. If Xcode doesn't work, try **Solution 3** (manual entitlements)
3. Once network works, disable development mode to test real backend OTP flow
4. Test complete auth flow: email → OTP → JWT tokens

## Testing Endpoints (for manual curl testing once network is fixed)
```bash
# When app can reach backend:
curl -X POST http://localhost:8000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "officer.bandara@pezy.gov"}'
```

## Reference
- [Flutter macOS Entitlements Documentation](https://flutter.dev/docs/development/platform-integration/macos/building)
- [macOS Code Signing Basics](https://developer.apple.com/support/code-signing/)
