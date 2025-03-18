
import { Database } from '@/lib/database.types';
import { Pet } from '@/components/pet/types';
import { User } from '@/components/admin/users/types';

// Database types
export type DbPet = Database['public']['Tables']['pets']['Row'];
export type DbPetImage = Database['public']['Tables']['pet_images']['Row'];
export type DbUser = Database['public']['Tables']['users']['Row'];
export type DbShelter = Database['public']['Tables']['shelters']['Row'];
export type DbAdoption = Database['public']['Tables']['adoptions']['Row'];

// Convert database pet to frontend pet model
export const dbPetToPet = (
  dbPet: DbPet, 
  images: DbPetImage[]
): Pet => {
  return {
    id: dbPet.id,
    name: dbPet.name,
    species: dbPet.species as 'dog' | 'cat' | 'other',
    breed: dbPet.breed,
    age: `${dbPet.age} ${dbPet.age_unit}`,
    gender: dbPet.gender as 'male' | 'female',
    size: dbPet.size as 'small' | 'medium' | 'large',
    weight: dbPet.weight,
    description: dbPet.description,
    location: dbPet.location,
    shelterTime: dbPet.shelter_time || '',
    images: images.map(img => img.url).sort((a, b) => {
      // Sort images to ensure primary image is first
      const isPrimaryA = images.find(img => img.url === a)?.is_primary;
      const isPrimaryB = images.find(img => img.url === b)?.is_primary;
      return isPrimaryA ? -1 : isPrimaryB ? 1 : 0;
    }),
    shelter: '', // Will be populated separately if needed
    traits: dbPet.traits || [],
    specialNeeds: dbPet.special_needs || false,
    healthIssues: dbPet.health_issues || false,
  };
};

// Convert database user to frontend user model
export const dbUserToUser = (dbUser: DbUser): User => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    registrationDate: dbUser.created_at,
    address: {
      cep: dbUser.zip,
      street: dbUser.address,
      number: '', // Not stored separately in database
      neighborhood: '', // Not stored separately in database
      city: dbUser.city
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
