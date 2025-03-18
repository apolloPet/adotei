
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { toast } from '@/hooks/use-sonner';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children 
}) => {
  const { user, isAdmin, isLoading, isAuthenticated } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        // Se ainda estiver carregando o estado de autenticação, aguardar
        if (isLoading) return;
        
        console.log('AdminProtectedRoute: Verificando acesso administrativo', {
          isAuthenticated,
          isAdmin,
          userEmail: user?.email,
          localStorageAdmin: localStorage.getItem("isAdmin"),
          userMetadata: user?.user_metadata,
          appMetadata: user?.app_metadata
        });
        
        // Verificar se o usuário está autenticado
        if (!isAuthenticated || !user) {
          console.log('AdminProtectedRoute: Usuário não autenticado, redirecionando para login admin');
          toast.error("Por favor, faça login para acessar esta página");
          navigate('/admin-login', { replace: true });
          return;
        }
        
        // Verificar se o usuário é administrador
        if (!isAdmin) {
          console.log('AdminProtectedRoute: Usuário não é administrador, redirecionando para login admin', { 
            email: user.email,
            isAdmin,
            localStorage: localStorage.getItem("isAdmin")
          });
          
          // Verificar email diretamente (verificação de segurança adicional)
          const adminEmails = ['admin@petmatch.com'];
          const adminDomains = ['@admin', '@ong'];
          
          const isAdminEmail = adminEmails.includes(user.email || '') || 
                              adminDomains.some(domain => (user.email || '').includes(domain));
          
          if (isAdminEmail) {
            console.log('AdminProtectedRoute: Email é administrativo, mas status admin está falso. Possível problema de sincronização.');
            
            // Tentar sincronizar status manualmente
            localStorage.setItem("isAdmin", "true");
            // Não usar setIsAdmin() diretamente pois pode causar efeitos colaterais inesperados
            // Em vez disso, recarregar a página para forçar nova verificação
            window.location.reload();
            return;
          }
          
          toast.error("Você não tem permissão para acessar esta página");
          navigate('/admin-login', { replace: true });
          return;
        }
        
        console.log('AdminProtectedRoute: Acesso administrativo confirmado', { 
          email: user.email,
          isAdmin 
        });
        
        // Todas as verificações passaram
        setIsVerifying(false);
      } catch (error) {
        console.error("Erro ao verificar status de administrador:", error);
        toast.error("Erro ao verificar permissões de administrador");
        navigate('/admin-login', { replace: true });
      }
    };

    verifyAdmin();
  }, [isLoading, user, isAdmin, isAuthenticated, navigate]);
  
  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acesso administrativo...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default AdminProtectedRoute;
