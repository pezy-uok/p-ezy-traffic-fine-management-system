# 📡 Network Connectivity Detection Implementation

## Overview

This document describes the network connectivity detection feature implemented using `connectivity_plus` package with Riverpod state management.

---

## 🏗️ Architecture

### Files Created/Modified

#### 1. **Core Service Layer**
- `lib/core/network/connectivity_service.dart` - Connectivity monitoring service
  - Real-time network status monitoring
  - Connection type detection (WiFi, Mobile, etc.)
  - Singleton pattern for app-wide access

#### 2. **State Management (Riverpod)**
- `lib/core/providers/connectivity_provider.dart` - Connectivity providers
  - `connectivityProvider` - Stream provider for real-time status
  - `isOnlineProvider` - Simple boolean for online/offline state
  - `connectionTypeProvider` - Current connection type
  - `connectivityServiceProvider` - Service singleton

#### 3. **Network Integration**
- `lib/core/network/interceptors/connectivity_interceptor.dart` - Dio interceptor
  - Checks connectivity before API requests
  - Throws custom error if offline
  - Added to DioClient interceptor chain

#### 4. **UI Components**
- `lib/shared/widgets/connectivity_status_banner.dart` - UI widgets
  - `ConnectivityStatusBanner` - Full banner with status
  - `ConnectivityIconIndicator` - Compact icon indicator
  - Helper functions for dialogs and snackbars

#### 5. **Integration**
- `lib/presentation/shell/main_navigation_screen.dart` - Main app shell
  - ConnectivityStatusBanner added to top of app
  - Visible across all screens

---

## 🎯 Features Implemented

### 1. **Real-time Connectivity Monitoring**
```dart
final status = ref.watch(connectivityProvider);
// status.isConnected - boolean
// status.connectionType - ConnectivityResult
// status.connectionTypeName - "WiFi", "Mobile", "No Connection"
```

### 2. **Visual Indicators**
- **Online**: Green banner showing connection type
- **Offline**: Red banner with offline message
- **Icon Indicator**: Compact cloud icon showing status

### 3. **API Request Protection**
- ConnectivityInterceptor prevents requests when offline
- Friendly error messages instead of connection timeouts
- Automatic retry handling in error interceptor

### 4. **User Notifications**
- `showOfflineDialog()` - Show offline alert dialog
- `showOfflineSnackbar()` - Show offline snackbar notification
- `showBackOnlineSnackbar()` - Notify when back online

---

## 💻 Usage Examples

### Example 1: Check Connectivity in Widget
```dart
class MyScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Get connectivity status
    final status = ref.watch(connectivityProvider);
    
    return status.when(
      data: (connectivity) {
        if (connectivity.isConnected) {
          return Text('Online via ${connectivity.connectionTypeName}');
        } else {
          return const Text('You are offline');
        }
      },
      loading: () => const CircularProgressIndicator(),
      error: (error, _) => const Text('Connection check failed'),
    );
  }
}
```

### Example 2: Simple Online Check
```dart
class MyScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOnline = ref.watch(isOnlineProvider);
    
    return ElevatedButton(
      onPressed: isOnline ? () => fetchData() : null,
      child: const Text('Fetch Data'),
    );
  }
}
```

### Example 3: Handle API Call Offline
```dart
try {
  final response = await dioClient.get('/api/criminals');
} on DioException catch (e) {
  if (e.message?.contains('No internet connection') ?? false) {
    showOfflineDialog(context);
  } else {
    // Handle other errors
  }
}
```

### Example 4: Monitor Connectivity Changes
```dart
final service = ConnectivityService();

service.connectivityStream.listen((result) {
  if (result == ConnectivityResult.none) {
    print('Lost connection!');
  } else {
    print('Connected via: ${service.getConnectionTypeName(result)}');
  }
});
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────┐
│  Main App - MainNavigationScreen        │
│  ┌───────────────────────────────────┐  │
│  │ ConnectivityStatusBanner (UI)    │  │ ← Real-time status display
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Navigation & Screens              │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
           ▲                         ▼
           │                    (watches)
           │                         │
    ┌─────────────────────────────┐  │
    │ connectivityProvider        │◄─┘
    │ (Riverpod StreamProvider)   │
    └─────────────────────────────┘
           ▲
           │ (listens to)
           │
    ┌─────────────────────────────┐
    │ ConnectivityService         │
    │ (connectivity_plus wrapper) │
    └─────────────────────────────┘
           ▲
           │ (streams from)
           │
    ┌─────────────────────────────┐
    │ connectivity_plus plugin    │
    │ (native connectivity)       │
    └─────────────────────────────┘
```

