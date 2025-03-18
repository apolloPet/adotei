
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { toast } from '@/hooks/use-sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children 
}) => {
  const { user, isAdmin, isLoading, isAuthenticated } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Flag para evitar múltiplas operações se o componente desmontar
    let isMounted = true;
    
    const verifyAdmin = async () => {
      try {
        // Evitar verificações se o estado já foi confirmado ou se ainda está carregando
        if (!isMounted || isVerified) return;
        
        console.log('AdminProtectedRoute: Início da verificação', {
          isLoading,
          isAuthenticated,
          isAdmin,
          userEmail: user?.email
        });
        
        // Se ainda estiver carregando o estado de autenticação, aguardar
        if (isLoading) return;
        
        // Verificar localStorage primeiro (prioridade máxima para evitar loops)
        const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
        
        // Se é admin pelo localStorage, aceitar imediatamente
        if (localStorageAdmin) {
          console.log('AdminProtectedRoute: Acesso confirmado via localStorage');
          setIsVerified(true);
          setIsVerifying(false);
          return;
        }
        
        // Se usuário não está autenticado, redirecionar para login
        if (!isAuthenticated) {
          console.log('AdminProtectedRoute: Usuário não autenticado, redirecionando');
          if (isMounted) {
            toast.error("Por favor, faça login para acessar esta página");
            navigate('/admin-login', { replace: true });
          }
          return;
        }
        
        // Se já está confirmado como admin pelo estado global
        if (isAdmin) {
          console.log('AdminProtectedRoute: Acesso confirmado via estado global');
          setIsVerified(true);
          setIsVerifying(false);
          return;
        }
        
        // Se chegou aqui e o usuário existe, verificar na base de dados (user_roles)
        if (user && isMounted) {
          console.log('AdminProtectedRoute: Verificando permissões no banco de dados');
          
          // Verificação adicional por email (para compatibilidade)
          const adminEmails = ['admin@petmatch.com'];
          const adminDomains = ['@admin', '@ong'];
          
          const isAdminEmail = adminEmails.includes(user.email || '') || 
                            adminDomains.some(domain => (user.email || '').includes(domain));
          
          if (isAdminEmail) {
            console.log('AdminProtectedRoute: Email administrativo detectado');
            localStorage.setItem("isAdmin", "true");
            setIsVerified(true);
            setIsVerifying(false);
            return;
          }
          
          // Verificar na tabela user_roles apenas se necessário
          try {
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
          } catch (roleError) {
            console.error('Erro ao verificar role:', roleError);
          }
        }
        
        // Se chegou aqui, não é admin
        if (isMounted) {
          console.log('AdminProtectedRoute: Acesso negado, redirecionando');
          toast.error("Você não tem permissão para acessar esta página");
          navigate('/admin-login', { replace: true });
        }
      } catch (error) {
        console.error("Erro ao verificar status de administrador:", error);
        if (isMounted) {
          toast.error("Erro ao verificar permissões");
          navigate('/admin-login', { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    verifyAdmin();
    
    // Cleanup para evitar operações em componente desmontado
    return () => {
      isMounted = false;
    };
  }, [isLoading, user, isAdmin, isAuthenticated, navigate, isVerified]);
  
  // Mostrar loader enquanto verifica
  if (isLoading || (isVerifying && !isVerified)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acesso administrativo...</p>
        </div>
      </div>
    );
  }
  
  // Mostrar conteúdo se verificado
  return isVerified ? <>{children}</> : null;
};

export default AdminProtectedRoute;
