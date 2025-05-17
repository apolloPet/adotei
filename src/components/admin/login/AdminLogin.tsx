
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { DialogTrigger } from "@/components/ui/dialog";
import AdminLoginForm from './AdminLoginForm';
import NewAdminDialog from './NewAdminDialog';
import DemoCredentialsInfo from './DemoCredentialsInfo';
import { AdminLoginProps } from './types';

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [redirectChecked, setRedirectChecked] = useState(false);
  const [showNewAdminDialog, setShowNewAdminDialog] = useState(false);
  
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, fetchUserData } = useAuth();
  const hasRedirected = useRef(false);
  
  // Verificação única de status de admin na montagem
  useEffect(() => {
    // Evitar verificações repetidas
    if (redirectChecked || hasRedirected.current) return;
    
    const checkAdminStatus = async () => {
      try {
        console.log('AdminLogin: Verificando status inicial', { isAdmin, isAuthenticated });
        
        // Verificar localStorage primeiro (método mais rápido)
        const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
        const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        
        if ((isAdmin || localStorageAdmin) && (isAuthenticated || localStorageLoggedIn)) {
          console.log('AdminLogin: Usuário já autenticado como admin, redirecionando para /admin');
          hasRedirected.current = true;
          navigate('/admin', { replace: true });
        }
        
        setRedirectChecked(true);
      } catch (error) {
        console.error('Erro ao verificar status admin:', error);
      }
    };
    
    checkAdminStatus();
  }, [isAdmin, isAuthenticated, navigate, redirectChecked]);

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
  
  // Não renderizar se já foi confirmado como admin
  if ((isAdmin || localStorage.getItem("isAdmin") === "true") && 
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
            <CardTitle className="text-2xl font-bold text-center">Acesso Administrativo</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <AdminLoginForm onAdminLogin={handleAdminLogin} />
            
            <div className="mt-6">
              <NewAdminDialog
                open={showNewAdminDialog}
                onOpenChange={setShowNewAdminDialog}
              />
              
              <DialogTrigger asChild onClick={() => setShowNewAdminDialog(true)}>
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Novo Administrador
                </Button>
              </DialogTrigger>
            </div>
            
            <DemoCredentialsInfo />
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
