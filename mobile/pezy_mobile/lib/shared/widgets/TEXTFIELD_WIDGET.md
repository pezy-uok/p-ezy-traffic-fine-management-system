# PezyTextField Widget

A customizable, reusable text field widget with validation, error states, helper text, and full theme integration.

## Features

- **Variants**: Filled and outlined
- **Validation**: Built-in validator support with error display
- **Text Types**: Text, email, number, password, URL, and custom input types
- **Icons**: Prefix and suffix icons with callbacks
- **States**: Focused, disabled, error
- **Password Support**: Show/hide password toggle
- **Character Count**: Optional character limit display
- **Helper Text**: Informational text below field
- **Theme Integration**: Full integration with AppColors, AppTextStyles, AppSpacing
- **Accessibility**: High contrast, proper error indicators

## Basic Usage

### Simple Text Field
```dart
import 'shared/widgets/index.dart';

PezyTextField(
  label: 'Full Name',
  hint: 'Enter your full name',
  onChanged: (value) {
    print('Name: $value');
  },
)
```

### Email Field
```dart
PezyTextField(
  label: 'Email Address',
  hint: 'your.email@example.com',
  keyboardType: TextInputType.emailAddress,
  prefixIcon: Icons.email,
  validator: (value) {
    if (value?.isEmpty ?? true) return 'Email is required';
    if (!value!.contains('@')) return 'Invalid email format';
    return null;
  },
)
```

### Password Field
```dart
PezyTextField(
  label: 'Password',
  hint: 'Enter your password',
  obscureText: true,
  prefixIcon: Icons.lock,
  validator: (value) {
    if (value?.isEmpty ?? true) return 'Password is required';
    if ((value?.length ?? 0) < 8) return 'Minimum 8 characters';
    return null;
  },
)
```

## Variants

### Filled Variant (Default)
```dart
PezyTextField(
  label: 'Username',
  variant: PezyTextFieldVariant.filled,
  onChanged: (value) {},
)
```

### Outlined Variant
```dart
PezyTextField(
  label: 'Username',
  variant: PezyTextFieldVariant.outlined,
  onChanged: (value) {},
)
```

## Input Types

### Text Input
```dart
PezyTextField(
  label: 'Message',
  keyboardType: TextInputType.text,
  maxLines: 4,
  onChanged: (value) {},
)
```

### Email Input
```dart
PezyTextField(
  label: 'Email',
  keyboardType: TextInputType.emailAddress,
  onChanged: (value) {},
)
```

### Phone Number
```dart
PezyTextField(
  label: 'Phone',
  keyboardType: TextInputType.phone,
  onChanged: (value) {},
)
```

### Number Input
```dart
PezyTextField(
  label: 'Age',
  keyboardType: TextInputType.number,
  validator: (value) {
    if (int.tryParse(value ?? '') == null) {
      return 'Please enter a valid number';
    }
    return null;
  },
)
```

### Password Input
```dart
PezyTextField(
  label: 'Password',
  obscureText: true, // Enables password toggle
  keyboardType: TextInputType.visiblePassword,
  onChanged: (value) {},
)
```

## Validation

### Simple Validation
```dart
PezyTextField(
  label: 'Username',
  validator: (value) {
    if (value?.isEmpty ?? true) return 'Username is required';
    if ((value?.length ?? 0) < 3) return 'Minimum 3 characters';
    return null; // Valid
  },
)
```

### With Error Messages
```dart
PezyTextField(
  label: 'Email',
  errorText: 'Email already exists',
  keyboardType: TextInputType.emailAddress,
  onChanged: (value) {},
)
```

### Required Fields
```dart
PezyTextField(
  label: 'Full Name',
  isRequired: true, // Shows red asterisk
  validator: (value) {
    if (value?.isEmpty ?? true) return 'This field is required';
    return null;
  },
)
```

## Icons

### Prefix Icon
```dart
PezyTextField(
  label: 'Username',
  prefixIcon: Icons.person,
  onChanged: (value) {},
)
```

### Suffix Icon
```dart
PezyTextField(
  label: 'Search',
  suffixIcon: Icons.search,
  onSuffixIconPressed: () {
    print('Search pressed');
  },
)
```

### Custom Icon Widget
```dart
PezyTextField(
  label: 'Amount',
  prefixIconWidget: Padding(
    padding: EdgeInsets.all(AppSpacing.md),
    child: Text('\$'),
  ),
  keyboardType: TextInputType.number,
)
```

### Password Toggle (Automatic)
```dart
PezyTextField(
  label: 'Password',
  obscureText: true, // Automatically shows visibility icon
  onChanged: (value) {},
)
```

## Helper Text and Character Count

### Helper Text
```dart
PezyTextField(
  label: 'Password',
  helperText: 'At least 8 characters with uppercase, lowercase, and numbers',
  obscureText: true,
)
```

