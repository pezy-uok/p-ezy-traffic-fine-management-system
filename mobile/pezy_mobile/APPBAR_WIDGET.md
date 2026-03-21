# PezyAppBar Widget Documentation

## Overview

`PezyAppBar` is a custom, reusable AppBar widget designed for the Pezy Mobile app. It provides a consistent header with PEZY branding, back button support, title/subtitle text, and customizable action buttons. The widget integrates seamlessly with the app's theme system (colors, typography, spacing).

**File:** `lib/shared/widgets/pezy_app_bar.dart`

## Key Features

- **PEZY Logo/Shield Icon** - Customizable logo display (default: amber shield icon)
- **Back Button Support** - Automatic navigation or custom callback
- **Title & Subtitle** - Two-line title support with custom styling
- **Action Buttons** - Multiple action buttons with custom callbacks
- **Theme Integration** - Uses AppColors, AppTextStyles, AppSpacing
- **Flexible Design** - Supports gradient backgrounds, bottom borders, elevation
- **Pre-built Variants** - Common configurations via `PezyAppBarVariants`

## Basic Usage

### Minimal AppBar

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Home',
  ),
  body: Container(),
)
```

### AppBar with Back Button

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Profile',
    showBackButton: true,
    onBackPressed: () => Navigator.pop(context),
  ),
  body: Container(),
)
```

### AppBar with Title & Subtitle

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Messages',
    subtitle: '5 new messages',
    showLogo: true,
  ),
  body: Container(),
)
```

### AppBar with Actions

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Users',
    showLogo: true,
    actions: [
      PezyAppBarAction(
        icon: Icons.search,
        onPressed: () => print('Search pressed'),
      ),
      PezyAppBarAction(
        icon: Icons.settings,
        onPressed: () => print('Settings pressed'),
      ),
    ],
  ),
  body: Container(),
)
```

## Constructor Parameters

### Display Content

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `title` | `String` | required | Main title text |
| `subtitle` | `String?` | null | Optional subtitle text below title |
| `showLogo` | `bool` | true | Display PEZY logo/shield icon |
| `customLogo` | `Widget?` | null | Custom logo widget (overrides default) |
| `showBackButton` | `bool` | false | Display back button |
| `actions` | `List<PezyAppBarAction>?` | null | Action buttons |

### Behavior

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `onBackPressed` | `VoidCallback?` | null | Callback when back button pressed (defaults to Navigator.pop) |

### Styling

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `backgroundColor` | `Color?` | AppColors.backgroundDarkNavy | Background color |
| `titleColor` | `Color?` | AppColors.textLight | Title text color |
| `iconColor` | `Color?` | AppColors.textLight | Icon color |
| `titleStyle` | `TextStyle?` | AppTextStyles.headlineSmall | Custom title text style |
| `subtitleStyle` | `TextStyle?` | AppTextStyles.bodySmall | Custom subtitle text style |
| `useGradient` | `bool` | false | Use gradient background (dark navy gradient) |
| `elevation` | `double` | 0 | Shadow elevation |
| `showBottomBorder` | `bool` | true | Show bottom border separator |
| `centerTitle` | `bool` | false | Center the title |
| `contentPadding` | `EdgeInsets?` | null | Custom padding for title content |

### Advanced

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `height` | `double` | kToolbarHeight (56dp) | AppBar height |
| `leading` | `Widget?` | null | Override entire leading widget |
| `flexibleSpace` | `Widget?` | null | Custom flexible space widget |

## PezyAppBarAction

Represents an action button in the AppBar.

```dart
class PezyAppBarAction {
  final IconData? icon;              // Icon to display
  final Widget? widget;              // Custom widget (alternative to icon)
  final VoidCallback onPressed;      // Button callback
  final Color? iconColor;            // Custom icon color
}
```

### Example

```dart
PezyAppBarAction(
  icon: Icons.search,
  onPressed: () => print('Search tapped'),
  iconColor: AppColors.accentAmber,
)
```

## Pre-built Variants

The `PezyAppBarVariants` class provides pre-configured AppBars for common scenarios:

### Simple AppBar

No logo, no back button, title only.

```dart
appBar: PezyAppBarVariants.simple(
  title: 'Home',
  backgroundColor: AppColors.backgroundDarkNavy,
),
```

