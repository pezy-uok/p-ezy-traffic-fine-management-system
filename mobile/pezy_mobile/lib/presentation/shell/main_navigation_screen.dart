import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/providers/navigation_providers.dart';
import '../../shared/widgets/index.dart';
import '../../features/home/presentation/pages/home_screen.dart';
import '../../features/criminal/presentation/pages/criminal_records_screen.dart';
import '../../features/profile/presentation/pages/profile_screen.dart';

/// Main navigation screen with bottom navigation bar
///
/// This screen acts as a shell that contains the bottom navigation bar
/// and uses IndexedStack to switch between different feature screens.
/// IndexedStack keeps all screens in memory, preserving their state,
/// scroll positions, and loaded data when switching tabs.
class MainNavigationScreen extends ConsumerWidget {
  const MainNavigationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch the selected tab from Riverpod provider
    final selectedTab = ref.watch(navigationProvider);

    // List of screens in tab order (Home, Criminal, Profile)
    const screens = [
      HomeScreen(),
      CriminalRecordsScreen(),
      ProfileScreen(),
    ];

    return Scaffold(
      // Use IndexedStack to preserve tab state and scroll position
      body: IndexedStack(
        index: selectedTab.index,
        children: screens,
      ),

      // Bottom navigation bar
      bottomNavigationBar: PezyBottomNavigationBar(
        selectedTab: selectedTab,
        onTabChanged: (tab) {
          // Update the selected tab in Riverpod provider
          ref.read(navigationProvider.notifier).state = tab;
        },
        showLabels: false,
        showActiveLabel: false,
        elevation: 0,
      ),
    );
  }
}
