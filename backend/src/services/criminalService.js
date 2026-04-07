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

  // Check if identification_number already exists (if provided)
  if (criminalData.identification_number) {
    const { data: existing } = await supabase
      .from('criminals')
      .select('id')
      .eq('identification_number', criminalData.identification_number)
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

  // Check if criminal exists
  const { data: existing } = await supabase
    .from('criminals')
    .select('id')
    .eq('id', criminalId)
    .single();

  if (!existing) {
    throw new NotFoundError('Criminal not found');
  }

  // If identification_number is being updated, check for duplicates
  if (updateData.identification_number) {
    const { data: duplicate } = await supabase
      .from('criminals')
      .select('id')
      .eq('identification_number', updateData.identification_number)
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

  // Update in database
  const { data: criminal, error } = await supabase
    .from('criminals')
    .update(updatePayload)
    .eq('id', criminalId)
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
    created_at: criminal.created_at,
    updated_at: criminal.updated_at,
  };
};
