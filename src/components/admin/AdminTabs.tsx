
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PaymentSettings from './PaymentSettings';
import { Match } from './MatchCard';
import { Settings, Users, PawPrint, ChartBar, Building2 } from 'lucide-react';
import AnimalRegistrationForm from './animal-registration';
import { UsersList } from './users';
import AdminUserManagement from './AdminUserManagement';
import AdoptionManagement from './AdoptionManagement';

interface AdminTabsProps {
  matches: Match[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  formatDate: (date: string) => string;
  settings: PaymentSettingsType;
  onSaveSettings: (settings: PaymentSettingsType) => void;
  activeTab?: string;
}

export interface PaymentSettingsType {
  adoptionFee: number;
  ngoPercentage: number;
  platformPercentage: number;
  pixKey: string;
  contractText: string;
  followUpPeriod: number;
  companyBankInfo?: string;
}

const AdminTabs = ({ 
  settings,
  onSaveSettings,
  activeTab = "pending"
}: AdminTabsProps) => {
  return (
    <Card className="border-none shadow-none">
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="adoption" className="flex items-center gap-1">
            <PawPrint className="h-4 w-4" />
            Adoção
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="adoption">
          <AdoptionManagement />
        </TabsContent>
        
        <TabsContent value="users">
          <UsersList />
        </TabsContent>
        
        <TabsContent value="settings">
          <Tabs defaultValue="parameters" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
              <TabsTrigger value="administrators">Administradores</TabsTrigger>
              <TabsTrigger value="register-animal">Cadastrar Animais</TabsTrigger>
            </TabsList>
            
            <TabsContent value="parameters">
              <PaymentSettings 
                settings={settings}
                onSave={onSaveSettings}
              />
            </TabsContent>
            
            <TabsContent value="administrators">
              <AdminUserManagement />
            </TabsContent>
            
            <TabsContent value="register-animal">
              <AnimalRegistrationForm />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AdminTabs;
