
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children?: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children
}) => {
  const { isAdmin, isVolunteer, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (!isAdmin && !isVolunteer))) {
      navigate('/admin-login', { replace: true });
    }
  }, [isLoading, isAuthenticated, isAdmin, isVolunteer, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4 p-8 border rounded-lg shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acesso administrativo...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (!isAdmin && !isVolunteer)) {
    return null;
  }

  return (
    <>{children}</>
  );
};

export default AdminProtectedRoute;