### API Request Flow (with offline protection)
```
┌─────────────────────────┐
│  Screen/Service         │
│  Makes API Request      │
└────────────┬────────────┘
             ▼
┌─────────────────────────────────────────┐
│  Dio Interceptor Chain                  │
│  1. ConnectivityInterceptor (CHECK)  ◄──┬─ Checks connectivity
│  2. LoggingInterceptor               │  │  first!
│  3. ErrorInterceptor                 │  │
│  4. AuthInterceptor                  │  │
└────────────┬──────────────────────────┘  │
             ▼                             │
    ┌──────────────────┐                   │
    │ No Connection?   │                   │
    │ YES → Reject     │───────────────────┘
    │ NO → Continue    │
    └────────┬─────────┘
             ▼
    ┌──────────────────┐
    │ Make Request     │
    │ to Backend       │
    └──────────────────┘
```

---

## 📱 Supported Platforms

- ✅ Android
- ✅ iOS
- ✅ Web (Chrome for development)
- ✅ macOS
- ✅ Linux
- ✅ Windows

**Note**: On web/Chrome, connectivity detection is limited as browsers don't expose native connectivity info.

---

## 🎨 UI States

### Banner States

#### Online State
```
┌────────────────────────────────┐
│ ☁️ Online • WiFi               │
└────────────────────────────────┘
```

#### Offline State
```
┌─────────────────────────────────────┐
│ ☁️ No internet connection      ℹ️   │
└─────────────────────────────────────┘
```

---

## ⚙️ Configuration

### Customize Banner Colors
Edit `connectivity_status_banner.dart`:
```dart
// Online color
Color onlineColor = AppColors.success; // Change to your color

// Offline color
Color offlineColor = AppColors.error; // Change to your color
```

### Disable/Enable Connectivity Check
In `dio_client.dart`, comment/uncomment the interceptor:
```dart
// To disable:
// _dio.interceptors.add(ConnectivityInterceptor());

// To enable:
_dio.interceptors.add(ConnectivityInterceptor());
```

---

## 🧪 Testing

### Test Online Connectivity
```dart
void testOnlineConnectivity() {
  final service = ConnectivityService();
  service.hasConnectivity().then((hasConnection) {
    assert(hasConnection == true);
  });
}
```

### Test Offline Detection
```dart
// Disable WiFi/Mobile data on device and run app
// Banner should turn red with "No internet connection"
```

### Test API Call Blocking
```dart
// Go offline and try to make an API request
// Should show error: "No internet connection"
```

---

## 📊 Provider Usage Map

| Provider | Type | Returns | Use Case |
|----------|------|---------|----------|
| `connectivityProvider` | StreamProvider | `ConnectivityStatus` | Real-time monitoring |
| `isOnlineProvider` | Provider | `bool` | Simple online/offline check |
| `connectionTypeProvider` | Provider | `String` | Display connection type |
| `connectivityServiceProvider` | Provider | `ConnectivityService` | Direct service access |

---

## 🚀 Performance Considerations

- ✅ Singleton pattern ensures only one service instance
- ✅ Lazy initialization of Riverpod providers
- ✅ Minimal overhead - only checks before API requests
- ✅ Efficient stream listening with proper cleanup
- ✅ No polling - uses native platform callbacks

---

## 🔐 Security & Best Practices

1. **Always check connectivity before user-critical actions** - File uploads, payments, etc.
2. **Provide clear feedback** - Users should know why requests fail
3. **Handle offline gracefully** - Cache data when possible
4. **Test on real devices** - Simulator connectivity may behave differently
5. **Monitor battery usage** - Continuous connectivity monitoring has minimal impact

---

## 📝 Future Enhancements

- [ ] Offline data caching with Hive
- [ ] Request queue for offline requests
- [ ] Auto-retry when connection restored
- [ ] Connection quality monitoring (signal strength)
- [ ] Analytics tracking for connectivity issues
- [ ] Custom timeout handling based on connection type

---

## 🐛 Troubleshooting

### Banner not showing
- ✅ Verify `ConnectivityStatusBanner()` is in `main_navigation_screen.dart`
- ✅ Check `connectivity_plus` package is installed
- ✅ Rebuild the app with `flutter clean`

### Interceptor not working
- ✅ Verify `ConnectivityInterceptor` is added to `DioClient`
- ✅ Check import path is correct
- ✅ Ensure interceptor is added before other interceptors

### Always showing offline
- ✅ Check device internet connection
- ✅ Check Firewall/VPN settings
- ✅ Try app restart with `flutter run --watch`

---

## 📞 Support

For issues or questions about connectivity detection, refer to:
- [connectivity_plus documentation](https://pub.dev/packages/connectivity_plus)
- [Riverpod documentation](https://riverpod.dev)
- Project GitHub repository

---

**Last Updated**: April 9, 2026  
**Status**: ✅ Production Ready
