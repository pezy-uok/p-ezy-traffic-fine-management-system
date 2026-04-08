import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { getAllFinesForAdmin } from '../controllers/fineController.js';
import { getAllCriminalsForAdmin } from '../controllers/criminalController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/fines', getAllFinesForAdmin);
router.get('/criminals', getAllCriminalsForAdmin);

export default router;
