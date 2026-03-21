import 'package:flutter/material.dart';
import '../../core/theme/index.dart';

/// Custom button widget with multiple variants and states
/// 
/// Supports:
/// - Filled and outlined variants
/// - Loading state with spinner
/// - Disabled state
/// - Custom sizing and styling
class PezyButton extends StatelessWidget {
  /// Button label text
  final String label;

  /// Callback when button is pressed
  final VoidCallback? onPressed;

  /// Whether button is in loading state
  final bool isLoading;

  /// Whether button is disabled
  final bool isDisabled;

  /// Button variant (filled or outlined)
  final PezyButtonVariant variant;

  /// Button size variant
  final PezyButtonSize size;

  /// Optional custom width
  final double? width;

  /// Optional custom height
  final double? height;

  /// Icon to display before text (optional)
  final IconData? prefixIcon;

  /// Icon to display after text (optional)
  final IconData? suffixIcon;

  /// Custom text color (overrides variant default)
  final Color? textColor;

  /// Custom background color (overrides variant default)
  final Color? backgroundColor;

  /// Custom border color (for outlined variant)
  final Color? borderColor;

  /// Border radius
  final double borderRadius;

  /// Custom text style (overrides size default)
  final TextStyle? textStyle;

  /// Loading indicator color
  final Color? loadingIndicatorColor;

  /// Whether to show full-width button
  final bool isFullWidth;

  const PezyButton({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.isDisabled = false,
    this.variant = PezyButtonVariant.filled,
    this.size = PezyButtonSize.medium,
    this.width,
    this.height,
    this.prefixIcon,
    this.suffixIcon,
    this.textColor,
    this.backgroundColor,
    this.borderColor,
    this.borderRadius = AppSpacing.cornerRadius,
    this.textStyle,
    this.loadingIndicatorColor,
    this.isFullWidth = false,
  });

  /// Get button height based on size
  double get _buttonHeight {
    if (height != null) return height!;
    switch (size) {
      case PezyButtonSize.small:
        return AppSpacing.buttonHeightSmall;
      case PezyButtonSize.medium:
        return AppSpacing.buttonHeight;
      case PezyButtonSize.large:
        return AppSpacing.buttonHeight + 8;
    }
  }

  /// Get text style based on size
  TextStyle get _textStyle {
    if (textStyle != null) return textStyle!;
    switch (size) {
      case PezyButtonSize.small:
        return AppTextStyles.labelMedium;
      case PezyButtonSize.medium:
        return AppTextStyles.button;
      case PezyButtonSize.large:
        return AppTextStyles.button.copyWith(fontSize: 16);
    }
  }

  /// Get button colors based on variant and state
  _ButtonColors get _colors {
    if (isDisabled) {
      return _ButtonColors(
        backgroundColor: AppColors.mediumGray,
        textColor: AppColors.textSecondary,
        borderColor: AppColors.mediumGray,
      );
    }

    switch (variant) {
      case PezyButtonVariant.filled:
        return _ButtonColors(
          backgroundColor:
              backgroundColor ?? AppColors.accentRed,
          textColor: textColor ?? AppColors.white,
          borderColor: backgroundColor ?? AppColors.accentRed,
        );
      case PezyButtonVariant.outlined:
        return _ButtonColors(
          backgroundColor: Colors.transparent,
          textColor: textColor ?? AppColors.accentRed,
          borderColor: borderColor ?? AppColors.accentRed,
        );
      case PezyButtonVariant.accent:
        return _ButtonColors(
          backgroundColor:
              backgroundColor ?? AppColors.accentRed,
          textColor: textColor ?? AppColors.white,
          borderColor: backgroundColor ?? AppColors.accentRed,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = _colors;
    final isClickable = !isLoading && !isDisabled;

    return Container(
      width: isFullWidth ? double.infinity : width,
      height: _buttonHeight,
      decoration: BoxDecoration(
        color: colors.backgroundColor,
        border: Border.all(
          color: colors.borderColor,
          width: variant == PezyButtonVariant.outlined ? 2 : 0,
        ),
        borderRadius: BorderRadius.circular(borderRadius),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isClickable ? onPressed : null,
          borderRadius: BorderRadius.circular(borderRadius),
          child: _buildButtonContent(colors),
        ),
      ),
    );
  }

  /// Build button content with text, icons, and loading indicator
  Widget _buildButtonContent(_ButtonColors colors) {
    if (isLoading) {
      return Center(
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(
              loadingIndicatorColor ?? colors.textColor,
            ),
          ),
        ),
      );
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (prefixIcon != null) ...[
          Icon(
            prefixIcon,
            color: colors.textColor,
            size: AppSpacing.iconSizeMedium,
          ),
          const SizedBox(width: AppSpacing.sm),
        ],
        Flexible(
          child: Text(
            label,
            style: _textStyle.copyWith(color: colors.textColor),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        if (suffixIcon != null) ...[
          const SizedBox(width: AppSpacing.sm),
          Icon(
            suffixIcon,
            color: colors.textColor,
            size: AppSpacing.iconSizeMedium,
          ),
        ],
      ],
    );
  }
}

/// Button variant enum
enum PezyButtonVariant {
  /// Solid filled button
  filled,

  /// Outlined button with transparent background
  outlined,

  /// Accent/gold button for secondary actions
  accent,
}

/// Button size enum
enum PezyButtonSize {
  /// Small button (40dp height)
  small,

  /// Medium button (48dp height) - default
  medium,

  /// Large button (56dp height)
  large,
}

/// Internal class to hold button color values
class _ButtonColors {
  final Color backgroundColor;
  final Color textColor;
  final Color borderColor;

  _ButtonColors({
    required this.backgroundColor,
    required this.textColor,
    required this.borderColor,
  });
}
