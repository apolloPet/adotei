
import { toast } from '@/hooks/use-sonner';
import { offlineSupabase } from './offlineSupabase';

// Backend remoto desligado temporariamente: o app usa um cliente local compatível
// para impedir chamadas a tabelas/funções inexistentes no ambiente atual.
export const supabase = offlineSupabase as any;

// Function to check if Supabase connection is properly configured
export const isSupabaseConfigured = async () => {
  try {
    console.log('Modo local ativo: conexão remota desabilitada temporariamente.');
    return true;
  } catch (error) {
    console.error('Erro ao iniciar modo local:', error);
    toast.error('Erro ao iniciar modo local');
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
