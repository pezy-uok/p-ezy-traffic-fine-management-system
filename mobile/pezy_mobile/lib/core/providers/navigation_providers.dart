import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/navigation/navigation_tab.dart';

/// Navigation state provider
///
/// Manages the currently selected navigation tab.
///
/// Usage:
/// ```dart
/// final selectedTab = ref.watch(navigationProvider);
/// 
/// ref.read(navigationProvider.notifier).state = NavigationTab.profile;
/// ```
final navigationProvider = StateProvider<NavigationTab>((ref) {
  return NavigationTab.home; // Default tab
});

/// Navigation history provider (optional for back navigation)
///
/// Keeps track of navigation history for implementing back button behavior.
final navigationHistoryProvider =
    StateProvider<List<NavigationTab>>((ref) => [NavigationTab.home]);
