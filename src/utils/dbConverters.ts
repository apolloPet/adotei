
import type { User } from '@/components/admin/users/types';

export interface DbUser {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  housing_type: string;
  has_children: boolean;
  children_ages: string;
  had_pets_before: boolean;
  has_allergies: boolean;
  allergies_description: string;
  work_schedule: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const dbUserToUser = (dbUser: DbUser): User => {
  return {
    id: dbUser.id,
    name: dbUser.name || '',
    email: dbUser.email || '',
    phone: dbUser.phone || '',
    registrationDate: dbUser.created_at,
    address: {
      street: dbUser.address || '',
      number: '', // Not available in database schema
      neighborhood: '', // Not available in database schema
      city: dbUser.city || '',
      state: dbUser.state || '',
      cep: dbUser.zip || ''
    },
    housingType: dbUser.housing_type as 'house' | 'apartment' | 'other',
    hasChildren: dbUser.has_children,
    childrenAges: dbUser.children_ages,
    hadPetsBefore: dbUser.had_pets_before,
    hasAllergies: dbUser.has_allergies,
    allergiesDescription: dbUser.allergies_description,
    workSchedule: dbUser.work_schedule || '',
    avatarUrl: dbUser.avatar_url
  };
};
