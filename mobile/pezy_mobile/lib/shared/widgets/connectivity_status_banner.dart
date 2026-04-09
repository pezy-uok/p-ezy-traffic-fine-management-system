import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/index.dart';
import '../../core/providers/connectivity_provider.dart';

/// Connectivity status indicator widget
/// 
/// Displays connectivity status at the top of the app with smooth animations.
/// Shows a banner when offline with connection type when online.
/// 
/// Usage:
/// ```dart
/// Scaffold(
///   appBar: AppBar(title: Text('Home')),
///   body: Column(
///     children: [
///       const ConnectivityStatusBanner(),
///       Expanded(child: ...), // Your other widgets
///     ],
///   ),
/// )
/// ```
class ConnectivityStatusBanner extends ConsumerWidget {
  const ConnectivityStatusBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final connectivityStatus = ref.watch(connectivityProvider);

    return connectivityStatus.when(
      data: (status) {
        if (status.isConnected) {
          // Animated online indicator with slide and fade
          return AnimatedSlide(
            offset: Offset.zero,
            duration: const Duration(milliseconds: 600),
            curve: Curves.easeOutCubic,
            child: AnimatedOpacity(
              opacity: 1.0,
              duration: const Duration(milliseconds: 600),
              curve: Curves.easeOutCubic,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.success.withValues(alpha: 0.95),
                      AppColors.success.withValues(alpha: 0.85),
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.success.withValues(alpha: 0.2),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // Animated dot indicator
                    ScaleTransition(
                      scale: _buildPulseAnimation(),
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.white.withValues(alpha: 0.5),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    // Status text
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Online',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            status.connectionTypeName,
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.85),
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              letterSpacing: 0.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Connection icon
                    Icon(
                      _getConnectionIcon(status.connectionTypeName),
                      color: Colors.white,
                      size: 18,
                    ),
                  ],
                ),
              ),
            ),
          );
        } else {
          // Animated offline indicator with slide and fade
          return AnimatedSlide(
            offset: const Offset(0, -0.1),
            duration: const Duration(milliseconds: 600),
            curve: Curves.easeOutCubic,
            child: AnimatedOpacity(
              opacity: 1.0,
              duration: const Duration(milliseconds: 600),
              curve: Curves.easeOutCubic,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.error.withValues(alpha: 1.0),
                      AppColors.error.withValues(alpha: 0.9),
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.error.withValues(alpha: 0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // Alert icon with background
                    ScaleTransition(
                      scale: _buildWarningPulseAnimation(),
                      child: Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white.withValues(alpha: 0.25),
                        ),
                        child: const Icon(
                          Icons.wifi_off_rounded,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Status text with action
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'No Connection',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            'Check your internet',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.8),
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              letterSpacing: 0.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Retry/Info icon
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.15),
                      ),
                      child: Icon(
                        Icons.info_outline_rounded,
                        color: Colors.white.withValues(alpha: 0.9),
                        size: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }
      },
      loading: () {
        // Subtle loading state with animation
        return AnimatedOpacity(
          opacity: 0.7,
          duration: const Duration(milliseconds: 400),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: Colors.grey[100],
            child: SizedBox(
              height: 32,
              child: Row(
                children: [
                  SizedBox(
                    width: 12,
                    height: 12,
                    child: CircularProgressIndicator(
                      strokeWidth: 1.5,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.textSecondary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Checking connection...',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
      error: (error, stackTrace) {
        // Assume online if error occurs
        return const SizedBox.shrink();
      },
    );
  }

  /// Build pulse animation for online indicator dot
  Animation<double> _buildPulseAnimation() {
    return Tween<double>(begin: 1.0, end: 1.2)
        .animate(CurvedAnimation(parent: AlwaysStoppedAnimation(0.5), curve: Curves.easeInOut));
  }

  /// Build warning pulse animation for offline icon
  Animation<double> _buildWarningPulseAnimation() {
    return Tween<double>(begin: 1.0, end: 1.1)
        .animate(CurvedAnimation(parent: AlwaysStoppedAnimation(0.5), curve: Curves.easeInOut));
  }

  /// Get appropriate icon for connection type
  IconData _getConnectionIcon(String connectionType) {
    switch (connectionType.toLowerCase()) {
      case 'wifi':
        return Icons.wifi_rounded;
      case 'mobile data':
        return Icons.signal_cellular_4_bar_rounded;
      case 'ethernet':
        return Icons.router_rounded;
      case 'vpn':
        return Icons.vpn_lock_rounded;
      case 'no connection':
        return Icons.cloud_off_rounded;
      default:
        return Icons.cloud_done_rounded;
    }
  }
}

/// Compact connectivity indicator (icon only)
/// 
/// Shows a small icon indicator of connectivity status.
/// Useful for app bar or other compact UI elements.
class ConnectivityIconIndicator extends ConsumerWidget {
  final double size;

  const ConnectivityIconIndicator({
    super.key,
    this.size = 22,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final connectivityStatus = ref.watch(connectivityProvider);

    return connectivityStatus.when(
      data: (status) {
        if (status.isConnected) {
          return ScaleTransition(
            scale: Tween<double>(begin: 0.8, end: 1.0).animate(
              CurvedAnimation(parent: AlwaysStoppedAnimation(0.6), curve: Curves.easeOut),
            ),
            child: Tooltip(
              message: 'Connected via ${status.connectionTypeName}',
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.success.withValues(alpha: 0.1),
                ),
                child: Icon(
                  Icons.cloud_done_rounded,
                  size: size,
                  color: AppColors.success,
                ),
              ),
            ),
          );
        } else {
          return ScaleTransition(
            scale: Tween<double>(begin: 0.8, end: 1.0).animate(
              CurvedAnimation(parent: AlwaysStoppedAnimation(0.6), curve: Curves.easeOut),
            ),
            child: Tooltip(
              message: 'No internet connection',
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.error.withValues(alpha: 0.1),
                ),
                child: Icon(
                  Icons.cloud_off_rounded,
                  size: size,
                  color: AppColors.error,
                ),
              ),
            ),
          );
        }
      },
      loading: () => Icon(
        Icons.cloud_queue_rounded,
        size: size,
        color: AppColors.textSecondary,
      ),
      error: (_, __) => Icon(
        Icons.cloud_done_rounded,
        size: size,
        color: AppColors.success,
      ),
    );
  }
}

/// Dialog widget for offline scenarios
/// 
/// Shows a modern dialog when user tries to perform action while offline.
void showOfflineDialog(BuildContext context) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      backgroundColor: Colors.white,
      elevation: 8,
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.error.withValues(alpha: 0.1),
            ),
            child: Icon(
              Icons.wifi_off_rounded,
              color: AppColors.error,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'No Connection',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Colors.black87,
              ),
            ),
          ),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'You are currently offline. Please check your internet connection and try again.',
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
              fontWeight: FontWeight.w500,
              height: 1.5,
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          style: TextButton.styleFrom(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: Text(
            'Got It',
            style: TextStyle(
              color: AppColors.accentRed,
              fontWeight: FontWeight.w700,
              fontSize: 14,
              letterSpacing: 0.3,
            ),
          ),
        ),
      ],
    ),
  );
}

/// Modern snackbar for offline notification
void showOfflineSnackbar(BuildContext context) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withValues(alpha: 0.25),
            ),
            child: const Icon(
              Icons.wifi_off_rounded,
              color: Colors.white,
              size: 16,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'You are offline. Some features may not work.',
              style: TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      backgroundColor: AppColors.error,
      duration: const Duration(seconds: 4),
      behavior: SnackBarBehavior.floating,
      margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      elevation: 6,
    ),
  );
}

/// Modern snackbar for back online notification
void showBackOnlineSnackbar(BuildContext context) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withValues(alpha: 0.25),
            ),
            child: const Icon(
              Icons.cloud_done_rounded,
              color: Colors.white,
              size: 16,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text(
              'Back online!',
              style: TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      backgroundColor: AppColors.success,
      duration: const Duration(seconds: 2),
      behavior: SnackBarBehavior.floating,
      margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      elevation: 6,
    ),
  );
}
