import { getSupabaseClient } from '../config/supabaseClient.js';
import { getAllFinesForAdmin as getAllFinesForAdminService } from '../services/fineService.js';
import { getAllCriminals as getAllCriminalsService } from '../services/criminalService.js';
import {
  getAllAuditLogs,
  getAuditLogById,
  getCriticalAuditLogs,
  getFailedAuditLogs,
  getAuditLogsByUser,
  getAuditLogsByDriver,
  getAuditLogsByEntity,
} from '../services/auditLogService.js';
import { deleteUploadedFile } from '../middlewares/uploadPhoto.js';
import { ValidationError, ConflictError, NotFoundError } from '../utils/errors.js';

const stripHtml = (value) => String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const formatCount = (value) => new Intl.NumberFormat('en-US').format(Number(value || 0));

const parseBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  if (typeof value === 'number') return value === 1;
  return fallback;
};

const parseNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseAliases = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return value
        .split(',')
        .map((alias) => alias.trim())
        .filter(Boolean);
    }
  }

  return null;
};

const NEWS_IMAGE_FIELD_CANDIDATES = ['image_path', 'image_url', 'thumbnail_url', 'cover_image', 'featured_image'];

const getNewsImagePathFromRow = (row = {}) => {
  for (const field of NEWS_IMAGE_FIELD_CANDIDATES) {
    if (row[field]) {
      return row[field];
    }
  }
  return null;
};

const getNewsColumnSet = async (supabase) => {
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'news');

  if (error || !Array.isArray(data)) {
    return null;
  }

  return new Set(data.map((column) => column.column_name));
};

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
        imagePath: getNewsImagePathFromRow(row),
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

const normalizeNewsPayload = (body) => ({
  title: String(body.title || '').trim(),
  content: String(body.content || '').trim(),
  category: String(body.category || 'general').trim(),
  featured: parseBoolean(body.featured),
  pinned: parseBoolean(body.pinned),
  published_at: body.publishedAt || body.published_at || null,
});

const mapNewsRow = (row, authorMap = {}) => {
  const publishedAt = row.published_at || row.publishedAt || null;
  const createdAt = row.created_at || row.createdAt || null;
  const summary = row.summary || stripHtml(row.content).slice(0, 160);
  const author = authorMap[row.author_id] || null;

  return {
    id: row.id,
    title: row.title || 'Untitled',
    content: row.content || '',
    summary,
    category: row.category || 'general',
    status: row.status || (publishedAt ? 'published' : 'draft'),
    featured: Boolean(row.featured),
    pinned: Boolean(row.pinned),
    publishedAt,
    createdAt,
    imagePath: getNewsImagePathFromRow(row),
    author: author ? author.name : row.authorName || row.author_id || 'Unknown Author',
    authorEmail: author?.email || null,
  };
};

export const createNewsForAdmin = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { title, content, category, featured, pinned, published_at } = normalizeNewsPayload(req.body);
    const status = String(req.body.status || 'draft').trim();

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const payload = {
      title,
      content,
      category,
      featured,
      pinned,
      status,
      author_id: req.user?.id || null,
      published_at: status === 'published' ? (published_at || new Date().toISOString()) : published_at || null,
    };

    const imagePath = req.file ? `/uploads/news/${req.file.filename}` : null;
    if (imagePath) {
      const newsColumns = await getNewsColumnSet(supabase);
      const imageField = newsColumns ? NEWS_IMAGE_FIELD_CANDIDATES.find((field) => newsColumns.has(field)) : null;
      if (!imageField) {
        deleteUploadedFile(imagePath);
        return res.status(400).json({
          success: false,
          message: 'News image column is missing in the database. Add one of: image_path, image_url, thumbnail_url, cover_image, featured_image.',
        });
      }
      payload[imageField] = imagePath;
      if (newsColumns && newsColumns.has('image_size')) {
        payload.image_size = req.file.size;
      }
      if (newsColumns && newsColumns.has('image_uploaded_at')) {
        payload.image_uploaded_at = new Date().toISOString();
      }
    }

    const { data: createdNews, error } = await supabase
      .from('news')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      if (req.file) {
        deleteUploadedFile(`/uploads/news/${req.file.filename}`);
      }
      return res.status(500).json({
        success: false,
        message: `Failed to create news: ${error.message}`,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'News created successfully',
      news: mapNewsRow(createdNews),
    });
  } catch (error) {
    next(error);
  }
};

