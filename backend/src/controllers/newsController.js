import { getAllNewsPublic, getNewsByIdPublic, getAllNewsAdmin, getNewsByIdAdmin, createNewsAdmin, updateNewsAdmin, deleteNewsAdmin } from '../services/newsService.js';

/**
 * Get all published news articles (public)
 * GET /api/news
 * Query parameters:
 *   - limit: number (default: 20, max: 100)
 *   - offset: number (default: 0)
 *   - category: string (optional filter)
 *   - search: string (optional search in title/content)
 * Returns: { success, news: Array, total, limit, offset }
 * Public Access: YES
 */
export const getAllNewsForPublic = async (req, res, next) => {
  try {
    const queryOptions = {
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined,
      category: req.query.category,
      search: req.query.search,
    };

    // Remove undefined values
    Object.keys(queryOptions).forEach((key) => queryOptions[key] === undefined && delete queryOptions[key]);

    const result = await getAllNewsPublic(queryOptions);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single news article by ID (public)
 * GET /api/news/:id
 * Returns: { success, news }
 * Public Access: YES
 */
export const getNewsByIdForPublic = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'News ID is required',
      });
    }

    const news = await getNewsByIdPublic(id);

    return res.status(200).json({
      success: true,
      news,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all news articles including drafts (admin view)
 * GET /api/news/admin
 * Protected: requires admin role
 */
export const getAllNewsForAdmin = async (req, res, next) => {
  try {
    const queryOptions = {
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined,
      status: req.query.status,
      category: req.query.category,
      search: req.query.search,
      orderBy: req.query.orderBy,
      orderDirection: req.query.orderDirection,
    };

    // Remove undefined values
    Object.keys(queryOptions).forEach((key) => queryOptions[key] === undefined && delete queryOptions[key]);

    const result = await getAllNewsAdmin(queryOptions);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a news article by ID (admin view)
 * GET /api/news/admin/:id
 * Protected: requires admin role
 */
export const getNewsByIdForAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'News ID is required',
      });
    }

    const news = await getNewsByIdAdmin(id);

    return res.status(200).json({
      success: true,
      news,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a news article (admin)
 * POST /api/news/admin/create
 * Protected: requires admin role
 */
export const createNewsForAdmin = async (req, res, next) => {
  try {
    const newsData = req.body;

    const news = await createNewsAdmin(newsData);

    return res.status(201).json({
      success: true,
      news,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a news article (admin)
 * PUT /api/news/admin/:id
 * Protected: requires admin role
 */
export const updateNewsForAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert camelCase to snake_case for database
    const mappedData = {};
    if (updateData.title !== undefined) mappedData.title = updateData.title;
    if (updateData.content !== undefined) mappedData.content = updateData.content;
    if (updateData.summary !== undefined) mappedData.summary = updateData.summary;
    if (updateData.category !== undefined) mappedData.category = updateData.category;
    if (updateData.status !== undefined) mappedData.status = updateData.status;
    if (updateData.publishedAt !== undefined) mappedData.published_at = updateData.publishedAt;
    if (updateData.published_at !== undefined) mappedData.published_at = updateData.published_at;
    if (updateData.authorName !== undefined) mappedData.author_name = updateData.authorName;
    if (updateData.author_name !== undefined) mappedData.author_name = updateData.author_name;
    if (updateData.authorEmail !== undefined) mappedData.author_email = updateData.authorEmail;
    if (updateData.author_email !== undefined) mappedData.author_email = updateData.author_email;
    if (updateData.featured !== undefined) mappedData.featured = updateData.featured;
    if (updateData.pinned !== undefined) mappedData.pinned = updateData.pinned;

    const news = await updateNewsAdmin(id, mappedData);

    return res.status(200).json({
      success: true,
      message: "News updated successfully",
      news,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a news article (admin)
 * DELETE /api/news/admin/:id
 * Protected: requires admin role
 */
export const deleteNewsForAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await deleteNewsAdmin(id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