### Character Count
```dart
PezyTextField(
  label: 'Bio',
  hint: 'Tell us about yourself',
  maxLength: 280,
  showCharacterCount: true,
  maxLines: 3,
)
```

## States

### Enabled (Default)
```dart
PezyTextField(
  label: 'Active Field',
  enabled: true,
)
```

### Disabled
```dart
PezyTextField(
  label: 'Disabled Field',
  enabled: false,
)
```

### With Focus
```dart
final _focusNode = FocusNode();

// Somewhere in the widget
PezyTextField(
  label: 'Focused Field',
  focusNode: _focusNode,
)

// To focus programmatically
_focusNode.requestFocus();
```

### Error State
```dart
PezyTextField(
  label: 'Username',
  errorText: 'Username already taken',
  onChanged: (value) {},
)
```

## Custom Colors

### Custom Background
```dart
PezyTextField(
  label: 'Field',
  backgroundColor: Colors.purple.withOpacity(0.1),
)
```

### Custom Border Colors
```dart
PezyTextField(
  label: 'Field',
  borderColor: Colors.blue,
  focusedBorderColor: Colors.deepBlue,
  errorBorderColor: Colors.red,
)
```

### Custom Text Colors
```dart
PezyTextField(
  label: 'Field',
  textColor: Colors.white,
  labelColor: Colors.amber,
  hintTextColor: Colors.grey,
  helperTextColor: Colors.grey,
  errorTextColor: Colors.red,
)
```

## Text Capitalization

```dart
// Capitalize first letter
PezyTextField(
  label: 'Name',
  textCapitalization: TextCapitalization.words,
)

// All caps
PezyTextField(
  label: 'Zip Code',
  textCapitalization: TextCapitalization.characters,
)

// Sentences
PezyTextField(
  label: 'Bio',
  textCapitalization: TextCapitalization.sentences,
  maxLines: 3,
)
```

## Controlled Input

### With TextEditingController
```dart
final _controller = TextEditingController();

// Listen to changes
_controller.addListener(() {
  print('Text: ${_controller.text}');
});

// Clear field
_controller.clear();

// Set value
_controller.text = 'New value';

// Use in widget
PezyTextField(
  controller: _controller,
)

// Don't forget to dispose
@override
void dispose() {
  _controller.dispose();
  super.dispose();
}
```

## Input Formatting

### Phone Number Format
```dart
PezyTextField(
  label: 'Phone',
  keyboardType: TextInputType.phone,
  inputFormatter: (value) {
    // Format: (123) 456-7890
    value = value.replaceAll(RegExp(r'\D'), '');
    if (value.length >= 6) {
      return '(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}';
    } else if (value.length >= 3) {
      return '(${value.substring(0, 3)}) ${value.substring(3)}';
    }
    return value;
  },
)
```

## Common Patterns

### Login Form
```dart
class LoginForm extends StatefulWidget {
  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _emailError;
  String? _passwordError;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _validateAndSubmit() {
    setState(() {
      _emailError = null;
      _passwordError = null;
    });

    bool isValid = true;

    if (_emailController.text.isEmpty) {
      setState(() => _emailError = 'Email is required');
      isValid = false;
    }

    if (_passwordController.text.isEmpty) {
      setState(() => _passwordError = 'Password is required');
      isValid = false;
    }

    if (isValid) {
      // Submit form
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        PezyTextField(
          label: 'Email',
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          prefixIcon: Icons.email,
          errorText: _emailError,
          validator: (value) {
            if (value?.isEmpty ?? true) return 'Email is required';
            if (!value!.contains('@')) return 'Invalid email format';
            return null;
          },
        ),
        const SizedBox(height: AppSpacing.lg),
        PezyTextField(
          label: 'Password',
          controller: _passwordController,
          obscureText: true,
          prefixIcon: Icons.lock,
          errorText: _passwordError,
          validator: (value) {
            if (value?.isEmpty ?? true) return 'Password is required';
            return null;
          },
        ),
        const SizedBox(height: AppSpacing.xl),
        PezyButton(
          label: 'Sign In',
          isFullWidth: true,
          onPressed: _validateAndSubmit,
        ),
      ],
    );
  }
}
```

### Search Field
```dart
PezyTextField(
  hint: 'Search users...',
  prefixIcon: Icons.search,
  suffixIcon: Icons.clear,
  onSuffixIconPressed: () {
    // Clear search
  },
  onChanged: (value) {
    // Search users
  },
)
```

### Multi-line Text Area
```dart
PezyTextField(
  label: 'Message',
  hint: 'Enter your message',
  maxLines: 5,
  maxLength: 500,
  showCharacterCount: true,
  keyboardType: TextInputType.multiline,
  textCapitalization: TextCapitalization.sentences,
)
```

