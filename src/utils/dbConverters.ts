
import { User } from "@/components/admin/users/types";
import { Pet } from "@/components/pet/types";

// Interface para o usuário como armazenado no banco de dados
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
  children_ages?: string;
  had_pets_before: boolean;
  has_allergies: boolean;
  allergies_description?: string;
  work_schedule: string;
  created_at: string;
  updated_at?: string;
}

// Interface para o abrigo como armazenado no banco de dados
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

// Interface para o pet como armazenado no banco de dados
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
  special_needs?: boolean;
  health_issues?: boolean;
  medical_info?: string;
  created_at: string;
  updated_at: string;
}

// Interface para imagens de pet como armazenadas no banco de dados
export interface DbPetImage {
  id: string;
  pet_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
}

// Converter de formato DB para o formato da UI
export const dbUserToUser = (dbUser: DbUser): User => {
  return {
    id: dbUser.id,
    name: dbUser.name || "",
    email: dbUser.email || "",
    phone: dbUser.phone || "",
    registrationDate: dbUser.created_at,
    address: {
      street: dbUser.address || "",
      city: dbUser.city || "",
      state: dbUser.state || "",
      neighborhood: "", // Este campo não existe no banco
      cep: dbUser.zip || "",
      number: "", // Este campo não existe no banco
    },
    housingType: dbUser.housing_type as "apartment" | "house" | "other",
    hasChildren: dbUser.has_children || false,
    childrenAges: dbUser.children_ages,
    hadPetsBefore: dbUser.had_pets_before || false,
    hasAllergies: dbUser.has_allergies || false,
    allergiesDescription: dbUser.allergies_description,
    workSchedule: dbUser.work_schedule || "",
  };
};

// Converter de formato UI para o formato DB
export const userToDbUser = (user: Partial<User>, authId?: string): Partial<DbUser> => {
  return {
    ...(authId && { auth_id: authId }),
    ...(user.name && { name: user.name }),
    ...(user.email && { email: user.email }),
    ...(user.phone && { phone: user.phone }),
    ...(user.address?.street && { address: user.address.street }),
    ...(user.address?.city && { city: user.address.city }),
    ...(user.address?.state && { state: user.address.state }),
    ...(user.address?.cep && { zip: user.address.cep }),
    ...(user.housingType && { housing_type: user.housingType }),
    ...(user.hasChildren !== undefined && { has_children: user.hasChildren }),
    ...(user.childrenAges && { children_ages: user.childrenAges }),
    ...(user.hadPetsBefore !== undefined && { had_pets_before: user.hadPetsBefore }),
    ...(user.hasAllergies !== undefined && { has_allergies: user.hasAllergies }),
    ...(user.allergiesDescription && { allergies_description: user.allergiesDescription }),
    ...(user.workSchedule && { work_schedule: user.workSchedule }),
  };
};

// Converter de formato DB para o formato da UI de Pet
export const dbPetToPet = (dbPet: DbPet, dbImages: DbPetImage[] = []): Pet => {
  // Calcular a idade formatada
  const ageString = dbPet.age_unit === 'years' 
    ? `${dbPet.age} ${dbPet.age === 1 ? 'ano' : 'anos'}`
    : dbPet.age_unit === 'months'
      ? `${dbPet.age} ${dbPet.age === 1 ? 'mês' : 'meses'}`
      : `${dbPet.age} dias`;

  return {
    id: dbPet.id,
    name: dbPet.name,
    species: dbPet.species as 'dog' | 'cat' | 'other',
    breed: dbPet.breed,
    age: ageString,
    gender: dbPet.gender as 'male' | 'female',
    size: dbPet.size as 'small' | 'medium' | 'large',
    weight: dbPet.weight.toString(),
    description: dbPet.description,
    location: dbPet.location,
    shelterTime: dbPet.shelter_time || '',
    traits: dbPet.traits || [],
    specialNeeds: dbPet.special_needs || false,
    healthIssues: dbPet.health_issues || false,
    medicalInfo: dbPet.medical_info || '',
    images: dbImages.map(img => ({
      id: img.id,
      url: img.url,
      isPrimary: img.is_primary
    })),
  };
};

// Converter de formato Pet UI para o formato DB
export const petToDbPet = (pet: Partial<Pet>, shelterId?: string): Partial<DbPet> => {
  // Extrair a parte numérica da idade
  let age = 0;
  let ageUnit = 'years';
  
  if (pet.age) {
    const ageMatch = pet.age.match(/^(\d+)/);
    if (ageMatch) {
      age = parseInt(ageMatch[1]);
    }
    
    if (pet.age.includes('mês') || pet.age.includes('meses')) {
      ageUnit = 'months';
    } else if (pet.age.includes('dia')) {
      ageUnit = 'days';
    }
  }

  return {
    ...(pet.name && { name: pet.name }),
    ...(pet.species && { species: pet.species }),
    ...(pet.breed && { breed: pet.breed }),
    ...(age && { age: age }),
    ...(ageUnit && { age_unit: ageUnit }),
    ...(pet.gender && { gender: pet.gender }),
    ...(pet.size && { size: pet.size }),
    ...(pet.weight && { weight: parseFloat(pet.weight) }),
    ...(pet.description && { description: pet.description }),
    ...(pet.location && { location: pet.location }),
    ...(shelterId && { shelter_id: shelterId }),
    ...(pet.shelterTime && { shelter_time: pet.shelterTime }),
    ...(pet.traits && { traits: pet.traits }),
    ...(pet.specialNeeds !== undefined && { special_needs: pet.specialNeeds }),
    ...(pet.healthIssues !== undefined && { health_issues: pet.healthIssues }),
    ...(pet.medicalInfo && { medical_info: pet.medicalInfo }),
  };
};
