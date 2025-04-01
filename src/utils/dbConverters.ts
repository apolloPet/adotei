
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

export interface DbPet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  age_unit: 'days' | 'months' | 'years';
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  weight: number;
  description: string;
  location: string;
  shelter_id: string;
  shelter_time: string | null;
  created_at: string;
  updated_at: string;
  traits: string[] | null;
  medical_info?: string | null;
  special_needs: boolean;
  health_issues: boolean;
}

export interface DbPetImage {
  id: string;
  pet_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
}

export interface DbShelter {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  created_at: string;
  updated_at: string;
  logo_url?: string | null;
  description?: string | null;
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
      number: '', // Not stored separately in the database
      neighborhood: '', // Not stored separately in the database
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

export const dbPetToPet = (dbPet: DbPet, images: DbPetImage[] = []): any => {
  return {
    id: dbPet.id,
    name: dbPet.name,
    species: dbPet.species,
    breed: dbPet.breed,
    age: `${dbPet.age} ${dbPet.age_unit === 'years' ? 'anos' : 
          dbPet.age_unit === 'months' ? 'meses' : 'dias'}`,
    gender: dbPet.gender,
    size: dbPet.size,
    weight: dbPet.weight,
    description: dbPet.description,
    location: dbPet.location,
    shelterTime: dbPet.shelter_time || '',
    traits: dbPet.traits || [],
    specialNeeds: dbPet.special_needs,
    healthIssues: dbPet.health_issues,
    medicalInfo: dbPet.medical_info || '',
    images: images.map(img => ({ 
      id: img.id, 
      url: img.url, 
      isPrimary: img.is_primary 
    })),
    mainImage: images.find(img => img.is_primary)?.url || 
               (images.length > 0 ? images[0].url : '')
  };
};
