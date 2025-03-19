
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-sonner";
import { formatDate } from './admin/MockData';
import { PaymentSettingsType } from './admin/AdminTabs';
import AdoptionManagement from './admin/AdoptionManagement';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  LogOut, 
  PawPrint, 
  Settings, 
  Users, 
  Handshake, 
  ShieldCheck, 
  Sliders,
  BarChart, 
  Bell 
} from 'lucide-react';
import PartnershipInterest from './admin/PartnershipInterest';
import { UsersList } from './admin/users';
import AdminUserManagement from './admin/AdminUserManagement';
import AdminRoleManagement from './admin/AdminRoleManagement';
import SystemParametersManager from './admin/SystemParametersManager';
import PaymentSettings from './admin/PaymentSettings';
import AnimalRegistrationForm from './admin/animal-registration';
import CostSimulator from './admin/partnerships/CostSimulator';

const AdminPanel = () => {
  const [settings, setSettings] = useState<PaymentSettingsType>({
    adoptionFee: 120,
    ngoPercentage: 90,
    platformPercentage: 10,
    pixKey: 'ong@example.com',
    contractText: 'Eu, adotante, me comprometo a cuidar do animal adotado, fornecendo abrigo, alimentação adequada, cuidados veterinários e carinho. Concordo em permitir visitas de acompanhamento pelo período estabelecido e em não abandonar ou maltratar o animal sob quaisquer circunstâncias. Entendo que o animal é um ser senciente e merece respeito e amor.',
    followUpPeriod: 90
  });
  const navigate = useNavigate();

  const handleSaveSettings = (newSettings: PaymentSettingsType) => {
    setSettings(newSettings);
    toast.success("Configurações salvas com sucesso!", {
      description: "As novas configurações foram aplicadas."
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };

  return (
    <div className="container py-12 max-w-6xl mx-auto mt-16">
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
            <TabsList className="w-full mb-6">
              <TabsTrigger value="adoption" className="flex items-center gap-1">
                <PawPrint className="h-4 w-4" />
                Adoção
              </TabsTrigger>
              <TabsTrigger value="partnerships" className="flex items-center gap-1">
                <Handshake className="h-4 w-4" />
                Parcerias
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1">
                <BarChart className="h-4 w-4" />
                Métricas
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Configurações
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="adoption">
              <AdoptionManagement />
            </TabsContent>
            
            <TabsContent value="partnerships">
              <PartnershipInterest />
            </TabsContent>
            
            <TabsContent value="users">
              <UsersList />
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas e Análises</CardTitle>
                  <CardDescription>
                    Visualize estatísticas e tendências do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="users" className="w-full">
                    <TabsList className="w-full mb-4">
                      <TabsTrigger value="users">Usuários</TabsTrigger>
                      <TabsTrigger value="adoptions">Adoções</TabsTrigger>
                      <TabsTrigger value="followups">
                        <div className="flex items-center gap-1">
                          <Bell className="h-4 w-4" />
                          Acompanhamentos
                        </div>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="users">
                      <div className="grid gap-6">
                        <UsersList />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="adoptions">
                      <div className="grid gap-6">
                        <AdoptionManagement />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="followups">
                      <div className="grid gap-6">
                        <AdoptionManagement />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Tabs defaultValue="parameters" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="parameters" className="flex items-center gap-1">
                    <Sliders className="h-4 w-4" />
                    Parâmetros
                  </TabsTrigger>
                  <TabsTrigger value="administrators" className="flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    Administradores
                  </TabsTrigger>
                  <TabsTrigger value="roles">Papéis & Permissões</TabsTrigger>
                  <TabsTrigger value="register-animal">Cadastrar Animais</TabsTrigger>
                  <TabsTrigger value="cost-simulator">Simulador de Custos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="parameters">
                  <SystemParametersManager />
                </TabsContent>
                
                <TabsContent value="administrators">
                  <AdminUserManagement />
                </TabsContent>
                
                <TabsContent value="roles">
                  <AdminRoleManagement />
                </TabsContent>
                
                <TabsContent value="register-animal">
                  <AnimalRegistrationForm />
                </TabsContent>
                
                <TabsContent value="cost-simulator">
                  <CostSimulator />
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
