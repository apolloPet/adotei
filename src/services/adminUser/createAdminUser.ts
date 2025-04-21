import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { AdminUser } from './types';

export const createAdminUser = async (
  email: string, 
  password: string, 
  name: string,
  permissions: AdminUser['permissions']
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
