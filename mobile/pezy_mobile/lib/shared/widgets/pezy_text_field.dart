import 'package:flutter/material.dart';
import '../../core/theme/index.dart';

/// Custom text field widget with validation, states, and customization
///
/// Supports:
/// - Filled and outlined variants
/// - Input validation and error states
/// - Helper text and error messages
/// - Password field support
/// - Prefix and suffix icons
/// - Custom styling and theming
class PezyTextField extends StatefulWidget {
  /// Label text displayed above the field
  final String? label;

  /// Hint text displayed inside the field
  final String? hint;

  /// Helper text displayed below the field
  final String? helperText;

  /// Error message displayed below the field
  final String? errorText;

  /// Controller for managing text input
  final TextEditingController? controller;

  /// Callback when text changes
  final ValueChanged<String>? onChanged;

  /// Callback when field is submitted
  final VoidCallback? onSubmitted;

  /// Whether to obscure text (for password fields)
  final bool obscureText;

  /// Input type (text, email, number, password, etc.)
  final TextInputType keyboardType;

  /// Maximum number of lines
  final int? maxLines;

  /// Maximum number of characters
  final int? maxLength;

  /// Whether field is enabled
  final bool enabled;

  /// Whether to show character count
  final bool showCharacterCount;

  /// Text field variant (filled or outlined)
  final PezyTextFieldVariant variant;

  /// Icon displayed before text
  final IconData? prefixIcon;

  /// Custom widget displayed before text
  final Widget? prefixIconWidget;

  /// Icon displayed after text (optional suffix widget)
  final IconData? suffixIcon;

  /// Custom widget displayed after text
  final Widget? suffixIconWidget;

  /// Callback for suffix icon tap
  final VoidCallback? onSuffixIconPressed;

  /// Custom background color
  final Color? backgroundColor;

  /// Custom border color
  final Color? borderColor;

  /// Custom focused border color
  final Color? focusedBorderColor;

  /// Custom error border color
  final Color? errorBorderColor;

  /// Custom text color
  final Color? textColor;

  /// Custom hint text color
  final Color? hintTextColor;

  /// Custom label color
  final Color? labelColor;

  /// Custom helper text color
  final Color? helperTextColor;

  /// Custom error text color
  final Color? errorTextColor;

  /// Border radius
  final double borderRadius;

  /// Content padding
  final EdgeInsets? contentPadding;

  /// Custom text style
  final TextStyle? textStyle;

  /// Custom label style
  final TextStyle? labelStyle;

  /// Custom hint style
  final TextStyle? hintStyle;

  /// Input formatter function
  final String Function(String)? inputFormatter;

  /// Custom validator function
  final String? Function(String?)? validator;

  /// Whether field has focus
  final bool autofocus;

  /// Focus node
  final FocusNode? focusNode;

  /// Text capitalization
  final TextCapitalization textCapitalization;

  /// Whether field is required
  final bool isRequired;

  /// Custom error icon color
  final Color? errorIconColor;

  const PezyTextField({
    super.key,
    this.label,
    this.hint,
    this.helperText,
    this.errorText,
    this.controller,
    this.onChanged,
    this.onSubmitted,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.maxLines = 1,
    this.maxLength,
    this.enabled = true,
    this.showCharacterCount = false,
    this.variant = PezyTextFieldVariant.filled,
    this.prefixIcon,
    this.prefixIconWidget,
    this.suffixIcon,
    this.suffixIconWidget,
    this.onSuffixIconPressed,
    this.backgroundColor,
    this.borderColor,
    this.focusedBorderColor,
    this.errorBorderColor,
    this.textColor,
    this.hintTextColor,
    this.labelColor,
    this.helperTextColor,
    this.errorTextColor,
    this.borderRadius = AppSpacing.cornerRadius,
    this.contentPadding,
    this.textStyle,
    this.labelStyle,
    this.hintStyle,
    this.inputFormatter,
    this.validator,
    this.autofocus = false,
    this.focusNode,
    this.textCapitalization = TextCapitalization.none,
    this.isRequired = false,
    this.errorIconColor,
  }) : super();

  @override
  State<PezyTextField> createState() => _PezyTextFieldState();
}

