import { getSupabaseClient } from '../config/supabaseClient.js';
import { ValidationError, ConflictError, NotFoundError } from '../utils/errors.js';

/**
 * Create a new criminal record
 * @param {Object} criminalData - Criminal information
 * @param {string} criminalData.first_name - First name (required)
 * @param {string} criminalData.last_name - Last name (required)
 * @param {string} criminalData.date_of_birth - Date of birth (optional, format: YYYY-MM-DD)
 * @param {string} criminalData.gender - Gender (optional)
 * @param {string} criminalData.physical_description - Physical description (optional)
 * @param {string} criminalData.identification_number - ID number (unique, optional)
 * @param {string} criminalData.status - Status: 'active', 'inactive', 'deceased', 'deported' (default: 'active')
 * @param {boolean} criminalData.wanted - Wanted status (default: false)
 * @param {string} criminalData.danger_level - Danger level (optional)
 * @param {Array<string>} criminalData.known_aliases - Array of known aliases (optional)
 * @param {boolean} criminalData.arrested_before - Has been arrested before (default: false)
 * @param {number} criminalData.arrest_count - Number of arrests (default: 0)
 * @returns {Promise<Object>} Created criminal object
 * @throws {ValidationError} If required fields are missing
 * @throws {ConflictError} If identification_number already exists
 */
export const createCriminal = async (criminalData) => {
  // Validate required fields
  if (!criminalData.first_name || !criminalData.last_name) {
    throw new ValidationError('First name and last name are required');
  }

  const supabase = getSupabaseClient();

  // Check if identification_number already exists (if provided) - exclude soft-deleted records
  if (criminalData.identification_number) {
    const { data: existing } = await supabase
      .from('criminals')
      .select('id')
      .eq('identification_number', criminalData.identification_number)
      .is('deleted_at', null)
      .single();

    if (existing) {
      throw new ConflictError('Criminal with this identification number already exists');
    }
  }

  // Prepare criminal data with all fields
  const newCriminal = {
    first_name: criminalData.first_name,
    last_name: criminalData.last_name,
    date_of_birth: criminalData.date_of_birth || null,
    gender: criminalData.gender || null,
    physical_description: criminalData.physical_description || null,
    identification_number: criminalData.identification_number || null,
    status: criminalData.status || 'active',
    wanted: criminalData.wanted || false,
    danger_level: criminalData.danger_level || null,
    known_aliases: criminalData.known_aliases || null,
    arrested_before: criminalData.arrested_before || false,
    arrest_count: criminalData.arrest_count || 0,
    photo_path: criminalData.photo_path || null,
    photo_uploaded_at: criminalData.photo_path ? new Date().toISOString() : null,
    photo_size: criminalData.photo_size || null,
  };

  // Insert into database
  const { data: criminal, error } = await supabase
    .from('criminals')
    .insert([newCriminal])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create criminal record: ${error.message}`);
  }

  return {
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
    photo_uploaded_at: criminal.photo_uploaded_at,
    photo_size: criminal.photo_size,
    created_at: criminal.created_at,
    updated_at: criminal.updated_at,
  };
};

/**
 * Get a criminal record by ID
 * @param {string} criminalId - Criminal ID (UUID)
 * @returns {Promise<Object>} Criminal object
 * @throws {ValidationError} If criminal ID is missing
 * @throws {NotFoundError} If criminal not found or is deleted
 */
export const getCriminalById = async (criminalId) => {
  if (!criminalId) {
    throw new ValidationError('Criminal ID is required');
  }

  const supabase = getSupabaseClient();

  // Get criminal by ID, excluding soft-deleted records
  const { data: criminal, error } = await supabase
    .from('criminals')
    .select('*')
    .eq('id', criminalId)
    .is('deleted_at', null)
    .single();

  if (error || !criminal) {
    throw new NotFoundError('Criminal not found');
  }

  return {
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
    photo_uploaded_at: criminal.photo_uploaded_at,
    photo_size: criminal.photo_size,
    created_at: criminal.created_at,
    updated_at: criminal.updated_at,
  };
};

/**
 * Update an existing criminal record
 * @param {string} criminalId - Criminal ID (UUID)
 * @param {Object} updateData - Fields to update
 * @param {string} updateData.first_name - First name (optional)
 * @param {string} updateData.last_name - Last name (optional)
 * @param {string} updateData.date_of_birth - Date of birth (optional, format: YYYY-MM-DD)
 * @param {string} updateData.gender - Gender (optional)
 * @param {string} updateData.physical_description - Physical description (optional)
 * @param {string} updateData.identification_number - ID number (optional, must be unique)
 * @param {string} updateData.status - Status (optional)
 * @param {boolean} updateData.wanted - Wanted status (optional)
 * @param {string} updateData.danger_level - Danger level (optional)
 * @param {Array<string>} updateData.known_aliases - Array of known aliases (optional)
 * @param {boolean} updateData.arrested_before - Has been arrested before (optional)
 * @param {number} updateData.arrest_count - Number of arrests (optional)
 * @returns {Promise<Object>} Updated criminal object
 * @throws {NotFoundError} If criminal not found
 * @throws {ConflictError} If identification_number already exists for another criminal
 */
export const updateCriminal = async (criminalId, updateData) => {
  if (!criminalId) {
    throw new ValidationError('Criminal ID is required');
  }

  const supabase = getSupabaseClient();

  // Check if criminal exists (and not soft-deleted)
  const { data: existing } = await supabase
    .from('criminals')
    .select('id')
    .eq('id', criminalId)
    .is('deleted_at', null)
    .single();

  if (!existing) {
    throw new NotFoundError('Criminal not found');
  }

  // If identification_number is being updated, check for duplicates (excluding soft-deleted)
  if (updateData.identification_number) {
    const { data: duplicate } = await supabase
      .from('criminals')
      .select('id')
      .eq('identification_number', updateData.identification_number)
      .is('deleted_at', null)
      .neq('id', criminalId)
      .single();

    if (duplicate) {
      throw new ConflictError('This identification number is already assigned to another criminal');
    }
  }

  // Prepare update data (only include fields that are provided)
  const updatePayload = {};
  if (updateData.first_name !== undefined) updatePayload.first_name = updateData.first_name;
  if (updateData.last_name !== undefined) updatePayload.last_name = updateData.last_name;
  if (updateData.date_of_birth !== undefined) updatePayload.date_of_birth = updateData.date_of_birth;
  if (updateData.gender !== undefined) updatePayload.gender = updateData.gender;
  if (updateData.physical_description !== undefined) updatePayload.physical_description = updateData.physical_description;
  if (updateData.identification_number !== undefined) updatePayload.identification_number = updateData.identification_number;
  if (updateData.status !== undefined) updatePayload.status = updateData.status;
  if (updateData.wanted !== undefined) updatePayload.wanted = updateData.wanted;
  if (updateData.danger_level !== undefined) updatePayload.danger_level = updateData.danger_level;
  if (updateData.known_aliases !== undefined) updatePayload.known_aliases = updateData.known_aliases;
  if (updateData.arrested_before !== undefined) updatePayload.arrested_before = updateData.arrested_before;
  if (updateData.arrest_count !== undefined) updatePayload.arrest_count = updateData.arrest_count;
  if (updateData.photo_path !== undefined) {
    updatePayload.photo_path = updateData.photo_path;
    updatePayload.photo_uploaded_at = updateData.photo_path ? new Date().toISOString() : null;
  }
  if (updateData.photo_size !== undefined) updatePayload.photo_size = updateData.photo_size;

  // Update in database
  const { data: criminal, error } = await supabase
    .from('criminals')
    .update(updatePayload)
    .eq('id', criminalId)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update criminal record: ${error.message}`);
  }

  return {
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
    photo_uploaded_at: criminal.photo_uploaded_at,
    photo_size: criminal.photo_size,
    created_at: criminal.created_at,
    updated_at: criminal.updated_at,
  };
};

