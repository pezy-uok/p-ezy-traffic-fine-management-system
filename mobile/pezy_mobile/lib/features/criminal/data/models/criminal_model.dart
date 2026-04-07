/// Criminal model and response classes
library criminal_model;

/// Criminal data model representing a criminal record
class Criminal {
  final String id;
  final String firstName;
  final String lastName;
  final String? dateOfBirth;
  final String? gender;
  final String? physicalDescription;
  final String? identificationNumber;
  final String status; // 'active', 'inactive', 'deceased', 'deported'
  final bool wanted;
  final String? dangerLevel;
  final List<String>? knownAliases;
  final bool arrestedBefore;
  final int arrestCount;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final DateTime? deletedAt; // Soft delete timestamp (null if not deleted)

  Criminal({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.dateOfBirth,
    this.gender,
    this.physicalDescription,
    this.identificationNumber,
    required this.status,
    required this.wanted,
    this.dangerLevel,
    this.knownAliases,
    required this.arrestedBefore,
    required this.arrestCount,
    required this.createdAt,
    this.updatedAt,
    this.deletedAt,
  });

  /// Full name convenience getter
  String get fullName => '$firstName $lastName';

  /// Is this criminal wanted?
  bool get isWanted => wanted;

  /// Is this criminal currently active in the system?
  bool get isActive => status == 'active';

  /// Has this criminal record been soft-deleted?
  bool get isDeleted => deletedAt != null;

  /// Parse Criminal from JSON response
  factory Criminal.fromJson(Map<String, dynamic> json) {
    return Criminal(
      id: json['id'] as String,
      firstName: json['first_name'] as String,
      lastName: json['last_name'] as String,
      dateOfBirth: json['date_of_birth'] as String?,
      gender: json['gender'] as String?,
      physicalDescription: json['physical_description'] as String?,
      identificationNumber: json['identification_number'] as String?,
      status: json['status'] as String? ?? 'active',
      wanted: json['wanted'] as bool? ?? false,
      dangerLevel: json['danger_level'] as String?,
      knownAliases: (json['known_aliases'] as List<dynamic>?)?.cast<String>(),
      arrestedBefore: json['arrested_before'] as bool? ?? false,
      arrestCount: json['arrest_count'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : null,
      deletedAt: json['deleted_at'] != null ? DateTime.parse(json['deleted_at'] as String) : null,
    );
  }

  @override
  String toString() => 'Criminal(id: $id, name: $fullName, status: $status, wanted: $wanted, deleted: $isDeleted)';
}

/// Response model for GET /api/criminals
class GetCriminalsResponse {
  final bool success;
  final List<Criminal> criminals;
  final int total;
  final int limit;
  final int offset;

  GetCriminalsResponse({
    required this.success,
    required this.criminals,
    required this.total,
    required this.limit,
    required this.offset,
  });

  /// Parse response from backend
  factory GetCriminalsResponse.fromJson(Map<String, dynamic> json) {
    return GetCriminalsResponse(
      success: json['success'] as bool? ?? false,
      criminals: (json['criminals'] as List<dynamic>?)
          ?.map((c) => Criminal.fromJson(c as Map<String, dynamic>))
          .toList() ?? [],
      total: json['total'] as int? ?? 0,
      limit: json['limit'] as int? ?? 50,
      offset: json['offset'] as int? ?? 0,
    );
  }

  /// Get number of wanted criminals
  int get wantedCount => criminals.where((c) => c.wanted).length;

  /// Get number of active criminals
  int get activeCount => criminals.where((c) => c.isActive).length;

  /// Get dangerous criminals (with danger_level set)
  List<Criminal> get dangerousCriminals => criminals.where((c) => c.dangerLevel != null && c.dangerLevel!.isNotEmpty).toList();

  /// Check if there are more records to fetch
  bool get hasMore => (offset + criminals.length) < total;

  @override
  String toString() => 'GetCriminalsResponse(total: $total, count: ${criminals.length}, wanted: $wantedCount)';
}
