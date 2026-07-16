import { createContext, useEffect, useMemo } from 'react';
import { AuthContextType, AuthProviderProps, AdminPermissions } from './types';
import { useAuthState } from './useAuthState';
import { useAuthSubscription } from './useAuthSubscription';

const FULL_ADMIN_PERMISSIONS: AdminPermissions = {
  manageAnimals: true,
  approveAdoptions: true,
  manageSettings: true,
  manageAdmins: true,
};

const INITIAL_AUTH_STATE: AuthContextType = {
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isVolunteer: false,
  isAuthenticated: false,
  adminPermissions: null,
};

export const AuthContext = createContext<AuthContextType>(INITIAL_AUTH_STATE);

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
    isVolunteer,
    setIsVolunteer,
    isAuthenticated,
    fetchUserData
  } = useAuthState();

  useAuthSubscription({
    setUser,
    setSession,
    setProfile,
    setIsAdmin,
    setIsVolunteer
  });

  useEffect(() => {
    console.log('AuthProvider montado - carregando dados iniciais do usuário');
    
    fetchUserData();
    
    const periodicCheck = setInterval(() => {
      const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (localStorageLoggedIn) {
        console.log('Verificação periódica de AuthProvider');
        fetchUserData();
      }
    }, 60000);
    
    const AUTH_STORAGE_KEYS = new Set(['authToken', 'authUser', 'isLoggedIn', 'isAdmin', 'userEmail']);

    const handleAuthChange = () => {
      console.log('Evento authStateChanged detectado, atualizando dados do usuário');
      fetchUserData();
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key || !AUTH_STORAGE_KEYS.has(event.key)) {
        return;
      }
      handleAuthChange();
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(periodicCheck);
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchUserData]);

  const adminPermissions = useMemo<AdminPermissions | null>(() => {
    if (!isAdmin) {
      return null;
    }
    const raw = user?.user_metadata?.permissions as Partial<AdminPermissions> | null | undefined;
    if (!raw || typeof raw !== 'object') {
      return FULL_ADMIN_PERMISSIONS;
    }
    return {
      manageAnimals: Boolean(raw.manageAnimals),
      approveAdoptions: Boolean(raw.approveAdoptions),
      manageSettings: Boolean(raw.manageSettings),
      manageAdmins: Boolean(raw.manageAdmins),
    };
  }, [isAdmin, user]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    isLoading,
    isAdmin,
    isVolunteer,
    isAuthenticated,
    adminPermissions,
    fetchUserData
  }), [user, session, profile, isLoading, isAdmin, isVolunteer, isAuthenticated, adminPermissions, fetchUserData]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
