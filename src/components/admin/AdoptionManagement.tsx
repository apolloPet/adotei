
import { AdoptionManagement as AdoptionManagementComponent } from './adoption';
import { useAuth } from '@/hooks/auth';
import { useEffect } from 'react';

const AdoptionManagement = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Verificar se ainda está autenticado antes de renderizar
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      console.log('Usuário não autenticado ou não é admin na página de adoção');
    }
  }, [isAuthenticated, isAdmin]);
  
  return <AdoptionManagementComponent />;
};

export default AdoptionManagement;
