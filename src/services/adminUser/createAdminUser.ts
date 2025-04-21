
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
    
    // Criar o payload para envio
    const adminData = {
      email,
      password,
      name,
      permissions
    };
    
    console.log('Request payload for admin creation:', adminData);
    
    // Construir o corpo da requisição como JSON string
    const requestBody = JSON.stringify(adminData);
    console.log('Serialized request body:', requestBody);
    
    // Verificar se a string JSON não está vazia
    if (!requestBody || requestBody === '{}') {
      console.error('Request body is empty after serialization');
      return {
        success: false,
        message: 'Erro na preparação dos dados para envio.'
      };
    }
    
    // Preparar os headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Verificar se é o admin principal via localStorage ou se tem sessão
    const isMainAdmin = localStorage.getItem('userEmail') === 'admin@petmatch.com';
    
    if (isMainAdmin) {
      console.log('Using admin override for admin@petmatch.com');
      headers['X-Admin-Override'] = 'true';
      headers['X-Admin-Email'] = 'admin@petmatch.com';
    } else {
      // Para usuários normais, obter token da sessão
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.access_token) {
        console.log('Using access token authentication');
        headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
      } else {
        console.error('No authentication method available');
        return {
          success: false,
          message: 'Erro de autenticação. Por favor, faça login novamente.'
        };
      }
    }
    
    console.log('Sending request to admin-management function with headers:', Object.keys(headers));
    
    // Fazer a chamada para o edge function
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'POST',
      body: requestBody,
      headers
    });
    
    console.log('Response from admin-management:', data, error);
    
    if (error) {
      console.error('Error from edge function:', error);
      return {
        success: false,
        message: error.message || 'Erro ao criar administrador'
      };
    }
    
    if (!data || !data.success) {
      console.error('Error response from edge function:', data);
      return {
        success: false,
        message: data?.message || 'Erro ao criar administrador'
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
