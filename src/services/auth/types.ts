export interface SignupData {
  email: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  
  // Address fields as separate properties
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  
  housingType?: string;
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
