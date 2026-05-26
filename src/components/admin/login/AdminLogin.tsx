
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import AdminLoginForm from './AdminLoginForm';
import { AdminLoginProps } from './types';

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [redirectChecked, setRedirectChecked] = useState(false);
  
  const navigate = useNavigate();
  const { isVolunteer, isAuthenticated, fetchUserData } = useAuth();
  const hasRedirected = useRef(false);
  const isVolunteerFromStorage = (() => {
    try {
      const authUserRaw = localStorage.getItem('authUser');
      if (!authUserRaw) return false;
      const authUser = JSON.parse(authUserRaw) as { userType?: string; roles?: string[] };
      return authUser.userType === 'VOLUNTARIO' || Boolean(authUser.roles?.includes('VOLUNTARIO'));
    } catch {
      return false;
    }
  })();
  
  // Verificação única de status de admin na montagem
  useEffect(() => {
    // Evitar verificações repetidas
    if (redirectChecked || hasRedirected.current) return;
    
    const checkAdminStatus = async () => {
      try {
        console.log('AdminLogin: Verificando status inicial', { isVolunteer, isAuthenticated });
        
        // Verificar localStorage primeiro (método mais rápido).
        // Esta tela é exclusiva para funcionários de entidade (VOLUNTARIO).
        const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        
        if ((isVolunteer || isVolunteerFromStorage) && (isAuthenticated || localStorageLoggedIn)) {
          console.log('AdminLogin: Funcionário de entidade já autenticado, redirecionando para /admin');
          hasRedirected.current = true;
          navigate('/admin', { replace: true });
        }
        
        setRedirectChecked(true);
      } catch (error) {
        console.error('Erro ao verificar status admin:', error);
      }
    };
    
    checkAdminStatus();
  }, [isVolunteer, isAuthenticated, navigate, redirectChecked, isVolunteerFromStorage]);

  const handleAdminLogin = async () => {
    // Atualizar estado global - obrigatório
    if (fetchUserData) {
      await fetchUserData();
    }
    
    // Callback opcional
    if (onLogin) {
      onLogin();
    }
    
    // Marcar que já redirecionamos
    hasRedirected.current = true;
    
    // Usar setTimeout com um atraso para garantir que o estado seja atualizado
    setTimeout(() => {
      navigate("/admin", { replace: true });
    }, 500);
  };
  
  // Não renderizar se já foi confirmado como funcionário de entidade
  if ((isVolunteer || isVolunteerFromStorage) && 
      (isAuthenticated || localStorage.getItem("isLoggedIn") === "true") && 
      redirectChecked) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <ShieldAlert className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Acesso da Entidade</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais de funcionário da entidade
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <AdminLoginForm onAdminLogin={handleAdminLogin} />
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button variant="link" onClick={() => navigate("/login")}>
              Voltar para login normal
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
