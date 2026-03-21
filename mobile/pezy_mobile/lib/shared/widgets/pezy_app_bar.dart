import 'package:flutter/material.dart';
import '../../core/theme/index.dart';

/// Custom reusable AppBar widget with logo, title, and action buttons
///
/// Designed with PEZY branding and supports:
/// - Logo/shield icon display
/// - Back button with custom callback
/// - Title text with modern styling
/// - Action buttons
/// - Custom subtitle
/// - Theme integration
class PezyAppBar extends StatelessWidget implements PreferredSizeWidget {
  /// Title text displayed in the app bar
  final String title;

  /// Subtitle text displayed below title (optional)
  final String? subtitle;

  /// Whether to show back button
  final bool showBackButton;

  /// Callback when back button is pressed
  final VoidCallback? onBackPressed;

  /// Whether to show PEZY logo
  final bool showLogo;

  /// Custom logo widget (if null, uses default shield icon)
  final Widget? customLogo;

  /// List of action buttons
  final List<PezyAppBarAction>? actions;

  /// App bar height
  final double height;

  /// Background color
  final Color? backgroundColor;

  /// Title color
  final Color? titleColor;

  /// Icon color
  final Color? iconColor;

  /// Whether to center title
  final bool centerTitle;

  /// Custom title style
  final TextStyle? titleStyle;

  /// Custom subtitle style
  final TextStyle? subtitleStyle;

  /// Use gradient background
  final bool useGradient;

  /// Elevation/shadow
  final double elevation;

  /// Whether to add bottom border
  final bool showBottomBorder;

  /// Custom padding
  final EdgeInsets? contentPadding;

  /// Leading widget override
  final Widget? leading;

  /// Flexible space widget (advanced)
  final Widget? flexibleSpace;

  const PezyAppBar({
    super.key,
    required this.title,
    this.subtitle,
    this.showBackButton = false,
    this.onBackPressed,
    this.showLogo = true,
    this.customLogo,
    this.actions,
    this.height = kToolbarHeight,
    this.backgroundColor,
    this.titleColor,
    this.iconColor,
    this.centerTitle = false,
    this.titleStyle,
    this.subtitleStyle,
    this.useGradient = false,
    this.elevation = 0,
    this.showBottomBorder = true,
    this.contentPadding,
    this.leading,
    this.flexibleSpace,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: _getBackgroundColor(),
      foregroundColor: iconColor ?? AppColors.textLight,
      elevation: elevation,
      toolbarHeight: height,
      automaticallyImplyLeading: false,
      title: _buildTitle(),
      centerTitle: centerTitle,
      leading: _buildLeading(context),
      actions: _buildActions(),
      flexibleSpace: flexibleSpace ??
          (useGradient ? _buildGradientBackground() : null),
      shape: showBottomBorder
          ? Border(
              bottom: BorderSide(
                color: AppColors.dividerColor.withValues(alpha: 0.3),
                width: 1,
              ),
            )
          : null,
      titleSpacing: contentPadding != null ? 0 : null,
    );
  }

