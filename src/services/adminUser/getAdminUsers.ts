import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { AdminUser } from './types';

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    console.log('Fetching admin users');
    
    // Verificar se é o admin principal por localStorage
    const isLocalAdmin = localStorage.getItem('userEmail') === 'admin@petmatch.com';
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError && !isLocalAdmin) {
      console.error('Erro ao obter sessão:', sessionError);
      toast.error('Você precisa estar autenticado para listar administradores');
      return [];
    }
    
    // Configurar cabeçalhos dependendo da autenticação
    let headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (sessionData.session?.access_token) {
      headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
    } else if (isLocalAdmin) {
      // Se for admin principal sem sessão, adicionar cabeçalho especial
      headers['X-Admin-Override'] = 'true';
      headers['X-Admin-Email'] = 'admin@petmatch.com';
    } else {
      console.error('Nem sessão válida nem admin principal detectado');
      toast.error('Sessão inválida. Por favor, faça login novamente.');
      return [];
    }
    
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'GET',
      headers
    });
    
    if (error) {
      console.error('Erro na edge function de listagem de administradores:', error);
      toast.error(`Erro ao listar administradores: ${error.message}`);
      return [];
    }
    
    if (!data.success || !data.data) {
      console.error('Resposta de erro da edge function:', data);
      toast.error(data.message || 'Erro ao listar administradores');
      return [];
    }
    
    console.log('Administradores obtidos:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error in getAdminUsers:', error);
    toast.error('Erro ao buscar administradores');
    throw error;
  }
};
