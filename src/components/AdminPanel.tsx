
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-sonner";
import { mockMatches, formatDate } from './admin/MockData';
import { Match } from './admin/MatchCard';
import AdminTabs, { PaymentSettingsType } from './admin/AdminTabs';
import AdoptionManagement from './admin/AdoptionManagement';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

const AdminPanel = () => {
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [settings, setSettings] = useState<PaymentSettingsType>({
    adoptionFee: 120,
    ngoPercentage: 90,
    platformPercentage: 10,
    pixKey: 'ong@example.com',
    contractText: 'Eu, adotante, me comprometo a cuidar do animal adotado, fornecendo abrigo, alimentação adequada, cuidados veterinários e carinho. Concordo em permitir visitas de acompanhamento pelo período estabelecido e em não abandonar ou maltratar o animal sob quaisquer circunstâncias. Entendo que o animal é um ser senciente e merece respeito e amor.',
    followUpPeriod: 90
  });
  const navigate = useNavigate();

  const handleApprove = (id: string) => {
    setMatches(prev => 
      prev.map(match => 
        match.id === id ? { ...match, status: 'approved' } : match
      )
    );
    
    toast.success("Match aprovado com sucesso!", {
      description: "O adotante será notificado."
    });
  };

  const handleReject = (id: string) => {
    setMatches(prev => 
      prev.map(match => 
        match.id === id ? { ...match, status: 'rejected' } : match
      )
    );
    
    toast("Match rejeitado", {
      description: "O adotante não será notificado."
    });
  };

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
    <div className="container py-8 max-w-6xl mx-auto">
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
        
        <CardContent>
          <Tabs defaultValue="adoption" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="adoption">Processo de Adoção</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="adoption">
              <AdoptionManagement />
            </TabsContent>
            
            <TabsContent value="matches">
              <AdminTabs 
                matches={matches}
                onApprove={handleApprove}
                onReject={handleReject}
                formatDate={formatDate}
                settings={settings}
                onSaveSettings={handleSaveSettings}
                activeTab="pending"
              />
            </TabsContent>
            
            <TabsContent value="users">
              <AdminTabs 
                matches={matches}
                onApprove={handleApprove}
                onReject={handleReject}
                formatDate={formatDate}
                settings={settings}
                onSaveSettings={handleSaveSettings}
                activeTab="users"
              />
            </TabsContent>
            
            <TabsContent value="settings">
              <AdminTabs 
                matches={matches}
                onApprove={handleApprove}
                onReject={handleReject}
                formatDate={formatDate}
                settings={settings}
                onSaveSettings={handleSaveSettings}
                activeTab="settings"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
