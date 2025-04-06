
import { User } from "@/components/admin/users/types";

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
