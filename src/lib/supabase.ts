
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// These environment variables are automatically injected by Lovable
// when using the Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single Supabase client for the entire application
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
