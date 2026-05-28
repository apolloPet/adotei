
import { fetchUserById, fetchUsers } from '@/services/userService';
import { toast } from '@/hooks/use-sonner';
import type { User } from '@/components/admin/users/types';

// Define a simpler FilterType to avoid excessive type inference
type SimpleFilter = string | boolean | string[] | null | undefined;

export const queryUsers = async (filters?: Record<string, SimpleFilter>): Promise<User[]> => {
  try {
    let users = await fetchUsers();

    if (filters && typeof filters === 'object') {
      const filterEntries = Object.entries(filters);
      users = users.filter((user) =>
        filterEntries.every(([key, value]) => {
          if (value === undefined || value === null) return true;
          const currentValue = (user as Record<string, unknown>)[key];
          if (Array.isArray(value)) return value.length === 0 || value.includes(String(currentValue ?? ''));
          if (typeof value === 'boolean') return Boolean(currentValue) === value;
          if (typeof value === 'string') return String(currentValue ?? '').toLowerCase().includes(value.toLowerCase());
          return true;
        }),
      );
    }

    return users;
  } catch (error) {
    console.error('Error in queryUsers function:', error);
    toast.error('Falha ao buscar usuários');
    return [];
  }
};

// Get a single user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    return await fetchUserById(id);
  } catch (error) {
    console.error('Error in getUserById function:', error);
    return null;
  }
};

// Search users by name, email, or phone
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }
    
    const users = await fetchUsers();
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.phone || '').toLowerCase().includes(term),
    );
  } catch (error) {
    console.error('Error in searchUsers function:', error);
    return [];
  }
};

// Get users with specific characteristics (for matching)
export const getUsersByCharacteristics = async (characteristics: Record<string, SimpleFilter>): Promise<User[]> => {
  try {
    return queryUsers(characteristics);
  } catch (error) {
    console.error('Error in getUsersByCharacteristics function:', error);
    return [];
  }
};
