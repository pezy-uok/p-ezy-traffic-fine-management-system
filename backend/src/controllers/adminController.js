import { getSupabaseClient } from '../config/supabaseClient.js';

const stripHtml = (value) => String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

export const getAllNewsForAdmin = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();

    const { data: newsRows, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch news: ${error.message}`,
      });
    }

    const authorIds = [...new Set((newsRows || []).map((row) => row.author_id).filter(Boolean))];

    let authorMap = {};

    if (authorIds.length > 0) {
      const { data: authors } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', authorIds);

      authorMap = Object.fromEntries((authors || []).map((author) => [author.id, author]));
    }

    const news = (newsRows || []).map((row) => {
      const publishedAt = row.published_at || row.publishedAt || null;
      const createdAt = row.created_at || row.createdAt || null;
      const summary = row.summary || stripHtml(row.content).slice(0, 160);
      const author = authorMap[row.author_id] || null;

      return {
        id: row.id,
        title: row.title || 'Untitled',
        summary,
        content: row.content || '',
        category: row.category || 'general',
        status: row.status || (publishedAt ? 'published' : 'draft'),
        featured: Boolean(row.featured),
        pinned: Boolean(row.pinned),
        publishedAt,
        createdAt,
        author: author ? author.name : row.authorName || row.author_id || 'Unknown Author',
        authorEmail: author?.email || null,
      };
    });

    return res.status(200).json({
      success: true,
      news,
      total: news.length,
    });
  } catch (error) {
    next(error);
  }
};