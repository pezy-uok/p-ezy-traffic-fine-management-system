import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import {
  createFine,
  getFineById,
  getFinesByLicense,
  getOutdatedFines,
  updateFineStatus,
} from '../controllers/fineController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createFine);
router.get('/outdated', getOutdatedFines);
router.get('/driver/:licenseNo', getFinesByLicense);
router.get('/:fineId', getFineById);
router.patch('/:fineId/status', updateFineStatus);

export default router;