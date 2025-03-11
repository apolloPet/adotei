
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  address: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
  };
  housingType: 'apartment' | 'house' | 'other';
  hasChildren: boolean;
  childrenAges?: string;
  hadPetsBefore: boolean;
  hasAllergies: boolean;
  allergiesDescription?: string;
  workSchedule: string;
}

export type FilterType = {
  housingType: string[];
  hadPetsBefore: boolean | null;
  hasAllergies: boolean | null;
  hasChildren: boolean | null;
  city: string[];
  neighborhood: string[];
};
