
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
    
    // Verify all required fields
    if (!email || !name || !password) {
      return {
        success: false,
        message: 'Todos os campos obrigatórios precisam ser preenchidos.'
      };
    }
    
    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return {
        success: false,
        message: 'Formato de email inválido.'
      };
    }
    
    // Validate password
    if (password.length < 6) {
      return {
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres.'
      };
    }
    
    // Create the payload
    const adminData = {
      email,
      password,
      name,
      permissions
    };
    
    console.log('Request payload for admin creation:', adminData);
    
    // Serialize request body
    const requestBody = JSON.stringify(adminData);
    console.log('Serialized request body:', requestBody);
    
    // Check if JSON is valid
    if (!requestBody || requestBody === '{}') {
      console.error('Request body is empty after serialization');
      return {
        success: false,
        message: 'Erro na preparação dos dados para envio.'
      };
    }
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Check if it's the main admin via localStorage or has a session
    const isMainAdmin = localStorage.getItem('userEmail') === 'admin@petmatch.com';
    
    if (isMainAdmin) {
      console.log('Using admin override for admin@petmatch.com');
      headers['X-Admin-Override'] = 'true';
      headers['X-Admin-Email'] = 'admin@petmatch.com';
    } else {
      // For normal users, get session token
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
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'POST',
      body: requestBody,
      headers
    });
    
    console.log('Response from admin-management:', data, error);
    
    if (error) {
      console.error('Error from edge function:', error);
      
      // Handle specific known error cases
      if (error.message?.includes('duplicate')) {
        return {
          success: false,
          message: 'Este email já está em uso por outro usuário.'
        };
      }
      
      // Improve error messages for user feedback
      const userFriendlyMessage = getUserFriendlyErrorMessage(error.message);
      
      return {
        success: false,
        message: userFriendlyMessage || 'Erro ao criar administrador'
      };
    }
    
    if (!data || !data.success) {
      console.error('Error response from edge function:', data);
      
      // Provide more specific error message from the response if available
      const errorMessage = data?.message ? getDetailedErrorMessage(data.message) : 'Erro ao criar administrador';
      
      return {
        success: false,
        message: errorMessage
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
    
    // Convert technical error to user-friendly message
    const userFriendlyMessage = getUserFriendlyErrorMessage(errorMessage);
    
    return {
      success: false,
      message: 'Erro ao criar administrador: ' + userFriendlyMessage
    };
  }
};

// Helper function to provide user-friendly error messages
function getUserFriendlyErrorMessage(errorMessage: string): string {
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 'Problema de conexão com o servidor. Verifique sua internet e tente novamente.';
  }
  
  if (errorMessage.includes('timeout')) {
    return 'O servidor demorou muito para responder. Tente novamente mais tarde.';
  }
  
  if (errorMessage.includes('duplicate') || errorMessage.includes('já existe')) {
    return 'Este email já está cadastrado no sistema.';
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
    return 'Você não tem permissão para realizar esta operação.';
  }
  
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return 'Os dados fornecidos são inválidos. Verifique os campos e tente novamente.';
  }
  
  // Return a default user-friendly message or the original error if nothing matches
  return errorMessage;
}

// Helper function to provide detailed error messages from edge function responses
function getDetailedErrorMessage(message: string): string {
  // Handle specific JSON parsing errors
  if (message.includes('JSON')) {
    return 'Erro na formatação dos dados. Por favor, verifique as informações e tente novamente.';
  }
  
  // Handle missing fields errors
  if (message.includes('missing') || message.includes('required')) {
    return 'Campos obrigatórios não preenchidos. Verifique o formulário e tente novamente.';
  }
  
  // Return original message if no specific handling
  return message;
}
