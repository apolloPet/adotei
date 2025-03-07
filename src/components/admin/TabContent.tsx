
import { Match } from './MatchCard';
import MatchCard from './MatchCard';

interface TabContentProps {
  matches: Match[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  formatDate: (date: string) => string;
  type: 'pending' | 'approved' | 'rejected';
}

const TabContent = ({ matches, onApprove, onReject, formatDate, type }: TabContentProps) => {
  const filteredMatches = matches.filter(match => match.status === type);
  
  if (filteredMatches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {type === 'pending' && "Nenhuma solicitação pendente."}
        {type === 'approved' && "Nenhuma solicitação aprovada."}
        {type === 'rejected' && "Nenhuma solicitação rejeitada."}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {filteredMatches.map(match => (
        <MatchCard 
          key={match.id}
          match={match}
          onApprove={onApprove}
          onReject={onReject}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

export default TabContent;
