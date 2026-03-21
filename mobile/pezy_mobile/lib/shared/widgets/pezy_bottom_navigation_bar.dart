import 'package:flutter/material.dart';
import '../../core/theme/index.dart';
import '../../core/navigation/navigation_tab.dart';

/// Custom bottom navigation bar widget for Pezy Mobile
///
/// Features:
/// - 3 persistent tabs (Home, Criminal, Profile)
/// - Active tab highlight with modern design
/// - Smooth animations
/// - Theme integration
/// - Custom styling for modern UI/UX
class PezyBottomNavigationBar extends StatelessWidget {
  /// Currently selected tab
  final NavigationTab selectedTab;

  /// Callback when tab is tapped
  final Function(NavigationTab) onTabChanged;

  /// Height of the navigation bar
  final double height;

  /// Background color
  final Color? backgroundColor;

  /// Show labels
  final bool showLabels;

  /// Show active label
  final bool showActiveLabel;

  /// Active icon color
  final Color? activeIconColor;

  /// Inactive icon color
  final Color? inactiveIconColor;

  /// Active label color
  final Color? activeLabelColor;

  /// Inactive label color
  final Color? inactiveLabelColor;

  /// Elevation/shadow
  final double elevation;

  /// Use gradient background
  final bool useGradient;

  const PezyBottomNavigationBar({
    super.key,
    required this.selectedTab,
    required this.onTabChanged,
    this.height = 76,
    this.backgroundColor,
    this.showLabels = false,
    this.showActiveLabel = false,
    this.activeIconColor,
    this.inactiveIconColor,
    this.activeLabelColor,
    this.inactiveLabelColor,
    this.elevation = 0,
    this.useGradient = false,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 12, left: 16, right: 16),
        child: Container(
          height: height,
          decoration: BoxDecoration(
            color: _getBackgroundColor(),
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: NavigationTab.values
                .map((tab) => _buildTabItem(context, tab))
                .toList(),
          ),
        ),
      ),
    );
  }

  /// Build individual tab item
  Widget _buildTabItem(BuildContext context, NavigationTab tab) {
    final isActive = selectedTab == tab;

    return Expanded(
      child: GestureDetector(
        onTap: () => onTabChanged(tab),
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon with background on active state
            AnimatedScale(
              scale: isActive ? 1.1 : 1.0,
              duration: const Duration(milliseconds: 200),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: EdgeInsets.all(isActive ? 10 : 8),
                decoration: isActive
                    ? BoxDecoration(
                        color: (activeIconColor ?? AppColors.accentRed)
                            .withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(14),
                      )
                    : null,
                child: Icon(
                  tab.icon,
                  size: 28,
                  color: isActive
                      ? (activeIconColor ?? AppColors.accentRed)
                      : (inactiveIconColor ?? Color(0xFF64748B)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Get background color
  Color _getBackgroundColor() {
    if (backgroundColor != null) {
      return backgroundColor!;
    }
    return Colors.white; // Light background for modern UX
  }
}
