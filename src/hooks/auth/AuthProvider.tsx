
import { createContext, useEffect } from 'react';
import { AuthContextType, AuthProviderProps } from './types';
import { useAuthState } from './useAuthState';
import { useAuthSubscription } from './useAuthSubscription';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isAuthenticated: false
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const {
    user,
    setUser,
    session,
    setSession,
    profile,
    setProfile,
    isLoading,
    isAdmin,
    setIsAdmin,
    isAuthenticated,
    fetchUserData
  } = useAuthState();

  // Configure auth subscription
  useAuthSubscription({
    setUser,
    setSession,
    setProfile,
    setIsAdmin
  });

  // Load user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const value = {
    user,
    session,
    profile,
    isLoading,
    isAdmin,
    isAuthenticated,
    fetchUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
