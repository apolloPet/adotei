
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
  created_at: string;
  updated_at: string;
  avatar_url?: string;
}

export const dbUserToUser = (dbUser: DbUser) => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone || '',
    registrationDate: dbUser.created_at,
    address: {
      cep: dbUser.zip || '',
      street: dbUser.address || '',
      number: '', // Not directly mapped in database
      neighborhood: '', // Not directly mapped in database
      city: dbUser.city || '',
      state: dbUser.state || ''
    },
    housingType: dbUser.housing_type as 'apartment' | 'house' | 'other',
    hasChildren: dbUser.has_children,
    childrenAges: dbUser.children_ages,
    hadPetsBefore: dbUser.had_pets_before,
    hasAllergies: dbUser.has_allergies,
    allergiesDescription: dbUser.allergies_description,
    workSchedule: dbUser.work_schedule
  };
};
