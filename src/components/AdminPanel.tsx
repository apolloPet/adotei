
import { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { UsersList } from './admin/users';
import AdminUserManagement from './admin/AdminUserManagement';
import PaymentSettings from './admin/PaymentSettings';
import AnimalRegistrationForm from './admin/animal-registration';

const AdminPanel = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };

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
