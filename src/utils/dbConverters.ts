
import type { User } from '@/components/admin/users/types';
import type { Pet } from '@/components/pet/types';

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

export interface DbShelter {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  logo_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DbPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  age_unit: string;
  gender: string;
  size: string;
  weight: number;
  description: string;
  location: string;
  shelter_id: string;
  shelter_time: string;
  created_at: string;
  updated_at: string;
  traits: string[];
  medical_info?: string;
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

export const dbPetToPet = (dbPet: DbPet, images: DbPetImage[] = []): Pet => {
  const primaryImage = images.find(img => img.is_primary)?.url || '';
  const additionalImages = images
    .filter(img => !img.is_primary)
    .map(img => img.url);

  return {
    id: dbPet.id,
    name: dbPet.name,
    species: dbPet.species as 'dog' | 'cat' | 'other',
    breed: dbPet.breed,
    age: `${dbPet.age} ${dbPet.age_unit === 'years' ? 'anos' : 
          dbPet.age_unit === 'months' ? 'meses' : 'dias'}`,
    gender: dbPet.gender as 'male' | 'female',
    size: dbPet.size as 'small' | 'medium' | 'large',
    weight: dbPet.weight,
    description: dbPet.description,
    location: dbPet.location,
    shelterId: dbPet.shelter_id,
    shelterTime: dbPet.shelter_time,
    adoptionStatus: 'available', // Default status
    traits: dbPet.traits || [],
    healthIssues: dbPet.health_issues,
    specialNeeds: dbPet.special_needs,
    mainImage: primaryImage,
    images: [primaryImage, ...additionalImages].filter(Boolean),
    medicalInfo: dbPet.medical_info || ''
  };
};
