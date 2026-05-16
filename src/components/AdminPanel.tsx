
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-sonner";
import { formatDate } from './admin/MockData';
import AdoptionManagement from './admin/AdoptionManagement';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  LogOut, 
  PawPrint, 
  Settings, 
  Users, 
  ShieldCheck,
  Heart
} from 'lucide-react';
import { UsersList } from './admin/users';
import AdminUserManagement from './admin/AdminUserManagement';
import PaymentSettings from './admin/PaymentSettings';
import AnimalRegistrationForm from './admin/animal-registration';
import AdopterCompatibility from './admin/AdopterCompatibility';
import { signOut } from '@/services/auth'; 
import { useAuth } from '@/hooks/auth';

const AdminPanel = ({ onLogout }) => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, fetchUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificar status de autenticação quando o componente é montado
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('AdminPanel: Verificando status de autenticação inicial');
        
        // Se temos uma função para buscar dados do usuário, 
        // garantir que ela seja chamada para sincronizar o estado
        if (fetchUserData) {
          await fetchUserData();
        }
        
        // Verificar também via localStorage para caso de usuário de demo
        const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
        const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        
        console.log('AdminPanel: Estado de autenticação', {
          isAdmin,
          isAuthenticated,
          localStorageAdmin,
          localStorageLoggedIn
        });
      } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Monitorar eventos de alteração de autenticação
    const handleAuthChange = () => {
      console.log('AdminPanel: Evento de mudança de autenticação detectado');
      checkAuthStatus();
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [isAdmin, isAuthenticated, fetchUserData]);
  
  const handleLogout = async () => {
    try {
      console.log('AdminPanel: Iniciando processo de logout');
      // Usar a função signOut do serviço de autenticação para garantir logout correto
      await signOut();
      
      // Verificar se callback de logout foi fornecido
      if (onLogout) {
        onLogout();
      } else {
        toast.success("Logout realizado com sucesso");
        navigate("/");
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout");
    }
  };
  
  // Exibir tela de carregamento enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="container py-8 max-w-7xl mx-auto px-4 mt-16">
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Verificar status de autenticação
  const isAuthorized = isAuthenticated && (isAdmin || localStorage.getItem("isAdmin") === "true");
  
  if (!isAuthorized) {
    console.log('AdminPanel: Usuário não autorizado, redirecionando');
    // Redirecionar para login administrativo após pequeno delay
    setTimeout(() => navigate("/admin-login"), 100);
    return null;
  }

  return (
    <div className="container py-4 sm:py-8 max-w-7xl mx-auto px-2 sm:px-4 mt-16">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2 p-4 sm:p-6">
          <div className="min-w-0">
            <CardTitle className="text-lg sm:text-2xl">Painel Administrativo</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Gerencie adoções, animais e usuários</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 shrink-0"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </CardHeader>
        
        <CardContent className="pt-2 sm:pt-6 px-2 sm:px-6">
          <Tabs defaultValue="adoption" className="w-full">
            <TabsList className="w-full mb-4 sm:mb-6 grid grid-cols-4 h-auto">
              <TabsTrigger value="adoption" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
                <PawPrint className="h-4 w-4" />
                <span>Adoções</span>
              </TabsTrigger>
              <TabsTrigger value="animals" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
                <PawPrint className="h-4 w-4" />
                <span>Animais</span>
              </TabsTrigger>
              <TabsTrigger value="compatibility" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
                <Heart className="h-4 w-4" />
                <span>Match</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
                <Settings className="h-4 w-4" />
                <span>Config</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="adoption">
              <AdoptionManagement />
            </TabsContent>
            
            <TabsContent value="animals">
              <AnimalRegistrationForm />
            </TabsContent>
            
            <TabsContent value="compatibility">
              <AdopterCompatibility />
            </TabsContent>
            
            <TabsContent value="settings">
              <Tabs defaultValue="administrators" className="w-full">
                <TabsList className="w-full mb-4 grid grid-cols-3 h-auto">
                  <TabsTrigger value="administrators" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admins</span>
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-xs sm:text-sm">
                    <Users className="h-4 w-4" />
                    <span>Usuários</span>
                  </TabsTrigger>
                  <TabsTrigger value="payment-settings" className="text-xs sm:text-sm py-2">Pagamentos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="administrators">
                  <AdminUserManagement />
                </TabsContent>
                
                <TabsContent value="users">
                  <UsersList />
                </TabsContent>
                
                <TabsContent value="payment-settings">
                  <PaymentSettings />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
