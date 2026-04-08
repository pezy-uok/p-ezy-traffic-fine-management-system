import express from 'express';
import {
  createDriverAdmin,
  deleteDriverAdmin,
  getAllDriversAdmin,
  getDriverByIdAdmin,
  updateDriverAdmin,
} from '../controllers/driverController.js';

const router = express.Router();

// GET /api/admin/drivers
router.get('/', getAllDriversAdmin);

// GET /api/admin/drivers/:driverId
router.get('/:driverId', getDriverByIdAdmin);

// POST /api/admin/drivers
router.post('/', createDriverAdmin);

// Backward-compatible create endpoint style
router.post('/create', createDriverAdmin);

// PUT /api/admin/drivers/:driverId
router.put('/:driverId', updateDriverAdmin);

// Backward-compatible update endpoint style
router.patch('/:driverId', updateDriverAdmin);

// DELETE /api/admin/drivers/:driverId
router.delete('/:driverId', deleteDriverAdmin);

export default router;
