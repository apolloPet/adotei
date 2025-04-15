
import type { User } from '@/components/admin/users/types';
import type { Pet } from '@/components/pet/types';

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

// Add missing types for Pet-related functionality
export type DbPet = {
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
  shelter_time?: string;
  special_needs?: boolean;
  health_issues?: boolean;
  traits?: string[];
  created_at: string;
  updated_at: string;
  medical_info?: string;
  [key: string]: any;
};

export type DbPetImage = {
  id: string;
  pet_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
};

// Updated pet converter function with normalized properties
export const dbPetToPet = (dbPet: DbPet, images: DbPetImage[] = []): Pet => {
  const primaryImage = images.find(img => img.is_primary)?.url || images[0]?.url || '';
  const additionalImages = images.filter(img => !img.is_primary).map(img => img.url);
  
  // Ensure species is properly mapped to the expected type
  const normalizedSpecies = (): 'dog' | 'cat' | 'other' => {
    const species = dbPet.species.toLowerCase();
    if (species === 'dog' || species === 'cachorro') return 'dog';
    if (species === 'cat' || species === 'gato') return 'cat';
    return 'other';
  };
  
  // Normalize gender to match the expected type
  const normalizedGender = (): 'male' | 'female' => {
    const gender = dbPet.gender.toLowerCase();
    if (gender === 'female' || gender === 'fêmea' || gender === 'femea') return 'female';
    return 'male'; // Default to male for any other values
  };
  
  // Normalize size to match the expected type
  const normalizedSize = (): 'small' | 'medium' | 'large' => {
    const size = dbPet.size.toLowerCase();
    if (size === 'small' || size === 'pequeno') return 'small';
    if (size === 'medium' || size === 'médio' || size === 'medio') return 'medium';
    if (size === 'large' || size === 'grande') return 'large';
    // Default to medium if size doesn't match any of the expected values
    return 'medium';
  };
  
  return {
    id: dbPet.id,
    name: dbPet.name,
    species: normalizedSpecies(),
    breed: dbPet.breed,
    age: `${dbPet.age} ${dbPet.age_unit === 'years' ? 'anos' : 
          dbPet.age_unit === 'months' ? 'meses' : 'dias'}`,
    gender: normalizedGender(),
    size: normalizedSize(),
    weight: dbPet.weight,
    description: dbPet.description,
    location: dbPet.location,
    shelterTime: dbPet.shelter_time,
    specialNeeds: dbPet.special_needs,
    healthIssues: dbPet.health_issues,
    traits: dbPet.traits || [],
    primaryImage,
    additionalImages,
    medicalInfo: dbPet.medical_info,
    shelterId: dbPet.shelter_id,
    created_at: dbPet.created_at,
    updated_at: dbPet.updated_at,
    // Add missing required properties
    shelter: dbPet.shelter_id || '', // Using shelter_id as shelter, could be improved later by looking up shelter details
    images: [primaryImage, ...additionalImages].filter(Boolean) // Combine all images into a single array
  };
};

// Add shelter-related types
export type DbShelter = {
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
  [key: string]: any;
};
