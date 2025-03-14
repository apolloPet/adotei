
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  isAdmin: boolean;
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  isAdmin, 
  children 
}) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin-login', { replace: true });
    }
  }, [isAdmin, navigate]);
  
  return isAdmin ? <>{children}</> : null;
};

export default AdminProtectedRoute;
