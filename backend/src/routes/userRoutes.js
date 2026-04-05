import express from 'express';
import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from '../controllers/userController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

// Routes

/**
 * POST /api/users/create
 * Create a new user (Admin only)
 * Headers: { Authorization: Bearer <token> }
 * Body: { email, name, role, phone, ... }
 */
router.post('/create', authenticate, authorize('admin'), createUserController);

/**
 * GET /api/users/all
 * Get all users (Public - shows active officers)
 */
router.get('/all', getAllUsersController);

/**
 * GET /api/users/:id
 * Get user by ID (Authenticated users only)
 * Headers: { Authorization: Bearer <token> }
 */
router.get('/:id', authenticate, getUserByIdController);

/**
 * PATCH /api/users/:id
 * Update user by ID (Authenticated users only)
 * Headers: { Authorization: Bearer <token> }
 * Body: { name, phone, department, ... }
 */
router.patch('/:id', authenticate, updateUserController);

/**
 * DELETE /api/users/:id
 * Delete user by ID (Authenticated users only)
 * Headers: { Authorization: Bearer <token> }
 */
router.delete('/:id', authenticate, deleteUserController);

export default router;
