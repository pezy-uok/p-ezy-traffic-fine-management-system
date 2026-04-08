import { getSupabaseClient } from '../config/supabaseClient.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

/**
 * Get all published news articles (public view)
 * Only returns published, non-deleted articles
 * @param {Object} options - Query options
 * @param {number} options.limit - Limit results (default: 20, max: 100)
 * @param {number} options.offset - Offset for pagination (default: 0)
 * @param {string} options.category - Filter by category (optional)
 * @param {string} options.search - Search in title/content (optional)
 * @returns {Promise<Object>} { news: Array, total: number, limit, offset }
 */
export const getAllNewsPublic = async (options = {}) => {
  const supabase = getSupabaseClient();

  // Validate and set defaults
  let limit = options.limit || 20;
  if (limit > 100) limit = 100;
  if (limit < 1) limit = 1;

  const offset = options.offset || 0;
  if (offset < 0) {
    throw new ValidationError('Offset cannot be negative');
  }

  let query = supabase.from('news').select('*', { count: 'exact' });

  // Only show published articles
  query = query.eq('status', 'published');

  // Exclude soft-deleted articles
  query = query.is('deleted_at', null);

  // Filter by category if provided
  if (options.category) {
    query = query.eq('category', options.category);
  }

  // Search in title or content
  if (options.search) {
    const searchTerm = `%${options.search}%`;
    query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
  }

  // Order by published date, newest first
  const { data: newsArticles, error, count } = await query
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch news: ${error.message}`);
  }

  return {
    news: (newsArticles || []).map((article) => ({
      id: article.id,
      title: article.title,
      summary: article.summary || '',
      content: article.content || '',
      category: article.category || 'general',
      featured: article.featured || false,
      pinned: article.pinned || false,
      publishedAt: article.published_at,
      author: article.author_name || 'Unknown',
      authorEmail: article.author_email || null,
    })),
    total: count || 0,
    limit,
    offset,
  };
};

/**
 * Get a single news article by ID (public view)
 * Only returns published articles
 * @param {string} newsId - News article ID (UUID)
 * @returns {Promise<Object>} News article object
 * @throws {ValidationError} If ID is missing
 * @throws {NotFoundError} If article not found or not published
 */
export const getNewsByIdPublic = async (newsId) => {
  if (!newsId) {
    throw new ValidationError('News ID is required');
  }

  const supabase = getSupabaseClient();

  // Get published article only
  const { data: article, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', newsId)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();

  if (error || !article) {
    throw new NotFoundError('News article not found or is not published');
  }

  return {
    id: article.id,
    title: article.title,
    summary: article.summary || '',
    content: article.content || '',
    category: article.category || 'general',
    featured: article.featured || false,
    pinned: article.pinned || false,
    publishedAt: article.published_at,
    createdAt: article.created_at,
    author: article.author_name || 'Unknown',
    authorEmail: article.author_email || null,
  };
};

/**
 * Get all news articles including drafts (admin view)
 * Returns all articles regardless of publication status
 * @param {Object} options - Query options
 * @param {number} options.limit - Limit results (default: 20, max: 100)
 * @param {number} options.offset - Offset for pagination (default: 0)
 * @param {string} options.status - Filter by status (published/draft/archived)
 * @param {string} options.category - Filter by category (optional)
 * @param {string} options.search - Search in title/content (optional)
 * @returns {Promise<Object>} { news: Array, total: number, limit, offset }
 */
export const getAllNewsAdmin = async (options = {}) => {
  const supabase = getSupabaseClient();

  // Validate and set defaults
  let limit = options.limit || 20;
  if (limit > 100) limit = 100;
  if (limit < 1) limit = 1;

  const offset = options.offset || 0;
  if (offset < 0) {
    throw new ValidationError('Offset cannot be negative');
  }

  let query = supabase.from('news').select('*', { count: 'exact' });

  // Filter by status if provided
  if (options.status) {
    query = query.eq('status', options.status);
  }

  // Filter by category if provided
  if (options.category) {
    query = query.eq('category', options.category);
  }

  // Search in title or content
  if (options.search) {
    const searchTerm = `%${options.search}%`;
    query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
  }

  // Order based on admin preferences
  const orderBy = options.orderBy || 'created_at';
  const orderDirection = options.orderDirection === 'asc' ? 'ascending' : 'descending';

  const { data: newsArticles, error, count } = await query
    .order(orderBy, { ascending: orderDirection === 'ascending' })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch news: ${error.message}`);
  }

  return {
    news: (newsArticles || []).map((article) => ({
      id: article.id,
      title: article.title,
      summary: article.summary || '',
      content: article.content || '',
      category: article.category || 'general',
      featured: article.featured || false,
      pinned: article.pinned || false,
      status: article.status,
      publishedAt: article.published_at,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      author: article.author_name || 'Unknown',
      authorEmail: article.author_email || null,
      deletedAt: article.deleted_at,
    })),
    total: count || 0,
    limit,
    offset,
  };
};

/**
 * Get a single news article by ID (admin view)
 * Returns article regardless of publication status
 * @param {string} newsId - News article ID (UUID)
 * @returns {Promise<Object>} News article object
 * @throws {ValidationError} If ID is missing
 * @throws {NotFoundError} If article not found
 */
