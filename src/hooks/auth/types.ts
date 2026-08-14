
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';

export type AdminPermissions = {
  manageAnimals: boolean;
  approveAdoptions: boolean;
  manageSettings: boolean;
  manageAdmins: boolean;
  manageUsers: boolean;
};

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isVolunteer: boolean;
  isAuthenticated: boolean;
  adminPermissions: AdminPermissions | null;
  fetchUserData?: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
