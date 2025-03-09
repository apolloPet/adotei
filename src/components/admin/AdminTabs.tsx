
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TabContent from './TabContent';
import PaymentSettings from './PaymentSettings';
import { Match } from './MatchCard';

interface AdminTabsProps {
  matches: Match[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  formatDate: (date: string) => string;
  settings: PaymentSettingsType;
  onSaveSettings: (settings: PaymentSettingsType) => void;
}

export interface PaymentSettingsType {
  adoptionFee: number;
  ngoPercentage: number;
  platformPercentage: number;
  pixKey: string;
  contractText: string;
  followUpPeriod: number;
}

const AdminTabs = ({ 
  matches, 
  onApprove, 
  onReject, 
  formatDate, 
  settings,
  onSaveSettings
}: AdminTabsProps) => {
  const pendingMatches = matches.filter(match => match.status === 'pending');
  
  return (
    <>
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="pending" className="relative">
          Pendentes
          {pendingMatches.length > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-primary text-white h-5 min-w-5 flex items-center justify-center p-0 text-xs">
              {pendingMatches.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved">Aprovados</TabsTrigger>
        <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
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
      
      <TabsContent value="settings">
        <PaymentSettings 
          settings={settings}
          onSave={onSaveSettings}
        />
      </TabsContent>
    </>
  );
};

export default AdminTabs;
