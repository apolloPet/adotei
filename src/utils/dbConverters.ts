
import { User } from '@/components/admin/users/types';

export interface DbUser {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  housing_type: string | null;
  has_children: boolean | null;
  children_ages: string | null;
  had_pets_before: boolean | null;
  has_allergies: boolean | null;
  allergies_description: string | null;
  work_schedule: string | null;
  created_at: string;
  updated_at: string;
  avatar_url?: string | null;
}

export const dbUserToUser = (dbUser: DbUser): User => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone || '',
    registrationDate: dbUser.created_at,
    address: {
      cep: dbUser.zip || '',
      street: dbUser.address || '',
      number: '', // Não armazenado separadamente no banco
      neighborhood: '', // Não armazenado separadamente no banco
      city: dbUser.city || '',
      state: dbUser.state || ''
    },
    housingType: dbUser.housing_type as any || 'other',
    hasChildren: dbUser.has_children || false,
    childrenAges: dbUser.children_ages || '',
    hadPetsBefore: dbUser.had_pets_before || false,
    hasAllergies: dbUser.has_allergies || false,
    allergiesDescription: dbUser.allergies_description || '',
    workSchedule: dbUser.work_schedule || ''
  };
};
