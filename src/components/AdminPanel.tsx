import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, MessageCircle, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-sonner";

// Simulated data for demonstration
interface Match {
  id: string;
  petName: string;
  petImage: string;
  userName: string;
  userImage?: string;
  userInfo: {
    phone: string;
    housingType: string;
    hasChildren: boolean;
    hadPetsBefore: boolean;
    hasAllergies: boolean;
  };
  matchDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

const mockMatches: Match[] = [
  {
    id: "1",
    petName: "Luna",
    petImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1027&q=80",
    userName: "Maria Silva",
    userImage: "https://randomuser.me/api/portraits/women/44.jpg",
    userInfo: {
      phone: "(11) 98765-4321",
      housingType: "apartment",
      hasChildren: false,
      hadPetsBefore: true,
      hasAllergies: false
    },
    matchDate: "2023-05-15T14:30:00",
    status: 'pending'
  },
  {
    id: "2",
    petName: "Max",
    petImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    userName: "João Pereira",
    userImage: "https://randomuser.me/api/portraits/men/32.jpg",
    userInfo: {
      phone: "(21) 99876-5432",
      housingType: "house",
      hasChildren: true,
      hadPetsBefore: true,
      hasAllergies: false
    },
    matchDate: "2023-05-14T09:15:00",
    status: 'pending'
  },
  {
    id: "3",
    petName: "Bella",
    petImage: "https://images.unsplash.com/photo-1574144113084-b6f450cc5e0b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80",
    userName: "Ana Oliveira",
    userInfo: {
      phone: "(47) 98888-7777",
      housingType: "house",
      hasChildren: false,
      hadPetsBefore: true,
      hasAllergies: true
    },
    matchDate: "2023-05-13T16:45:00",
    status: 'approved'
  },
  {
    id: "4",
    petName: "Thor",
    petImage: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
    userName: "Carlos Santos",
    userImage: "https://randomuser.me/api/portraits/men/67.jpg",
    userInfo: {
      phone: "(85) 99999-8888",
      housingType: "apartment",
      hasChildren: true,
      hadPetsBefore: false,
      hasAllergies: false
    },
    matchDate: "2023-05-12T11:20:00",
    status: 'rejected'
  },
];

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const pendingMatches = matches.filter(match => match.status === 'pending');
  const approvedMatches = matches.filter(match => match.status === 'approved');
  const rejectedMatches = matches.filter(match => match.status === 'rejected');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
        <CardDescription>Gerencie solicitações de adoção</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
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
          
          <TabsContent value="pending" className="space-y-4">
            {pendingMatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma solicitação pendente.
              </div>
            ) : (
              pendingMatches.map(match => (
                <MatchCard 
                  key={match.id}
                  match={match}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  formatDate={formatDate}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="space-y-4">
            {approvedMatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma solicitação aprovada.
              </div>
            ) : (
              approvedMatches.map(match => (
                <MatchCard 
                  key={match.id}
                  match={match}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  formatDate={formatDate}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="space-y-4">
            {rejectedMatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma solicitação rejeitada.
              </div>
            ) : (
              rejectedMatches.map(match => (
                <MatchCard 
                  key={match.id}
                  match={match}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  formatDate={formatDate}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface MatchCardProps {
  match: Match;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  formatDate: (date: string) => string;
}

const MatchCard = ({ match, onApprove, onReject, formatDate }: MatchCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="overflow-hidden transition-all duration-300">
      <div className="flex">
        {/* Pet image */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 relative flex-shrink-0">
          <img 
            src={match.petImage} 
            alt={match.petName}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{match.petName}</h3>
                <Badge variant="outline" className="text-xs">
                  {match.status === 'pending' ? 'Pendente' : 
                   match.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Solicitado em {formatDate(match.matchDate)}
              </p>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setExpanded(!expanded)}
                className="text-xs px-2"
              >
                {expanded ? 'Menos detalhes' : 'Mais detalhes'}
              </Button>
            </div>
          </div>
          
          <div className="mt-2 flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              {match.userImage ? (
                <AvatarImage src={match.userImage} alt={match.userName} />
              ) : null}
              <AvatarFallback>{match.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{match.userName}</span>
          </div>
          
          {expanded && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Telefone:</p>
                  <p>{match.userInfo.phone}</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Moradia:</p>
                  <p>{match.userInfo.housingType === 'apartment' ? 'Apartamento' : 'Casa'}</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Crianças:</p>
                  <p>{match.userInfo.hasChildren ? 'Sim' : 'Não'}</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Experiência prévia:</p>
                  <p>{match.userInfo.hadPetsBefore ? 'Sim' : 'Não'}</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Alergias:</p>
                  <p>{match.userInfo.hasAllergies ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {match.status === 'pending' && (
        <CardFooter className="bg-muted/30 flex justify-between py-3 px-4">
          <Button 
            variant="outline" 
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => onReject(match.id)}
          >
            <X className="h-4 w-4 mr-1" />
            Recusar
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              variant="default" 
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onApprove(match.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Aprovar
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // In a real app, this would open WhatsApp
                window.open(`https://wa.me/${match.userInfo.phone.replace(/\D/g, '')}`, '_blank');
              }}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              WhatsApp
            </Button>
          </div>
        </CardFooter>
      )}
      
      {match.status === 'approved' && (
        <CardFooter className="bg-muted/30 flex justify-end py-3 px-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              window.open(`https://wa.me/${match.userInfo.phone.replace(/\D/g, '')}`, '_blank');
            }}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Contatar via WhatsApp
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AdminPanel;
