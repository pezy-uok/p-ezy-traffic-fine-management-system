import 'package:flutter/material.dart';

/// Navigation tab definition
enum NavigationTab {
  home,
  newFine,
  outdatedFines,
  profile,
}

/// Extension methods for NavigationTab
extension NavigationTabExtension on NavigationTab {
  /// Get the icon for this tab
  IconData get icon {
    switch (this) {
      case NavigationTab.home:
        return Icons.home_rounded;
      case NavigationTab.newFine:
        return Icons.assignment_outlined;
      case NavigationTab.outdatedFines:
        return Icons.history_outlined;
      case NavigationTab.profile:
        return Icons.info_outlined;
    }
  }

  /// Get the label for this tab
  String get label {
    switch (this) {
      case NavigationTab.home:
        return 'Fines';
      case NavigationTab.newFine:
        return 'New Fine';
      case NavigationTab.outdatedFines:
        return 'Outdated';
      case NavigationTab.profile:
        return 'Profile';
    }
  }

  /// Get the route name for this tab
  String get routeName {
    switch (this) {
      case NavigationTab.home:
        return '/home';
      case NavigationTab.newFine:
        return '/new-fine';
      case NavigationTab.outdatedFines:
        return '/outdated-fines';
      case NavigationTab.profile:
        return '/profile';
    }
  }

  /// Get index of this tab
  int get index {
    switch (this) {
      case NavigationTab.home:
        return 0;
      case NavigationTab.newFine:
        return 1;
      case NavigationTab.outdatedFines:
        return 2;
      case NavigationTab.profile:
        return 3;
    }
  }
}

/// Get NavigationTab from index
NavigationTab navigationTabFromIndex(int index) {
  return NavigationTab.values[index];
}