### With Back Button

Shows logo and back button.

```dart
appBar: PezyAppBarVariants.withBackButton(
  title: 'Profile',
  onBack: () => Navigator.pop(context),
),
```

### With Logo

Shows logo, no back button.

```dart
appBar: PezyAppBarVariants.withLogo(
  title: 'Dashboard',
),
```

### With Search

Shows logo and search action button.

```dart
appBar: PezyAppBarVariants.withSearch(
  title: 'Users',
  onSearchPressed: () => Navigator.push(...),
),
```

### With Settings

Shows logo and settings action button.

```dart
appBar: PezyAppBarVariants.withSettings(
  title: 'Account',
  onSettingsPressed: () => navigateToSettings(),
),
```

### With Multiple Actions

Shows logo and multiple custom actions.

```dart
appBar: PezyAppBarVariants.withActions(
  title: 'Dashboard',
  actions: [
    PezyAppBarAction(
      icon: Icons.search,
      onPressed: () {},
    ),
    PezyAppBarAction(
      icon: Icons.notifications,
      onPressed: () {},
    ),
  ],
),
```

### With Back Button and Search

Back button + search action.

```dart
appBar: PezyAppBarVariants.withBackAndSearch(
  title: 'Search Results',
  onBack: () => Navigator.pop(context),
  onSearch: () => showSearchDialog(),
),
```

## Customization Examples

### Custom Colors

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Settings',
    backgroundColor: AppColors.primary,
    titleColor: Colors.white,
    iconColor: Colors.white,
  ),
  body: Container(),
)
```

### Gradient AppBar with Elevation

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Premium Features',
    useGradient: true,
    elevation: 4,
    showLogo: true,
  ),
  body: Container(),
)
```

### Custom Logo Widget

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'My App',
    customLogo: Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: AppColors.accentAmber,
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Icon(Icons.verified, color: Colors.white),
    ),
  ),
  body: Container(),
)
```

### AppBar Without Bottom Border

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'No Border',
    showBottomBorder: false,
  ),
  body: Container(),
)
```

### Centered Title

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Welcome',
    centerTitle: true,
    showLogo: false,
  ),
  body: Container(),
)
```

## Integration with Theme System

The AppBar automatically integrates with the app's theme:

- **Colors**: Uses `AppColors.backgroundDarkNavy`, `AppColors.textLight`, `AppColors.accentAmber`
- **Typography**: Uses `AppTextStyles.headlineSmall`, `AppTextStyles.bodySmall`
- **Spacing**: Uses `AppSpacing.*` constants for padding and sizing

```dart
// All these are applied automatically
backgroundColor: AppColors.backgroundDarkNavy,
titleStyle: AppTextStyles.headlineSmall.copyWith(
  color: AppColors.textLight,
),
```

## Common Patterns

### Home Screen with Logo

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Dashboard',
    showLogo: true,
    actions: [
      PezyAppBarAction(
        icon: Icons.notifications,
        onPressed: () => navigateToNotifications(),
      ),
      PezyAppBarAction(
        icon: Icons.person,
        onPressed: () => navigateToProfile(),
      ),
    ],
  ),
  body: Container(),
)
```

### Detail Screen with Back Button

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'User Details',
    subtitle: 'John Doe',
    showBackButton: true,
    showLogo: true,
    actions: [
      PezyAppBarAction(
        icon: Icons.edit,
        onPressed: () => enterEditMode(),
      ),
    ],
  ),
  body: Container(),
)
```

### Search Screen

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Search',
    showBackButton: true,
    actions: [
      PezyAppBarAction(
        icon: Icons.filter_list,
        onPressed: () => showFilters(),
      ),
    ],
  ),
  body: Container(),
)
```

