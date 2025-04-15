
import type { User } from '@/components/admin/users/types';

export type DbUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  housing_type?: string;
  has_children?: boolean;
  children_ages?: string;
  had_pets_before?: boolean;
  has_allergies?: boolean;
  allergies_description?: string;
  work_schedule?: string;
  auth_id?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
};

export const dbUserToUser = (dbUser: DbUser): User => {
  console.log('Convertendo usuário do banco para formato de frontend:', dbUser);
  
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    registrationDate: dbUser.created_at,
    address: {
      street: dbUser.address || '',
      city: dbUser.city || '',
      state: dbUser.state || '',
      cep: dbUser.zip || '',
      // Dados de neighborhood e number podem não existir no banco
      neighborhood: '',
      number: ''
    },
    housingType: dbUser.housing_type as 'apartment' | 'house' | 'other',
    hasChildren: dbUser.has_children,
    childrenAges: dbUser.children_ages,
    hadPetsBefore: dbUser.had_pets_before,
    hasAllergies: dbUser.has_allergies,
    allergiesDescription: dbUser.allergies_description,
    workSchedule: dbUser.work_schedule,
    auth_id: dbUser.auth_id,
    created_at: dbUser.created_at,
    updated_at: dbUser.updated_at
  };
};
