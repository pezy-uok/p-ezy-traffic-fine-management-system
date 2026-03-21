import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Model for a most wanted criminal
class MostWantedCriminal {
  final String id;
  final String name;
  final String avatarUrl;
  final String description;

  MostWantedCriminal({
    required this.id,
    required this.name,
    required this.avatarUrl,
    required this.description,
  });
}

/// State for most wanted criminals list
class MostWantedState {
  final List<MostWantedCriminal> criminals;
  final bool isLoading;
  final String? errorMessage;

  const MostWantedState({
    this.criminals = const [],
    this.isLoading = false,
    this.errorMessage,
  });

  /// Create a copy with modified fields
  MostWantedState copyWith({
    List<MostWantedCriminal>? criminals,
    bool? isLoading,
    String? errorMessage,
  }) {
    return MostWantedState(
      criminals: criminals ?? this.criminals,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

/// Notifier for managing most wanted criminals state
class MostWantedNotifier extends StateNotifier<MostWantedState> {
  MostWantedNotifier() : super(const MostWantedState()) {
    // Load criminals on initialization
    loadMostWanted();
  }

  /// Load most wanted criminals from API
  Future<void> loadMostWanted() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      // Simulate API call to fetch most wanted criminals
      await Future.delayed(const Duration(seconds: 1));

      // Mock data for most wanted criminals
      final mockCriminals = _getMockMostWanted();

      state = state.copyWith(
        criminals: mockCriminals,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Error loading most wanted: ${e.toString()}',
      );
    }
  }

  /// Mock data for testing - replace with actual API call
  List<MostWantedCriminal> _getMockMostWanted() {
    return [
      MostWantedCriminal(
        id: '1',
        name: 'Kehelbaddara Padme',
        avatarUrl: 'https://via.placeholder.com/150',
        description:
            'Wanted for multiple counts of theft and robbery. Last seen in the downtown area. Considered dangerous. Approach with caution.',
      ),
      MostWantedCriminal(
        id: '2',
        name: 'Kehelbaddara Padme',
        avatarUrl: 'https://via.placeholder.com/150',
        description:
            'Wanted for fraud and identity theft. Known to operate in financial districts. Multiple aliases in use.',
      ),
      MostWantedCriminal(
        id: '3',
        name: 'Kehelbaddara Padme',
        avatarUrl: 'https://via.placeholder.com/150',
        description:
            'Wanted for assault and battery. Frequent offender with violent history. Report any sightings immediately.',
      ),
      MostWantedCriminal(
        id: '4',
        name: 'Kehelbaddara Padme',
        avatarUrl: 'https://via.placeholder.com/150',
        description:
            'Wanted for drug trafficking and possession. Known associates identified. High priority case.',
      ),
      MostWantedCriminal(
        id: '5',
        name: 'Kehelbaddara Padme',
        avatarUrl: 'https://via.placeholder.com/150',
        description:
            'Wanted for burglary and trespassing. Operates at night. Known methods of entry documented.',
      ),
      MostWantedCriminal(
        id: '6',
        name: 'Kehelbaddara Padme',
        avatarUrl: 'https://via.placeholder.com/150',
        description:
            'Wanted for vehicle theft and hit-and-run. Highly mobile suspect. Multiple reports filed.',
      ),
    ];
  }
}

/// Riverpod provider for most wanted criminals state
final mostWantedProvider =
    StateNotifierProvider<MostWantedNotifier, MostWantedState>((ref) {
  return MostWantedNotifier();
});
