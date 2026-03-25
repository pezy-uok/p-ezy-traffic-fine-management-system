import { getSupabaseClient } from '../config/supabaseClient.js';

const createUser = async (userData) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching users:', error.message);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user:', error.message);
    throw error;
  }
};

const updateUser = async (userId, userData) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error.message);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error.message);
    throw error;
  }
};

export { createUser, getAllUsers, getUserById, updateUser, deleteUser };
