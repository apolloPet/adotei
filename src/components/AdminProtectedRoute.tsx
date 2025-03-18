
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
        
        // Verificar o localStorage primeiro (para compatibilidade com o login de demonstração)
        const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
        
        // Se é admin pelo localStorage OU pelo estado global
        if (localStorageAdmin || isAdmin) {
          console.log('AdminProtectedRoute: Acesso administrativo confirmado via localStorage ou estado global', { 
            email: user.email,
            isAdmin,
            localStorageAdmin
          });
          
          setIsVerifying(false);
          return;
        }
        
        // Verificar na base de dados (user_roles)
        console.log('AdminProtectedRoute: Verificando permissões na tabela user_roles');
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
          
        if (roleData) {
          console.log('AdminProtectedRoute: Usuário encontrado na tabela user_roles como admin', {
            userId: user.id,
            role: roleData.role
          });
          
          // Atualizar localStorage para futuras verificações
          localStorage.setItem("isAdmin", "true");
          setIsVerifying(false);
          return;
        }
        
        // Verificação adicional por email
        const adminEmails = ['admin@petmatch.com'];
        const adminDomains = ['@admin', '@ong'];
        
        const isAdminEmail = adminEmails.includes(user.email || '') || 
                          adminDomains.some(domain => (user.email || '').includes(domain));
        
        if (isAdminEmail) {
          console.log('AdminProtectedRoute: Email administrativo detectado, concedendo acesso', {
            email: user.email
          });
          
          // Atualizar localStorage para futuras verificações
          localStorage.setItem("isAdmin", "true");
          setIsVerifying(false);
          return;
        }
        
        // Se chegou aqui, não é admin
        console.log('AdminProtectedRoute: Usuário não é administrador, redirecionando para login admin', { 
          email: user?.email
        });
        
        toast.error("Você não tem permissão para acessar esta página");
        navigate('/admin-login', { replace: true });
      } catch (error) {
        console.error("Erro ao verificar status de administrador:", error);
        toast.error("Erro ao verificar permissões de administrador");
        navigate('/admin-login', { replace: true });
      } finally {
        setIsVerifying(false);
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
