
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
    
    // Verificar se existe uma sessão ativa ou se é o admin principal
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const isLocalAdmin = localStorage.getItem('userEmail') === 'admin@petmatch.com';
    
    if (sessionError && !isLocalAdmin) {
      console.error('Erro ao obter sessão:', sessionError);
      return {
        success: false,
        message: 'Erro ao obter sessão: ' + (sessionError.message || 'Verifique se você está logado')
      };
    }
    
    // Se não houver sessão, mas for o admin principal por localStorage, prosseguir
    if (!sessionData.session && !isLocalAdmin) {
      console.error('Sessão não encontrada e não é admin principal');
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
    
    // Usar o token da sessão se disponível, ou proceder sem token para admin principal
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
      console.error('Token de acesso não encontrado na sessão');
      return {
        success: false,
        message: 'Sessão inválida. Por favor, faça login novamente.'
      };
    }
    
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'POST',
      body: JSON.stringify(adminData),
      headers
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
    
    // Se a criação foi bem-sucedida, atualizar permissões do admin@petmatch.com para ter acesso total
    if (email === 'admin@petmatch.com' || isLocalAdmin) {
      try {
        await supabase.functions.invoke('admin-management', {
          method: 'POST',
          body: JSON.stringify({
            grantSuperAdmin: true,
            email: 'admin@petmatch.com'
          }),
          headers
        });
        console.log('Permissões do admin principal atualizadas com sucesso');
      } catch (updateError) {
        console.error('Erro ao atualizar permissões do admin principal:', updateError);
      }
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

export const ensureMainAdminAccess = async (): Promise<boolean> => {
  try {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail !== 'admin@petmatch.com') {
      return false;
    }
    
    const { data: sessionData } = await supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (sessionData.session?.access_token) {
      headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
    } else {
      headers['X-Admin-Override'] = 'true';
      headers['X-Admin-Email'] = 'admin@petmatch.com';
    }
    
    console.log('Enviando solicitação para garantir acesso do admin principal');
    
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'POST',
      body: JSON.stringify({
        grantSuperAdmin: true,
        email: 'admin@petmatch.com'
      }),
      headers
    });
    
    if (error || !data?.success) {
      console.error('Erro ao garantir acesso do admin principal:', error || data?.message);
      return false;
    }
    
    console.log('Acesso do admin principal garantido com sucesso');
    localStorage.setItem('isAdmin', 'true');
    return true;
  } catch (error) {
    console.error('Erro ao garantir acesso do admin principal:', error);
    return false;
  }
};
