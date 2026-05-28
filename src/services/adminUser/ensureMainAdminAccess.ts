
import { apiRequest } from '@/lib/apiClient';

export const ensureMainAdminAccess = async (): Promise<boolean> => {
  try {
    const isMainAdmin = localStorage.getItem("userEmail") === "admin@petmatch.com";
    
    if (isMainAdmin) {
      const users = await apiRequest<
        Array<{
          id: string;
          email: string;
          roles: string[];
          authSubject: string;
          fullName: string;
          organizationId?: string;
        }>
      >('/api/users');
      const current = users.find((user) => user.email === 'admin@petmatch.com');

      if (!current) {
        return false;
      }

      await apiRequest(`/api/users/${current.id}`, {
        method: 'PUT',
        body: {
          authSubject: current.authSubject,
          fullName: current.fullName,
          email: current.email,
          userType: 'ADMIN',
          organizationId: current.organizationId ?? null,
          roles: ['ADMIN'],
        },
      });

      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error in ensureMainAdminAccess:', error);
    return false;
  }
};
