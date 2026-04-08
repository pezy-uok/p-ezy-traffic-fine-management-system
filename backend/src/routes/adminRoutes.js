import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import adminFineRoutes from './adminFineRoutes.js';
import adminDriverRoutes from './adminDriverRoutes.js';
import adminOfficerRoutes from './adminOfficerRoutes.js';
import { getAllCriminalsForAdmin } from '../controllers/criminalController.js';
import {
	createCriminalAdmin,
	createNewsForAdmin,
	deleteCriminalAdmin,
	deleteNewsForAdmin,
	getCriminalByIdAdmin,
	getAllNewsForAdmin,
	getDashboardStatsForAdmin,
	hardDeleteCriminalAdmin,
	restoreCriminalAdmin,
	updateCriminalAdmin,
	updateNewsForAdmin,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.use('/fines', adminFineRoutes);
router.use('/drivers', adminDriverRoutes);
router.use('/officers', adminOfficerRoutes);
router.get('/criminals', getAllCriminalsForAdmin);
router.get('/criminals/:id', getCriminalByIdAdmin);
router.post('/criminals/create', createCriminalAdmin);
router.patch('/criminals/:id', updateCriminalAdmin);
router.delete('/criminals/:id', deleteCriminalAdmin);
router.patch('/criminals/:id/restore', restoreCriminalAdmin);
router.delete('/criminals/:id/permanent', hardDeleteCriminalAdmin);
router.get('/news', getAllNewsForAdmin);
router.post('/news', createNewsForAdmin);
router.put('/news/:newsId', updateNewsForAdmin);
router.delete('/news/:newsId', deleteNewsForAdmin);
router.get('/stats', getDashboardStatsForAdmin);

export default router;
