
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { toast } from '@/hooks/use-sonner';
import { Loader2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface AdminProtectedRouteProps {
  children?: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children 
}) => {
  const { user, isAdmin, isLoading, isAuthenticated, fetchUserData } = useAuth();
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
        
        // Se a função fetchUserData existe, chame-a para atualizar o estado global
        if (fetchUserData) {
          await fetchUserData();
        }
        
        // Verificar localStorage primeiro (maior prioridade)
        const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
        const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        
        // Log do estado atual para debug
        console.log('AdminProtectedRoute: Estado atual', {
          isAdmin,
          isAuthenticated,
          localStorageAdmin,
          localStorageLoggedIn,
          isLoading
        });
        
        if (localStorageAdmin && localStorageLoggedIn) {
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
          return;
        }

        // Se o usuário não está autenticado, redirecionar para login
        if (!isAuthenticated && !localStorageLoggedIn) {
          console.log('AdminProtectedRoute: Usuário não autenticado, redirecionando');
          if (isMounted) {
            setVerificationError("Você precisa estar autenticado para acessar esta página");
            setIsVerifying(false);
            navigate('/admin-login', { replace: true });
          }
          return;
        }
        
        // Se já confirmado como admin via estado global
        if (isAdmin || localStorageAdmin) {
          console.log('AdminProtectedRoute: Acesso confirmado via estado global');
          if (isMounted) {
            setIsVerified(true);
            setIsVerifying(false);
          }
          return;
        }
        
        // Se chegamos aqui e o usuário existe, verificar via email ou banco de dados
        if (user) {
          console.log('AdminProtectedRoute: Verificando permissões por email ou banco de dados');
          
          // Verificação de email (para compatibilidade)
          const adminEmails = ['admin@petmatch.com'];
          const adminDomains = ['@admin', '@ong'];
          
          const isAdminEmail = adminEmails.includes(user.email || '') || 
                              adminDomains.some(domain => (user.email || '').includes(domain));
          
          if (isAdminEmail) {
            console.log('AdminProtectedRoute: Email admin detectado');
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("isAdmin", "true");
            if (isMounted) {
              setIsVerified(true);
              setIsVerifying(false);
            }
            return;
          }
          
          // Verificar a tabela user_roles
          try {
            console.log('AdminProtectedRoute: Verificando papel de admin na tabela user_roles');
            
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('*')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .maybeSingle();
              
            if (roleData) {
              console.log('AdminProtectedRoute: Usuário encontrado na tabela user_roles');
              localStorage.setItem("isLoggedIn", "true");
              localStorage.setItem("isAdmin", "true");
              if (isMounted) {
                setIsVerified(true);
                setIsVerifying(false);
              }
              return;
            }
          } catch (roleError) {
            console.error('Erro ao verificar papel:', roleError);
          }
        }
        
        // Se chegamos aqui, não é um admin - redirecionar após um timeout
        if (isMounted) {
          console.log('AdminProtectedRoute: Acesso negado, redirecionando');
          setVerificationError("Você não tem permissão para acessar esta página");
          setIsVerifying(false);
          navigate('/admin-login', { replace: true });
        }
        
      } catch (error) {
        console.error("Erro ao verificar status de admin:", error);
        if (isMounted) {
          setVerificationError("Erro ao verificar permissões");
          setIsVerifying(false);
          navigate('/admin-login', { replace: true });
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
        const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        
        if (localStorageAdmin && localStorageLoggedIn) {
          console.log('AdminProtectedRoute: Usando credenciais do localStorage após timeout');
          setIsVerified(true);
        } else {
          setVerificationError("Tempo de verificação excedido");
          navigate('/admin-login', { replace: true });
        }
      }
    }, 3000); // Tempo máximo de 3 segundos para verificar
    
    // Configurar verificação periódica do status de autenticação
    const intervalId = setInterval(() => {
      const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
      const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      
      // Se já foi verificado que é admin, não precisamos continuar verificando
      if (isVerified) return;
      
      if (localStorageAdmin && localStorageLoggedIn && isMounted) {
        console.log('AdminProtectedRoute: Verificação periódica confirmou acesso admin');
        setIsVerified(true);
        setIsVerifying(false);
      } else if (isMounted && !isVerifying) {
        // Se não está verificando e não é admin, iniciar nova verificação
        verifyAdmin();
      }
    }, 5000); // Verificar a cada 5 segundos
    
    // Cleanup para evitar operações em componente desmontado
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      if (verificationTimeout) {
        clearTimeout(verificationTimeout);
      }
    };
  }, [isLoading, user, isAdmin, isAuthenticated, navigate, fetchUserData]);
  
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
