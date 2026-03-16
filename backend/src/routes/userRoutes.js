import express from 'express';
import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from '../controllers/userController.js';

const router = express.Router();

// Routes
router.post('/create', createUserController);
router.get('/all', getAllUsersController);
router.get('/:id', getUserByIdController);
router.patch('/:id', updateUserController);
router.delete('/:id', deleteUserController);

export default router;
