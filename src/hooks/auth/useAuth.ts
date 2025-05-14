
import { useContext, useDebugValue } from 'react';
import { AuthContext } from './AuthProvider';

export const useAuth = () => {
  const auth = useContext(AuthContext);
  
  // Adicionar debug value para melhorar a depuração
  useDebugValue(
    auth, 
    (auth) => ({
      authenticated: !!auth?.isAuthenticated,
      admin: !!auth?.isAdmin,
      userId: auth?.user?.id
    })
  );
  
  return auth;
};
