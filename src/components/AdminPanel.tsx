import { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { UsersList } from './admin/users';
import AdminUserManagement from './admin/AdminUserManagement';
import AnimalRegistrationForm from './admin/animal-registration';
import OrganizationManagement from './admin/organization-management/OrganizationManagement';
import VolunteerManagement from './admin/volunteer-management/VolunteerManagement';
import { signOut } from '@/services/auth';
import { useAuth } from '@/hooks/auth';

const AdminPanel = ({ onLogout }) => {
  const navigate = useNavigate();
  const { isAdmin, isVolunteer, isAuthenticated, fetchUserData, adminPermissions } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const canManageAdoptions = Boolean(adminPermissions?.approveAdoptions);
  const canManageAnimals = Boolean(adminPermissions?.manageAnimals);
  const canManageSettings = isAdmin && Boolean(adminPermissions?.manageSettings);
  const canManageAdmins = isAdmin && Boolean(adminPermissions?.manageAdmins);
  const canManageUsers = Boolean(adminPermissions?.manageUsers);
  const canOpenSettings = canManageSettings || canManageAdmins || canManageUsers;

  const defaultTab = useMemo(() => {
    if (canManageAdoptions) return 'adoption';
    if (canManageAnimals) return 'animals';
    if (canOpenSettings) return 'settings';
    return 'adoption';
  }, [canManageAdoptions, canManageAnimals, canOpenSettings]);

  const settingsDefaultTab = canManageAdmins
    ? 'administrators'
    : canManageSettings
      ? 'users'
      : canManageUsers
        ? (isVolunteer ? 'ong-users' : 'users')
        : 'administrators';

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
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="w-full mb-4 sm:mb-6 overflow-x-auto flex flex-nowrap whitespace-nowrap">
              {canManageAdoptions && (
                <TabsTrigger value="adoption" className="flex items-center gap-1">
                  <PawPrint className="h-4 w-4" />
                  <span className="hidden sm:inline">Adoção</span>
                </TabsTrigger>
              )}
              {canManageAnimals && (
                <TabsTrigger value="animals" className="flex items-center gap-1">
                  <PawPrint className="h-4 w-4" />
                  <span className="hidden sm:inline">Animais</span>
                </TabsTrigger>
              )}
              {canOpenSettings && (
                <TabsTrigger value="settings" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Configurações</span>
                </TabsTrigger>
              )}
            </TabsList>

            {canManageAdoptions && (
              <TabsContent value="adoption">
                <AdoptionManagement />
              </TabsContent>
            )}

            {canManageAnimals && (
              <TabsContent value="animals">
                <AnimalRegistrationForm />
              </TabsContent>
            )}

            {canOpenSettings && (
              <TabsContent value="settings">
                <Tabs defaultValue={settingsDefaultTab} className="w-full">
                  <TabsList className="w-full mb-4 overflow-x-auto flex flex-nowrap whitespace-nowrap">
                    {canManageAdmins && (
                      <TabsTrigger value="administrators" className="flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="hidden sm:inline">Administradores</span>
                      </TabsTrigger>
                    )}
                    {canManageUsers && (
                      <TabsTrigger value="users" className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Usuários</span>
                      </TabsTrigger>
                    )}
                    {canManageUsers && isVolunteer && (
                      <TabsTrigger value="ong-users" className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Usuários da ONG</span>
                      </TabsTrigger>
                    )}
                    {canManageSettings && (
                      <TabsTrigger value="organizations" className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span className="hidden sm:inline">ONGs</span>
                      </TabsTrigger>
                    )}
                  </TabsList>

                  {canManageAdmins && (
                    <TabsContent value="administrators">
                      <AdminUserManagement />
                    </TabsContent>
                  )}

                  {canManageUsers && (
                    <TabsContent value="users">
                      <UsersList />
                    </TabsContent>
                  )}

                  {canManageUsers && isVolunteer && (
                    <TabsContent value="ong-users">
                      <VolunteerManagement />
                    </TabsContent>
                  )}

                  {canManageSettings && (
                    <TabsContent value="organizations">
                      <OrganizationManagement />
                    </TabsContent>
                  )}
                </Tabs>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
