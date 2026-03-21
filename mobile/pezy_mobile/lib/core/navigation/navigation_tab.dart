import 'package:flutter/material.dart';

/// Navigation tab definition
enum NavigationTab {
  home,
  criminal,
  profile,
}

/// Extension methods for NavigationTab
extension NavigationTabExtension on NavigationTab {
  /// Get the icon for this tab
  IconData get icon {
    switch (this) {
      case NavigationTab.home:
        return Icons.home_rounded;
      case NavigationTab.criminal:
        return Icons.assignment_outlined;
      case NavigationTab.profile:
        return Icons.info_outlined;
    }
  }

  /// Get the label for this tab
  String get label {
    switch (this) {
      case NavigationTab.home:
        return 'Fines';
      case NavigationTab.criminal:
        return 'Criminal';
      case NavigationTab.profile:
        return 'Profile';
    }
  }

  /// Get the route name for this tab
  String get routeName {
    switch (this) {
      case NavigationTab.home:
        return '/home';
      case NavigationTab.criminal:
        return '/criminal';
      case NavigationTab.profile:
        return '/profile';
    }
  }

  /// Get index of this tab
  int get index {
    switch (this) {
      case NavigationTab.home:
        return 0;
      case NavigationTab.criminal:
        return 1;
      case NavigationTab.profile:
        return 2;
    }
  }
}

/// Get NavigationTab from index
NavigationTab navigationTabFromIndex(int index) {
  return NavigationTab.values[index];
}
