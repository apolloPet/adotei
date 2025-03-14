
import React, { useState } from 'react';
import { 
  Card, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdoptionStages, { adoptionStages } from '../../adoption/AdoptionStages';
import { 
  Calendar, 
  Clock, 
  Edit, 
  HeartHandshake, 
  MapPin, 
  MessageCircle, 
  UserCheck 
} from 'lucide-react';
import { AdoptionMatch, MatchCardProps } from './types';
import MatchCompatibilityDialog from './MatchCompatibilityDialog';
import SchedulingDialog from './SchedulingDialog';

const MatchCard = ({
  match,
  onStageChange,
  onScheduleVisit,
  onScheduleHomeInspection,
  onCompleteAdoption,
  getStageLabel,
  getStageColor,
  formatDate
}: MatchCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [showInspectionDialog, setShowInspectionDialog] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  
  const handleOpenVisitDialog = () => {
    setShowVisitDialog(true);
  };
  
  const handleOpenInspectionDialog = () => {
    setShowInspectionDialog(true);
  };

  const handleOpenMatchDialog = () => {
    setShowMatchDialog(true);
  };
  
  const getAvailableActions = () => {
    switch (match.currentStage) {
      case "interested":
        return (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStageChange(match.id, "pending_approval")}
            >
              Iniciar Análise
            </Button>
          </>
        );
      case "pending_approval":
        return (
          <>
            {match.matchPoints && match.matchPoints.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handleOpenMatchDialog}
              >
                <HeartHandshake className="h-4 w-4" />
                <span>Ver Compatibilidade</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"
              onClick={() => onStageChange(match.id, "approved")}
            >
              Aprovar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900"
              onClick={() => onStageChange(match.id, "interested")}
            >
              Rejeitar
            </Button>
          </>
        );
      case "approved":
        return (
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={handleOpenVisitDialog}
          >
            <Calendar className="h-4 w-4" />
            <span>Agendar Visita</span>
          </Button>
        );
      case "visit_scheduled":
        return (
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={handleOpenInspectionDialog}
          >
            <MapPin className="h-4 w-4" />
            <span>Agendar Inspeção</span>
          </Button>
        );
      case "home_inspection":
        return (
          <Button 
            variant="default" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => onCompleteAdoption(match.id)}
          >
            <UserCheck className="h-4 w-4" />
            <span>Concluir Adoção</span>
          </Button>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            Adoção Concluída
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      {/* Main Card */}
      <Card className="overflow-hidden">
        <div className={`p-4 border-l-4 ${match.currentStage === "completed" ? "border-primary" : "border-muted"}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={match.petImage} 
                alt={match.petName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium">{match.petName}</h3>
                <p className="text-sm text-muted-foreground">Adotante: {match.userName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getStageColor(match.currentStage)}>
                    {getStageLabel(match.currentStage)}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Atualizado: {formatDate(match.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {getAvailableActions()}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setExpanded(!expanded)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {expanded && (
            <div className="mt-4 pt-4 border-t">
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Estágios da Adoção</h4>
                <AdoptionStages currentStage={match.currentStage} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Dados do Adotante</h4>
                  <ul className="text-sm space-y-1">
                    <li><span className="text-muted-foreground">Nome:</span> {match.userName}</li>
                    <li><span className="text-muted-foreground">Email:</span> {match.userEmail}</li>
                    <li><span className="text-muted-foreground">Telefone:</span> {match.userPhone}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Informações da Adoção</h4>
                  <ul className="text-sm space-y-1">
                    <li><span className="text-muted-foreground">Interesse inicial:</span> {formatDate(match.createdAt)}</li>
                    <li><span className="text-muted-foreground">Última atualização:</span> {formatDate(match.updatedAt)}</li>
                    <li><span className="text-muted-foreground">Responsável:</span> {match.responsibleName || "Não atribuído"}</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Observações</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{match.notes || "Nenhuma observação registrada."}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Dialogs */}
      <MatchCompatibilityDialog 
        open={showMatchDialog}
        onOpenChange={setShowMatchDialog}
        match={match}
      />
      
      <SchedulingDialog 
        open={showVisitDialog}
        onOpenChange={setShowVisitDialog}
        match={match}
        type="visit"
        onSubmit={onScheduleVisit}
      />
      
      <SchedulingDialog 
        open={showInspectionDialog}
        onOpenChange={setShowInspectionDialog}
        match={match}
        type="inspection"
        onSubmit={onScheduleHomeInspection}
      />
    </>
  );
};

export default MatchCard;
