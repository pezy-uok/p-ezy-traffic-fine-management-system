import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/index.dart';
import '../../../../shared/widgets/index.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

/// Profile screen
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final currentUser = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: PezyAppBar(
        title: 'Profile',
        showLogo: true,
        actions: [
          PezyAppBarAction(
            icon: Icons.edit,
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Edit profile pressed')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.screenPaddingHorizontal),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Profile header
              Center(
                child: Column(
                  children: [
                    // Avatar - Pro Max optimized
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.accentRed.withValues(alpha: 0.1),
                        border: Border.all(
                          color: AppColors.accentRed,
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: Icon(
                          Icons.person,
                          size: 60,
                          color: AppColors.accentRed,
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sectionGap),

                    // Name
                    Text(
                      currentUser?.name ?? 'User',
                      style: AppTextStyles.headlineSmall.copyWith(
                        color: Colors.black87,
                        fontWeight: FontWeight.w700,
                        fontSize: 22,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),

                    // Badge or role
                    if (currentUser != null)
                      Text(
                        (currentUser.badge?.isNotEmpty ?? false)
                            ? 'Badge: ${currentUser.badge}'
                            : 'Role: ${currentUser.role}',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: const Color(0xFF64748B),
                          fontSize: 13,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.sectionGap),

              // Quick stats
              Row(
                children: [
                  Expanded(
                    child: _buildQuickStat(
                      label: 'Active Fines',
                      value: '2',
                    ),
                  ),
                  const SizedBox(width: AppSpacing.lg),
                  Expanded(
                    child: _buildQuickStat(
                      label: 'Warnings',
                      value: '5',
                    ),
                  ),
                  const SizedBox(width: AppSpacing.lg),
                  Expanded(
                    child: _buildQuickStat(
                      label: 'Record Status',
                      value: 'Clean',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xl),

              // Account information
              Text(
                'Account Information',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              _buildProfileOption(
                icon: Icons.email,
                label: 'Email',
                value: currentUser?.email ?? 'N/A',
              ),
              const SizedBox(height: AppSpacing.md),
              if (currentUser?.phone != null && (currentUser!.phone?.isNotEmpty ?? false))
                ...[
                  _buildProfileOption(
                    icon: Icons.phone,
                    label: 'Phone',
                    value: currentUser!.phone ?? '',
                  ),
                  const SizedBox(height: AppSpacing.md),
                ],
              if (currentUser?.department != null && (currentUser!.department?.isNotEmpty ?? false))
                ...[
                  _buildProfileOption(
                    icon: Icons.domain,
                    label: 'Department',
                    value: currentUser!.department ?? '',
                  ),
                  const SizedBox(height: AppSpacing.md),
                ],
              const SizedBox(height: AppSpacing.xl),

              // Settings
              Text(
                'Settings',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              _buildSettingOption(
                icon: Icons.notifications,
                label: 'Notifications',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Notifications settings')),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.md),
              _buildSettingOption(
                icon: Icons.security,
                label: 'Security & Privacy',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Security settings')),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.md),
              _buildSettingOption(
                icon: Icons.help,
                label: 'Help & Support',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Help & Support')),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.xl),

              // DEBUG: Clear stored tokens (for testing login flow)
              if (!kIsWeb)
                PezyButton(
                  label: 'Clear Storage (Dev)',
                  variant: PezyButtonVariant.outlined,
                  isFullWidth: true,
                  borderColor: const Color(0xFFFFA500),
                  textColor: const Color(0xFFFFA500),
                  onPressed: () async {
                    final confirmed = await showDialog<bool>(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          title: const Text('Clear Storage'),
                          content: const Text(
                            'This will clear all stored tokens and log you out. Use this for testing the login flow.',
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(context).pop(false),
                              child: const Text('Cancel'),
                            ),
                            TextButton(
                              onPressed: () => Navigator.of(context).pop(true),
                              child: const Text(
                                'Clear',
                                style: TextStyle(color: Color(0xFFFFA500)),
                              ),
                            ),
                          ],
                        );
                      },
                    );

                    if (confirmed == true && context.mounted) {
                      try {
                        final tokenStorage = ref.read(tokenStorageServiceProvider);
                        await tokenStorage.clearAll();
                        
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Storage cleared! Restart the app to see login screen.'),
                              backgroundColor: Color(0xFFFFA500),
                            ),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Error: ${e.toString()}'),
                              backgroundColor: AppColors.error,
                            ),
                          );
                        }
                      }
                    }
                  },
                ),
              const SizedBox(height: AppSpacing.xl),

              // Logout button
              PezyButton(
                label: authState.isLoading ? 'Logging out...' : 'Logout',
                variant: PezyButtonVariant.outlined,
                isFullWidth: true,
                borderColor: AppColors.error,
                textColor: AppColors.error,
                isDisabled: authState.isLoading,
                onPressed: authState.isLoading
                    ? null
                    : () async {
                        try {
                          await ref.read(authProvider.notifier).logout();
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Logged out successfully'),
                                backgroundColor: AppColors.success,
                              ),
                            );
                            // Wait briefly then pop back to AppShell
                            // AppShell will automatically show LoginScreen
                            // because authProvider.isLoggedIn is now false
                            await Future.delayed(const Duration(milliseconds: 500));
                            if (context.mounted) {
                              Navigator.of(context).popUntil((route) => route.isFirst);
                            }
                          }
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Logout failed: ${e.toString()}'),
                                backgroundColor: AppColors.error,
                              ),
                            );
                          }
                        }
                      },
              ),
              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickStat({
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value,
            style: AppTextStyles.titleLarge.copyWith(color: AppColors.accentRed, fontWeight: FontWeight.w700, fontSize: 20),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            label,
            style: AppTextStyles.labelSmall.copyWith(color: Color(0xFF64748B), fontSize: 12),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildProfileOption({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.accentRed.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.accentRed, size: 24),
          ),
          const SizedBox(width: AppSpacing.lg),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTextStyles.labelSmall.copyWith(color: Color(0xFF94A3B8), fontSize: 12)),
                const SizedBox(height: AppSpacing.sm),
                Text(value, style: AppTextStyles.bodySmall.copyWith(color: Colors.black87, fontWeight: FontWeight.w500, fontSize: 14)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingOption({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.accentRed.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppColors.accentRed, size: 24),
            ),
            const SizedBox(width: AppSpacing.lg),
            Expanded(
              child: Text(label, style: AppTextStyles.bodySmall.copyWith(color: Colors.black87, fontWeight: FontWeight.w500, fontSize: 14)),
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: Color(0xFFCBD5E1),
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}
