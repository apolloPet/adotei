export type HousingType = 'house' | 'apartment' | 'farm';
export type Ownership = 'owned' | 'rented';
export type MonthlyBudget = '100-300' | '300-600' | '600+';

export interface HousingProfile {
  type: HousingType;
  ownership: Ownership;
  rentAllowsPets?: boolean;
  hasYard: boolean;
  yardWalled?: boolean;
  hasWindowScreens?: boolean;
  numResidents: number;
  hasChildren: boolean;
  childrenAges?: string;
}

export interface ExperienceProfile {
  hadPetsBefore: boolean;
  currentlyHasPets: boolean;
  currentPetsCount?: number;
  currentPetsTypes?: string;
  returnedAnimal: boolean;
  petsVaccinated?: boolean;
  petsNeutered?: boolean;
}

export interface FinancialProfile {
  awareOfCosts: boolean;
  monthlyBudget: MonthlyBudget;
  willCoverVaccines: boolean;
  willCoverNeutering: boolean;
  willCoverEmergencies: boolean;
}

export interface IntentionProfile {
  reasonToAdopt: string;
  hoursAloneDaily: number;
  ifDestroyed: string;
  ifSick: string;
  willAdapt: boolean;
}

export interface ProofProfile {
  environmentPhotoUrl?: string;
}

export interface ExtendedProfile {
  housing?: HousingProfile;
  experience?: ExperienceProfile;
  financial?: FinancialProfile;
  intention?: IntentionProfile;
  proof?: ProofProfile;
}

export interface UserProfile {
  id: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  // legacy fields kept for back compat
  housingType?: string;
  hasChildren?: boolean;
  childrenAges?: string;
  hadPetsBefore?: boolean;
  hasAllergies?: boolean;
  allergiesDescription?: string;
  workSchedule?: string;
  // new
  extended?: ExtendedProfile;
}

export type UserRole = 'user' | 'admin' | 'moderator' | 'staff';

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  createdAt: string;
}
