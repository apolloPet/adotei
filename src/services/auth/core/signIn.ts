
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { AuthError } from '@supabase/supabase-js';

/**
 * Realiza o login do usuário
 */
export const signIn = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('Iniciando login com:', { email });
    
    // Validação básica de entrada
    if (!email || !password) {
      console.error('Email ou senha não fornecidos');
      toast.error('Email e senha são obrigatórios');
      return false;
    }
    
    // Tenta fazer login através do Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Tratamento de erros
    if (error) {
      console.error('Erro de autenticação:', error);
      if (error instanceof AuthError) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenciais inválidas. Verifique seu email e senha.');
        } else {
          toast.error(`Erro de autenticação: ${error.message}`);
        }
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
      return false;
    }

    if (!data.session) {
      console.error('Nenhuma sessão retornada após o login');
      toast.error('Erro ao iniciar sessão. Tente novamente.');
      return false;
    }

    console.log('Usuário autenticado com sucesso:', { 
      userId: data.user?.id,
      email: data.user?.email,
      hasSession: !!data.session
    });
    
    return true;
  } catch (error) {
    console.error('Erro inesperado durante o login:', error);
    toast.error('Erro inesperado ao fazer login. Tente novamente.');
    return false;
  }
};
