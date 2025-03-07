
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-sonner";
import { mockMatches, formatDate } from './admin/MockData';
import { Match } from './admin/MatchCard';
import AdminTabs from './admin/AdminTabs';

const AdminPanel = () => {
  const [matches, setMatches] = useState<Match[]>(mockMatches);

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
        <CardDescription>Gerencie solicitações de adoção</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <AdminTabs 
            matches={matches}
            onApprove={handleApprove}
            onReject={handleReject}
            formatDate={formatDate}
          />
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminPanel;
