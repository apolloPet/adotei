
export interface SignupData {
  email: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    cep?: string;
  };
  housingType?: 'house' | 'apartment' | 'other';
  hasChildren?: boolean;
  childrenAges?: string;
  hadPetsBefore?: boolean;
  hasAllergies?: boolean;
  allergiesDescription?: string;
  workSchedule?: string;
}

export interface UserRoleData {
  userId: string;
  role: string;
  permissions?: {
    manageAdmins?: boolean;
    manageAnimals?: boolean;
    manageSettings?: boolean;
    approveAdoptions?: boolean;
  };
}
