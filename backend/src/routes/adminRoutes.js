import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import adminFineRoutes from './adminFineRoutes.js';
import adminDriverRoutes from './adminDriverRoutes.js';
import adminOfficerRoutes from './adminOfficerRoutes.js';
import { getAllCriminalsForAdmin } from '../controllers/criminalController.js';
import { getAllNewsForAdmin, getDashboardStatsForAdmin } from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.use('/fines', adminFineRoutes);
router.use('/drivers', adminDriverRoutes);
router.use('/officers', adminOfficerRoutes);
router.get('/criminals', getAllCriminalsForAdmin);
router.get('/news', getAllNewsForAdmin);
router.get('/stats', getDashboardStatsForAdmin);

export default router;
