import express from 'express';
import {
  getAllFinesForAdmin,
  getFineByIdForAdmin,
  updateFineForAdmin,
  deleteFineForAdmin,
} from '../controllers/fineController.js';

const router = express.Router();

// GET /api/admin/fines
router.get('/', getAllFinesForAdmin);

// GET /api/admin/fines/:fineId
router.get('/:fineId', getFineByIdForAdmin);

// PUT /api/admin/fines/:fineId
router.put('/:fineId', updateFineForAdmin);

// Backward compatible update endpoint
router.patch('/:fineId', updateFineForAdmin);

// DELETE /api/admin/fines/:fineId
router.delete('/:fineId', deleteFineForAdmin);

export default router;
