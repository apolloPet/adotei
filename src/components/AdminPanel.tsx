import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-sonner";
import AdoptionManagement from './admin/AdoptionManagement';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import {
  LogOut,
  PawPrint,
  Settings,
  Users,
  ShieldCheck,
  Building2,
  Heart
} from 'lucide-react';
import { UsersList } from './admin/users';
import AdminUserManagement from './admin/AdminUserManagement';
import AnimalRegistrationForm from './admin/animal-registration';
import AdopterCompatibility from './admin/AdopterCompatibility';
import OrganizationManagement from './admin/organization-management/OrganizationManagement';
import { signOut } from '@/services/auth';
import { useAuth } from '@/hooks/auth';

const AdminPanel = ({ onLogout }) => {
  const navigate = useNavigate();
  const { isAdmin, isVolunteer, isAuthenticated, fetchUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (fetchUserData) {
          await fetchUserData();
        }
      } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [fetchUserData]);

  const handleLogout = async () => {
    try {
      await signOut();
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

  const isAuthorized = isAuthenticated && (isAdmin || isVolunteer);

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      navigate("/admin-login", { replace: true });
    }
  }, [isLoading, isAuthorized, navigate]);

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

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="container py-4 sm:py-8 max-w-7xl mx-auto px-2 sm:px-4 mt-16">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2 p-4 sm:p-6">
          <div className="min-w-0">
            <CardTitle className="text-lg sm:text-2xl">Painel Administrativo</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Gerencie adoções, animais, ONGs, voluntários e administração da plataforma
            </CardDescription>
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
          <Tabs defaultValue={isVolunteer && !isAdmin ? "animals" : "adoption"} className="w-full">
            <TabsList className="w-full mb-4 sm:mb-6 overflow-x-auto flex flex-nowrap whitespace-nowrap">
              {!isVolunteer && (
                <TabsTrigger value="adoption" className="flex items-center gap-1">
                  <PawPrint className="h-4 w-4" />
                  <span className="hidden sm:inline">Adoção</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="animals" className="flex items-center gap-1">
                <PawPrint className="h-4 w-4" />
                <span className="hidden sm:inline">Animais</span>
              </TabsTrigger>
              {!isVolunteer && (
                <>
                  <TabsTrigger value="compatibility" className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span className="hidden sm:inline">Compatibilidade</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Configurações</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {!isVolunteer && (
              <TabsContent value="adoption">
                <AdoptionManagement />
              </TabsContent>
            )}

            <TabsContent value="animals">
              <AnimalRegistrationForm />
            </TabsContent>

            {!isVolunteer && (
              <>
                <TabsContent value="compatibility">
                  <AdopterCompatibility />
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
                      <TabsTrigger value="organizations" className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span className="hidden sm:inline">ONGs</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="administrators">
                      <AdminUserManagement />
                    </TabsContent>

                    <TabsContent value="users">
                      <UsersList />
                    </TabsContent>

                    <TabsContent value="organizations">
                      <OrganizationManagement />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
