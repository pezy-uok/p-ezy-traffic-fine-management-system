import express from 'express';
import {
  createOfficerAdmin,
  deleteOfficerAdmin,
  getAllOfficersAdmin,
  getOfficerByIdAdmin,
  updateOfficerAdmin,
} from '../controllers/officerController.js';

const router = express.Router();

// GET /api/admin/officers
router.get('/', getAllOfficersAdmin);

// GET /api/admin/officers/:officerId
router.get('/:officerId', getOfficerByIdAdmin);

// POST /api/admin/officers
router.post('/', createOfficerAdmin);

// Backward-compatible create endpoint style
router.post('/create', createOfficerAdmin);

// PUT /api/admin/officers/:officerId
router.put('/:officerId', updateOfficerAdmin);

// Backward-compatible update endpoint style
router.patch('/:officerId', updateOfficerAdmin);

// DELETE /api/admin/officers/:officerId
router.delete('/:officerId', deleteOfficerAdmin);

export default router;
