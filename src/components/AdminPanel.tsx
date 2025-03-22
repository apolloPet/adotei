
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
  const [settings, setSettings] = useState({
    fees: {
      adoptionFee: 120,
      enableAdoptionFee: true
    },
    bankDetails: {
      pixKey: 'ong@example.com',
      companyBankInfo: 'Banco do Brasil, Ag: 1234, CC: 12345-6'
    },
    contractDetails: {
      contractText: 'Eu, adotante, me comprometo a cuidar do animal adotado, fornecendo abrigo, alimentação adequada, cuidados veterinários e carinho. Concordo em permitir visitas de acompanhamento pelo período estabelecido e em não abandonar ou maltratar o animal sob quaisquer circunstâncias. Entendo que o animal é um ser senciente e merece respeito e amor.',
      followUpPeriod: 90
    }
  });
  
  const navigate = useNavigate();

  const handleSaveSettings = (newSettings: any) => {
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
                  <PaymentSettings 
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                  />
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
