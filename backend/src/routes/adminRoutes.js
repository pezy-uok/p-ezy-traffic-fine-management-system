import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { getAllFinesForAdmin, updateFineForAdmin, deleteFineForAdmin } from '../controllers/fineController.js';
import { getAllCriminalsForAdmin } from '../controllers/criminalController.js';
import { getAllNewsForAdmin, getDashboardStatsForAdmin } from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/fines', getAllFinesForAdmin);
router.patch('/fines/:fineId', updateFineForAdmin);
router.delete('/fines/:fineId', deleteFineForAdmin);
router.get('/criminals', getAllCriminalsForAdmin);
router.get('/news', getAllNewsForAdmin);
router.get('/stats', getDashboardStatsForAdmin);

export default router;
