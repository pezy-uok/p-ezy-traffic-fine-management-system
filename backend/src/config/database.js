import { createClient } from '@supabase/supabase-js';

let supabase = null;

// Initialize Supabase client lazily
const getSupabaseClient = () => {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
    }
    
    supabase = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });
  }
  return supabase;
};

// Verify connection on startup
const initializeDatabase = async () => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.error('❌ Supabase authentication warning:', error.message);
      // Don't throw - just warn, as some operations might still work
    } else {
      console.log('✓ Supabase client initialized successfully');
    }
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error.message);
    throw error;
  }
};

export { getSupabaseClient, initializeDatabase };
