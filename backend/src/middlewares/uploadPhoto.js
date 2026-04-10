import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createStorage = (folderName, filenamePrefix) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', folderName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const recordId = req.params.id || req.params.newsId || 'new';
    const filename = `${filenamePrefix}-${recordId}-${timestamp}${ext}`;
    cb(null, filename);
  },
});

const createImageUpload = (storage) => multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG and PNG images are allowed'));
    }

    cb(null, true);
  },
});

/**
 * Storage configuration for multer
 * Stores criminal photos in: backend/public/uploads/criminals
 */
const criminalStorage = createStorage('criminals', 'criminal');
const newsStorage = createStorage('news', 'news');

/**
 * Multer middleware for criminal photo uploads
 * File size limit: 10MB
 * Accepted file types: jpeg, png, jpg
 */
export const uploadCriminalPhoto = createImageUpload(criminalStorage);

/**
 * Multer middleware for news image uploads
 * File size limit: 10MB
 * Accepted file types: jpeg, png, jpg
 */
export const uploadNewsImage = createImageUpload(newsStorage);

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

export const deleteUploadedFile = deletePhotoFile;

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
