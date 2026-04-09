import {
  submitTipService,
  getTipStatusService,
  getAllTipsAdminService,
  getTipByIdAdminService,
  updateTipStatusService,
  assignTipService,
  updateTipCategoryService,
  deleteTipService,
} from '../services/tipService.js';

/**
 * PUBLIC ENDPOINTS
 */

// POST /api/tips/submit - Submit a new tip
export const submitTip = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      location,
      dateTime,
      contactEmail,
      isAnonymous = true,
    } = req.body;

    // Validation
    if (!title || !description || !category || !location || !dateTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, category, location, dateTime',
      });
    }

    if (title.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Title must not exceed 255 characters',
      });
    }

    if (description.length < 20 || description.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Description must be between 20 and 5000 characters',
      });
    }

    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Get submitter IP
    const submitterIp =
      req.headers['x-forwarded-for']?.split(',')[0] || req.ip;

    const result = await submitTipService({
      title,
      description,
      category,
      location,
      dateTime,
      contactEmail,
      isAnonymous,
      submitterIp,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error in submitTip:', error);
    next(error);
  }
};

// GET /api/tips/:tipReference/status - Check tip status by reference ID
export const getTipStatus = async (req, res, next) => {
  try {
    const { tipReference } = req.params;

    if (!tipReference) {
      return res.status(400).json({
        success: false,
        message: 'Tip reference ID is required',
      });
    }

    const status = await getTipStatusService(tipReference);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Tip not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error in getTipStatus:', error);
    next(error);
  }
};

/**
 * ADMIN ENDPOINTS
 */

// GET /api/tips/admin/all - List all tips with filtering
export const getAllTipsAdmin = async (req, res, next) => {
  try {
    const {
      limit = 50,
      offset = 0,
      status,
      category,
      dateRange,
      assignedTo,
      search,
    } = req.query;

    // Clean up query params
    const queryOptions = {
      limit: Math.min(parseInt(limit) || 50, 1000),
      offset: parseInt(offset) || 0,
      status: status ? (Array.isArray(status) ? status : [status]) : undefined,
      category: category
        ? (Array.isArray(category) ? category : [category])
        : undefined,
      dateRange: dateRange
        ? typeof dateRange === 'object'
          ? dateRange
          : undefined
        : undefined,
      assignedTo,
      search,
    };

    // Remove undefined values
    Object.keys(queryOptions).forEach(
      (k) => queryOptions[k] === undefined && delete queryOptions[k]
    );

    const result = await getAllTipsAdminService(queryOptions);

    return res.status(200).json({
      success: true,
      data: result.tips,
      pagination: {
        limit: result.limit,
        offset: result.offset,
        total: result.total,
      },
    });
  } catch (error) {
    console.error('Error in getAllTipsAdmin:', error);
    next(error);
  }
};

// GET /api/tips/admin/:id - Get full tip details
export const getTipByIdAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Tip ID is required',
      });
    }

    const tip = await getTipByIdAdminService(id);

    if (!tip) {
      return res.status(404).json({
        success: false,
        message: 'Tip not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: tip,
    });
  } catch (error) {
    console.error('Error in getTipByIdAdmin:', error);
    next(error);
  }
};

// PATCH /api/tips/admin/:id/status - Update tip status
export const updateTipStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStatus, notes } = req.body;
    const updatedBy = req.user?.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Tip ID is required',
      });
    }

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message: 'New status is required',
      });
    }

    // Validate status transition
    const validStatuses = [
      'submitted',
      'under_review',
      'resolved',
      'closed',
      'archived',
    ];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(', ')}`,
      });
    }

    const result = await updateTipStatusService(id, newStatus, updatedBy, notes);

    return res.status(200).json({
      success: true,
      data: result,
      message: `Tip status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error('Error in updateTipStatus:', error);
    next(error);
  }
};

// PATCH /api/tips/admin/:id/assign - Assign tip to officer
export const assignTip = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Accept both camelCase and snake_case field names
    const assignedOfficerId = req.body.assignedOfficerId || req.body.assigned_officer_id;
    const assignmentNotes = req.body.assignmentNotes || req.body.assignment_notes;

    console.log('\n🔧 ASSIGN TIP DEBUG');
    console.log(`   Tip ID: ${id}`);
    console.log(`   Content-Type Header: ${req.get('content-type')}`);
    console.log(`   Full Body:`, req.body);
    console.log(`   AssignedOfficerId: ${assignedOfficerId}`);
    console.log(`   AssignmentNotes: ${assignmentNotes}\n`);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Tip ID is required',
      });
    }

    if (!assignedOfficerId) {
      return res.status(400).json({
        success: false,
        message: 'Assigned officer ID is required',
      });
    }

    const result = await assignTipService(id, assignedOfficerId, assignmentNotes);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Tip assigned successfully',
    });
  } catch (error) {
    console.error('Error in assignTip:', error);
    next(error);
  }
};

// PATCH /api/tips/admin/:id/category - Update tip category
export const updateTipCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newCategory } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Tip ID is required',
      });
    }

    if (!newCategory) {
      return res.status(400).json({
        success: false,
        message: 'New category is required',
      });
    }

    const result = await updateTipCategoryService(id, newCategory);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Tip category updated successfully',
    });
  } catch (error) {
    console.error('Error in updateTipCategory:', error);
    next(error);
  }
};

// DELETE /api/tips/admin/:id - Delete tip (soft delete)
export const deleteTip = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Tip ID is required',
      });
    }

    const result = await deleteTipService(id);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in deleteTip:', error);
    next(error);
  }
};
