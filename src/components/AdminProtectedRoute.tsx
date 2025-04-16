
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { toast } from '@/hooks/use-sonner';
import { Loader2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
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
          setVerificationError("Você precisa estar autenticado para acessar esta página");
          
          if (isMounted) {
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
            
            // Atualizar a tabela user_roles se ainda não existir
            try {
              const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', user.id)
                .eq('role', 'admin')
                .single();
                
              if (roleError && roleError.code === 'PGRST116') {
                // Não encontrou registro, vamos criar
                await supabase
                  .from('user_roles')
                  .insert({
                    user_id: user.id,
                    role: 'admin',
                    permissions: {
                      manageAnimals: true,
                      approveAdoptions: true,
                      manageSettings: true,
                      manageAdmins: true
                    }
                  });
                
                console.log('AdminProtectedRoute: Registro de admin criado na tabela user_roles');
              }
            } catch (e) {
              console.error('Erro ao verificar/atualizar user_roles:', e);
            }
            
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
          toast.error("Erro ao verificar permissões");
          
          setTimeout(() => {
            navigate('/admin-login', { replace: true });
          }, 300);
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