### Price Input
```dart
PezyTextField(
  label: 'Price',
  prefixIconWidget: Padding(
    padding: EdgeInsets.all(AppSpacing.md),
    child: Text(
      '\$',
      style: AppTextStyles.bodyLarge,
    ),
  ),
  keyboardType: TextInputType.numberWithOptions(decimal: true),
  inputFormatter: (value) {
    return '\$${value}';
  },
)
```

## API Reference

### Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | String? | null | Field label |
| `hint` | String? | null | Placeholder text |
| `helperText` | String? | null | Helper text below field |
| `errorText` | String? | null | Error message |
| `controller` | TextEditingController? | null | Text controller |
| `onChanged` | ValueChanged<String>? | null | Change callback |
| `onSubmitted` | VoidCallback? | null | Submit callback |
| `obscureText` | bool | false | Hide text (password) |
| `keyboardType` | TextInputType | text | Input type |
| `maxLines` | int? | 1 | Maximum lines |
| `maxLength` | int? | null | Max characters |
| `enabled` | bool | true | Enable field |
| `showCharacterCount` | bool | false | Show char count |
| `variant` | enum | filled | Field style |
| `prefixIcon` | IconData? | null | Left icon |
| `prefixIconWidget` | Widget? | null | Custom left widget |
| `suffixIcon` | IconData? | null | Right icon |
| `suffixIconWidget` | Widget? | null | Custom right widget |
| `onSuffixIconPressed` | VoidCallback? | null | Icon tap callback |
| `backgroundColor` | Color? | null | Custom bg color |
| `borderColor` | Color? | null | Custom border |
| `focusedBorderColor` | Color? | null | Focus border color |
| `errorBorderColor` | Color? | null | Error border color |
| `textColor` | Color? | null | Text color |
| `hintTextColor` | Color? | null | Hint color |
| `labelColor` | Color? | null | Label color |
| `helperTextColor` | Color? | null | Helper text color |
| `errorTextColor` | Color? | null | Error text color |
| `borderRadius` | double | 12 | Corner radius |
| `contentPadding` | EdgeInsets? | null | Custom padding |
| `textStyle` | TextStyle? | null | Custom text style |
| `labelStyle` | TextStyle? | null | Custom label style |
| `hintStyle` | TextStyle? | null | Custom hint style |
| `inputFormatter` | Function? | null | Text formatter |
| `validator` | Function? | null | Validator function |
| `autofocus` | bool | false | Auto focus |
| `focusNode` | FocusNode? | null | Focus node |
| `textCapitalization` | enum | none | Capitalization |
| `isRequired` | bool | false | Show required * |
| `errorIconColor` | Color? | null | Error icon color |

### Enums

#### PezyTextFieldVariant
- `filled` - Dark background with border
- `outlined` - Transparent with border outline

## Styling with Theme

The field automatically uses theme colors:

- **Text**: `AppColors.textLight`
- **Hint**: `AppColors.textMutedLight`
- **Helper**: `AppColors.textMuted`
- **Error**: `AppColors.error`
- **Border**: `AppColors.dividerColor` (default), `AppColors.primaryBlue` (focused)
- **Background**: `AppColors.surfaceDark` (filled)
- **Disabled**: `AppColors.dividerColor`

Text sizes follow `AppTextStyles`:
- Label: `titleSmall`
- Text/Hint: `bodyMedium`
- Helper/Error: `bodySmall`

## Best Practices

1. **Always provide labels** - Improves accessibility and UX
2. **Use appropriate keyboard types** - Improves mobile UX
3. **Validate on submit** - Don't validate on every keystroke
4. **Show helpful error messages** - Be specific about what's wrong
5. **Use required indicator** - Show users which fields are mandatory
6. **Provide helper text** - Guide users on expected input format
7. **Disable during submission** - Prevent duplicate submissions
8. **Clear controllers** - Always dispose of TextEditingController
9. **Use consistent sizing** - Maintain alignment in forms

## Accessibility

- Proper label association for screen readers
- High contrast error indicators
- Clear visual states (focused, disabled, error)
- Error icon with text for clarity
- Touch-friendly input areas (minimum 48dp height)
- Clear focus indicators

## Focus Management

```dart
final _emailFocus = FocusNode();
final _passwordFocus = FocusNode();

// Move focus to next field
_emailFocus.unfocus();
_passwordFocus.requestFocus();

// Dispose
@override
void dispose() {
  _emailFocus.dispose();
  _passwordFocus.dispose();
  super.dispose();
}
```

## Form Submission

```dart
void _submitForm() {
  // Validate all fields
  String? emailError = _validateEmail(_emailController.text);
  String? passwordError = _validatePassword(_passwordController.text);

  if (emailError == null && passwordError == null) {
    // Submit form
    _submitLogin();
  } else {
    setState(() {
      _emailError = emailError;
      _passwordError = passwordError;
    });
  }
}
```
