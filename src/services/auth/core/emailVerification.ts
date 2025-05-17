
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

/**
 * Confirma o email do usuário
 */
export const confirmEmail = async (token: string, type: 'signup' | 'recovery' = 'signup'): Promise<boolean> => {
  try {
    let result;
    
    // Handle different types of verification
    if (type === 'signup') {
      result = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup',
      });
    } else if (type === 'recovery') {
      result = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      });
    } else {
      throw new Error('Invalid verification type');
    }

    const { data, error } = result;

    if (error) {
      console.error('Email confirmation error:', error);
      toast.error('Erro ao confirmar o email');
      return false;
    }

    console.log('Email confirmed successfully:', data);
    toast.success('Email confirmado com sucesso!');
    return true;
  } catch (error) {
    console.error('Unexpected error during email confirmation:', error);
    toast.error('Erro inesperado ao confirmar o email');
    return false;
  }
};
