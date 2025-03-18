
import { createContext, useEffect } from 'react';
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
    isAuthenticated,
    fetchUserData
  } = useAuthState();

  // Configurar assinatura de autenticação
  useAuthSubscription({
    setUser,
    setSession,
    setProfile,
    setIsAdmin
  });

  // Performance: buscar dados do usuário apenas uma vez na montagem
  useEffect(() => {
    console.log('AuthProvider montado - carregando dados iniciais do usuário');
    
    // Performance: executar em segundo plano para não bloquear a renderização
    const timer = setTimeout(() => {
      fetchUserData();
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  // Performance: memorização de valor do contexto
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
