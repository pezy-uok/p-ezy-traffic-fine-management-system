# App Theme Configuration

## Overview

The Pezy Mobile app uses a comprehensive theming system based on Material Design 3, built with custom configurations for colors, typography, and spacing.

## Theme Files Structure

```
lib/core/theme/
├── app_colors.dart          # Color palette definitions
├── app_text_styles.dart     # Typography and text styles
├── app_spacing.dart         # Spacing constants
├── app_theme.dart           # Main theme configuration
└── index.dart               # Barrel export file
```

## Color Palette

### Primary Colors
- **Primary Blue**: `#046BD2` - Main action color
- **Primary Blue Dark**: `#035BB3` - Hover/interactive states

### Background Colors
- **Dark Navy**: `#161D6F` - Main background (dark mode)
- **Darker Navy**: `#1B237F` - UI components (dark mode)
- **Darkest**: `#111655` - Deep background (dark mode)

### Accent Colors (Amber/Gold)
- **Amber**: `#FBBF24` - Primary accent
- **Gold**: `#F59E0B` - Secondary accent
- **Amber Dark**: `#B45309` - Darker accent variant

### Text Colors
- **Text Light**: `#E2E8F0` - Primary text
- **Text Muted**: `#CBD5E1` - Secondary text
- **Text Muted Light**: `#BFDBFE` - Tertiary text
- **Text Link**: `#FDE68A` - Link text

### Status Colors
- **Success**: `#10B981` - Success states
- **Error**: `#EF4444` - Error states
- **Warning**: `#F59E0B` - Warning states
- **Info**: `#3B82F6` - Information states

## Typography

### Display Styles (Large Headlines)
- **displayLarge**: 32px, bold
- **displayMedium**: 28px, bold
- **displaySmall**: 24px, bold

### Headline Styles (Section Titles)
- **headlineLarge**: 22px, w700
- **headlineMedium**: 20px, w700
- **headlineSmall**: 18px, w700

### Title Styles
- **titleLarge**: 18px, w600
- **titleMedium**: 16px, w600
- **titleSmall**: 14px, w600

### Body Styles (Regular Text)
- **bodyLarge**: 16px, w400
- **bodyMedium**: 14px, w400
- **bodySmall**: 12px, w400

### Label Styles
- **labelLarge**: 14px, w600
- **labelMedium**: 12px, w600
- **labelSmall**: 11px, w600

### Special Styles
- **button**: 14px, w600, white text
- **accentButton**: 14px, w600, amber text
- **link**: 14px, w600, underlined, amber text

## Spacing System

All spacing uses a consistent scale:

- **xs**: 4.0
- **sm**: 8.0
- **md**: 12.0
- **lg**: 16.0 (default padding)
- **xl**: 24.0 (section spacing)
- **xxl**: 32.0
- **xxxl**: 48.0

### Common Spacing Values
- **cornerRadius**: 12.0 (standard border radius)
- **cornerRadiusMedium**: 16.0
- **cornerRadiusLarge**: 24.0
- **buttonHeight**: 48.0
- **buttonHeightSmall**: 40.0
- **buttonHeightTiny**: 32.0

## Usage Examples

### Using Colors
```dart
import 'core/theme/index.dart';

Container(
  color: AppColors.backgroundDarkNavy,
  child: Text(
    'Hello',
    style: TextStyle(color: AppColors.textLight),
  ),
)
```

### Using Text Styles
```dart
import 'core/theme/index.dart';

Text(
  'Headline',
  style: AppTextStyles.headlineLarge,
)

Text(
  'Body text',
  style: AppTextStyles.bodyMedium,
)
```

### Using Spacing
```dart
import 'core/theme/index.dart';

Padding(
  padding: EdgeInsets.all(AppSpacing.lg),
  child: Container(
    width: 100,
    height: 100,
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
    ),
  ),
)
```

### Using Theme Data
```dart
import 'core/theme/index.dart';

MaterialApp(
  title: 'Pezy Mobile',
  theme: AppTheme.lightTheme,
  darkTheme: AppTheme.darkTheme,
  themeMode: ThemeMode.system,
  home: HomePage(),
)
```

## Theme Modes

The app supports three theme modes:

- **Light Theme**: Based on `AppTheme.lightTheme`
- **Dark Theme**: Based on `AppTheme.darkTheme`
- **System**: Automatically follows device settings

## Customizing Theme

To customize the theme, modify the relevant files:

1. **Colors**: Edit `app_colors.dart` to change color values
2. **Typography**: Edit `app_text_styles.dart` to modify text styles
3. **Spacing**: Edit `app_spacing.dart` to adjust spacing constants
4. **Theme Configuration**: Edit `app_theme.dart` to modify Material Design components

## Material Design Components with Custom Styling

The followingComponents are pre-styled with the custom theme:

- **ElevatedButton**: Blue background, custom padding
- **OutlinedButton**: Blue border, custom padding
- **TextButton**: Amber text, minimalist style
- **TextField**: Custom input decoration with focus states
- **Card**: Custom background and elevation
- **AppBar**: Dark navy background with custom title styling
- **BottomNavigationBar**: Dark navy with amber highlights
- **Dialog**: Dark navy background with rounded corners
- **FloatingActionButton**: Blue background with custom shape

## Best Practices

1. Always use theme constants instead of hardcoded values
2. Use `AppTextStyles` for consistent typography across the app
3. Leverage `AppSpacing` for consistent padding and margins
4. Use `AppColors` exclusively for color definitions
5. Test both light and dark themes during development
6. Keep custom colors to a minimum; use the defined palette

## Migration Guide

When migrating existing code to use the theme system:

1. Replace hardcoded colors with `AppColors` constants
2. Replace hardcoded text styles with `AppTextStyles` constants
3. Replace hardcoded padding/margins with `AppSpacing` constants
4. Update ThemeData in main.dart to use `AppTheme.lightTheme` and `AppTheme.darkTheme`
