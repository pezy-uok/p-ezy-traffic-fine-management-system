import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/index.dart';
import 'presentation/shell/app_shell.dart';

const bool _isDevelopmentMode = false; // Change to false for production - NOW DISABLED FOR REAL API CALLS

void main() {
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
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
      debugShowCheckedModeBanner: _isDevelopmentMode, // Show dev banner in dev mode
      home: const AppShell(),
    );
  }
}
