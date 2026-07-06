
import React, { useState } from 'react';
import AuthedImage from '@/components/ui/authed-image';
import { 
  Card, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdoptionTimeline, { AdoptionStage } from '../../adoption/AdoptionStages';
import { 
  Calendar, 
  Clock, 
  Edit, 
  HeartHandshake, 
  MapPin, 
  MessageCircle, 
  UserCheck,
  Heart 
} from 'lucide-react';
import { AdoptionMatch, MatchCardProps } from './types';
import MatchCompatibilityDialog from './MatchCompatibilityDialog';
import SchedulingDialog from './SchedulingDialog';
import { getProfileAlerts } from '@/utils/profileAlerts';
import { UserProfile } from '@/types/user';
import AdoptionDetailsPanel from './AdoptionDetailsPanel';

const loadExtendedFor = (userId: string) => {
  try {
    const all = JSON.parse(localStorage.getItem('user_profile_extended') || '{}');
    return all[userId] || undefined;
  } catch {
    return undefined;
  }
};

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

  const showInterestIcon = match.currentStage === 'interested' && match.matchDate;
  const isMatchInterest = match.matchDate && match.matchDate !== match.createdAt;

  const candidateProfile: UserProfile = {
    id: match.userId,
    email: match.userEmail,
    extended: loadExtendedFor(match.userId),
  };
  const alerts = getProfileAlerts(candidateProfile);
  const sevColor = (s: string) =>
    s === 'critical' ? 'bg-red-100 text-red-800 border-red-200'
    : s === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-blue-100 text-blue-800 border-blue-200';
  return (
    <>
      {/* Main Card */}
      <Card className="overflow-hidden">
        <div className={`p-4 border-l-4 ${match.currentStage === "completed" ? "border-primary" : "border-muted"}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AuthedImage
                src={match.petImage} 
                alt={match.petName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  {match.petName}
                  {showInterestIcon && (
                    <span className="text-sm text-rose-500 flex items-center" title="Demonstrou interesse">
                      <Heart className="h-4 w-4 fill-rose-500" /> 
                    </span>
                  )}
                </h3>
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

          {alerts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {alerts.map((a, i) => (
                <Badge key={i} variant="outline" className={sevColor(a.severity)}>
                  ⚠ {a.message}
                </Badge>
              ))}
            </div>
          )}

          {expanded && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Estágios da Adoção</h4>
                <AdoptionTimeline currentStage={match.currentStage} />
              </div>

              <AdoptionDetailsPanel match={match} />
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
        onSubmit={(m, date, time, notes) => onScheduleVisit(m, date, time, notes)}
      />
      
      <SchedulingDialog 
        open={showInspectionDialog}
        onOpenChange={setShowInspectionDialog}
        match={match}
        type="inspection"
        onSubmit={(m, date, time, notes) => onScheduleHomeInspection(m, date, time, notes)}
      />
    </>
  );
};

export default MatchCard;
