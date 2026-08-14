import { apiRequest } from '@/lib/apiClient';
import { toast } from '@/hooks/use-sonner';
import { AdminUser } from './types';

const DEFAULT_PERMISSIONS: AdminUser['permissions'] = {
  manageAnimals: true,
  approveAdoptions: true,
  manageSettings: true,
  manageAdmins: true,
  manageUsers: true,
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const users = await apiRequest<Array<{
      id: string;
      email: string;
      roles: string[];
      permissions?: AdminUser['permissions'] | null;
      createdAt?: string | null;
    }>>('/api/users');

    return users
      .filter((user) => user.roles.includes('ADMIN'))
      .map((user) => ({
        id: user.id,
        email: user.email,
        role: 'admin',
        permissions: user.permissions ?? DEFAULT_PERMISSIONS,
        created_at: user.createdAt ?? undefined,
      }));
  } catch (error) {
    console.error('Error in getAdminUsers:', error);
    toast.error('Erro ao buscar administradores');
    throw error;
  }
};
