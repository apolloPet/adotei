
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { toast } from '@/hooks/use-sonner';

// These environment variables are automatically injected by Lovable
// when using the Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that the required environment variables are set
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
  toast.error('Erro de configuração: VITE_SUPABASE_URL não está definido');
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
  toast.error('Erro de configuração: VITE_SUPABASE_ANON_KEY não está definido');
}

// Create a single Supabase client for the entire application
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// Function to check if Supabase connection is properly configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
