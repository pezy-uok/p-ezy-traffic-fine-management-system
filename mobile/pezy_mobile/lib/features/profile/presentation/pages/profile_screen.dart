import 'package:flutter/material.dart';
import '../../../../core/theme/index.dart';
import '../../../../shared/widgets/index.dart';

/// Profile screen
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF8FAFC),
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
                        color: AppColors.primaryBlue.withValues(alpha: 0.1),
                        border: Border.all(
                          color: AppColors.primaryBlue,
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: Icon(
                          Icons.person,
                          size: 60,
                          color: AppColors.primaryBlue,
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sectionGap),

                    // Name
                    Text(
                      'John Doe',
                      style: AppTextStyles.headlineSmall.copyWith(color: Colors.black87, fontWeight: FontWeight.w700, fontSize: 22),
                    ),
                    const SizedBox(height: AppSpacing.sm),

                    // License number
                    Text(
                      'License: DL-123456789',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: Color(0xFF64748B),
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
                value: 'john.doe@example.com',
              ),
              const SizedBox(height: AppSpacing.md),
              _buildProfileOption(
                icon: Icons.phone,
                label: 'Phone',
                value: '+91 9876543210',
              ),
              const SizedBox(height: AppSpacing.md),
              _buildProfileOption(
                icon: Icons.location_on,
                label: 'Location',
                value: 'Mumbai, Maharashtra',
              ),
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

              // Logout button
              PezyButton(
                label: 'Logout',
                variant: PezyButtonVariant.outlined,
                isFullWidth: true,
                borderColor: AppColors.error,
                textColor: AppColors.error,
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Logging out...')),
                  );
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
            style: AppTextStyles.titleLarge.copyWith(color: AppColors.primaryBlue, fontWeight: FontWeight.w700, fontSize: 20),
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
              color: AppColors.primaryBlue.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.primaryBlue, size: 24),
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
                color: AppColors.primaryBlue.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: AppColors.primaryBlue, size: 24),
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