export const getNewsByIdAdmin = async (newsId) => {
  if (!newsId) {
    throw new ValidationError('News ID is required');
  }

  const supabase = getSupabaseClient();

  // Get article without filtering by status
  const { data: article, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', newsId)
    .single();

  if (error || !article) {
    throw new NotFoundError('News article not found');
  }

  return {
    id: article.id,
    title: article.title,
    summary: article.summary || '',
    content: article.content || '',
    category: article.category || 'general',
    featured: article.featured || false,
    pinned: article.pinned || false,
    status: article.status,
    publishedAt: article.published_at,
    createdAt: article.created_at,
    updatedAt: article.updated_at,
    author: article.author_name || 'Unknown',
    authorEmail: article.author_email || null,
    deletedAt: article.deleted_at,
  };
};

/**
 * Create a new news article (admin)
 * @param {Object} newsData - Article data
 * @param {string} newsData.title - Article title (required)
 * @param {string} newsData.content - Article content (required)
 * @param {string} newsData.summary - Brief summary (optional)
 * @param {string} newsData.category - Article category (default: 'general')
 * @param {string} newsData.status - 'draft' or 'published' (default: 'draft')
 * @param {date} newsData.published_at - Publication date (optional)
 * @param {string} newsData.author_name - Author name (optional)
 * @param {string} newsData.author_email - Author email (optional)
 * @param {boolean} newsData.featured - Feature article (default: false)
 * @param {boolean} newsData.pinned - Pin article (default: false)
 * @returns {Promise<Object>} Created article
 * @throws {ValidationError} If required fields are missing
 */
export const createNewsAdmin = async (newsData) => {
  // Validate required fields
  if (!newsData.title || !newsData.title.trim()) {
    throw new ValidationError('Title is required');
  }
  if (!newsData.content || !newsData.content.trim()) {
    throw new ValidationError('Content is required');
  }

  const supabase = getSupabaseClient();

  const articleData = {
    title: newsData.title.trim(),
    content: newsData.content.trim(),
    summary: newsData.summary?.trim() || '',
    category: newsData.category || 'general',
    status: newsData.status || 'draft',
    published_at: newsData.published_at || null,
    author_name: newsData.author_name || null,
    author_email: newsData.author_email || null,
    featured: newsData.featured || false,
    pinned: newsData.pinned || false,
  };

  const { data: article, error } = await supabase
    .from('news')
    .insert([articleData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create news: ${error.message}`);
  }

  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    content: article.content,
    category: article.category,
    featured: article.featured,
    pinned: article.pinned,
    status: article.status,
    publishedAt: article.published_at,
    createdAt: article.created_at,
    author: article.author_name,
    authorEmail: article.author_email,
  };
};

/**
 * Update a news article (admin)
 * @param {string} newsId - Article ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated article
 * @throws {ValidationError} If data is invalid
 * @throws {NotFoundError} If article not found
 */
export const updateNewsAdmin = async (newsId, updateData) => {
  if (!newsId) {
    throw new ValidationError('News ID is required');
  }

  const supabase = getSupabaseClient();

  // Check article exists
  const { data: existingArticle, error: fetchError } = await supabase
    .from('news')
    .select('id')
    .eq('id', newsId)
    .single();

  if (fetchError || !existingArticle) {
    throw new NotFoundError('News article not found');
  }

  // Build update object (only include provided fields)
  const updateFields = {};
  
  if (updateData.title !== undefined) {
    if (!updateData.title.trim()) {
      throw new ValidationError('Title cannot be empty');
    }
    updateFields.title = updateData.title.trim();
  }
  if (updateData.content !== undefined) {
    if (!updateData.content.trim()) {
      throw new ValidationError('Content cannot be empty');
    }
    updateFields.content = updateData.content.trim();
  }
  if (updateData.summary !== undefined) {
    updateFields.summary = updateData.summary?.trim() || '';
  }
  if (updateData.category !== undefined) {
    updateFields.category = updateData.category;
  }
  if (updateData.status !== undefined) {
    updateFields.status = updateData.status;
  }
  if (updateData.published_at !== undefined) {
    updateFields.published_at = updateData.published_at;
  }
  if (updateData.author_name !== undefined) {
    updateFields.author_name = updateData.author_name;
  }
  if (updateData.author_email !== undefined) {
    updateFields.author_email = updateData.author_email;
  }
  if (updateData.featured !== undefined) {
    updateFields.featured = updateData.featured;
  }
  if (updateData.pinned !== undefined) {
    updateFields.pinned = updateData.pinned;
  }
  updateFields.updated_at = new Date().toISOString();

  const { data: article, error } = await supabase
    .from('news')
    .update(updateFields)
    .eq('id', newsId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update news: ${error.message}`);
  }

  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    content: article.content,
    category: article.category,
    featured: article.featured,
    pinned: article.pinned,
    status: article.status,
    publishedAt: article.published_at,
    createdAt: article.created_at,
    updatedAt: article.updated_at,
    author: article.author_name,
    authorEmail: article.author_email,
  };
};

/**
 * Delete a news article (soft delete - admin)
 * @param {string} newsId - Article ID
 * @returns {Promise<Object>} { message: 'deleted', id: newsId }
 * @throws {ValidationError} If ID is missing
 * @throws {NotFoundError} If article not found
 */
export const deleteNewsAdmin = async (newsId) => {
  if (!newsId) {
    throw new ValidationError('News ID is required');
  }

  const supabase = getSupabaseClient();

  // Check article exists
  const { data: existingArticle, error: fetchError } = await supabase
    .from('news')
    .select('id')
    .eq('id', newsId)
    .single();

  if (fetchError || !existingArticle) {
    throw new NotFoundError('News article not found');
  }

  // Soft delete by setting deleted_at
  const { error } = await supabase
    .from('news')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', newsId);

  if (error) {
    throw new Error(`Failed to delete news: ${error.message}`);
  }

  return {
    message: 'News article deleted successfully',
    id: newsId,
  };
};
