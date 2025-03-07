
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TabContent from './TabContent';
import { Match } from './MatchCard';

interface AdminTabsProps {
  matches: Match[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  formatDate: (date: string) => string;
}

const AdminTabs = ({ matches, onApprove, onReject, formatDate }: AdminTabsProps) => {
  const pendingMatches = matches.filter(match => match.status === 'pending');
  
  return (
    <>
      <TabsList className="grid grid-cols-3 mb-6">
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
    </>
  );
};

export default AdminTabs;