  /// Build the title widget
  Widget _buildTitle() {
    if (subtitle != null) {
      return Padding(
        padding: contentPadding ?? EdgeInsets.zero,
        child: Column(
          crossAxisAlignment:
              centerTitle ? CrossAxisAlignment.center : CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              title,
              style: titleStyle ??
                  AppTextStyles.headlineSmall.copyWith(
                    color: titleColor ?? AppColors.textLight,
                  ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              subtitle!,
              style: subtitleStyle ??
                  AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textMuted,
                  ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      );
    }

    return Padding(
      padding: contentPadding ?? EdgeInsets.zero,
      child: Text(
        title,
        style: titleStyle ??
            AppTextStyles.headlineSmall.copyWith(
              color: titleColor ?? AppColors.textLight,
            ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  /// Build leading widget (logo and/or back button)
  Widget? _buildLeading(BuildContext context) {
    if (leading != null) {
      return leading;
    }

    if (showBackButton && showLogo) {
      return Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Back button
            GestureDetector(
              onTap: onBackPressed ?? () => Navigator.of(context).pop(),
              child: Icon(
                Icons.arrow_back_ios,
                color: iconColor ?? AppColors.textLight,
                size: AppSpacing.iconSizeMedium,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            // Logo
            if (showLogo) _buildLogo(),
          ],
        ),
      );
    }

    if (showBackButton) {
      return Padding(
        padding: const EdgeInsets.only(left: AppSpacing.lg),
        child: GestureDetector(
          onTap: onBackPressed ?? () => Navigator.of(context).pop(),
          child: Icon(
            Icons.arrow_back_ios,
            color: iconColor ?? AppColors.textLight,
            size: AppSpacing.iconSizeMedium,
          ),
        ),
      );
    }

    if (showLogo) {
      return Padding(
        padding: const EdgeInsets.only(left: AppSpacing.lg),
        child: Center(child: _buildLogo()),
      );
    }

    return null;
  }

  /// Build logo/shield icon
  Widget _buildLogo() {
    if (customLogo != null) {
      return customLogo!;
    }

    return Container(
      width: AppSpacing.buttonHeightSmall,
      height: AppSpacing.buttonHeightSmall,
      decoration: BoxDecoration(
        color: AppColors.accentAmber.withValues(alpha: 0.1),
        border: Border.all(
          color: AppColors.accentAmber,
          width: 2,
        ),
        borderRadius: BorderRadius.circular(AppSpacing.cornerRadius / 2),
      ),
      child: Icon(
        Icons.shield,
        color: AppColors.accentAmber,
        size: AppSpacing.iconSizeMedium,
      ),
    );
  }

  /// Build action buttons
  List<Widget>? _buildActions() {
    if (actions == null || actions!.isEmpty) {
      return null;
    }

    return actions!
        .map(
          (action) => Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
            child: Center(
              child: GestureDetector(
                onTap: action.onPressed,
                child: action.icon != null
                    ? Icon(
                        action.icon,
                        color:
                            action.iconColor ?? (iconColor ?? AppColors.textLight),
                        size: AppSpacing.iconSizeMedium,
                      )
                    : (action.widget ?? const SizedBox.shrink()),
              ),
            ),
          ),
        )
        .toList();
  }

  /// Get background color
  Color? _getBackgroundColor() {
    if (backgroundColor != null) {
      return backgroundColor;
    }
    return AppColors.backgroundDarkNavy;
  }

  /// Build gradient background
  Widget _buildGradientBackground() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.backgroundDarkNavy,
            AppColors.backgroundDarkerNavy,
          ],
        ),
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(height);
}

/// Represents an action button in the AppBar
class PezyAppBarAction {
  /// Icon to display
  final IconData? icon;

  /// Custom widget (alternative to icon)
  final Widget? widget;

  /// Callback when action is tapped
  final VoidCallback onPressed;

  /// Custom icon color
  final Color? iconColor;

  PezyAppBarAction({
    this.icon,
    this.widget,
    required this.onPressed,
    this.iconColor,
  }) : assert(icon != null || widget != null, 'Either icon or widget must be provided');
}

/// Pre-built AppBar variants for common use cases
class PezyAppBarVariants {
  /// Simple AppBar with title only
  static PreferredSizeWidget simple({
    required String title,
    Color? backgroundColor,
  }) {
    return PezyAppBar(
      title: title,
      showLogo: false,
      showBackButton: false,
      backgroundColor: backgroundColor,
    );
  }

  /// AppBar with back button and title
  static PreferredSizeWidget withBackButton({
    required String title,
    VoidCallback? onBack,
    Color? backgroundColor,
  }) {
    return PezyAppBar(
      title: title,
      showBackButton: true,
      onBackPressed: onBack,
      showLogo: true,
      backgroundColor: backgroundColor,
    );
  }

  /// AppBar with logo and title (no back button)
  static PreferredSizeWidget withLogo({
    required String title,
    Color? backgroundColor,
  }) {
    return PezyAppBar(
      title: title,
      showLogo: true,
      showBackButton: false,
      backgroundColor: backgroundColor,
    );
  }

  /// AppBar with search action
  static PreferredSizeWidget withSearch({
    required String title,
    required VoidCallback onSearchPressed,
    Color? backgroundColor,
  }) {
    return PezyAppBar(
      title: title,
      showLogo: true,
      actions: [
        PezyAppBarAction(
          icon: Icons.search,
          onPressed: onSearchPressed,
        ),
      ],
      backgroundColor: backgroundColor,
    );
  }

  /// AppBar with settings action
  static PreferredSizeWidget withSettings({
    required String title,
    required VoidCallback onSettingsPressed,
    Color? backgroundColor,
  }) {
    return PezyAppBar(
      title: title,
      showLogo: true,
      actions: [
        PezyAppBarAction(
          icon: Icons.settings,
          onPressed: onSettingsPressed,
        ),
      ],
      backgroundColor: backgroundColor,
    );
  }

  /// AppBar with multiple actions
  static PreferredSizeWidget withActions({
    required String title,
    required List<PezyAppBarAction> actions,
    Color? backgroundColor,
  }) {
    return PezyAppBar(
      title: title,
      showLogo: true,
      actions: actions,
      backgroundColor: backgroundColor,
    );
  }

  /// AppBar with back button and search
  static PreferredSizeWidget withBackAndSearch({
    required String title,
    VoidCallback? onBack,
    required VoidCallback onSearch,
    Color? backgroundColor,
  }) {
    return PezyAppBar(
      title: title,
      showBackButton: true,
      onBackPressed: onBack,
      showLogo: true,
      actions: [
        PezyAppBarAction(
          icon: Icons.search,
          onPressed: onSearch,
        ),
      ],
      backgroundColor: backgroundColor,
    );
  }
}
