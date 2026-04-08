import { getSupabaseClient } from '../config/supabaseClient.js';
import { getAllFinesForAdmin as getAllFinesForAdminService } from '../services/fineService.js';
import { getAllCriminals as getAllCriminalsService } from '../services/criminalService.js';

const stripHtml = (value) => String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const formatCount = (value) => new Intl.NumberFormat('en-US').format(Number(value || 0));

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

export const getDashboardStatsForAdmin = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const now = new Date();

    let fineRecords = [];
    let criminalRecordsList = [];
    let newsRows = [];

    try {
      fineRecords = await getAllFinesForAdminService();
    } catch (error) {
      console.error('Failed to load admin fines for dashboard stats:', error.message);
    }

    try {
      const criminalResult = await getAllCriminalsService({ limit: 1000, offset: 0 });
      criminalRecordsList = criminalResult.criminals || [];
    } catch (error) {
      console.error('Failed to load admin criminals for dashboard stats:', error.message);
    }

    try {
      const newsRowsResult = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (newsRowsResult.error) {
        throw newsRowsResult.error;
      }

      newsRows = newsRowsResult.data || [];
    } catch (error) {
      console.error('Failed to load admin news for dashboard stats:', error.message);
    }

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

    const totalFines = fineRecords.length;
    const criminalRecords = criminalRecordsList.length;
    const activeCases = fineRecords.filter((fine) => fine.status !== 'paid').length;
    const newsPublished = newsRows.filter((row) => (row.status || (row.published_at ? 'published' : 'draft')) === 'published').length;
    const finesThisWeek = fineRecords.filter((fine) => {
      const createdAt = fine.date ? new Date(fine.date) : fine.created_at ? new Date(fine.created_at) : null;
      return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= sevenDaysAgo;
    }).length;
    const newRecords = criminalRecordsList.filter((criminal) => {
      const createdAt = criminal.created_at ? new Date(criminal.created_at) : null;
      return createdAt && !Number.isNaN(createdAt.getTime()) && createdAt >= thirtyDaysAgo;
    }).length;
    const wantedCriminals = criminalRecordsList.filter((criminal) => Boolean(criminal.wanted)).length;

    const cards = [
      {
        id: 'totalFines',
        title: 'Total Fines',
        value: formatCount(totalFines),
        trend: 'Live',
        trendPositive: true,
        tone: 'blue',
      },
      {
        id: 'criminalRecords',
        title: 'Criminal Records',
        value: formatCount(criminalRecords),
        trend: 'Live',
        trendPositive: true,
        tone: 'red',
      },
      {
        id: 'activeCases',
        title: 'Active Cases',
        value: formatCount(activeCases),
        trend: 'Live',
        trendPositive: false,
        tone: 'yellow',
      },
      {
        id: 'newsPublished',
        title: 'News Published',
        value: formatCount(newsPublished),
        trend: 'Live',
        trendPositive: true,
        tone: 'green',
      },
    ];

    const quickStats = [
      { label: 'Avg Fines/Week', value: formatCount(finesThisWeek), tone: 'blue' },
      { label: 'Pending Cases', value: formatCount(activeCases), tone: 'red' },
      { label: 'New Records', value: formatCount(newRecords), tone: 'yellow' },
      { label: 'Wanted Criminals', value: formatCount(wantedCriminals), tone: 'green' },
    ];

    return res.status(200).json({
      success: true,
      stats: {
        cards,
        quickStats,
        summary: {
          totalFines,
          criminalRecords,
          activeCases,
          newsPublished,
          finesThisWeek,
          newRecords,
          wantedCriminals,
        },
        generatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};