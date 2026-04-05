/// App shell that handles routing based on authentication state
/// Checks if user is logged in on startup and routes accordingly
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/pages/login_screen.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import 'main_navigation_screen.dart';

class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key});

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  @override
  void initState() {
    super.initState();
    // Check auth status in the background without blocking UI
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAuthStatus();
    });
  }

  Future<void> _checkAuthStatus() async {
    // Fire and forget - don't wait for this on desktop
    try {
      await ref.read(authProvider.notifier).checkAuthStatus();
    } catch (e) {
      debugPrint('Error checking auth status: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    // Watch auth state to react to login/logout changes
    final authState = ref.watch(authProvider);

    // Show loading screen while checking authentication
    if (authState.isLoading) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(
                  Theme.of(context).primaryColor,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Checking authentication...',
                style: TextStyle(fontSize: 16, color: Colors.black87),
              ),
            ],
          ),
        ),
      );
    }

    // Route based on authentication state
    if (authState.isLoggedIn) {
      // User is logged in - show main app
      return const MainNavigationScreen();
    } else {
      // User is not logged in - show login screen
      return const LoginScreen();
    }
  }
}
