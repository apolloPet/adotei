
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  fetchUserData?: () => Promise<void>; // Added missing fetchUserData method
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