### Nested Navigation with Back

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Settings',
    showBackButton: true,
    onBackPressed: () {
      // Custom navigation logic
      Navigator.of(context).pop();
    },
  ),
  body: Container(),
)
```

## Best Practices

1. **Always Provide Title** - Title is required and should be concise
2. **Use Subtitle for Context** - Subtitle helps users understand current state
3. **Show Logo on Main Screens** - Shows PEZY brand on home, dashboard, etc.
4. **Show Back Button on Detail Screens** - Helps users navigate back
5. **Limit Actions to 2-3** - Too many actions clutter the AppBar
6. **Use Pre-built Variants** - Reduces code duplication
7. **Match Colors to Theme** - Use AppColors constants
8. **Test Navigation Flow** - Ensure back buttons work correctly

## Styling Consistency

All colors default to the current theme:

```dart
// Light theme
backgroundColor: AppColors.backgroundDarkNavy    // #161D6F
titleColor: AppColors.textLight                   // White
iconColor: AppColors.textLight                    // White

// Accent colors
accentAmber: #FBBF24                             // Gold shield icon
```

## Responsive Design

The AppBar responds to different screen sizes:

- **Small screens**: Logo hidden automatically if space is limited
- **Medium screens**: Full layout with all elements
- **Large screens**: Optimal spacing maintained

## Accessibility

The AppBar widget includes:

- Semantic icon buttons with proper hit targets (48dp)
- Color contrast compliance (text on dark backgrounds)
- Clear navigation indicators (back button)
- Proper text sizing and hierarchy

## Migration from Flutter's AppBar

If replacing Flutter's default AppBar:

```dart
// Before
appBar: AppBar(
  title: Text('Title'),
  leading: BackButton(),
),

// After
appBar: PezyAppBar(
  title: 'Title',
  showBackButton: true,
),
```

## Troubleshooting

### AppBar actions not appearing

Ensure actions list is not null and contains valid `PezyAppBarAction` objects:

```dart
actions: [
  PezyAppBarAction(
    icon: Icons.search,
    onPressed: () {},  // Must be provided
  ),
],
```

### Back button not working

Provide `onBackPressed` callback or ensure Navigator context is available:

```dart
showBackButton: true,
onBackPressed: () => Navigator.of(context).pop(),
```

### Custom colors not applying

Ensure you're overriding the correct parameters:

```dart
PezyAppBar(
  title: 'Title',
  backgroundColor: Colors.red,        // Background
  titleColor: Colors.white,           // Title text
  iconColor: Colors.white,            // Icons
),
```

### Subtitle not showing

Provide the `subtitle` parameter:

```dart
PezyAppBar(
  title: 'Main Title',
  subtitle: 'Subtitle text',  // Required to show
),
```

## Widget Size

```
Height:         56dp (default, customizable via height parameter)
Logo Size:      40dp
Icon Size:      24dp
Padding:        16dp horizontal, 12dp vertical
Action Spacing: 16dp between actions
```

## Code Examples by Feature

### Sign In Screen

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Sign In',
    showBackButton: true,
    showLogo: true,
  ),
  body: SignInForm(),
)
```

### Profile Edit Screen

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Edit Profile',
    subtitle: 'Update your information',
    showBackButton: true,
    actions: [
      PezyAppBarAction(
        icon: Icons.check,
        onPressed: () => saveProfile(),
      ),
    ],
  ),
  body: ProfileEditForm(),
)
```

### Users List Screen

```dart
Scaffold(
  appBar: PezyAppBar(
    title: 'Users',
    actions: [
      PezyAppBarAction(
        icon: Icons.search,
        onPressed: () => openSearch(),
      ),
      PezyAppBarAction(
        icon: Icons.person_add,
        onPressed: () => addNewUser(),
      ),
    ],
  ),
  body: UsersList(),
)
```

## State Management Integration

The AppBar can be used with Riverpod or other state managers:

```dart
// With Riverpod
Scaffold(
  appBar: PezyAppBar(
    title: ref.watch(appTitleProvider),
    showBackButton: true,
    actions: [
      PezyAppBarAction(
        icon: Icons.refresh,
        onPressed: () => ref.refresh(dataProvider),
      ),
    ],
  ),
  body: Container(),
)
```

## Further Integration

The PezyAppBar integrates with:

- **PezyButton** - Use in actions with custom widgets
- **PezyTextField** - Use on search/filter screens
- **AppTheme** - Automatic theme application
- **AppColors** - Consistent color scheme
- **AppTextStyles** - Consistent typography

---

**Last Updated:** March 2026  
**Version:** 1.0  
**Status:** Complete and tested with flutter analyze ✓
