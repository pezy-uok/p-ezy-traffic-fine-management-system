# Bottom Navigation Bar - Quick Reference

## Overview

The app now has a persistent bottom navigation bar with 3 tabs:
1. **Home** (Fines icon) - View and manage traffic fines
2. **Criminal** (Document icon) - View criminal records
3. **Profile** (Person icon) - View and manage profile

## Files Created

### Navigation System
- `lib/core/navigation/navigation_tab.dart` - Tab definitions and enums
- `lib/core/providers/navigation_providers.dart` - Riverpod state providers
- `lib/presentation/shell/main_navigation_screen.dart` - Main navigation shell

### Widgets
- `lib/shared/widgets/pezy_bottom_navigation_bar.dart` - Custom bottom navigation bar

### Feature Screens
- `lib/features/home/presentation/pages/home_screen.dart` - Fines screen
- `lib/features/criminal/presentation/pages/criminal_records_screen.dart` - Criminal records
- `lib/features/profile/presentation/pages/profile_screen.dart` - User profile

## Key Features

✅ **3 Persistent Tabs** - Always visible at bottom  
✅ **Active Tab Highlight** - Amber background on active tab  
✅ **Smooth Animations** - Icons scale and opacity animate  
✅ **Modern UI/UX** - Clean design with theme integration  
✅ **Riverpod Integration** - State managed through providers  
✅ **Theme Consistent** - Uses AppColors, AppTextStyles, AppSpacing  
✅ **Fast Performance** - Stateless widgets, no rebuilds  
✅ **Code Quality** - Zero analysis errors  

## Architecture

```
MainNavigationScreen (ConsumerWidget with Riverpod)
│
├── navigationProvider (tracks selected tab)
│
├── PezyBottomNavigationBar (custom bottom nav)
│   └── Shows 3 tabs with active highlight
│
└── _buildScreen() (switches between screens)
    ├── HomeScreen (Fines tab)
    ├── CriminalRecordsScreen (Criminal tab)
    └── ProfileScreen (Profile tab)
```

## Navigation States

### HomeScreen (Fines)
- Recent fines list
- Total fines and pending count
- Fine status indicators (Paid/Pending)
- Search functionality

### CriminalRecordsScreen (Criminal)
- Record status display
- Information about records
- Related documents (with download)
- Clean status indicator

### ProfileScreen (Profile)
- User avatar and info
- Quick statistics (fines, warnings, status)
- Account information (email, phone, location)
- Settings options (notifications, security, help)
- Logout button

## Using the Navigation

### Programmatic Navigation
```dart
// In any widget
ref.read(navigationProvider.notifier).state = NavigationTab.profile;
```

### Check Current Tab
```dart
final currentTab = ref.watch(navigationProvider);
if (currentTab == NavigationTab.home) {
  // Do something
}
```

## Styling

### Default Colors
- Active tab background: AppColors.accentAmber (10% opacity)
- Active icon/label: AppColors.accentAmber (#FBBF24)
- Inactive icon/label: AppColors.textMuted
- AppBar background: AppColors.backgroundDarkNavy

### Height & Spacing
- Bottom nav height: 64dp
- Icon size: 28dp (large)
- Label text style: labelSmall with bold on active
- Elevation: 8 with shadow

## Customization

The `PezyBottomNavigationBar` supports full customization:

```dart
PezyBottomNavigationBar(
  selectedTab: selectedTab,
  onTabChanged: (tab) { /* handle tap */ },
  height: 64,
  showLabels: true,
  showActiveLabel: true,
  activeIconColor: AppColors.accentAmber,
  elevation: 8,
  useGradient: false, // Optional gradient background
)
```

## Adding New Tabs

To add a new tab:

1. Add to `NavigationTab` enum in `navigation_tab.dart`:
```dart
enum NavigationTab {
  home,
  criminal,
  profile,
  newTab,  // Add here
}
```

2. Add case to extension methods:
```dart
extension NavigationTabExtension on NavigationTab {
  IconData get icon {
    switch (this) {
      // ... existing cases
      case NavigationTab.newTab:
        return Icons.your_icon;
    }
  }
  
  String get label {
    switch (this) {
      // ... existing cases
      case NavigationTab.newTab:
        return 'New Tab';
    }
  }
  // ... add for routeName and index
}
```

3. Add screen in `main_navigation_screen.dart`:
```dart
Widget _buildScreen(NavigationTab tab) {
  switch (tab) {
    // ... existing cases
    case NavigationTab.newTab:
      return const NewScreen();
  }
}
```

## State Management

The selected tab state is managed through Riverpod:

```dart
// Define provider
final navigationProvider = StateProvider<NavigationTab>((ref) {
  return NavigationTab.home; // Default
});

// Watch in widget
final selectedTab = ref.watch(navigationProvider);

// Update state
ref.read(navigationProvider.notifier).state = newTab;
```

## Performance

- **Stateless widgets**: No unnecessary rebuilds
- **Single provider**: Minimal Riverpod overhead
- **Efficient animations**: Only affected tab rebuilds
- **Memory efficient**: No screen instance caching needed

## Code Quality

✅ flutter analyze: **Zero errors**  
✅ Null safety: Fully implemented  
✅ Documentation: Comprehensive comments  
✅ Exports: Proper barrel files  
✅ Type safety: Full generic support  

## Future Enhancements

Possible improvements:
- Add navigation animations (slide/fade)
- Implement navigation history for back button
- Add unread badges for notifications
- Deep linking support
- Nested navigation per tab

## Files Summary

```
lib/
├── core/
│   ├── navigation/
│   │   └── navigation_tab.dart (40 lines)
│   └── providers/
│       └── navigation_providers.dart (30 lines)
├── features/
│   ├── home/presentation/pages/
│   │   └── home_screen.dart (150 lines)
│   ├── criminal/presentation/pages/
│   │   └── criminal_records_screen.dart (160 lines)
│   └── profile/presentation/pages/
│       └── profile_screen.dart (200 lines)
├── presentation/
│   └── shell/
│       └── main_navigation_screen.dart (50 lines)
├── shared/widgets/
│   └── pezy_bottom_navigation_bar.dart (180 lines)
└── main.dart (30 lines, uses ProviderScope + MainNavigationScreen)
```

## Testing the Navigation

The three demo screens are fully functional:

1. **Home Screen** - Shows sample fines with pay status
2. **Criminal Screen** - Displays record status and documents
3. **Profile Screen** - Shows user info, settings, and logout

Tap the bottom tabs to navigate between screens instantly!

---

**Status:** ✅ Complete and tested  
**Code Quality:** Zero analysis errors  
**Build Status:** Ready for development
