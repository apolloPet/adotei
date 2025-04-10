
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
    console.log('Testando conexão com Supabase...');
    
    // Testa primeiro a autenticação (não precisa de tabelas)
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Erro ao testar conexão de autenticação do Supabase:', authError);
      toast.error('Não foi possível conectar ao Supabase. Verifique as configurações.');
      return false;
    }
    
    console.log('Conexão de autenticação do Supabase bem-sucedida!', authData);
    console.log('Status da autenticação:', authData.session ? 'Autenticado' : 'Não autenticado');
    
    // Test if we can query something from Supabase
    try {
      // Check if we can access the users table
      console.log('Tentando acessar tabela users...');
      const { data: usersData, error: usersError } = await supabase.from('users').select('count', { count: 'exact', head: true });
      
      if (usersError) {
        console.warn('Teste de acesso à tabela users falhou:', usersError);
        console.log('Tentando tabela alternativa...');
        
        // Try an alternative table
        const { data: adoptionsData, error: adoptionsError } = await supabase.from('adoptions').select('count', { count: 'exact', head: true });
        
        if (adoptionsError) {
          console.warn('Teste de acesso à tabela adoptions falhou:', adoptionsError);
        } else {
          console.log('Acesso à tabela adoptions bem-sucedido!');
        }
      } else {
        console.log('Acesso à tabela users bem-sucedido!', usersData);
      }
    } catch (queryError) {
      console.warn('Teste de consulta às tabelas falhou:', queryError);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao Supabase:', error);
    toast.error('Erro de configuração do Supabase');
    return false;
  }
};

// Handle errors in a standardized way
export const handleSupabaseError = (error: any, defaultMessage: string = 'Ocorreu um erro') => {
  console.error('Erro do Supabase:', error);
  
  // Check for specific authentication errors
  if (error?.name === 'AuthSessionMissingError') {
    toast.error('Sua sessão expirou. Por favor, faça login novamente para continuar.');
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
  
  // Handle database error codes
  if (error?.code) {
    switch (error.code) {
      case '23505':
        toast.error('Este registro já existe no sistema.');
        return;
      case '42501':
        toast.error('Você não tem permissão para realizar esta operação.');
        return;
      case '23502':
        toast.error('Dados incompletos. Preencha todos os campos obrigatórios.');
        return;
      case 'PGRST301':
        toast.error('A consulta não retornou resultados.');
        return;
    }
  }
  
  // Handle other errors
  const errorMessage = error?.message || defaultMessage;
  toast.error(errorMessage);
};
