
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { toast } from '@/hooks/use-sonner';

// Use the Supabase integration client information
import { supabase as integrationClient } from '@/integrations/supabase/client';

// Export the client directly from the integration
export const supabase = integrationClient;

// Function to check if Supabase connection is properly configured
export const isSupabaseConfigured = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test if we can query something from Supabase
    const { data, error } = await supabase.from('pets').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error testing Supabase connection:', error);
      return false;
    }
    
    console.log('Supabase connection successful!');
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
  
  // Handle specific known errors
  if (error?.message?.includes('Email link is invalid or has expired')) {
    toast.error('O link de email é inválido ou expirou. Por favor, solicite um novo link.');
    return;
  }

  if (error?.message?.includes('User already registered')) {
    toast.error('Este email já está cadastrado. Por favor, tente fazer login ou recuperar sua senha.');
    return;
  }
  
  // Handle other errors
  const errorMessage = error?.message || defaultMessage;
  toast.error(errorMessage);
};
