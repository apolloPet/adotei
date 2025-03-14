
import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  isAdmin: boolean;
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  isAdmin, 
  children 
}) => {
  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }
  
  return <>{children}</>;
};

export default AdminProtectedRoute;
