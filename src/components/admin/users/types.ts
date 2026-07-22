
export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  registrationDate: string;
  address?: {
    cep?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  housingType?: 'apartment' | 'house' | 'farm' | 'other';
  hasChildren?: boolean;
  childrenAges?: string;
  hadPetsBefore?: boolean;
  hasAllergies?: boolean;
  allergiesDescription?: string;
  workSchedule?: string;
  auth_id?: string;
  created_at?: string;
  updated_at?: string;
  adopterProfile?: {
    housingType?: string;
    ownershipType?: string;
    rentAllowsPets?: boolean;
    hasYard?: boolean;
    yardWalled?: boolean;
    hasWindowScreens?: boolean;
    residentsCount?: number;
    hasChildren?: boolean;
    childrenAges?: string;
    hadPetsBefore?: boolean;
    currentlyHasPets?: boolean;
    currentPetsCount?: number;
    currentPetsTypes?: string;
    returnedAnimal?: boolean;
    petsVaccinated?: boolean;
    petsNeutered?: boolean;
    awareOfCosts?: boolean;
    monthlyBudget?: string;
    willCoverVaccines?: boolean;
    willCoverNeutering?: boolean;
    willCoverEmergencies?: boolean;
    reasonToAdopt?: string;
    hoursAloneDaily?: number;
    ifDestroyed?: string;
    ifSick?: string;
    willAdapt?: boolean;
  };
};

export type FilterType = {
  housingType: string[];
  hadPetsBefore: boolean | null;
  hasAllergies: boolean | null;
  hasChildren: boolean | null;
  city: string[];
  neighborhood: string[];
};
