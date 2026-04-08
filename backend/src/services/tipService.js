import { getSupabaseClient } from '../config/supabaseClient.js';

/**
 * PUBLIC ENDPOINTS
 */

// Submit a new tip (public)
export const submitTipService = async (tipData) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');
  
  const {
    title,
    description,
    category,
    location,
    dateTime,
    contactEmail,
    isAnonymous,
    submitterIp,
  } = tipData;

  try {
    // Generate tip reference ID: TIP-YYYYMMDD-XXXXXX
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const tipReference = `TIP-${date}-${randomId}`;

    const { data, error } = await supabase
      .from('tips')
      .insert([
        {
          title,
          description,
          category,
          location,
          date_time: dateTime,
          contact_email: isAnonymous ? null : contactEmail,
          is_anonymous: isAnonymous,
          submitter_ip: submitterIp,
          tip_reference: tipReference,
          status: 'submitted',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Tip submitted successfully',
      tipReference: data.tip_reference,
      statusCheckUrl: `/api/tips/${data.tip_reference}/status`,
    };
  } catch (error) {
    console.error('Error submitting tip:', error);
    throw new Error('Failed to submit tip');
  }
};

// Get tip status by reference ID (public)
export const getTipStatusService = async (tipReference) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('id, status, tip_reference, created_at, updated_at')
      .eq('tip_reference', tipReference)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      tipReference: data.tip_reference,
      status: data.status,
      submittedAt: data.created_at,
      lastUpdated: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching tip status:', error);
    throw new Error('Failed to fetch tip status');
  }
};

/**
 * ADMIN ENDPOINTS
 */

// Get all tips with filtering and pagination (admin)
export const getAllTipsAdminService = async (options = {}) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');
  
  const {
    limit = 50,
    offset = 0,
    status,
    category,
    dateRange,
    assignedTo,
    search,
  } = options;

  try {
    let query = supabase.from('tips').select('*', { count: 'exact' });

    // Soft delete filter
    query = query.is('deleted_at', null);

    // Status filter
    if (status && status.length > 0) {
      query = query.in('status', status);
    }

    // Category filter
    if (category && category.length > 0) {
      query = query.in('category', category);
    }

    // Date range filter
    if (dateRange) {
      const { from, to } = dateRange;
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);
    }

    // Assigned officer filter
    if (assignedTo === 'unassigned') {
      query = query.is('assigned_officer_id', null);
    } else if (assignedTo && assignedTo !== 'all') {
      query = query.eq('assigned_officer_id', assignedTo);
    }

    // Search filter (title and description)
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      tips: data.map((tip) => formatTipResponse(tip)),
      total: count || 0,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error fetching tips:', error);
    throw new Error('Failed to fetch tips');
  }
};

// Get single tip by ID (admin)
export const getTipByIdAdminService = async (tipId) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('id', tipId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Fetch status change history
    const { data: history } = await supabase
      .from('tip_status_history')
      .select('*, users(first_name, last_name)')
      .eq('tip_id', tipId)
      .order('changed_at', { ascending: true });

    const statusChanges = history?.map((h) => ({
      oldStatus: h.old_status,
      newStatus: h.new_status,
      changedAt: h.changed_at,
      changedBy: `${h.users?.first_name} ${h.users?.last_name}`,
    })) || [];

    return {
      ...formatTipResponse(data),
      statusChanges,
      internalNotes: data.internal_notes,
      assignedOfficerId: data.assigned_officer_id,
    };
  } catch (error) {
    console.error('Error fetching tip:', error);
    throw new Error('Failed to fetch tip');
  }
};

// Update tip status (admin)
export const updateTipStatusService = async (
  tipId,
  newStatus,
  updatedBy,
  notes
) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    // Get current status
    const { data: currentTip, error: fetchError } = await supabase
      .from('tips')
      .select('status')
      .eq('id', tipId)
      .single();

    if (fetchError) throw fetchError;

    const oldStatus = currentTip.status;

    // Update tip status
    const { data, error: updateError } = await supabase
      .from('tips')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tipId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Record status change history
    await supabase.from('tip_status_history').insert([
      {
        tip_id: tipId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: updatedBy,
        changed_at: new Date().toISOString(),
        notes,
      },
    ]);

    // Update internal notes if provided
    if (notes) {
      await supabase
        .from('tips')
        .update({ internal_notes: notes })
        .eq('id', tipId);
    }

    return formatTipResponse(data);
  } catch (error) {
    console.error('Error updating tip status:', error);
    throw new Error('Failed to update tip status');
  }
};

// Assign tip to officer (admin)
export const assignTipService = async (
  tipId,
  assignedOfficerId,
  assignmentNotes
) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    const { data, error } = await supabase
      .from('tips')
      .update({
        assigned_officer_id: assignedOfficerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tipId)
      .select()
      .single();

    if (error) throw error;

    // Record assignment in internal notes
    if (assignmentNotes) {
      const currentNotes = data.internal_notes || '';
      const newNotes = `${currentNotes}\n[ASSIGNMENT] ${assignmentNotes}`;
      await supabase
        .from('tips')
        .update({ internal_notes: newNotes })
        .eq('id', tipId);
    }

    return formatTipResponse(data);
  } catch (error) {
    console.error('Error assigning tip:', error);
    throw new Error('Failed to assign tip');
  }
};

// Update tip category (admin)
export const updateTipCategoryService = async (tipId, newCategory) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    const { data, error } = await supabase
      .from('tips')
      .update({
        category: newCategory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tipId)
      .select()
      .single();

    if (error) throw error;

    return formatTipResponse(data);
  } catch (error) {
    console.error('Error updating tip category:', error);
    throw new Error('Failed to update tip category');
  }
};

// Delete tip (soft delete) (admin)
export const deleteTipService = async (tipId) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');
  
  try {
    const { data, error } = await supabase
      .from('tips')
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', tipId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Tip deleted successfully',
      id: data.id,
    };
  } catch (error) {
    console.error('Error deleting tip:', error);
    throw new Error('Failed to delete tip');
  }
};

/**
 * HELPER FUNCTION
 */

// Format tip response to camelCase
const formatTipResponse = (tip) => {
  return {
    id: tip.id,
    tipReference: tip.tip_reference,
    title: tip.title,
    description: tip.description,
    category: tip.category,
    location: tip.location,
    dateTime: tip.date_time,
    status: tip.status,
    isAnonymous: tip.is_anonymous,
    submitterEmail: tip.contact_email,
    assignedOfficerId: tip.assigned_officer_id,
    createdAt: tip.created_at,
    updatedAt: tip.updated_at,
  };
};
