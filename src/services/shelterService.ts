
import { apiRequest } from '@/lib/apiClient';
import { toast } from '@/hooks/use-sonner';

export interface Shelter {
  id: string;
  name: string;
  cnpj?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  logoUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

type BackendOrganization = {
  id: string;
  legalName: string;
  cnpj?: string;
  primaryContactName: string;
  secondaryContactName?: string;
  contactPhone1: string;
  contactPhone2?: string;
  city: string;
  state?: string;
};

const backendToShelter = (organization: BackendOrganization): Shelter => {
  return {
    id: organization.id,
    name: organization.legalName,
    cnpj: organization.cnpj,
    email: `${organization.legalName.toLowerCase().replace(/\s+/g, '.')}@entidade.local`,
    phone: organization.contactPhone1,
    address: '',
    city: organization.city,
    state: organization.state || '',
    zip: '',
    logoUrl: undefined,
    description: `Responsável: ${organization.primaryContactName}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const fetchShelters = async (): Promise<Shelter[]> => {
  try {
    const data = await apiRequest<BackendOrganization[]>('/api/organizations');
    return data.map(backendToShelter);
  } catch (error) {
    console.error('Error fetching shelters:', error);
    return [];
  }
};

export const fetchShelterById = async (id: string): Promise<Shelter | null> => {
  try {
    const data = await apiRequest<BackendOrganization[]>('/api/organizations');
    const found = data.find((organization) => organization.id === id);
    return found ? backendToShelter(found) : null;
  } catch (error) {
    console.error('Error fetching shelter by ID:', error);
    return null;
  }
};

export const fetchShelterPets = async (shelterId: string): Promise<string[]> => {
  try {
    const data = await apiRequest<Array<{ id: string; organizationId?: string }>>('/api/animals');
    return data.filter((animal) => animal.organizationId === shelterId).map((animal) => animal.id);
  } catch (error) {
    console.error('Error fetching shelter pets:', error);
    return [];
  }
};

export const createShelter = async (shelter: Omit<Shelter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shelter | null> => {
  try {
    const data = await apiRequest<BackendOrganization>('/api/organizations', {
      method: 'POST',
      body: {
        legalName: shelter.name,
        cnpj: shelter.cnpj ?? null,
        primaryContactName: shelter.name,
        secondaryContactName: null,
        contactPhone1: shelter.phone,
        contactPhone2: null,
        city: shelter.city,
        state: shelter.state,
      },
    });

    return backendToShelter(data);
  } catch (error) {
    console.error('Error creating shelter:', error);
    return null;
  }
};

export const updateShelter = async (id: string, updates: Partial<Shelter>): Promise<Shelter | null> => {
  try {
    const all = await apiRequest<BackendOrganization[]>('/api/organizations');
    const existing = all.find((organization) => organization.id === id);
    if (!existing) {
      throw new Error('Entidade não encontrada');
    }
    const data = await apiRequest<BackendOrganization>(`/api/organizations/${id}`, {
      method: 'PUT',
      body: {
        legalName: updates.name ?? existing.legalName,
        cnpj: updates.cnpj ?? existing.cnpj,
        primaryContactName: existing.primaryContactName,
        secondaryContactName: existing.secondaryContactName,
        contactPhone1: updates.phone ?? existing.contactPhone1,
        contactPhone2: existing.contactPhone2,
        city: updates.city ?? existing.city,
        state: updates.state ?? existing.state,
      },
    });

    return backendToShelter(data);
  } catch (error) {
    console.error('Error updating shelter:', error);
    return null;
  }
};

export const deleteShelter = async (id: string): Promise<boolean> => {
  try {
    await apiRequest(`/api/organizations/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting shelter:', error);
    return false;
  }
};