export const updateNewsForAdmin = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { newsId } = req.params;
    const { title, content, category, featured, pinned, published_at } = normalizeNewsPayload(req.body);
    const status = String(req.body.status || 'draft').trim();

    if (!newsId) {
      return res.status(400).json({
        success: false,
        message: 'News ID is required',
      });
    }

    const updatePayload = {
      title,
      content,
      category,
      featured,
      pinned,
      status,
      published_at: status === 'published' ? (published_at || new Date().toISOString()) : published_at || null,
    };

    let existingNewsRow = null;
    if (req.file) {
      const { data: existingNews, error: existingNewsError } = await supabase
        .from('news')
        .select('*')
        .eq('id', newsId)
        .single();

      if (existingNewsError || !existingNews) {
        deleteUploadedFile(`/uploads/news/${req.file.filename}`);
        return res.status(404).json({
          success: false,
          message: 'News article not found',
        });
      }

      existingNewsRow = existingNews;
      const newsColumns = await getNewsColumnSet(supabase);
      const imageField = newsColumns ? NEWS_IMAGE_FIELD_CANDIDATES.find((field) => newsColumns.has(field)) : null;
      if (!imageField) {
        deleteUploadedFile(`/uploads/news/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: 'News image column is missing in the database. Add one of: image_path, image_url, thumbnail_url, cover_image, featured_image.',
        });
      }

      updatePayload[imageField] = `/uploads/news/${req.file.filename}`;
      if (newsColumns && newsColumns.has('image_size')) {
        updatePayload.image_size = req.file.size;
      }
      if (newsColumns && newsColumns.has('image_uploaded_at')) {
        updatePayload.image_uploaded_at = new Date().toISOString();
      }
    }

    const { data: updatedNews, error } = await supabase
      .from('news')
      .update(updatePayload)
      .eq('id', newsId)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to update news: ${error.message}`,
      });
    }

    if (!updatedNews) {
      if (req.file) {
        deleteUploadedFile(`/uploads/news/${req.file.filename}`);
      }
      return res.status(404).json({
        success: false,
        message: 'News article not found',
      });
    }

    if (req.file && existingNewsRow) {
      const previousImagePath = getNewsImagePathFromRow(existingNewsRow);
      if (previousImagePath) {
        deleteUploadedFile(previousImagePath);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'News updated successfully',
      news: mapNewsRow(updatedNews),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNewsForAdmin = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { newsId } = req.params;

    if (!newsId) {
      return res.status(400).json({
        success: false,
        message: 'News ID is required',
      });
    }

    const { data: deletedNews, error } = await supabase
      .from('news')
      .delete()
      .eq('id', newsId)
      .select('id')
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to delete news: ${error.message}`,
      });
    }

    if (!deletedNews) {
      return res.status(404).json({
        success: false,
        message: 'News article not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'News deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStatsForAdmin = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const now = new Date();

    // ===== FETCH ALL DATA IN PARALLEL =====
    let fineRecords = [];
    let criminalRecordsList = [];
    let newsRows = [];
    let driverRows = [];
    let officerRows = [];
    let appealRows = [];

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

    try {
      const driverResult = await supabase.from('drivers').select('*');
      if (!driverResult.error) {
        driverRows = driverResult.data || [];
      }
    } catch (error) {
      console.error('Failed to load drivers for stats:', error.message);
    }

    try {
      const officerResult = await supabase.from('officers').select('*');
      if (!officerResult.error) {
        officerRows = officerResult.data || [];
      }
    } catch (error) {
      console.error('Failed to load officers for stats:', error.message);
    }

    try {
      const appealResult = await supabase.from('appeals').select('*');
      if (!appealResult.error) {
        appealRows = appealResult.data || [];
      }
    } catch (error) {
      console.error('Failed to load appeals for stats:', error.message);
    }

    // ===== CALCULATE TIME PERIODS =====
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

    // ===== CORE METRICS =====
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

    // ===== DRIVER STATISTICS =====
    const totalDrivers = driverRows.length;
    const driversWithPendingFines = new Set(
      fineRecords
        .filter((fine) => fine.status !== 'paid' && fine.driver_license)
        .map((fine) => fine.driver_license)
    ).size;

    // ===== PAYMENT METRICS =====
    const totalRevenue = fineRecords
      .filter((fine) => fine.status === 'paid')
      .reduce((sum, fine) => sum + (parseFloat(fine.amount) || 0), 0);
    const paidFines = fineRecords.filter((fine) => fine.status === 'paid').length;
    const pendingPayments = fineRecords.filter((fine) => fine.status === 'pending').length;
    const paymentSuccessRate = totalFines > 0 ? Math.round((paidFines / totalFines) * 100) : 0;
    const averageFineAmount = totalFines > 0 ? totalRevenue / paidFines : 0;

    // ===== OFFICER PERFORMANCE =====
    const totalOfficers = officerRows.length;
    const finesByOfficer = {};
    fineRecords.forEach((fine) => {
      const officerId = fine.officer_id || 'unassigned';
      finesByOfficer[officerId] = (finesByOfficer[officerId] || 0) + 1;
    });
    const topOfficerEntry = Object.entries(finesByOfficer).sort(([, a], [, b]) => b - a)[0];
    const topOfficerFines = topOfficerEntry ? topOfficerEntry[1] : 0;

    // ===== FINE STATUS BREAKDOWN =====
    const fineStatusBreakdown = {
      paid: paidFines,
      pending: pendingPayments,
      appealed: fineRecords.filter((fine) => fine.status === 'appealed').length,
      cancelled: fineRecords.filter((fine) => fine.status === 'cancelled').length,
      suspended: fineRecords.filter((fine) => fine.status === 'suspended').length,
    };

    // ===== APPEAL STATISTICS =====
    const totalAppeals = appealRows.length;
    const approvedAppeals = appealRows.filter((appeal) => appeal.status === 'approved').length;
    const rejectedAppeals = appealRows.filter((appeal) => appeal.status === 'rejected').length;
    const pendingAppeals = appealRows.filter((appeal) => appeal.status === 'pending').length;

    // ===== RECIDIVIST ANALYSIS =====
    const driverFineCount = {};
    fineRecords.forEach((fine) => {
      const license = fine.driver_license;
      if (license) {
        driverFineCount[license] = (driverFineCount[license] || 0) + 1;
      }
    });
    const recidivistDrivers = Object.values(driverFineCount).filter((count) => count > 3).length;

    // ===== DASHBOARD CARDS =====
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

    // ===== QUICK STATS =====
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

        // Core Summary
        summary: {
          totalFines,
          criminalRecords,
          activeCases,
          newsPublished,
          finesThisWeek,
          newRecords,
          wantedCriminals,
        },

        // Driver Statistics
        drivers: {
          total: totalDrivers,
          withPendingFines: driversWithPendingFines,
          recidivists: recidivistDrivers,
        },

        // Payment Metrics
        payments: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          paidFines,
          pendingPayments,
          successRate: paymentSuccessRate,
          averageFineAmount: Math.round(averageFineAmount * 100) / 100,
        },

        // Officer Performance
        officers: {
          total: totalOfficers,
          topOfficerFines,
          averageFinesPerOfficer: totalOfficers > 0 ? Math.round(totalFines / totalOfficers) : 0,
        },

        // Fine Analytics
        fineStatus: fineStatusBreakdown,

        // Appeal Statistics
        appeals: {
          total: totalAppeals,
          approved: approvedAppeals,
          rejected: rejectedAppeals,
          pending: pendingAppeals,
          approvalRate: totalAppeals > 0 ? Math.round((approvedAppeals / totalAppeals) * 100) : 0,
        },

        // System Health
        system: {
          dataRecords: totalFines + criminalRecords,
          pendingActions: activeCases + pendingAppeals,
          systemHealth: 'operational',
        },

        generatedAt: now.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ADMIN CRIMINAL MANAGEMENT - FULL CRUD
 * Admins can view, create, update, delete, and restore criminal records
 */

/**
 * Get all criminals including deleted (admin view)
 * GET /api/admin/criminals
 * Protected: requires authenticate + authorize('admin')
 * Returns: { success, criminals: Array, total, includesDeleted: true }
 */
export const getAllCriminalsAdmin = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();

    // Validate and set defaults
    let limit = req.query.limit ? parseInt(req.query.limit) : 50;
    if (limit > 1000) limit = 1000;
    if (limit < 1) limit = 1;

    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    if (offset < 0) {
      return res.status(400).json({
        success: false,
        message: 'Offset cannot be negative',
      });
    }

    const orderBy = req.query.orderBy || 'created_at';
    const orderDirection = req.query.orderDirection === 'asc' ? 'asc' : 'desc';
    const includeDeleted = req.query.includeDeleted === 'true';

    let query = supabase.from('criminals').select('*', { count: 'exact' });

    // Filter by deletion status if requested
    if (!includeDeleted) {
      query = query.is('deleted_at', null);
    }

    // Apply filters
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    if (req.query.wanted !== undefined) {
      const wanted = req.query.wanted === 'true' ? true : req.query.wanted === 'false' ? false : undefined;
      if (wanted !== undefined) {
        query = query.eq('wanted', wanted);
      }
    }

    if (req.query.search) {
      const searchTerm = `%${req.query.search}%`;
      query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`);
    }

    // Apply deleted filter if only showing deleted
    if (req.query.showDeletedOnly === 'true') {
      query = query.not('deleted_at', 'is', null);
    }

    const { data: criminals, error, count } = await query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch criminals: ${error.message}`,
      });
    }

    return res.status(200).json({
      success: true,
      criminals: criminals.map((c) => ({
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        identification_number: c.identification_number,
        status: c.status,
        wanted: c.wanted,
        danger_level: c.danger_level,
        created_at: c.created_at,
        updated_at: c.updated_at,
        deleted_at: c.deleted_at,
      })),
      total: count,
      limit,
      offset,
      includesDeleted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a criminal by ID (admin view - includes deleted)
 * GET /api/admin/criminals/:id
 * Protected: requires authenticate + authorize('admin')
 * Returns: { success, criminal }
 */
export const getCriminalByIdAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Criminal ID is required',
      });
    }

    const { data: criminal, error } = await supabase
      .from('criminals')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !criminal) {
      return res.status(404).json({
        success: false,
        message: 'Criminal not found',
      });
    }

    return res.status(200).json({
      success: true,
      criminal: {
        id: criminal.id,
        first_name: criminal.first_name,
        last_name: criminal.last_name,
        date_of_birth: criminal.date_of_birth,
        gender: criminal.gender,
        physical_description: criminal.physical_description,
        identification_number: criminal.identification_number,
        status: criminal.status,
        wanted: criminal.wanted,
        danger_level: criminal.danger_level,
        known_aliases: criminal.known_aliases,
        arrested_before: criminal.arrested_before,
        arrest_count: criminal.arrest_count,
        photo_path: criminal.photo_path,
        photo_size: criminal.photo_size,
        photo_uploaded_at: criminal.photo_uploaded_at,
        created_at: criminal.created_at,
        updated_at: criminal.updated_at,
        deleted_at: criminal.deleted_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a criminal record (admin)
 * POST /api/admin/criminals/create
 * Protected: requires authenticate + authorize('admin')
 * Returns: { success, criminal }
 */
export const createCriminalAdmin = async (req, res, next) => {
  try {
    const { first_name, last_name, ...otherData } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required',
      });
    }

    const supabase = getSupabaseClient();

    // Check for duplicate identification_number
    if (otherData.identification_number) {
      const { data: existing } = await supabase
        .from('criminals')
        .select('id')
        .eq('identification_number', otherData.identification_number)
        .single();

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Criminal with this identification number already exists',
        });
      }
    }

    const newCriminal = {
      first_name,
      last_name,
      date_of_birth: otherData.date_of_birth || null,
      gender: otherData.gender || null,
      physical_description: otherData.physical_description || null,
      identification_number: otherData.identification_number || null,
      status: otherData.status || 'active',
      wanted: parseBoolean(otherData.wanted),
      danger_level: otherData.danger_level || null,
      known_aliases: parseAliases(otherData.known_aliases),
      arrested_before: parseBoolean(otherData.arrested_before),
      arrest_count: parseNumber(otherData.arrest_count),
      photo_path: req.file ? `/uploads/criminals/${req.file.filename}` : null,
      photo_size: req.file ? req.file.size : null,
      photo_uploaded_at: req.file ? new Date().toISOString() : null,
    };

    const { data: criminal, error } = await supabase
      .from('criminals')
      .insert([newCriminal])
      .select()
      .single();

    if (error) {
      if (req.file) {
        deleteUploadedFile(`/uploads/criminals/${req.file.filename}`);
      }
      return res.status(500).json({
        success: false,
        message: `Failed to create criminal: ${error.message}`,
      });
    }

    return res.status(201).json({
      success: true,
      criminal: {
        id: criminal.id,
        first_name: criminal.first_name,
        last_name: criminal.last_name,
        date_of_birth: criminal.date_of_birth,
        gender: criminal.gender,
        physical_description: criminal.physical_description,
        identification_number: criminal.identification_number,
        status: criminal.status,
        wanted: criminal.wanted,
        danger_level: criminal.danger_level,
        known_aliases: criminal.known_aliases,
        arrested_before: criminal.arrested_before,
        arrest_count: criminal.arrest_count,
        photo_path: criminal.photo_path,
        photo_size: criminal.photo_size,
        photo_uploaded_at: criminal.photo_uploaded_at,
        created_at: criminal.created_at,
        updated_at: criminal.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a criminal record (admin)
 * PATCH /api/admin/criminals/:id
 * Protected: requires authenticate + authorize('admin')
 * Returns: { success, criminal }
 */
export const updateCriminalAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Criminal ID is required',
      });
    }

    const supabase = getSupabaseClient();

    // Check if criminal exists
    const { data: existing } = await supabase
      .from('criminals')
      .select('id, photo_path')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Criminal not found',
      });
    }

    // Check for duplicate identification_number if being updated
    if (updateData.identification_number) {
      const { data: duplicate } = await supabase
        .from('criminals')
        .select('id')
        .eq('identification_number', updateData.identification_number)
        .neq('id', id)
        .single();

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'This identification number is already assigned to another criminal',
        });
      }
    }

    // Build update payload (only provided fields)
    const updatePayload = {};
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        updatePayload[key] = updateData[key];
      }
    });

    if (updatePayload.wanted !== undefined) {
      updatePayload.wanted = parseBoolean(updatePayload.wanted);
    }
    if (updatePayload.arrested_before !== undefined) {
      updatePayload.arrested_before = parseBoolean(updatePayload.arrested_before);
    }
    if (updatePayload.arrest_count !== undefined) {
      updatePayload.arrest_count = parseNumber(updatePayload.arrest_count);
    }
    if (updatePayload.known_aliases !== undefined) {
      updatePayload.known_aliases = parseAliases(updatePayload.known_aliases);
    }

    if (req.file) {
      updatePayload.photo_path = `/uploads/criminals/${req.file.filename}`;
      updatePayload.photo_size = req.file.size;
      updatePayload.photo_uploaded_at = new Date().toISOString();
    }

    const { data: criminal, error } = await supabase
      .from('criminals')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (req.file) {
        deleteUploadedFile(`/uploads/criminals/${req.file.filename}`);
      }
      return res.status(500).json({
        success: false,
        message: `Failed to update criminal: ${error.message}`,
      });
    }

    if (req.file && existing.photo_path) {
      deleteUploadedFile(existing.photo_path);
    }

    return res.status(200).json({
      success: true,
      criminal: {
        id: criminal.id,
        first_name: criminal.first_name,
        last_name: criminal.last_name,
        date_of_birth: criminal.date_of_birth,
        gender: criminal.gender,
        physical_description: criminal.physical_description,
        identification_number: criminal.identification_number,
        status: criminal.status,
        wanted: criminal.wanted,
        danger_level: criminal.danger_level,
        known_aliases: criminal.known_aliases,
        arrested_before: criminal.arrested_before,
        arrest_count: criminal.arrest_count,
        photo_path: criminal.photo_path,
        photo_size: criminal.photo_size,
        photo_uploaded_at: criminal.photo_uploaded_at,
        created_at: criminal.created_at,
        updated_at: criminal.updated_at,
        deleted_at: criminal.deleted_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete a criminal record (admin)
 * DELETE /api/admin/criminals/:id
 * Protected: requires authenticate + authorize('admin')
 * Returns: { success, message, criminal_id, deleted_at }
 */
export const deleteCriminalAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Criminal ID is required',
      });
    }

    const supabase = getSupabaseClient();

    // Check if criminal exists
    const { data: existing } = await supabase
      .from('criminals')
      .select('id, deleted_at')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Criminal not found',
      });
    }

    if (existing.deleted_at) {
      return res.status(400).json({
        success: false,
        message: 'Criminal record is already deleted',
      });
    }

    // Soft delete
    const deletedAt = new Date().toISOString();
    const { error } = await supabase
      .from('criminals')
      .update({ deleted_at: deletedAt })
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to delete criminal: ${error.message}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Criminal record deleted successfully',
      criminal_id: id,
      deleted_at: deletedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restore a soft-deleted criminal record (admin only)
 * PATCH /api/admin/criminals/:id/restore
 * Protected: requires authenticate + authorize('admin')
 * Returns: { success, message, criminal_id }
 */
export const restoreCriminalAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Criminal ID is required',
      });
    }

    const supabase = getSupabaseClient();

    // Check if criminal exists and is deleted
    const { data: existing } = await supabase
      .from('criminals')
      .select('id, deleted_at')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Criminal not found',
      });
    }

    if (!existing.deleted_at) {
      return res.status(400).json({
        success: false,
        message: 'Criminal record is not deleted',
      });
    }

    // Restore (clear deleted_at)
    const { error } = await supabase
      .from('criminals')
      .update({ deleted_at: null })
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to restore criminal: ${error.message}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Criminal record restored successfully',
      criminal_id: id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Permanent delete a criminal record (admin only - irreversible)
 * DELETE /api/admin/criminals/:id/permanent
 * Protected: requires authenticate + authorize('admin')
 * Returns: { success, message, criminal_id }
 */
export const hardDeleteCriminalAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Criminal ID is required',
      });
    }

    const supabase = getSupabaseClient();

    // Check if criminal exists
    const { data: existing } = await supabase
      .from('criminals')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Criminal not found',
      });
    }

    // Permanently delete
    const { error } = await supabase
      .from('criminals')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to permanently delete criminal: ${error.message}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Criminal record permanently deleted (irreversible)',
      criminal_id: id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * AUDIT LOG MANAGEMENT - READONLY
 * Admins can view audit logs to track system activity and changes
 */

/**
 * Get all audit logs with optional filtering and pagination
 * GET /api/admin/audit-logs
 * Protected: requires authenticate + authorize('admin')
 * Query Parameters:
 *   - limit (default: 50, max: 500)
 *   - offset (default: 0)
 *   - userId, action, entityType, severity, status, licenseNumber (optional filters)
 *   - startDate, endDate (ISO format for date range)
 *   - sortBy (default: 'timestamp')
 *   - sortOrder ('asc' or 'desc', default: 'desc')
 * Returns: { success, auditLogs: Array, total, limit, offset }
 */
export const getAuditLogsForAdmin = async (req, res, next) => {
  try {
    const result = await getAllAuditLogs(req.query);

    return res.status(200).json({
      success: true,
      auditLogs: result.logs,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

/**
 * Get a single audit log entry by ID
 * GET /api/admin/audit-logs/:id
 * Protected: requires authenticate + authorize('admin')
 * Returns: { success, auditLog: Object }
 */
export const getAuditLogByIdForAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Audit log ID is required',
      });
    }

    const auditLog = await getAuditLogById(id);

    return res.status(200).json({
      success: true,
      auditLog,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

/**
 * Get audit logs for a specific user
 * GET /api/admin/audit-logs/user/:userId
 * Protected: requires authenticate + authorize('admin')
 * Query Parameters: limit, offset, sortBy, sortOrder
 * Returns: { success, auditLogs: Array, total }
 */
export const getAuditLogsByUserForAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const result = await getAuditLogsByUser(userId, req.query);

    return res.status(200).json({
      success: true,
      auditLogs: result.logs,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

/**
 * Get critical severity audit logs
 * GET /api/admin/audit-logs/critical
 * Protected: requires authenticate + authorize('admin')
 * Query Parameters: limit, offset, startDate, endDate
 * Returns: { success, auditLogs: Array, total }
 */
export const getCriticalAuditLogsForAdmin = async (req, res, next) => {
  try {
    const result = await getCriticalAuditLogs(req.query);

    return res.status(200).json({
      success: true,
      auditLogs: result.logs,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

/**
 * Get failed action audit logs
 * GET /api/admin/audit-logs/failed
 * Protected: requires authenticate + authorize('admin')
 * Query Parameters: limit, offset, startDate, endDate
 * Returns: { success, auditLogs: Array, total }
 */
export const getFailedAuditLogsForAdmin = async (req, res, next) => {
  try {
    const result = await getFailedAuditLogs(req.query);

    return res.status(200).json({
      success: true,
      auditLogs: result.logs,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};