import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/criminal_model.dart';
import '../../data/services/criminal_api_service.dart';
import 'criminal_providers.dart';

/// Model for a most wanted criminal (simple view for grid display)
class MostWantedCriminal {
  final String id;
  final String name;
  final String firstName;
  final String lastName;
  final String? dateOfBirth;
  final String? gender;
  final String? description;
  final String? identificationNumber;
  final String status;
  final bool isWanted;
  final String? dangerLevel;
  final List<String>? knownAliases;
  final bool arrestedBefore;
  final int arrestCount;
  final String? photoPath;

  MostWantedCriminal({
    required this.id,
    required this.name,
    required this.firstName,
    required this.lastName,
    this.dateOfBirth,
    this.gender,
    this.description,
    this.identificationNumber,
    required this.status,
    required this.isWanted,
    this.dangerLevel,
    this.knownAliases,
    required this.arrestedBefore,
    required this.arrestCount,
    this.photoPath,
  });

  /// Create from Criminal model
  factory MostWantedCriminal.fromCriminal(Criminal criminal) {
    return MostWantedCriminal(
      id: criminal.id,
      name: criminal.fullName,
      firstName: criminal.firstName,
      lastName: criminal.lastName,
      dateOfBirth: criminal.dateOfBirth,
      gender: criminal.gender,
      description: criminal.physicalDescription,
      identificationNumber: criminal.identificationNumber,
      status: criminal.status,
      isWanted: criminal.wanted,
      dangerLevel: criminal.dangerLevel,
      knownAliases: criminal.knownAliases,
      arrestedBefore: criminal.arrestedBefore,
      arrestCount: criminal.arrestCount,
      photoPath: criminal.photoPath,
    );
  }
}

/// State for most wanted criminals list
class MostWantedState {
  final List<MostWantedCriminal> criminals;
  final bool isLoading;
  final String? errorMessage;
  final int total;

  const MostWantedState({
    this.criminals = const [],
    this.isLoading = false,
    this.errorMessage,
    this.total = 0,
  });

  /// Create a copy with modified fields
  MostWantedState copyWith({
    List<MostWantedCriminal>? criminals,
    bool? isLoading,
    String? errorMessage,
    int? total,
  }) {
    return MostWantedState(
      criminals: criminals ?? this.criminals,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
      total: total ?? this.total,
    );
  }
}

/// Notifier for managing most wanted criminals state
class MostWantedNotifier extends StateNotifier<MostWantedState> {
  final CriminalApiService _apiService;

  MostWantedNotifier({required CriminalApiService apiService})
      : _apiService = apiService,
        super(const MostWantedState()) {
    debugPrint('\n╔════════════════════════════════════════╗');
    debugPrint('║  MOST WANTED NOTIFIER: Constructor     ║');
    debugPrint('╠════════════════════════════════════════╣');
    debugPrint('║ API Service provided: ✅ YES');
    debugPrint('║ Calling loadMostWanted() on init...');
    debugPrint('╚════════════════════════════════════════╝\n');
    // Load criminals on initialization
    loadMostWanted();
  }

  /// Load most wanted criminals from API
  /// Fetches only criminals marked as wanted
  Future<void> loadMostWanted() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      debugPrint('\n╔════════════════════════════════════════╗');
      debugPrint('║  MOST WANTED: Fetching wanted crimes ║');
      debugPrint('╚════════════════════════════════════════╝\n');

      // Call API with wanted filter
      final response = await _apiService.getAllCriminals(
        limit: 50,
        wanted: true, // Only fetch wanted criminals
      );

      debugPrint('✅ Fetched ${response.criminals.length} wanted criminals');

      // Validate: check for any deleted criminals (should not happen, but safety check)
      final deletedCriminals = response.criminals.where((c) => c.isDeleted).toList();
      if (deletedCriminals.isNotEmpty) {
        debugPrint('⚠️  WARNING: ${deletedCriminals.length} deleted criminal(s) found in response');
        for (final criminal in deletedCriminals) {
          debugPrint('   - ${criminal.fullName} (ID: ${criminal.id}, deleted: ${criminal.deletedAt})');
        }
      }

      // Convert Criminal models to MostWantedCriminal models (excluding deleted)
      final mostWantedCriminals = response.criminals
          .where((criminal) => !criminal.isDeleted) // Filter out deleted criminals
          .map((criminal) => MostWantedCriminal.fromCriminal(criminal))
          .toList();

      state = state.copyWith(
        criminals: mostWantedCriminals,
        total: response.total,
        isLoading: false,
      );

      debugPrint('✅ Most wanted state updated\n');
    } catch (e) {
      debugPrint('❌ Error loading most wanted: $e\n');
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Error loading most wanted: ${e.toString()}',
      );
    }
  }

  /// Refresh most wanted criminals list
  Future<void> refresh() async {
    await loadMostWanted();
  }
}

/// Provider for most wanted criminals
final mostWantedProvider =
    StateNotifierProvider<MostWantedNotifier, MostWantedState>((ref) {
  debugPrint('\n╔════════════════════════════════════════╗');
  debugPrint('║  MOST WANTED PROVIDER: Creating        ║');
  debugPrint('╠════════════════════════════════════════╣');
  debugPrint('║ Watching criminalApiServiceProvider...');
  
  final apiService = ref.watch(criminalApiServiceProvider);
  
  debugPrint('║ ✅ API Service obtained');
  debugPrint('║ Creating MostWantedNotifier...');
  
  final notifier = MostWantedNotifier(apiService: apiService);
  
  debugPrint('║ ✅ MostWantedNotifier created');
  debugPrint('╚════════════════════════════════════════╝\n');
  
  return notifier;
});

/// Convenience provider - filter by danger level
final dangerousCriminalsProvider = Provider<List<MostWantedCriminal>>((ref) {
  final state = ref.watch(mostWantedProvider);
  return state.criminals
      .where((c) => c.dangerLevel != null && c.dangerLevel!.isNotEmpty)
      .toList();
});

/// Convenience provider - get total wanted count
final wantedCountProvider = Provider<int>((ref) {
  final state = ref.watch(mostWantedProvider);
  return state.criminals.length;
});
