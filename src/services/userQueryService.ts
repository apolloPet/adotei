
import { supabase, isSupabaseConfigured, handleSupabaseError } from '@/lib/supabase';
import type { User } from '@/components/admin/users/types';
import { toast } from '@/hooks/use-sonner';
import { dbUserToUser, DbUser } from '@/utils/dbConverters';

/**
 * Fetches all users from the database
 * This dedicated function ensures we're only querying the users table
 */
export const queryUsers = async (): Promise<User[]> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return [];
    }

    console.log('Iniciando busca de usuários na tabela users...');
    
    // First try to get session to ensure we're authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('Erro: Usuário não está autenticado');
      toast.error('Você precisa estar autenticado para ver usuários');
      return [];
    }
    
    // Use admin role to bypass RLS if possible
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar usuários diretamente:', error);
      handleSupabaseError(error, 'Erro ao buscar usuários');
      
      // If we can't get users directly, try using edge function
      try {
        console.log('Tentando buscar usuários via edge function...');
        const { data: functionData, error: functionError } = await supabase.functions.invoke('admin', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: { endpoint: '/users' }
        });
        
        if (functionError) {
          console.error('Erro ao buscar usuários via edge function:', functionError);
          return [];
        }
        
        console.log(`Encontrados ${functionData?.length || 0} usuários via edge function`);
        return (functionData || []).map((dbUser: DbUser) => dbUserToUser(dbUser));
      } catch (functionCallError) {
        console.error('Erro ao chamar edge function:', functionCallError);
        return [];
      }
    }

    console.log(`Encontrados ${userData?.length || 0} usuários na tabela users`);
    
    return (userData || []).map((dbUser) => {
      return dbUserToUser(dbUser as DbUser);
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    toast.error('Erro ao buscar usuários');
    return [];
  }
};

export const queryUserById = async (id: string): Promise<User | null> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return dbUserToUser(data as DbUser);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};
