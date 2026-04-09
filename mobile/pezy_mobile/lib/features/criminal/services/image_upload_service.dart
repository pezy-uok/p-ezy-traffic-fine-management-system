import 'package:image_picker/image_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'dart:convert';

/// Provider for image picker
final imagePickerProvider = StateProvider<File?>((ref) => null);

/// Provider for managing criminal photo uploads
final criminalPhotoUploadProvider = FutureProvider.family<Map<String, dynamic>, Map<String, dynamic>>((ref, params) async {
  final file = params['file'] as File;
  final criminalId = params['criminalId'] as String;
  final authToken = params['authToken'] as String;

  return await uploadCriminalPhoto(file, criminalId, authToken);
});

class ImageUploadService {
  final ImagePicker _picker = ImagePicker();
  static const String baseUrl = 'http://127.0.0.1:8000/api/criminals';

  /// Pick image from camera
  Future<File?> pickImageFromCamera() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
        preferredCameraDevice: CameraDevice.rear,
      );

      if (image != null) {
        return File(image.path);
      }
      return null;
    } catch (e) {
      print('Error picking image from camera: $e');
      return null;
    }
  }

  /// Pick image from gallery
  Future<File?> pickImageFromGallery() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );

      if (image != null) {
        return File(image.path);
      }
      return null;
    } catch (e) {
      print('Error picking image from gallery: $e');
      return null;
    }
  }

  /// Upload criminal photo to backend
  Future<Map<String, dynamic>> uploadPhoto({
    required File photoFile,
    required String criminalId,
    required String authToken,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/$criminalId/photo');

      final request = http.MultipartRequest('POST', uri);
      request.headers['Authorization'] = 'Bearer $authToken';

      // Add photo file
      request.files.add(
        http.MultipartFile(
          'photo',
          photoFile.readAsBytes().asStream(),
          photoFile.lengthSync(),
          filename: 'criminal_photo_${DateTime.now().millisecondsSinceEpoch}.jpg',
        ),
      );

      final response = await request.send();
      final responseData = await response.stream.transform(utf8.decoder).join();

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': jsonDecode(responseData),
          'message': 'Photo uploaded successfully',
        };
      } else {
        return {
          'success': false,
          'error': 'Upload failed with status code ${response.statusCode}',
          'details': jsonDecode(responseData),
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Photo upload error',
        'details': e.toString(),
      };
    }
  }

  /// Get photo URL for display
  String getPhotoUrl({
    required String? photoPath,
    required String baseUrl,
  }) {
    if (photoPath == null || photoPath.isEmpty) {
      return '';
    }
    return '$baseUrl${photoPath}';
  }
}

/// Upload criminal photo helper function
Future<Map<String, dynamic>> uploadCriminalPhoto(
  File file,
  String criminalId,
  String authToken,
) async {
  final service = ImageUploadService();
  return await service.uploadPhoto(
    photoFile: file,
    criminalId: criminalId,
    authToken: authToken,
  );
}
