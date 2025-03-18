
export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  housingType?: string;
  hasChildren?: boolean;
  childrenAges?: string;
  hadPetsBefore?: boolean;
  hasAllergies?: boolean;
  allergiesDescription?: string;
  workSchedule?: string;
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
