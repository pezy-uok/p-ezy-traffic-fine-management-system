import 'package:flutter/material.dart';
import 'core/theme/index.dart';
import 'shared/widgets/index.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pezy Mobile',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const MyHomePage(title: 'Pezy Mobile'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  // Buttons state
  bool _isLoading = false;
  bool _isAnotherLoading = false;

  // TextField controllers and state
  late TextEditingController _fullNameController;
  late TextEditingController _emailController;
  late TextEditingController _passwordController;
  late TextEditingController _phoneController;
  late TextEditingController _bioController;
  late TextEditingController _searchController;

  String? _emailError;
  String? _passwordError;
  String? _phoneError;

  @override
  void initState() {
    super.initState();
    _fullNameController = TextEditingController();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
    _phoneController = TextEditingController();
    _bioController = TextEditingController();
    _searchController = TextEditingController();
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _bioController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _simulateLoading() {
    if (!_isLoading) {
      setState(() => _isLoading = true);
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) setState(() => _isLoading = false);
      });
    }
  }

  void _simulateAnotherLoading() {
    if (!_isAnotherLoading) {
      setState(() => _isAnotherLoading = true);
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) setState(() => _isAnotherLoading = false);
      });
    }
  }

  void _validateEmail(String value) {
    setState(() {
      if (value.isEmpty) {
        _emailError = 'Email is required';
      } else if (!value.contains('@')) {
        _emailError = 'Invalid email format';
      } else {
        _emailError = null;
      }
    });
  }

  void _validatePassword(String value) {
    setState(() {
      if (value.isEmpty) {
        _passwordError = 'Password is required';
      } else if (value.length < 8) {
        _passwordError = 'Minimum 8 characters';
      } else {
        _passwordError = null;
      }
    });
  }

  void _validatePhone(String value) {
    setState(() {
      if (value.isEmpty) {
        _phoneError = 'Phone is required';
      } else if (value.length < 10) {
        _phoneError = 'Invalid phone format';
      } else {
        _phoneError = null;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PezyAppBar(
        title: 'Pezy Mobile',
        subtitle: 'All Widgets Demo',
        showLogo: true,
        showBottomBorder: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.xl,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ============ APP BARS DEMO ============
              Text(
                'AppBar Variants',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.dividerColor),
                  borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
                ),
                child: PezyAppBar(
                  title: 'Simple AppBar',
                  showLogo: false,
                  showBackButton: false,
                  elevation: 0,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.dividerColor),
                  borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
                ),
                child: PezyAppBar(
                  title: 'With Back Button',
                  subtitle: 'Profile Screen',
                  showBackButton: true,
                  showLogo: true,
                  elevation: 0,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.dividerColor),
                  borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
                ),
                child: PezyAppBar(
                  title: 'With Search Action',
                  showLogo: true,
                  actions: [
                    PezyAppBarAction(
                      icon: Icons.search,
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Search pressed')),
                        );
                      },
                    ),
                  ],
                  elevation: 0,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.dividerColor),
                  borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
                ),
                child: PezyAppBar(
                  title: 'With Multiple Actions',
                  showLogo: true,
                  actions: [
                    PezyAppBarAction(
                      icon: Icons.search,
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Search pressed')),
                        );
                      },
                    ),
                    PezyAppBarAction(
                      icon: Icons.settings,
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Settings pressed')),
                        );
                      },
                    ),
                  ],
                  elevation: 0,
                ),
              ),
              const SizedBox(height: AppSpacing.xl),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.dividerColor),
                  borderRadius: BorderRadius.circular(AppSpacing.cornerRadius),
                ),
                child: PezyAppBar(
                  title: 'Gradient Background',
                  useGradient: true,
                  showLogo: true,
                  actions: [
                    PezyAppBarAction(
                      icon: Icons.notifications,
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Notifications pressed')),
                        );
                      },
                    ),
                  ],
                  elevation: 2,
                ),
              ),

              // ============ BUTTONS DEMO ============
              const SizedBox(height: AppSpacing.xxxl),
              Text(
                'Filled Buttons',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              PezyButton(
                label: 'Sign In',
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Sign In pressed')),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.md),
              PezyButton(
                label: 'Loading State',
                isLoading: _isLoading,
                onPressed: _simulateLoading,
              ),
              const SizedBox(height: AppSpacing.md),
              PezyButton(
                label: 'Disabled Button',
                isDisabled: true,
                onPressed: () {},
              ),

              const SizedBox(height: AppSpacing.xl),
              Text(
                'Outlined Buttons',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              PezyButton(
                label: 'Cancel',
                variant: PezyButtonVariant.outlined,
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Cancel pressed')),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.md),
              PezyButton(
                label: 'Remove',
                variant: PezyButtonVariant.outlined,
                borderColor: AppColors.error,
                textColor: AppColors.error,
                onPressed: () {},
              ),

              const SizedBox(height: AppSpacing.xl),
              Text(
                'Accent Buttons',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              PezyButton(
                label: 'Special Action',
                variant: PezyButtonVariant.accent,
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Special action pressed')),
                  );
                },
              ),

              const SizedBox(height: AppSpacing.xl),
              Text(
                'Button Sizes',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              PezyButton(
                label: 'Small',
                size: PezyButtonSize.small,
                onPressed: () {},
              ),
              const SizedBox(height: AppSpacing.md),
              PezyButton(
                label: 'Medium (Default)',
                size: PezyButtonSize.medium,
                onPressed: () {},
              ),
              const SizedBox(height: AppSpacing.md),
              PezyButton(
                label: 'Large',
                size: PezyButtonSize.large,
                onPressed: () {},
              ),

              const SizedBox(height: AppSpacing.xl),
              Text(
                'Buttons with Icons',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              PezyButton(
                label: 'Send',
                prefixIcon: Icons.send,
                onPressed: () {},
              ),
              const SizedBox(height: AppSpacing.md),
              PezyButton(
                label: 'Download',
                suffixIcon: Icons.download,
                onPressed: () {},
              ),
              const SizedBox(height: AppSpacing.md),
              PezyButton(
                label: 'Loading with Icon',
                prefixIcon: Icons.cloud_upload,
                isLoading: _isAnotherLoading,
                onPressed: _simulateAnotherLoading,
              ),

              const SizedBox(height: AppSpacing.xl),
              Text(
                'Full Width Buttons',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              PezyButton(
                label: 'Submit Form',
                isFullWidth: true,
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Form submitted')),
                  );
                },
              ),
              const SizedBox(height: AppSpacing.md),
              PezyButton(
                label: 'Cancel',
                variant: PezyButtonVariant.outlined,
                isFullWidth: true,
                onPressed: () {},
              ),

              // ============ TEXT FIELDS DEMO ============
              const SizedBox(height: AppSpacing.xxxl),
              Text(
                'Text Fields - Basic',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              PezyTextField(
                label: 'Full Name',
                hint: 'Enter your full name',
                prefixIcon: Icons.person,
                controller: _fullNameController,
                isRequired: true,
                onChanged: (value) {},
              ),
              const SizedBox(height: AppSpacing.xl),
              PezyTextField(
                label: 'Search Users',
                hint: 'Search...',
                prefixIcon: Icons.search,
                suffixIcon: Icons.clear,
                controller: _searchController,
                onChanged: (value) {},
                onSuffixIconPressed: () {
                  _searchController.clear();
                  setState(() {});
                },
              ),

              const SizedBox(height: AppSpacing.xl),
              Text(
                'Text Fields - Validation',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              PezyTextField(
                label: 'Email Address',
                hint: 'your.email@example.com',
                prefixIcon: Icons.email,
                keyboardType: TextInputType.emailAddress,
                controller: _emailController,
                errorText: _emailError,
                isRequired: true,
                onChanged: _validateEmail,
                helperText: 'We\'ll never share your email',
              ),
              const SizedBox(height: AppSpacing.xl),
              PezyTextField(
                label: 'Password',
                hint: 'Enter your password',
                prefixIcon: Icons.lock,
                obscureText: true,
                controller: _passwordController,
                errorText: _passwordError,
                isRequired: true,
                onChanged: _validatePassword,
                helperText: 'At least 8 characters',
              ),
              const SizedBox(height: AppSpacing.xl),
              PezyTextField(
                label: 'Phone Number',
                hint: '(123) 456-7890',
                prefixIcon: Icons.phone,
                keyboardType: TextInputType.phone,
                controller: _phoneController,
                errorText: _phoneError,
                onChanged: _validatePhone,
              ),

              const SizedBox(height: AppSpacing.xl),
              Text(
                'Text Fields - Multi-line',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              PezyTextField(
                label: 'Bio',
                hint: 'Tell us about yourself',
                maxLines: 4,
                maxLength: 500,
                showCharacterCount: true,
                controller: _bioController,
                keyboardType: TextInputType.multiline,
                textCapitalization: TextCapitalization.sentences,
                onChanged: (value) {},
              ),

              const SizedBox(height: AppSpacing.xl),
              Text(
                'Text Fields - States',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              PezyTextField(
                label: 'Enabled Field',
                hint: 'This field is enabled',
                prefixIcon: Icons.check_circle,
                enabled: true,
              ),
              const SizedBox(height: AppSpacing.xl),
              PezyTextField(
                label: 'Disabled Field',
                hint: 'This field is disabled',
                prefixIcon: Icons.lock,
                enabled: false,
              ),
              const SizedBox(height: AppSpacing.xl),
              PezyTextField(
                label: 'Error Field',
                hint: 'This field has an error',
                errorText: 'This field contains invalid data',
                prefixIcon: Icons.error_outline,
              ),

              const SizedBox(height: AppSpacing.xl),
              Text(
                'Text Fields - Variants',
                style: AppTextStyles.headlineSmall,
              ),
              const SizedBox(height: AppSpacing.lg),
              PezyTextField(
                label: 'Filled Variant',
                hint: 'Default filled variant',
                variant: PezyTextFieldVariant.filled,
                prefixIcon: Icons.text_fields,
              ),
              const SizedBox(height: AppSpacing.xl),
              PezyTextField(
                label: 'Outlined Variant',
                hint: 'Outlined variant',
                variant: PezyTextFieldVariant.outlined,
                prefixIcon: Icons.text_fields,
              ),

              const SizedBox(height: AppSpacing.xxxl),
            ],
          ),
        ),
      ),
    );
  }
}
