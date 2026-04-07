import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

/**
 * Criminal Management Routes
 * Base: /api/criminals
 */

// TODO: Implement criminal lookup routes

export default router;
