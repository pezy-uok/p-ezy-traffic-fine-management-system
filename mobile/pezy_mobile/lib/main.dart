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
  bool _isLoading = false;
  bool _isAnotherLoading = false;

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
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
              // Filled Button Examples
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

              // Outlined Button Examples
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

              // Accent Button Examples
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

              // Button Sizes
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

              // Buttons with Icons
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

              // Full Width Buttons
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

              const SizedBox(height: AppSpacing.xxl),
            ],
          ),
        ),
      ),
    );
  }
}
