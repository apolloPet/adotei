
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
  shelter_time?: string;
  traits?: string[];
  special_needs: boolean;
  health_issues: boolean;
  created_at: string;
  updated_at: string;
  medical_info?: string;
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
  logo_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
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

export const dbPetToPet = (dbPet: DbPet, images: DbPetImage[] = []) => {
  const age = `${dbPet.age} ${dbPet.age_unit === 'years' ? 'anos' : 
              dbPet.age_unit === 'months' ? 'meses' : 'dias'}`;
  
  const primaryImage = images.find(img => img.is_primary)?.url || 
                      (images.length > 0 ? images[0].url : '');
                      
  return {
    id: dbPet.id,
    name: dbPet.name,
    species: dbPet.species,
    breed: dbPet.breed,
    age: age,
    gender: dbPet.gender,
    size: dbPet.size,
    weight: dbPet.weight,
    description: dbPet.description,
    location: dbPet.location,
    shelterId: dbPet.shelter_id,
    shelterTime: dbPet.shelter_time || '',
    traits: dbPet.traits || [],
    specialNeeds: dbPet.special_needs,
    healthIssues: dbPet.health_issues,
    medicalInfo: dbPet.medical_info || '',
    images: images.map(img => img.url),
    primaryImage: primaryImage,
    shelter: dbPet.shelter_id  // Adding the missing shelter property to match the Pet interface
  };
};
