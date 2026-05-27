
import { createContext, useEffect, useMemo } from 'react';
import { AuthContextType, AuthProviderProps } from './types';
import { useAuthState } from './useAuthState';
import { useAuthSubscription } from './useAuthSubscription';

// Performance: configuração imutável para contexto inicial
const INITIAL_AUTH_STATE: AuthContextType = {
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isVolunteer: false,
  isAuthenticated: false
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

  // Configurar assinatura de autenticação
  useAuthSubscription({
    setUser,
    setSession,
    setProfile,
    setIsAdmin,
    setIsVolunteer
  });

  // Performance: buscar dados do usuário apenas uma vez na montagem
  useEffect(() => {
    console.log('AuthProvider montado - carregando dados iniciais do usuário');
    
    // Executar imediatamente a primeira verificação
    fetchUserData();
    
    // Performance: executar verificações adicionais em segundo plano para não bloquear a renderização
    const periodicCheck = setInterval(() => {
      // Verificar apenas se localStorage indica que o usuário está logado
      const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (localStorageLoggedIn) {
        console.log('Verificação periódica de AuthProvider');
        fetchUserData();
      }
    }, 60000); // Verificação a cada minuto
    
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

  // Performance: memorização de valor do contexto
  const value = useMemo(() => ({
    user,
    session,
    profile,
    isLoading,
    isAdmin,
    isVolunteer,
    isAuthenticated,
    fetchUserData
  }), [user, session, profile, isLoading, isAdmin, isVolunteer, isAuthenticated, fetchUserData]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
