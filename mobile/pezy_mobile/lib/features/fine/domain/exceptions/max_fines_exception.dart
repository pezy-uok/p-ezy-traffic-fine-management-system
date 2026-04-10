/// Exception thrown when max fines exceeded
class MaxFinesExceededException implements Exception {
  final String message;

  MaxFinesExceededException(this.message);

  @override
  String toString() => message;
}
