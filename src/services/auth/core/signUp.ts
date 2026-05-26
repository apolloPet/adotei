
import { SignupData } from '../types';
import { apiRequest } from '@/lib/apiClient';

/**
 * Realiza o cadastro do usuário
 */
export const signUp = async (data: SignupData): Promise<boolean> => {
  try {
    await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        email: data.email,
        password: data.password,
        phone: data.phone || '',
        addressLine: data.address || '',
        addressNumber: '',
        neighborhood: '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zip || '',
      },
      skipAuth: true,
    });

    return true;
  } catch (error) {
    console.error('Signup process failed:', error);
    throw error;
  }
};
