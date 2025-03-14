
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import TabContent from './TabContent';
import PaymentSettings from './PaymentSettings';
import { Match } from './MatchCard';
import { Settings, Users, PawPrint, ChartBar, Building2, Handshake } from 'lucide-react';
import AnimalRegistrationForm from './animal-registration';
import { UsersList } from './users';
import AdminUserManagement from './AdminUserManagement';
import AdoptionManagement from './AdoptionManagement';
import PartnershipInterest from './PartnershipInterest';

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
  matches, 
  onApprove, 
  onReject, 
  formatDate, 
  settings,
  onSaveSettings,
  activeTab = "pending"
}: AdminTabsProps) => {
  const pendingMatches = matches.filter(match => match.status === 'pending');
  
  return (
    <Card className="border-none shadow-none">
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="adoption" className="flex items-center gap-1">
            <PawPrint className="h-4 w-4" />
            Adoção
          </TabsTrigger>
          <TabsTrigger value="matches" className="relative flex items-center gap-1">
            <ChartBar className="h-4 w-4" />
            Matches
            {pendingMatches.length > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-primary text-white h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                {pendingMatches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="flex items-center gap-1">
            <Handshake className="h-4 w-4" />
            Parcerias
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="adoption">
          <AdoptionManagement />
        </TabsContent>
        
        <TabsContent value="matches">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="approved">Aprovados</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <TabContent 
                matches={matches} 
                onApprove={onApprove} 
                onReject={onReject} 
                formatDate={formatDate}
                type="pending"
              />
            </TabsContent>
            
            <TabsContent value="approved">
              <TabContent 
                matches={matches} 
                onApprove={onApprove} 
                onReject={onReject} 
                formatDate={formatDate}
                type="approved"
              />
            </TabsContent>
            
            <TabsContent value="rejected">
              <TabContent 
                matches={matches} 
                onApprove={onApprove} 
                onReject={onReject} 
                formatDate={formatDate}
                type="rejected"
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="users">
          <UsersList />
        </TabsContent>
        
        <TabsContent value="partnerships">
          <PartnershipInterest />
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