class _PezyTextFieldState extends State<PezyTextField> {
  late FocusNode _focusNode;
  bool _isFocused = false;
  bool _showPassword = false;
  String? _validationError;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_handleFocusChange);
  }

  @override
  void dispose() {
    if (widget.focusNode == null) {
      _focusNode.dispose();
    } else {
      _focusNode.removeListener(_handleFocusChange);
    }
    super.dispose();
  }

  void _handleFocusChange() {
    setState(() => _isFocused = _focusNode.hasFocus);
  }

  void _validateInput(String value) {
    if (widget.validator != null) {
      setState(() => _validationError = widget.validator!(value));
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasError = widget.errorText != null || _validationError != null;
    final errorMessage = widget.errorText ?? _validationError;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label with required indicator
        if (widget.label != null) ...[
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: widget.label,
                  style: widget.labelStyle ??
                      AppTextStyles.titleSmall.copyWith(
                        color: widget.labelColor ??
                            (hasError
                                ? AppColors.error
                                : AppColors.textPrimary),
                      ),
                ),
                if (widget.isRequired)
                  TextSpan(
                    text: ' *',
                    style: AppTextStyles.titleSmall.copyWith(
                      color: AppColors.error,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
        ],

        // Text field
        TextField(
          controller: widget.controller,
          focusNode: _focusNode,
          onChanged: (value) {
            _validateInput(value);
            widget.onChanged?.call(value);
          },
          onSubmitted: (_) => widget.onSubmitted?.call(),
          obscureText: widget.obscureText && !_showPassword,
          keyboardType: widget.keyboardType,
          maxLines: widget.obscureText ? 1 : widget.maxLines,
          maxLength: widget.maxLength,
          enabled: widget.enabled,
          autofocus: widget.autofocus,
          textCapitalization: widget.textCapitalization,
          style: widget.textStyle ??
              AppTextStyles.bodyMedium.copyWith(
                color: widget.textColor ?? AppColors.textPrimary,
              ),
          decoration: InputDecoration(
            hintText: widget.hint,
            hintStyle: widget.hintStyle ??
                AppTextStyles.bodyMedium.copyWith(
                  color: widget.hintTextColor ?? AppColors.textTertiary,
                ),
            helperText: hasError ? null : widget.helperText,
            helperStyle: AppTextStyles.bodySmall.copyWith(
              color:
                  widget.helperTextColor ?? AppColors.textSecondary,
            ),
            errorText: null, // Handled manually below
            counterText: widget.showCharacterCount ? null : '',
            counterStyle: AppTextStyles.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
            filled: widget.variant == PezyTextFieldVariant.filled,
            fillColor: widget.backgroundColor ??
                (widget.enabled
                    ? AppColors.lightGray
                    : AppColors.mediumGray),
            contentPadding: widget.contentPadding ??
                const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.md,
                ),
            border: _buildBorder(AppColors.mediumGray),
            enabledBorder: _buildBorder(
              widget.borderColor ?? AppColors.mediumGray,
            ),
            focusedBorder: _buildBorder(
              widget.focusedBorderColor ?? AppColors.primaryBlack,
              width: 2,
            ),
            errorBorder: _buildBorder(
              widget.errorBorderColor ?? AppColors.error,
            ),
            focusedErrorBorder: _buildBorder(
              widget.errorBorderColor ?? AppColors.error,
              width: 2,
            ),
            disabledBorder: _buildBorder(AppColors.mediumGray),
            prefixIcon: _buildPrefixIcon(),
            suffixIcon: _buildSuffixIcon(hasError),
            prefixIconConstraints: const BoxConstraints(
              minWidth: 40,
              minHeight: 24,
            ),
            suffixIconConstraints: const BoxConstraints(
              minWidth: 40,
              minHeight: 24,
            ),
          ),
        ),

        // Error or helper text
        const SizedBox(height: AppSpacing.sm),
        if (hasError) ...[
          Row(
            children: [
              Icon(
                Icons.error_outline,
                size: 16,
                color: widget.errorIconColor ?? AppColors.error,
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  errorMessage ?? '',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: widget.errorTextColor ?? AppColors.error,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ] else if (widget.helperText != null && !widget.showCharacterCount) ...[
          Text(
            widget.helperText ?? '',
            style: AppTextStyles.bodySmall.copyWith(
              color: widget.helperTextColor ?? AppColors.textSecondary,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ],
    );
  }

  /// Build input border based on variant
  InputBorder _buildBorder(Color color, {double width = 1}) {
    switch (widget.variant) {
      case PezyTextFieldVariant.filled:
        return OutlineInputBorder(
          borderRadius: BorderRadius.circular(widget.borderRadius),
          borderSide: BorderSide(color: color, width: width),
        );
      case PezyTextFieldVariant.outlined:
        return OutlineInputBorder(
          borderRadius: BorderRadius.circular(widget.borderRadius),
          borderSide: BorderSide(color: color, width: width),
        );
    }
  }

  /// Build prefix icon widget
  Widget? _buildPrefixIcon() {
    if (widget.prefixIconWidget != null) {
      return widget.prefixIconWidget;
    }
    if (widget.prefixIcon != null) {
      return Icon(
        widget.prefixIcon,
        color: _isFocused ? AppColors.primaryBlack : AppColors.textSecondary,
        size: AppSpacing.iconSizeMedium,
      );
    }
    return null;
  }

  /// Build suffix icon widget
  Widget? _buildSuffixIcon(bool hasError) {
    // Show error icon if there's an error
    if (hasError) {
      return Icon(
        Icons.error_outline,
        color: widget.errorIconColor ?? AppColors.error,
        size: AppSpacing.iconSizeMedium,
      );
    }

    // Show password toggle icon for password fields
    if (widget.obscureText) {
      return GestureDetector(
        onTap: () => setState(() => _showPassword = !_showPassword),
        child: Icon(
          _showPassword ? Icons.visibility : Icons.visibility_off,
          color: AppColors.textSecondary,
          size: AppSpacing.iconSizeMedium,
        ),
      );
    }

    // Show custom suffix icon if provided
    if (widget.suffixIconWidget != null) {
      return widget.suffixIconWidget;
    }

    if (widget.suffixIcon != null) {
      return GestureDetector(
        onTap: widget.onSuffixIconPressed,
        child: Icon(
          widget.suffixIcon,
          color: _isFocused ? AppColors.primaryBlack : AppColors.textSecondary,
          size: AppSpacing.iconSizeMedium,
        ),
      );
    }

    return null;
  }
}

/// Text field variant enum
enum PezyTextFieldVariant {
  /// Filled background variant
  filled,

  /// Outlined border variant
  outlined,
}
