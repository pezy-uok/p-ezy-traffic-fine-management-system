import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

/**
 * Initialize Supabase client for REST API operations
 * This uses HTTP-based REST API which works even when DNS blocks direct database access
 */
export const initializeSupabaseClient = () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️  Supabase credentials not configured');
      return null;
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });

    console.log('✓ Supabase REST API client initialized');
    return supabaseClient;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error.message);
    return null;
  }
};

/**
 * Get the Supabase client instance
 * Use this to perform database operations via REST API
 */
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    return initializeSupabaseClient();
  }
  return supabaseClient;
};

/**
 * Test Supabase connection by querying public tables
 */
export const testSupabaseConnection = async () => {
  try {
    const client = getSupabaseClient();
    if (!client) {
      console.warn('⚠️  Supabase client not available');
      return false;
    }

    // Try to fetch a single row from any table
    // This will test if connection works
    const { data, error } = await client.from('users').select('*').limit(1);

    if (error) {
      console.warn('⚠️  Could not connect to Supabase:', error.message);
      return false;
    }

    console.log('✓ Supabase REST API connection successful');
    return true;
  } catch (error) {
    console.warn('⚠️  Supabase connection test failed:', error.message);
    return false;
  }
};

export default supabaseClient;
