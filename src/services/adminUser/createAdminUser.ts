import { apiRequest } from '@/lib/apiClient';
import { AdminUser } from './types';
import { isValidEmail, normalizeEmail } from '@/utils/brMasks';

export const createAdminUser = async (
  email: string,
  password: string, 
  name: string,
  permissions: AdminUser['permissions']
): Promise<{success: boolean; message: string; data?: AdminUser}> => {
  try {
    const normalizedEmail = normalizeEmail(email);
    if (!email || !name || !password) {
      return {
        success: false,
        message: 'Todos os campos obrigatórios precisam ser preenchidos.'
      };
    }
    
    if (!isValidEmail(normalizedEmail)) {
      return {
        success: false,
        message: 'Formato de email inválido.'
      };
    }
    
    if (password.length < 6) {
      return {
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres.'
      };
    }
    
    const data = await apiRequest<{
      id: string;
      email: string;
      roles: string[];
      permissions?: AdminUser['permissions'] | null;
    }>('/api/users', {
      method: 'POST',
      body: {
        authSubject: normalizedEmail,
        fullName: name,
        email: normalizedEmail,
        phone: null,
        userType: 'ADMIN',
        addressLine: null,
        addressNumber: null,
        neighborhood: null,
        city: null,
        state: null,
        zipCode: null,
        organizationId: null,
        password,
        permissions,
        roles: ['ADMIN'],
      },
    });

    return {
      success: true,
      message: 'Administrador criado com sucesso',
      data: {
        id: data.id,
        email: data.email,
        role: 'admin',
        permissions: data.permissions ?? permissions,
      },
    };
  } catch (error) {
    console.error('Error in createAdminUser:', error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    
    const userFriendlyMessage = getUserFriendlyErrorMessage(errorMessage);
    
    return {
      success: false,
      message: 'Erro ao criar administrador: ' + userFriendlyMessage
    };
  }
}

function getUserFriendlyErrorMessage(errorMessage: string): string {
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 'Problema de conexão com o servidor. Verifique sua internet e tente novamente.';
  }
  
  if (errorMessage.includes('timeout')) {
    return 'O servidor demorou muito para responder. Tente novamente mais tarde.';
  }
  
  if (errorMessage.includes('duplicate') || errorMessage.includes('já existe') || errorMessage.includes('ja esta')) {
    return 'Este email já está cadastrado no sistema.';
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized') || errorMessage.includes('permissao')) {
    return 'Você não tem permissão para realizar esta operação.';
  }
  
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return 'Os dados fornecidos são inválidos. Verifique os campos e tente novamente.';
  }
  
  return errorMessage;
}
