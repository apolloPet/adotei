
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-sonner";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

// Em uma aplicação real, isso seria verificado com backend
const checkAdminStatus = (): boolean => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return isAdmin;
};

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Simula uma verificação de autenticação
    const checkAuth = async () => {
      try {
        const adminStatus = checkAdminStatus();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Erro ao verificar status de admin:", error);
        toast.error("Erro ao verificar permissões de administrador");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Mostra um indicador de carregamento enquanto verifica
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redireciona para login se não for admin
  if (!isAdmin) {
    toast.error("Acesso restrito a administradores");
    return <Navigate to="/login" replace />;
  }

  // Renderiza o conteúdo protegido se for admin
  return <>{children}</>;
};

export default AdminProtectedRoute;
