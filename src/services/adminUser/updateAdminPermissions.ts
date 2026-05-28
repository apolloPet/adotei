import { apiRequest } from '@/lib/apiClient';
import { toast } from '@/hooks/use-sonner';
import { AdminUser } from './types';

export const updateAdminPermissions = async (
  userId: string,
  permissions: AdminUser['permissions']
): Promise<boolean> => {
  try {
    const current = await apiRequest<{
      id: string;
      authSubject: string;
      fullName: string;
      email: string;
      phone?: string;
      userType?: string;
      addressLine?: string;
      addressNumber?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      organizationId?: string;
      roles: string[];
    }>(`/api/users/${userId}`);

    const roles = permissions.manageAdmins ? ['ADMIN'] : ['VOLUNTARIO'];

    await apiRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: {
        authSubject: current.authSubject,
        fullName: current.fullName,
        email: current.email,
        phone: current.phone,
        userType: current.userType ?? 'ADOTANTE',
        addressLine: current.addressLine,
        addressNumber: current.addressNumber,
        neighborhood: current.neighborhood,
        city: current.city,
        state: current.state,
        zipCode: current.zipCode,
        organizationId: current.organizationId ?? null,
        roles,
      },
    });

    toast.success('Permissões atualizadas com sucesso');
    return true;
  } catch (error) {
    console.error('Error in updateAdminPermissions:', error);
    toast.error('Erro ao atualizar permissões');
    return false;
  }
};
