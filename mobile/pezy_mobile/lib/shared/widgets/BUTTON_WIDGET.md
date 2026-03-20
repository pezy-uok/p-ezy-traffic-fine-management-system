# PezyButton Widget

A customizable, reusable button widget with multiple variants, sizes, and states.

## Features

- **Variants**: Filled, Outlined, Accent
- **Sizes**: Small (40dp), Medium (48dp), Large (56dp)
- **States**: Normal, Loading, Disabled
- **Icons**: Optional prefix and suffix icons
- **Customization**: Full color, size, and styling control
- **Accessibility**: Proper state handling and visual feedback

## Basic Usage

### Filled Button (Default)
```dart
import 'shared/widgets/index.dart';

PezyButton(
  label: 'Sign In',
  onPressed: () {
    print('Button pressed');
  },
)
```

### Outlined Button
```dart
PezyButton(
  label: 'Cancel',
  variant: PezyButtonVariant.outlined,
  onPressed: () {
    Navigator.pop(context);
  },
)
```

### Accent Button (Gold/Amber)
```dart
PezyButton(
  label: 'Highlight Action',
  variant: PezyButtonVariant.accent,
  onPressed: () {
    // Handle action
  },
)
```

## Button Sizes

### Small Button (40dp)
```dart
PezyButton(
  label: 'Small',
  size: PezyButtonSize.small,
  onPressed: () {},
)
```

### Medium Button (48dp) - Default
```dart
PezyButton(
  label: 'Medium',
  size: PezyButtonSize.medium,
  onPressed: () {},
)
```

### Large Button (56dp)
```dart
PezyButton(
  label: 'Large',
  size: PezyButtonSize.large,
  onPressed: () {},
)
```

## With Icons

### Prefix Icon
```dart
PezyButton(
  label: 'Send',
  prefixIcon: Icons.send,
  onPressed: () {},
)
```

### Suffix Icon
```dart
PezyButton(
  label: 'Download',
  suffixIcon: Icons.download,
  onPressed: () {},
)
```

### Both Icons
```dart
PezyButton(
  label: 'Share',
  prefixIcon: Icons.share,
  suffixIcon: Icons.arrow_forward,
  onPressed: () {},
)
```

## Loading State

```dart
bool _isLoading = false;

PezyButton(
  label: 'Authenticate',
  isLoading: _isLoading,
  onPressed: _isLoading
      ? null
      : () async {
    setState(() => _isLoading = true);
    try {
      await _performAuth();
    } finally {
      setState(() => _isLoading = false);
    }
  },
)
```

The button will display a loading spinner and disable interactions when `isLoading` is true.

## Disabled State

```dart
PezyButton(
  label: 'Disabled Button',
  isDisabled: true,
  onPressed: () {
    // Won't be called when disabled
  },
)
```

## Full Width Button

```dart
PezyButton(
  label: 'Submit',
  isFullWidth: true,
  onPressed: () {},
)
```

## Custom Colors

### Custom Background Color
```dart
PezyButton(
  label: 'Custom Color',
  backgroundColor: Color(0xFF4CAF50),
  onPressed: () {},
)
```

### Custom Text Color
```dart
PezyButton(
  label: 'Custom Text',
  textColor: Colors.white,
  backgroundColor: Colors.purple,
  onPressed: () {},
)
```

### Custom Border Color (Outlined)
```dart
PezyButton(
  label: 'Custom Border',
  variant: PezyButtonVariant.outlined,
  borderColor: Colors.red,
  textColor: Colors.red,
  onPressed: () {},
)
```

## Custom Size

### Custom Width
```dart
PezyButton(
  label: 'Wide Button',
  width: 300,
  onPressed: () {},
)
```

### Custom Height
```dart
PezyButton(
  label: 'Tall Button',
  height: 64,
  onPressed: () {},
)
```

## Custom Border Radius

```dart
PezyButton(
  label: 'Rounded',
  borderRadius: 24,
  onPressed: () {},
)
```

## Custom Text Style

