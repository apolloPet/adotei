
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { toast } from '@/hooks/use-sonner';

// Use the Supabase integration client information
import { supabase as integrationClient } from '@/integrations/supabase/client';

// Export the client directly from the integration
export const supabase = integrationClient;

// Function to check if Supabase connection is properly configured
export const isSupabaseConfigured = () => {
  try {
    // Simple test query to check connection
    supabase.from('pets').select('count', { count: 'exact', head: true });
    return true;
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    toast.error('Erro de configuração do Supabase');
    return false;
  }
};
