
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';

export interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
