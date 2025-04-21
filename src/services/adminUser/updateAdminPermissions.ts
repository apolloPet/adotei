import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { AdminUser } from './types';

export const updateAdminPermissions = async (
  userId: string,
  permissions: AdminUser['permissions']
): Promise<boolean> => {
  try {
    // Verificar se é o admin principal por localStorage
    const isLocalAdmin = localStorage.getItem('userEmail') === 'admin@petmatch.com';
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError && !isLocalAdmin) {
      console.error('Erro ao obter sessão:', sessionError);
      toast.error('Você precisa estar autenticado para atualizar permissões');
      return false;
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
      return false;
    }
    
    const requestData = {
      userId,
      permissions
    };
    
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'PUT',
      body: JSON.stringify(requestData),
      headers
    });
    
    if (error) {
      console.error('Erro na edge function de atualização de permissões:', error);
      toast.error(`Erro ao atualizar permissões: ${error.message}`);
      return false;
    }
    
    if (!data.success) {
      console.error('Resposta de erro da edge function:', data);
      toast.error(data.message || 'Erro ao atualizar permissões');
      return false;
    }
    
    toast.success('Permissões atualizadas com sucesso');
    return true;
  } catch (error) {
    console.error('Error in updateAdminPermissions:', error);
    toast.error('Erro ao atualizar permissões');
    return false;
  }
};