/**
 * Get all criminals with optional filtering and pagination
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of records per page (default: 50, max: 1000)
 * @param {number} options.offset - Number of records to skip (default: 0)
 * @param {string} options.status - Filter by status ('active', 'inactive', 'deceased', 'deported')
 * @param {boolean} options.wanted - Filter by wanted status (true/false)
 * @param {string} options.search - Search by first_name or last_name (partial match)
 * @param {string} options.orderBy - Field to order by (default: 'created_at')
 * @param {string} options.orderDirection - 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Object>} { criminals: Array, total: number, limit, offset }
 */
export const getAllCriminals = async (options = {}) => {
  const supabase = getSupabaseClient();

  // Validate and set defaults
  let limit = options.limit || 50;
  if (limit > 1000) limit = 1000;
  if (limit < 1) limit = 1;

  const offset = options.offset || 0;
  if (offset < 0) throw new ValidationError('Offset cannot be negative');

  const orderBy = options.orderBy || 'created_at';
  const orderDirection = (options.orderDirection === 'asc') ? 'asc' : 'desc';

  let query = supabase.from('criminals').select('*', { count: 'exact' });

  // Filter out soft-deleted records
  query = query.is('deleted_at', null);

  // Apply filters
  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.wanted !== undefined) {
    query = query.eq('wanted', options.wanted);
  }

  if (options.search) {
    // Search is case-insensitive using ilike
    const searchTerm = `%${options.search}%`;
    query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`);
  }

  // Apply ordering, pagination
  const { data: criminals, error, count } = await query
    .order(orderBy, { ascending: orderDirection === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch criminals: ${error.message}`);
  }

  return {
    criminals: criminals.map((criminal) => ({
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
      photo_uploaded_at: criminal.photo_uploaded_at,
      photo_size: criminal.photo_size,
      created_at: criminal.created_at,
      updated_at: criminal.updated_at,
    })),
    total: count,
    limit,
    offset,
  };
};

/**
 * Delete a criminal record (soft delete - sets deleted_at timestamp)
 * @param {string} criminalId - Criminal ID (UUID)
 * @returns {Promise<Object>} { deleted: true, message: 'Criminal record deleted' }
 * @throws {ValidationError} If criminal ID is missing
 * @throws {NotFoundError} If criminal not found
 */
export const deleteCriminal = async (criminalId) => {
  if (!criminalId) {
    throw new ValidationError('Criminal ID is required');
  }

  const supabase = getSupabaseClient();

  // Check if criminal exists and is not already deleted
  const { data: existing } = await supabase
    .from('criminals')
    .select('id, deleted_at')
    .eq('id', criminalId)
    .single();

  if (!existing) {
    throw new NotFoundError('Criminal not found');
  }

  if (existing.deleted_at) {
    throw new ValidationError('Criminal record is already deleted');
  }

  // Soft delete: set deleted_at timestamp
  const { error } = await supabase
    .from('criminals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', criminalId);

  if (error) {
    throw new Error(`Failed to delete criminal record: ${error.message}`);
  }

  return {
    deleted: true,
    message: 'Criminal record deleted successfully',
    criminal_id: criminalId,
  };
};
