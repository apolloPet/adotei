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
      organizationResponsible?: boolean;
      roles: string[];
    }>(`/api/users/${userId}`);

    await apiRequest(`/api/users/${userId}`, {
      method: 'PUT',
      body: {
        authSubject: current.authSubject,
        fullName: current.fullName,
        email: current.email,
        phone: current.phone ?? null,
        userType: 'ADMIN',
        addressLine: current.addressLine ?? null,
        addressNumber: current.addressNumber ?? null,
        neighborhood: current.neighborhood ?? null,
        city: current.city ?? null,
        state: current.state ?? null,
        zipCode: current.zipCode ?? null,
        organizationId: current.organizationId ?? null,
        organizationResponsible: current.organizationResponsible ?? false,
        permissions,
        roles: ['ADMIN'],
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
