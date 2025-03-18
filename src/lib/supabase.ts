
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

// Handle errors in a standardized way
export const handleSupabaseError = (error: any, defaultMessage: string = 'Ocorreu um erro') => {
  console.error('Supabase error:', error);
  
  // Check for specific authentication errors
  if (error?.name === 'AuthSessionMissingError') {
    toast.error('Sessão de autenticação expirada. Por favor, faça login novamente.');
    return;
  }
  
  // Handle other errors
  const errorMessage = error?.message || defaultMessage;
  toast.error(errorMessage);
};
