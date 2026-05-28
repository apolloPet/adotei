
import { SignupData } from '../types';
import { apiRequest } from '@/lib/apiClient';
import { parseHoursAloneDaily } from '@/utils/adopterProfileStorage';

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
        addressNumber: data.number || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zip || '',
        housingType: data.housingType || null,
        hasChildren: data.hasChildren ?? null,
        childrenAges: data.childrenAges || null,
        hadPetsBefore: data.hadPetsBefore ?? null,
        currentlyHasPets: data.hasOtherPets ?? null,
        currentPetsTypes: data.otherPetsDescription || null,
        hoursAloneDaily: parseHoursAloneDaily(data.hoursAlone || '') ?? null,
        willCoverVaccines: data.commitVet ?? null,
        willCoverEmergencies: data.commitEmergency ?? null,
        awareOfCosts: data.commitFood ?? null,
      },
      skipAuth: true,
    });

    return true;
  } catch (error) {
    console.error('Signup process failed:', error);
    throw error;
  }
};
