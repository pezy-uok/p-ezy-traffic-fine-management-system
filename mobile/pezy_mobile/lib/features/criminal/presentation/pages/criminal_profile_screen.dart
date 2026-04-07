import 'package:flutter/material.dart';
import '../../../../core/theme/index.dart';
import '../providers/most_wanted_provider.dart';

/// Criminal Profile Detail Screen
///
/// This screen displays detailed information about a most wanted criminal with
/// a modern, attractive UI design featuring gradient backgrounds and polished components.
class CriminalProfileScreen extends StatefulWidget {
  final MostWantedCriminal criminal;

  const CriminalProfileScreen({
    super.key,
    required this.criminal,
  });

  @override
  State<CriminalProfileScreen> createState() => _CriminalProfileScreenState();
}

class _CriminalProfileScreenState extends State<CriminalProfileScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: CustomScrollView(
          slivers: [
            // Modern hero app bar with gradient
            SliverAppBar(
              expandedHeight: 280,
              pinned: true,
              elevation: 0,
              backgroundColor: Colors.transparent,
              leading: Padding(
                padding: const EdgeInsets.all(8),
                child: GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.15),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.arrow_back,
                      color: AppColors.accentRed,
                    ),
                  ),
                ),
              ),
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        AppColors.accentRed.withValues(alpha: 0.9),
                        AppColors.accentRed.withValues(alpha: 0.7),
                      ],
                    ),
                  ),
                  child: SafeArea(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Animated avatar
                        ScaleTransition(
                          scale: Tween<double>(begin: 0.8, end: 1).animate(
                            CurvedAnimation(
                              parent: _animationController,
                              curve: Curves.elasticOut,
                            ),
                          ),
                          child: Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white.withValues(alpha: 0.95),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.25),
                                  blurRadius: 20,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: ClipOval(
                              child: widget.criminal.photoPath != null && widget.criminal.photoPath!.isNotEmpty
                                  ? Image.network(
                                      'http://localhost:8000${widget.criminal.photoPath}',
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        return Container(
                                          color: Colors.grey[300],
                                          child: Icon(
                                            Icons.person,
                                            color: AppColors.accentRed,
                                            size: 60,
                                          ),
                                        );
                                      },
                                      loadingBuilder: (context, child, loadingProgress) {
                                        if (loadingProgress == null) return child;
                                        return Center(
                                          child: CircularProgressIndicator(
                                            value: loadingProgress.expectedTotalBytes != null
                                                ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                                                : null,
                                            strokeWidth: 2,
                                            valueColor: AlwaysStoppedAnimation<Color>(
                                              AppColors.accentRed.withValues(alpha: 0.7),
                                            ),
                                          ),
                                        );
                                      },
                                    )
                                  : Icon(
                                      Icons.person,
                                      color: AppColors.accentRed,
                                      size: 60,
                                    ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          widget.criminal.name,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            // Main content
            SliverToBoxAdapter(
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(24),
                    topRight: Radius.circular(24),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.screenPaddingHorizontal,
                    vertical: 24,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status chips
                      if (widget.criminal.isWanted || widget.criminal.dangerLevel != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 24),
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              if (widget.criminal.isWanted)
                                _buildStatusChip(
                                  'WANTED',
                                  Icons.warning_rounded,
                                  AppColors.accentRed,
                                ),
                              if (widget.criminal.dangerLevel != null &&
                                  widget.criminal.dangerLevel!.isNotEmpty)
                                _buildStatusChip(
                                  widget.criminal.dangerLevel!.toUpperCase(),
                                  Icons.security,
                                  _getDangerLevelColor(widget.criminal.dangerLevel!),
                                ),
                            ],
                          ),
                        ),

                      // Basic Information Card
                      _buildModernCard(
                        title: 'Personal Information',
                        icon: Icons.person_outline,
                        children: [
                          _buildModernInfoRow('First Name', widget.criminal.firstName),
                          const SizedBox(height: 16),
                          _buildModernInfoRow('Last Name', widget.criminal.lastName),
                          if (widget.criminal.dateOfBirth != null) ...[
                            const SizedBox(height: 16),
                            _buildModernInfoRow(
                              'Date of Birth',
                              widget.criminal.dateOfBirth!,
                            ),
                          ],
                          if (widget.criminal.gender != null) ...[
                            const SizedBox(height: 16),
                            _buildModernInfoRow(
                              'Gender',
                              widget.criminal.gender!.toUpperCase(),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Identification Card
                      _buildModernCard(
                        title: 'Identification',
                        icon: Icons.badge_outlined,
                        children: [
                          if (widget.criminal.identificationNumber != null)
                            _buildModernInfoRow(
                              'ID Number',
                              widget.criminal.identificationNumber!,
                              monoFont: true,
                            ),
                          const SizedBox(height: 16),
                          _buildModernInfoRow(
                            'Status',
                            widget.criminal.status.toUpperCase(),
                            color: _getStatusColor(widget.criminal.status),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Criminal History Card
                      _buildModernCard(
                        title: 'Criminal History',
                        icon: Icons.history,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: _buildStatBox(
                                  'Arrested Before',
                                  widget.criminal.arrestedBefore ? 'Yes' : 'No',
                                  widget.criminal.arrestedBefore
                                      ? AppColors.error
                                      : AppColors.success,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildStatBox(
                                  'Arrests',
                                  '${widget.criminal.arrestCount}',
                                  AppColors.accentRed,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Physical Description Card
                      if (widget.criminal.description != null &&
                          widget.criminal.description!.isNotEmpty)
                        _buildModernCard(
                          title: 'Physical Description',
                          icon: Icons.visibility_outlined,
                          children: [
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: AppColors.borderColor,
                                ),
                              ),
                              child: Text(
                                widget.criminal.description!,
                                style: TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 14,
                                  height: 1.6,
                                ),
                              ),
                            ),
                          ],
                        ),

                      if (widget.criminal.description != null &&
                          widget.criminal.description!.isNotEmpty)
                        const SizedBox(height: 20),

                      // Known Aliases Card
                      if (widget.criminal.knownAliases != null &&
                          widget.criminal.knownAliases!.isNotEmpty)
                        _buildModernCard(
                          title: 'Known Aliases',
                          icon: Icons.person_search,
                          children: [
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: widget.criminal.knownAliases!
                                  .map(
                                    (alias) => Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 8,
                                      ),
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            AppColors.accentRed
                                                .withValues(alpha: 0.1),
                                            AppColors.accentRed
                                                .withValues(alpha: 0.05),
                                          ],
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(20),
                                        border: Border.all(
                                          color: AppColors.accentRed
                                              .withValues(alpha: 0.3),
                                        ),
                                      ),
                                      child: Text(
                                        alias,
                                        style: TextStyle(
                                          color: AppColors.accentRed,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  )
                                  .toList(),
                            ),
                          ],
                        ),

                      if (widget.criminal.knownAliases != null &&
                          widget.criminal.knownAliases!.isNotEmpty)
                        const SizedBox(height: 20),

                      // Report button with modern style
                      Container(
                        width: double.infinity,
                        height: 54,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              AppColors.accentRed,
                              AppColors.accentRed.withAlpha(220),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.accentRed.withValues(alpha: 0.35),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: const Text(
                                    '✓ Sighting reported successfully',
                                  ),
                                  backgroundColor: AppColors.success,
                                  duration: const Duration(seconds: 2),
                                  behavior: SnackBarBehavior.floating,
                                  margin: const EdgeInsets.all(16),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              );
                            },
                            borderRadius: BorderRadius.circular(14),
                            child: Center(
                              child: Text(
                                'REPORT SIGHTING',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16,
                                  letterSpacing: 1.2,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build a modern card with gradient header
  Widget _buildModernCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.borderColor,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Gradient header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.accentRed.withValues(alpha: 0.08),
                  AppColors.accentRed.withValues(alpha: 0.03),
                ],
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
              border: Border(
                bottom: BorderSide(
                  color: AppColors.borderColor,
                ),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  color: AppColors.accentRed,
                  size: 22,
                ),
                const SizedBox(width: 10),
                Text(
                  title,
                  style: TextStyle(
                    color: Colors.black87,
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                    letterSpacing: 0.3,
                  ),
                ),
              ],
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: children,
            ),
          ),
        ],
      ),
    );
  }

  /// Build modern info row with better styling
  Widget _buildModernInfoRow(
    String label,
    String value, {
    Color? color,
    bool monoFont = false,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          label,
          style: TextStyle(
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
            fontSize: 13,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(width: 12),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: TextStyle(
              color: color ?? Colors.black87,
              fontWeight: FontWeight.w700,
              fontSize: 14,
              fontFamily: monoFont ? 'monospace' : null,
            ),
          ),
        ),
      ],
    );
  }

  /// Build stat box for criminal history
  Widget _buildStatBox(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w800,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }

  /// Build status chip
  Widget _buildStatusChip(String label, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            color.withValues(alpha: 0.15),
            color.withValues(alpha: 0.08),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: color.withValues(alpha: 0.4),
        ),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.1),
            blurRadius: 4,
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            color: color,
            size: 16,
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w700,
              fontSize: 12,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  /// Get color for status badge
  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return AppColors.success;
      case 'inactive':
        return Colors.grey;
      case 'deceased':
        return AppColors.error;
      case 'arrested':
        return AppColors.accentRed;
      default:
        return Colors.blue;
    }
  }

  /// Get color for danger level
  Color _getDangerLevelColor(String level) {
    switch (level.toLowerCase()) {
      case 'low':
        return AppColors.success;
      case 'medium':
        return Colors.orange;
      case 'high':
        return Colors.deepOrange;
      case 'critical':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }
}
