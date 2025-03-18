
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
  const { user, isAdmin, isLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        // If still loading auth state, wait
        if (isLoading) return;
        
        // No user means redirect to login
        if (!user) {
          console.log('AdminProtectedRoute: No user found, redirecting to admin login');
          toast.error("Por favor, faça login para acessar esta página");
          navigate('/admin-login', { replace: true });
          return;
        }
        
        // Check admin status from our auth hook
        if (!isAdmin) {
          console.log('AdminProtectedRoute: User is not admin, redirecting to admin login', { 
            email: user.email,
            isAdmin 
          });
          toast.error("Você não tem permissão para acessar esta página");
          navigate('/admin-login', { replace: true });
          return;
        }
        
        console.log('AdminProtectedRoute: User has admin access', { 
          email: user.email,
          isAdmin 
        });
        
        // All checks passed
        setIsVerifying(false);
      } catch (error) {
        console.error("Error verifying admin status:", error);
        toast.error("Erro ao verificar permissões de administrador");
        navigate('/admin-login', { replace: true });
      }
    };

    verifyAdmin();
  }, [isLoading, user, isAdmin, navigate]);
  
  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default AdminProtectedRoute;
