import { apiRequest } from '@/lib/apiClient';
import type { User } from '@/components/admin/users/types';
import { toast } from '@/hooks/use-sonner';

type BackendAdopterProfile = User['adopterProfile'];

type BackendUser = {
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
  organizationName?: string;
  organizationResponsible?: boolean;
  roles: string[];
  createdAt?: string;
  adopterProfile?: BackendAdopterProfile;
};

const mapBackendUser = (user: BackendUser): User => ({
  id: user.id,
  name: user.fullName,
  email: user.email,
  phone: user.phone,
  registrationDate: user.createdAt ?? new Date().toISOString(),
  address: {
    street: user.addressLine,
    number: user.addressNumber,
    neighborhood: user.neighborhood,
    city: user.city,
    state: user.state,
    cep: user.zipCode,
  },
  housingType: user.adopterProfile?.housingType as User['housingType'],
  hasChildren: user.adopterProfile?.hasChildren,
  childrenAges: user.adopterProfile?.childrenAges,
  hadPetsBefore: user.adopterProfile?.hadPetsBefore,
  adopterProfile: user.adopterProfile,
});

const mapRequest = (user: Omit<User, 'id' | 'registrationDate'>, authId: string) => ({
  authSubject: authId,
  fullName: user.name,
  email: user.email,
  phone: user.phone,
  userType: 'ADOTANTE',
  addressLine: user.address?.street,
  addressNumber: user.address?.number,
  neighborhood: user.address?.neighborhood,
  city: user.address?.city,
  state: user.address?.state,
  zipCode: user.address?.cep,
  organizationId: null,
  roles: ['ADOTANTE'],
});

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const userData = await apiRequest<BackendUser[]>('/api/users');
    return userData.map(mapBackendUser);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    toast.error('Erro ao buscar usuários');
    return [];
  }
};

export const fetchUserWithRoleInfo = async (userId: string): Promise<{user: User | null, isAdmin: boolean}> => {
  try {
    const userData = await apiRequest<BackendUser>(`/api/users/${userId}`);
    if (!userData) {
      return { user: null, isAdmin: false };
    }

    return { 
      user: mapBackendUser(userData),
      isAdmin: userData.roles.includes('ADMIN'),
    };
  } catch (error) {
    console.error('Erro ao buscar usuário com informações de papel:', error);
    toast.error('Erro ao buscar informações do usuário');
    return { user: null, isAdmin: false };
  }
};

export const fetchUserById = async (id: string): Promise<User | null> => {
  try {
    const data = await apiRequest<BackendUser>(`/api/users/${id}`);
    return mapBackendUser(data);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};

export const createUser = async (user: Omit<User, 'id' | 'registrationDate'>, authId: string): Promise<User | null> => {
  try {
    const data = await apiRequest<BackendUser>('/api/users', {
      method: 'POST',
      body: mapRequest(user, authId),
    });
    return mapBackendUser(data);
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const existing = await apiRequest<BackendUser>(`/api/users/${id}`);
    const data = await apiRequest<BackendUser>(`/api/users/${id}`, {
      method: 'PUT',
      body: {
        authSubject: existing.authSubject,
        fullName: updates.name ?? existing.fullName,
        email: updates.email ?? existing.email,
        phone: updates.phone ?? existing.phone,
        userType: existing.userType ?? 'ADOTANTE',
        addressLine: updates.address?.street ?? existing.addressLine,
        addressNumber: updates.address?.number ?? existing.addressNumber,
        neighborhood: updates.address?.neighborhood ?? existing.neighborhood,
        city: updates.address?.city ?? existing.city,
        state: updates.address?.state ?? existing.state,
        zipCode: updates.address?.cep ?? existing.zipCode,
        organizationId: existing.organizationId ?? null,
        organizationResponsible: existing.organizationResponsible ?? false,
        roles: existing.roles.length ? existing.roles : ['ADOTANTE'],
      },
    });

    return mapBackendUser(data);
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await apiRequest(`/api/users/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};
