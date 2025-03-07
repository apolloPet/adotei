
import { useState } from 'react';
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-sonner";

export interface Match {
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

export default MatchCard;
