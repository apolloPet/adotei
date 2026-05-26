
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminProtectedRouteProps {
  children?: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children 
}) => {
  const { user, isAdmin, isVolunteer, isLoading, isAuthenticated } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Flag para prevenir operações múltiplas se o componente desmontar
    let isMounted = true;
    let verificationTimeout: number | null = null;
    
    const verifyAdmin = async () => {
      try {
        console.log('AdminProtectedRoute: Iniciando verificação de admin');
        
        // Verificar localStorage primeiro (maior prioridade)
        const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
        const localStorageVolunteer = (() => {
          try {
            const raw = localStorage.getItem("authUser");
            if (!raw) return false;
            const parsed = JSON.parse(raw) as { userType?: string; roles?: string[] };
            return parsed.userType === "VOLUNTARIO" || Boolean(parsed.roles?.includes("VOLUNTARIO"));
          } catch {
            return false;
          }
        })();
        const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        
        // Log do estado atual para debug
        console.log('AdminProtectedRoute: Estado atual', {
          isAdmin,
          isAuthenticated,
          localStorageAdmin,
          localStorageVolunteer,
          localStorageLoggedIn,
          isLoading
        });
        
        if ((localStorageAdmin || localStorageVolunteer) && localStorageLoggedIn) {
          console.log('AdminProtectedRoute: Acesso confirmado via localStorage');
          if (isMounted) {
            setIsVerified(true);
            setIsVerifying(false);
          }
          return;
        }
        
        // Se o estado de autenticação ainda está carregando, aguardar
        if (isLoading) {
          console.log('AdminProtectedRoute: Estado de autenticação ainda carregando, aguardando...');
          if (isMounted) {
            // Não alterar estado ainda, continuar aguardando
            return;
          }
        }

        // Se o usuário não está autenticado, redirecionar para login
        if (!isAuthenticated && !localStorageLoggedIn) {
          console.log('AdminProtectedRoute: Usuário não autenticado, redirecionando');
          if (isMounted) {
            setVerificationError("Você precisa estar autenticado para acessar esta página");
            setIsVerifying(false);
            setTimeout(() => navigate('/admin-login', { replace: true }), 100);
          }
          return;
        }
        
        // Se já confirmado como admin via estado global
        if (isAdmin || isVolunteer || localStorageAdmin || localStorageVolunteer) {
          console.log('AdminProtectedRoute: Acesso confirmado via estado global ou localStorage');
          if (isMounted) {
            setIsVerified(true);
            setIsVerifying(false);
          }
          return;
        }
        
        // Se chegamos aqui e o usuário existe, verificar via email
        if (user) {
          console.log('AdminProtectedRoute: Verificando permissões por email ou banco de dados');
          
          // Verificação de email (para compatibilidade)
          const hasAdminOrVolunteerMetadata = Boolean(
            user.app_metadata?.role === 'admin' ||
            user.user_metadata?.isAdmin === true ||
            user.user_metadata?.userType === 'VOLUNTARIO' ||
            (user.user_metadata?.roles as string[] | undefined)?.includes('VOLUNTARIO')
          );
          
          if (hasAdminOrVolunteerMetadata) {
            console.log('AdminProtectedRoute: Permissão detectada via metadados');
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("isAdmin", String(user.app_metadata?.role === 'admin' || user.user_metadata?.isAdmin === true));
            if (isMounted) {
              setIsVerified(true);
              setIsVerifying(false);
            }
            return;
          }
        }
        
        // Se chegamos aqui, não é um admin - redirecionar após um timeout
        if (isMounted) {
          console.log('AdminProtectedRoute: Acesso negado, redirecionando');
          setVerificationError("Você não tem permissão para acessar esta página");
          setIsVerifying(false);
          setTimeout(() => navigate('/admin-login', { replace: true }), 100);
        }
        
      } catch (error) {
        console.error("Erro ao verificar status de admin:", error);
        if (isMounted) {
          setVerificationError("Erro ao verificar permissões");
          setIsVerifying(false);
          setTimeout(() => navigate('/admin-login', { replace: true }), 100);
        }
      } finally {
        // Finalizar verificação para evitar travamentos
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    // Iniciar verificação
    verifyAdmin();
    
    // Timer de segurança para não ficar preso na verificação
    const timeoutId = setTimeout(() => {
      if (isMounted && isVerifying) {
        console.log('AdminProtectedRoute: Tempo de verificação excedido');
        setIsVerifying(false);
        
        // Se temos credenciais no localStorage, confiar nelas mesmo com timeout
        const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
        const localStorageVolunteer = (() => {
          try {
            const raw = localStorage.getItem("authUser");
            if (!raw) return false;
            const parsed = JSON.parse(raw) as { userType?: string; roles?: string[] };
            return parsed.userType === "VOLUNTARIO" || Boolean(parsed.roles?.includes("VOLUNTARIO"));
          } catch {
            return false;
          }
        })();
        const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        
        if ((localStorageAdmin || localStorageVolunteer) && localStorageLoggedIn) {
          console.log('AdminProtectedRoute: Usando credenciais do localStorage após timeout');
          setIsVerified(true);
        } else {
          setVerificationError("Tempo de verificação excedido");
          navigate('/admin-login', { replace: true });
        }
      }
    }, 3000); // Tempo máximo de 3 segundos para verificar
    
    // Cleanup para evitar operações em componente desmontado
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (verificationTimeout) {
        clearTimeout(verificationTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Se está verificado, renderizar filhos
  if (isVerified) {
    return <>{children}</>;
  }
  
  // Mostrar loader enquanto verifica
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4 p-8 border rounded-lg shadow-sm">
        {isVerifying ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verificando acesso administrativo...</p>
          </>
        ) : verificationError ? (
          <div className="flex flex-col items-center gap-4">
            <ShieldAlert className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-red-500">Acesso Restrito</h3>
              <p className="text-muted-foreground mt-2">{verificationError}</p>
            </div>
            <Button 
              onClick={() => navigate('/admin-login')}
              variant="default"
              className="mt-2"
            >
              Ir para Login Administrativo
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">Redirecionando...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProtectedRoute;
