
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
  const { user, isAdmin, isLoading, isAuthenticated } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Flag para evitar múltiplas operações se o componente desmontar
    let isMounted = true;
    
    const verifyAdmin = async () => {
      try {
        // Verificar localStorage primeiro (prioridade máxima)
        const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
        
        if (localStorageAdmin) {
          console.log('AdminProtectedRoute: Acesso confirmado via localStorage');
          if (isMounted) {
            setIsVerified(true);
            setIsVerifying(false);
          }
          return;
        }
        
        // Se ainda estiver carregando o estado de autenticação, aguardar
        if (isLoading) {
          console.log('AdminProtectedRoute: Estado de autenticação ainda carregando, aguardando...');
          return;
        }

        // Se usuário não está autenticado, redirecionar para login
        if (!isAuthenticated) {
          console.log('AdminProtectedRoute: Usuário não autenticado, redirecionando');
          if (isMounted) {
            setVerificationError("Você precisa estar autenticado para acessar esta página");
            toast.error("Por favor, faça login para acessar esta página");
            setTimeout(() => {
              navigate('/admin-login', { replace: true });
            }, 300);
          }
          return;
        }
        
        // Se já está confirmado como admin pelo estado global
        if (isAdmin) {
          console.log('AdminProtectedRoute: Acesso confirmado via estado global');
          if (isMounted) {
            setIsVerified(true);
            setIsVerifying(false);
          }
          return;
        }
        
        // Se chegou aqui e o usuário existe, verificar na base de dados ou por email
        if (user) {
          console.log('AdminProtectedRoute: Verificando permissões por email ou banco de dados');
          
          // Verificação por email (para compatibilidade)
          const adminEmails = ['admin@petmatch.com'];
          const adminDomains = ['@admin', '@ong'];
          
          const isAdminEmail = adminEmails.includes(user.email || '') || 
                            adminDomains.some(domain => (user.email || '').includes(domain));
          
          if (isAdminEmail) {
            console.log('AdminProtectedRoute: Email administrativo detectado');
            localStorage.setItem("isAdmin", "true");
            if (isMounted) {
              setIsVerified(true);
              setIsVerifying(false);
            }
            return;
          }
          
          // Verificar na tabela user_roles (limitando tempo para evitar loops)
          try {
            console.log('AdminProtectedRoute: Verificando papel de admin na tabela user_roles');
            
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('*')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .single();
              
            if (roleData && isMounted) {
              console.log('AdminProtectedRoute: Usuário encontrado na tabela user_roles');
              localStorage.setItem("isAdmin", "true");
              setIsVerified(true);
              setIsVerifying(false);
              return;
            }
            
            if (roleError && roleError.code !== 'PGRST116') {
              console.error('Erro na verificação de user_roles:', roleError);
            }
          } catch (roleError) {
            console.error('Erro ao verificar role:', roleError);
          }
        }
        
        // Se chegou aqui, não é admin - redirecionar após um tempo limite
        if (isMounted) {
          console.log('AdminProtectedRoute: Acesso negado, redirecionando');
          setVerificationError("Você não tem permissão para acessar esta página");
          toast.error("Você não tem permissão para acessar esta página");
          
          setTimeout(() => {
            navigate('/admin-login', { replace: true });
          }, 300);
        }
        
      } catch (error) {
        console.error("Erro ao verificar status de administrador:", error);
        if (isMounted) {
          setVerificationError("Erro ao verificar permissões");
          setIsVerifying(false);
          
          toast.error("Erro ao verificar permissões");
          setTimeout(() => {
            navigate('/admin-login', { replace: true });
          }, 300);
        }
      } finally {
        // Encerrar a verificação após um tempo limite para evitar travamentos
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    // Iniciar verificação e configurar timer para garantir que não fique preso
    verifyAdmin();
    
    // Timer de segurança para não ficar preso na verificação
    const timeoutId = setTimeout(() => {
      if (isMounted && isVerifying) {
        console.log('AdminProtectedRoute: Tempo limite de verificação excedido');
        setIsVerifying(false);
        setVerificationError("Tempo limite de verificação excedido");
        navigate('/admin-login', { replace: true });
      }
    }, 5000); // Tempo máximo de 5 segundos para verificar
    
    // Cleanup para evitar operações em componente desmontado
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isLoading, user, isAdmin, isAuthenticated, navigate]);
  
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
            <p className="text-muted-foreground">Verificando permissões...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProtectedRoute;
