
export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    cep: string;
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
}

export interface AuthServiceReexports {
  // Reexport name resolver for ambiguous exports
  resetPassword: typeof import('./passwordService').resetPassword;
  updatePassword: typeof import('./passwordService').updatePassword;
  getProfile: typeof import('./profileService').getProfile;
  updateProfile: typeof import('./profileService').updateProfile;
}
