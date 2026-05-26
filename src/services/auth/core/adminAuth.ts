
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

/**
 * Tenta fazer login com credenciais de funcionário de entidade
 */
export const signInAdmin = async (email: string, password: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }

    const authUserRaw = localStorage.getItem('authUser');
    const isEntityStaff = (() => {
      if (!authUserRaw) return false;
      try {
        const authUser = JSON.parse(authUserRaw) as { userType?: string; roles?: string[] };
        return authUser.userType === 'VOLUNTARIO' || Boolean(authUser.roles?.includes('VOLUNTARIO'));
      } catch {
        return false;
      }
    })();

    if (!isEntityStaff) {
      await supabase.auth.signOut();
      toast.error('Este usuário não tem permissão de funcionário de entidade');
      return false;
    }
    
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Credenciais invalidas') || error.message.includes('Invalid login credentials')) {
        toast.error('Credenciais inválidas');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.error('Erro ao fazer login como entidade');
    }
    return false;
  }
};

// Add functions for setting user roles if needed
export const setUserRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    console.log('Setting user role:', { userId, role });
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    toast.error('Erro ao definir função do usuário');
    return false;
  }
};

export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    console.log('Getting user role for:', userId);
    return 'user'; // Placeholder
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};
