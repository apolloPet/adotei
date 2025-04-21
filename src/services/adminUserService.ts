
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at?: string;
  permissions: {
    manageAnimals: boolean;
    approveAdoptions: boolean;
    manageSettings: boolean;
    manageAdmins: boolean;
  };
}

export const createAdminUser = async (
  email: string, 
  password: string, 
  name: string,
  permissions: {
    manageAnimals: boolean;
    approveAdoptions: boolean;
    manageSettings: boolean;
    manageAdmins: boolean;
  }
): Promise<{success: boolean; message: string; data?: AdminUser}> => {
  try {
    console.log('Creating admin user with data:', { email, name, permissions });
    
    // Verificar se existe uma sessão ativa
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Erro ao obter sessão:', sessionError);
      return {
        success: false,
        message: 'Erro ao obter sessão: ' + (sessionError.message || 'Verifique se você está logado')
      };
    }
    
    if (!sessionData.session) {
      console.error('Sessão não encontrada');
      return {
        success: false,
        message: 'Você precisa estar autenticado para criar um administrador. Por favor, faça login novamente.'
      };
    }
    
    const adminData = {
      email,
      password,
      name,
      permissions
    };
    
    console.log('Enviando solicitação para edge function de criação de administrador');
    
    // Tentar obter o token de acesso
    const accessToken = sessionData.session.access_token;
    if (!accessToken) {
      console.error('Token de acesso não encontrado na sessão');
      return {
        success: false,
        message: 'Sessão inválida. Por favor, faça login novamente.'
      };
    }
    
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'POST',
      body: JSON.stringify(adminData),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (error) {
      console.error('Erro na edge function de criação de administrador:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar administrador'
      };
    }
    
    console.log('Resposta da edge function:', data);
    
    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Erro ao criar administrador'
      };
    }
    
    return {
      success: true,
      message: data.message || 'Administrador criado com sucesso',
      data: data.data
    };
  } catch (error) {
    console.error('Error in createAdminUser:', error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return {
      success: false,
      message: 'Erro ao criar administrador: ' + errorMessage
    };
  }
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    console.log('Fetching admin users');
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Erro ao obter sessão:', sessionError);
      toast.error('Você precisa estar autenticado para listar administradores');
      return [];
    }
    
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        'Content-Type': 'application/json'
      }
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

export const updateAdminPermissions = async (
  userId: string,
  permissions: {
    manageAnimals: boolean;
    approveAdoptions: boolean;
    manageSettings: boolean;
    manageAdmins: boolean;
  }
): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Erro ao obter sessão:', sessionError);
      toast.error('Você precisa estar autenticado para atualizar permissões');
      return false;
    }
    
    const requestData = {
      userId,
      permissions
    };
    
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'PUT',
      body: JSON.stringify(requestData),
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        'Content-Type': 'application/json'
      }
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

export const removeAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Erro ao obter sessão:', sessionError);
      toast.error('Você precisa estar autenticado para remover administrador');
      return false;
    }
    
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        'Content-Type': 'application/json'
      }
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
