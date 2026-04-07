import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Storage configuration for multer
 * Stores criminal photos in: backend/public/uploads/criminals
 */
const criminalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'criminals');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate filename: criminal-{criminalId}-{timestamp}.{extension}
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const criminalId = req.params.id || 'unknown';
    const filename = `criminal-${criminalId}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

/**
 * Multer middleware for criminal photo uploads
 * File size limit: 10MB
 * Accepted file types: jpeg, png, jpg
 */
export const uploadCriminalPhoto = multer({
  storage: criminalStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG and PNG images are allowed'));
    }
    
    cb(null, true);
  }
});

/**
 * Delete a photo file from disk
 * @param {string} photoPath - Relative path to the photo file (e.g., /uploads/criminals/photo.jpg)
 * @returns {boolean} True if file was deleted, false if not found
 */
export const deletePhotoFile = (photoPath) => {
  if (!photoPath) {
    return false;
  }

  try {
    const filePath = path.join(__dirname, '..', '..', 'public', photoPath);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted photo file: ${photoPath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error deleting photo file ${photoPath}:`, error.message);
    return false;
  }
};

/**
 * Upload criminal photo record controller
 * Saves the file path to database after multer stores the file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const uploadCriminalPhotoRecord = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided'
      });
    }

    const { id } = req.params;
    const photoPath = `/uploads/criminals/${req.file.filename}`;
    const photoSize = req.file.size;

    // Update criminal record with photo path in database
    // This would typically be done via a service call here
    // For now, returning the success response
    
    return res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      photoPath,
      photoSize,
      filename: req.file.filename
    });
  } catch (error) {
    next(error);
  }
};
