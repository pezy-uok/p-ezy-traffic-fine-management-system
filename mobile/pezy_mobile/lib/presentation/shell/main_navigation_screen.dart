import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/navigation/navigation_tab.dart';
import '../../core/providers/navigation_providers.dart';
import '../../shared/widgets/index.dart';
import '../../features/home/presentation/pages/home_screen.dart';
import '../../features/criminal/presentation/pages/criminal_records_screen.dart';
import '../../features/profile/presentation/pages/profile_screen.dart';

/// Main navigation screen with bottom navigation bar
///
/// This screen acts as a shell that contains the bottom navigation bar
/// and switches between different feature screens based on the selected tab.
class MainNavigationScreen extends ConsumerWidget {
  const MainNavigationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch the selected tab from Riverpod provider
    final selectedTab = ref.watch(navigationProvider);

    return Scaffold(
      // Show the appropriate screen based on selected tab
      body: _buildScreen(selectedTab),

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

  /// Build the appropriate screen based on selected tab
  Widget _buildScreen(NavigationTab tab) {
    switch (tab) {
      case NavigationTab.home:
        return const HomeScreen();
      case NavigationTab.criminal:
        return const CriminalRecordsScreen();
      case NavigationTab.profile:
        return const ProfileScreen();
    }
  }
}
