import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import {
  getAllNewsForPublic,
  getNewsByIdForPublic,
  getAllNewsForAdmin,
  getNewsByIdForAdmin,
  createNewsForAdmin,
  updateNewsForAdmin,
  deleteNewsForAdmin,
} from '../controllers/newsController.js';

const router = express.Router();

/**
 * NEWS ROUTES - Combined Public & Admin
 * Base: /api/news (public) and /api/news/admin (admin)
 */

// ============================================================
// PUBLIC NEWS ROUTES - No Authentication Required
// ============================================================

/**
 * GET /api/news
 * Get all published news articles
 * Query parameters:
 *   - limit: number (default: 20, max: 100)
 *   - offset: number (default: 0)
 *   - category: string (optional filter)
 *   - search: string (optional search in title/content)
 * Returns: { success, news: Array, total, limit, offset }
 * Public Access: YES
 */
router.get('/', getAllNewsForPublic);

/**
 * GET /api/news/:id
 * Get a single news article by ID
 * Returns: { success, news }
 * Public Access: YES
 */
router.get('/:id', getNewsByIdForPublic);

// ============================================================
// ADMIN NEWS ROUTES - Authentication Required
// ============================================================

/**
 * GET /api/news/admin
 * Get all news articles including drafts (admin view)
 * Query parameters:
 *   - limit: number (default: 50, max: 1000)
 *   - offset: number (default: 0)
 *   - status: 'published' | 'draft' | 'archived'
 *   - featured: boolean
 *   - category: string
 *   - search: string (search in title/content)
 *   - orderBy: string (default: 'published_at')
 *   - orderDirection: 'asc' | 'desc' (default: 'desc')
 * Protected: requires admin role
 */
router.get('/admin', authenticate, authorize('admin'), getAllNewsForAdmin);

/**
 * GET /api/news/admin/:id
 * Get a news article by ID (admin view)
 * Protected: requires admin role
 */
router.get('/admin/:id', authenticate, authorize('admin'), getNewsByIdForAdmin);

/**
 * POST /api/news/admin/create
 * Create a new news article
 * Body: { title, content, category, status, featured, pinned, summary }
 * Protected: requires admin role
 */
router.post('/admin/create', authenticate, authorize('admin'), createNewsForAdmin);

/**
 * PUT /api/news/admin/:id
 * Update a news article
 * Body: { title, content, category, status, featured, pinned, summary }
 * Protected: requires admin role
 */
router.put('/admin/:id', authenticate, authorize('admin'), updateNewsForAdmin);

/**
 * DELETE /api/news/admin/:id
 * Delete a news article
 * Protected: requires admin role
 */
router.delete('/admin/:id', authenticate, authorize('admin'), deleteNewsForAdmin);

export default router;