```dart
PezyButton(
  label: 'Custom Style',
  textStyle: TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w700,
  ),
  onPressed: () {},
)
```

## Loading Indicator Color

```dart
PezyButton(
  label: 'Loading...',
  isLoading: true,
  loadingIndicatorColor: AppColors.accentAmber,
  onPressed: () {},
)
```

## Common Patterns

### Sign Up Form
```dart
Column(
  children: [
    PezyButton(
      label: 'Sign Up',
      isFullWidth: true,
      size: PezyButtonSize.large,
      onPressed: () {
        _handleSignUp();
      },
    ),
    const SizedBox(height: AppSpacing.lg),
    PezyButton(
      label: 'Already have an account? Sign In',
      variant: PezyButtonVariant.outlined,
      isFullWidth: true,
      onPressed: () {
        _navigateToSignIn();
      },
    ),
  ],
)
```

### Action Buttons
```dart
Row(
  children: [
    Expanded(
      child: PezyButton(
        label: 'Cancel',
        variant: PezyButtonVariant.outlined,
        onPressed: () {
          Navigator.pop(context);
        },
      ),
    ),
    const SizedBox(width: AppSpacing.lg),
    Expanded(
      child: PezyButton(
        label: 'Confirm',
        variant: PezyButtonVariant.filled,
        onPressed: () {
          _handleConfirm();
        },
      ),
    ),
  ],
)
```

### Loading with Error Handling
```dart
bool _isLoading = false;
String? _errorMessage;

PezyButton(
  label: 'Submit',
  isLoading: _isLoading,
  isDisabled: _errorMessage != null,
  onPressed: _isLoading
      ? null
      : () async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      await _submitForm();
    } catch (e) {
      setState(() => _errorMessage = e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  },
)
```

## API Reference

### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | `String` | Required | Button text |
| `onPressed` | `VoidCallback?` | `null` | Tap callback |
| `isLoading` | `bool` | `false` | Show loading spinner |
| `isDisabled` | `bool` | `false` | Disable button |
| `variant` | `PezyButtonVariant` | `filled` | Button style |
| `size` | `PezyButtonSize` | `medium` | Button size |
| `width` | `double?` | `null` | Custom width |
| `height` | `double?` | `null` | Custom height |
| `prefixIcon` | `IconData?` | `null` | Icon before text |
| `suffixIcon` | `IconData?` | `null` | Icon after text |
| `textColor` | `Color?` | `null` | Custom text color |
| `backgroundColor` | `Color?` | `null` | Custom background |
| `borderColor` | `Color?` | `null` | Custom border color |
| `borderRadius` | `double` | `12` | Corner radius |
| `textStyle` | `TextStyle?` | `null` | Custom text style |
| `loadingIndicatorColor` | `Color?` | `null` | Spinner color |
| `isFullWidth` | `bool` | `false` | Full width button |

### Enums

#### PezyButtonVariant
- `filled` - Solid filled button
- `outlined` - Hollow button with border
- `accent` - Gold/amber accent button

#### PezyButtonSize
- `small` - 40dp height
- `medium` - 48dp height (default)
- `large` - 56dp height

## Styling with Theme

The button automatically uses theme colors from `AppColors`:

- **Filled**: `AppColors.primaryBlue` background, white text
- **Outlined**: Transparent background, blue border and text
- **Accent**: `AppColors.accentAmber` background, black text
- **Disabled**: `AppColors.dividerColor` background, muted text

Text sizes follow `AppTextStyles` based on button size.

## Best Practices

1. **Use `isFullWidth` for form buttons** - Makes better use of space
2. **Provide loading feedback** - Use `isLoading` during async operations
3. **Handle disabled state** - Show disabled UI for unavailable actions
4. **Consistent sizing** - Use small, medium, large sizes consistently
5. **Icon usage** - Add icons for better visual communication
6. **Color consistency** - Use variant enums instead of custom colors when possible

## Accessibility

- Buttons are touch-friendly with 48dp+ minimum height
- Clear visual feedback for all states (loading, disabled)
- High contrast between text and background
- Proper ripple feedback on tap
