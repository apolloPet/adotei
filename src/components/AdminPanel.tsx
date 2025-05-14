
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
  Globe
} from 'lucide-react';
import { UsersList } from './admin/users';
import AdminUserManagement from './admin/AdminUserManagement';
import PaymentSettings from './admin/PaymentSettings';
import AnimalRegistrationForm from './admin/animal-registration';
import WebsiteContentManager from './admin/WebsiteContentManager';
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
    <div className="container py-8 max-w-7xl mx-auto px-4 mt-16">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
            <CardDescription>Gerencie solicitações de adoção, usuários e administradores</CardDescription>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs defaultValue="adoption" className="w-full">
            <TabsList className="w-full mb-6 overflow-x-auto flex flex-nowrap whitespace-nowrap">
              <TabsTrigger value="adoption" className="flex items-center gap-1">
                <PawPrint className="h-4 w-4" />
                <span className="hidden sm:inline">Adoção</span>
              </TabsTrigger>
              <TabsTrigger value="animals" className="flex items-center gap-1">
                <PawPrint className="h-4 w-4" />
                <span className="hidden sm:inline">Animais</span>
              </TabsTrigger>
              <TabsTrigger value="website" className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Conteúdo do Site</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Configurações</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="adoption">
              <AdoptionManagement />
            </TabsContent>
            
            <TabsContent value="animals">
              <AnimalRegistrationForm />
            </TabsContent>
            
            <TabsContent value="website">
              <WebsiteContentManager />
            </TabsContent>
            
            <TabsContent value="settings">
              <Tabs defaultValue="administrators" className="w-full">
                <TabsList className="w-full mb-4 overflow-x-auto flex flex-nowrap whitespace-nowrap">
                  <TabsTrigger value="administrators" className="flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Administradores</span>
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Usuários</span>
                  </TabsTrigger>
                  <TabsTrigger value="payment-settings">Configurações de Pagamento</TabsTrigger>
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
