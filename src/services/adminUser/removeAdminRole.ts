import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

export const removeAdminRole = async (userId: string): Promise<boolean> => {
  try {
    // Verificar se é o admin principal por localStorage
    const isLocalAdmin = localStorage.getItem('userEmail') === 'admin@petmatch.com';
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError && !isLocalAdmin) {
      console.error('Erro ao obter sessão:', sessionError);
      toast.error('Você precisa estar autenticado para remover administrador');
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
    
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
      headers
    });
    
    if (error) {
      console.error('Erro na edge function de remoção de administrador:', error);
      toast.error(`Erro ao remover administrador: ${error.message}`);
      return false;
    }
    
    if (!data.success) {
      console.error('Resposta de erro da edge function:', data);
      toast.error(data.message || 'Erro ao remover administrador');
      return false;
    }
    
    toast.success('Administrador removido com sucesso');
    return true;
  } catch (error) {
    console.error('Error in removeAdminRole:', error);
    toast.error('Erro ao remover administrador');
    return false;
  }
};
