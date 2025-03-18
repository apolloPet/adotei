
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { toast } from '@/hooks/use-sonner';

// These environment variables are automatically injected by Lovable
// when using the Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single Supabase client for the entire application
export const supabase = createClient<Database>(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);

// Function to check if Supabase connection is properly configured
export const isSupabaseConfigured = () => {
  if (!supabaseUrl) {
    console.error('Missing VITE_SUPABASE_URL environment variable');
    toast.error('Erro de configuração: VITE_SUPABASE_URL não está definido');
    return false;
  }

  if (!supabaseAnonKey) {
    console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
    toast.error('Erro de configuração: VITE_SUPABASE_ANON_KEY não está definido');
    return false;
  }

  return true;
};
