
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { clearAuthSession } from '@/lib/apiClient';

/**
 * Desloga o usuário atual
 */
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      console.error('Signout error:', error);
      toast.error('Erro ao fazer logout');
      return;
    }
    clearAuthSession();
    toast.success('Logout realizado com sucesso');
  } catch (error) {
    console.error('Unexpected error during signout:', error);
    toast.error('Erro inesperado ao fazer logout');
  }
};
