
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
    
    // Check if we have admin access from localStorage (for demo purposes)
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    
    // Try the query regardless of session status if the user is an admin
    try {
      // First attempt - direct query
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar usuários diretamente:', error);
        
        // If we're admin but still got an error, try the edge function approach
        if (isAdmin) {
          console.log('Usuário é admin via localStorage, tentando função edge...');
          return await tryEdgeFunctionQuery();
        }
        
        // If we're not admin and got an error, check session and try again
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          console.error('Erro: Usuário não está autenticado');
          
          // If we're in the admin panel, we can try using edge function as fallback
          return await tryEdgeFunctionQuery();
        } else {
          // We have a session but the query failed for some other reason
          handleSupabaseError(error, 'Erro ao buscar usuários');
          return [];
        }
      }

      console.log(`Encontrados ${userData?.length || 0} usuários na tabela users`);
      
      return (userData || []).map((dbUser) => {
        return dbUserToUser(dbUser as DbUser);
      });
    } catch (directQueryError) {
      console.error('Erro ao fazer query direta:', directQueryError);
      // Fallback to edge function
      return await tryEdgeFunctionQuery();
    }
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    toast.error('Erro ao buscar usuários');
    return [];
  }
};

// Helper function to try using edge function as fallback
async function tryEdgeFunctionQuery(): Promise<User[]> {
  try {
    console.log('Tentando buscar usuários via edge function...');
    
    // Get current session if exists
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    // Call edge function with or without token
    const { data: functionData, error: functionError } = await supabase.functions.invoke('admin', {
      method: 'POST',
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
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
