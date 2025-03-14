import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdoptionStages, { AdoptionStage, adoptionStages } from '../adoption/AdoptionStages';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Edit, MapPin, MessageSquare, UserCheck, Check, HeartHandshake } from 'lucide-react';
import { 
  Dialog, 
  DialogClose, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-sonner';
import { sendWhatsAppMessage, generateAdoptionStageMessage } from '@/utils/whatsappUtils';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface AdoptionMatch {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  currentStage: AdoptionStage;
  createdAt: string;
  updatedAt: string;
  notes: string;
  responsibleId?: string;
  responsibleName?: string;
  matchPoints?: MatchPoint[];
}

export interface MatchPoint {
  icon: string;
  description: string;
  strength: 'high' | 'medium' | 'low';
}

const mockAdoptionMatches: AdoptionMatch[] = [
  {
    id: "match-1",
    petId: "pet-1",
    petName: "Luna",
    petImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=60",
    userId: "user-1",
    userName: "Carlos Oliveira",
    userEmail: "carlos@example.com",
    userPhone: "(11) 98765-4321",
    currentStage: "interested",
    createdAt: "2023-11-15T10:30:00Z",
    updatedAt: "2023-11-15T10:30:00Z",
    notes: "Usuário tem experiência com cães de porte médio.",
    responsibleId: "admin-1",
    responsibleName: "Mariana Silva",
    matchPoints: [
      { icon: "🏠", description: "Mora em casa com quintal", strength: "high" },
      { icon: "⏰", description: "Disponibilidade de tempo", strength: "medium" },
      { icon: "🐕", description: "Experiência com cães", strength: "high" }
    ]
  },
  {
    id: "match-2",
    petId: "pet-2",
    petName: "Max",
    petImage: "https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=500&auto=format&fit=crop&q=60",
    userId: "user-2",
    userName: "Ana Ferreira",
    userEmail: "ana@example.com",
    userPhone: "(11) 91234-5678",
    currentStage: "pending_approval",
    createdAt: "2023-11-10T14:20:00Z",
    updatedAt: "2023-11-12T09:15:00Z",
    notes: "Mora em apartamento, precisa verificar se é adequado para o pet.",
    responsibleId: "admin-1",
    responsibleName: "Mariana Silva",
    matchPoints: [
      { icon: "🏢", description: "Mora em apartamento", strength: "medium" },
      { icon: "❤️", description: "Primeira adoção", strength: "low" },
      { icon: "🐈", description: "Experiência apenas com gatos", strength: "low" }
    ]
  },
  {
    id: "match-3",
    petId: "pet-3",
    petName: "Nina",
    petImage: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&auto=format&fit=crop&q=60",
    userId: "user-3",
    userName: "Roberto Santos",
    userEmail: "roberto@example.com",
    userPhone: "(11) 97890-1234",
    currentStage: "approved",
    createdAt: "2023-11-05T11:45:00Z",
    updatedAt: "2023-11-13T16:30:00Z",
    notes: "Família grande com crianças. Perfil aprovado.",
    responsibleId: "admin-2",
    responsibleName: "Lucas Pereira"
  },
  {
    id: "match-4",
    petId: "pet-4",
    petName: "Thor",
    petImage: "https://images.unsplash.com/photo-1583512603806-077998240c7a?w=500&auto=format&fit=crop&q=60",
    userId: "user-4",
    userName: "Fernanda Lima",
    userEmail: "fernanda@example.com",
    userPhone: "(11) 96543-2109",
    currentStage: "visit_scheduled",
    createdAt: "2023-10-28T09:10:00Z",
    updatedAt: "2023-11-14T10:00:00Z",
    notes: "Visita agendada para 18/11 às 14h.",
    responsibleId: "admin-1",
    responsibleName: "Mariana Silva"
  },
  {
    id: "match-5",
    petId: "pet-5",
    petName: "Bella",
    petImage: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=500&auto=format&fit=crop&q=60",
    userId: "user-5",
    userName: "Pedro Costa",
    userEmail: "pedro@example.com",
    userPhone: "(11) 95678-9012",
    currentStage: "home_inspection",
    createdAt: "2023-10-20T15:30:00Z",
    updatedAt: "2023-11-15T11:45:00Z",
    notes: "Inspeção domiciliar marcada para 20/11 às 10h.",
    responsibleId: "admin-2",
    responsibleName: "Lucas Pereira"
  },
  {
    id: "match-6",
    petId: "pet-6",
    petName: "Rex",
    petImage: "https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=500&auto=format&fit=crop&q=60",
    userId: "user-6",
    userName: "Julia Mendes",
    userEmail: "julia@example.com",
    userPhone: "(11) 94321-8765",
    currentStage: "completed",
    createdAt: "2023-10-15T10:20:00Z",
    updatedAt: "2023-11-10T14:30:00Z",
    notes: "Adoção concluída com sucesso. Acompanhamento pós-adoção em 30 dias.",
    responsibleId: "admin-1",
    responsibleName: "Mariana Silva"
  }
];

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

const AdoptionManagement = () => {
  const [matches, setMatches] = useState<AdoptionMatch[]>(mockAdoptionMatches);
  const [selectedMatch, setSelectedMatch] = useState<AdoptionMatch | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);

  const handleStageChange = (matchId: string, newStage: AdoptionStage) => {
    const match = matches.find(m => m.id === matchId);
    
    if (match) {
      setMatches(prevMatches => 
        prevMatches.map(m => 
          m.id === matchId 
            ? { 
                ...m, 
                currentStage: newStage, 
                updatedAt: new Date().toISOString() 
              } 
            : m
        )
      );
      
      const autoMessage = generateAdoptionStageMessage(match.petName, newStage);
      setNotificationMessage(autoMessage);
      
      setSelectedMatch(match);
      setShowNotifyDialog(true);
      
      toast.success(`Estágio atualizado para ${adoptionStages.find(stage => stage.id === newStage)?.label}`);
    }
  };

  const handleSendNotification = () => {
    if (!selectedMatch || !notificationMessage) {
      toast.error("Não foi possível enviar a notificação. Faltam informações.");
      return;
    }

    try {
      sendWhatsAppMessage(selectedMatch.userPhone, notificationMessage);
      
      const timestamp = new Date().toLocaleString('pt-BR');
      const updatedNotes = `${selectedMatch.notes}\n\n[${timestamp}] Notificação enviada via WhatsApp: "${notificationMessage}"`;
      
      setMatches(prevMatches => 
        prevMatches.map(match => 
          match.id === selectedMatch.id 
            ? { 
                ...match, 
                notes: updatedNotes
              } 
            : match
        )
      );
      
      toast.success("Notificação enviada com sucesso!");
      
      setNotificationMessage("");
      setSelectedMatch(null);
      setShowNotifyDialog(false);
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      toast.error("Erro ao enviar notificação. Tente novamente.");
    }
  };

  const handleScheduleVisit = (match: AdoptionMatch, date: Date, time: string, notes: string) => {
    if (!date) {
      toast.error("Por favor, selecione uma data para a visita");
      return;
    }

    if (!time) {
      toast.error("Por favor, informe um horário para a visita");
      return;
    }

    const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

    const updatedNotes = `${match.notes}\n\nVisita agendada para ${formattedDate} às ${time}. ${notes}`;
    
    setMatches(prevMatches => 
      prevMatches.map(m => 
        m.id === match.id 
          ? { 
              ...m, 
              notes: updatedNotes,
              currentStage: "visit_scheduled",
              updatedAt: new Date().toISOString() 
            } 
          : m
      )
    );
    
    const autoMessage = `Olá ${match.userName}! Gostaríamos de agendar uma visita para que você conheça ${match.petName}. A data sugerida é ${formattedDate} às ${time}. Por favor, confirme se esta data é conveniente para você. Obrigado!`;
    setNotificationMessage(autoMessage);
    
    setSelectedMatch(match);
    setShowNotifyDialog(true);
    
    toast.success("Visita agendada com sucesso!");
  };

  const handleScheduleHomeInspection = (match: AdoptionMatch, date: Date, time: string, notes: string) => {
    if (!date) {
      toast.error("Por favor, selecione uma data para a inspeção");
      return;
    }

    if (!time) {
      toast.error("Por favor, informe um horário para a inspeção");
      return;
    }

    const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

    const updatedNotes = `${match.notes}\n\nInspeção domiciliar agendada para ${formattedDate} às ${time}. ${notes}`;
    
    setMatches(prevMatches => 
      prevMatches.map(m => 
        m.id === match.id 
          ? { 
              ...m, 
              notes: updatedNotes,
              currentStage: "home_inspection",
              updatedAt: new Date().toISOString() 
            } 
          : m
      )
    );
    
    const autoMessage = `Olá ${match.userName}! Gostaríamos de agendar uma visita à sua residência para verificar as condições para ${match.petName}. A data sugerida é ${formattedDate} às ${time}. Por favor, confirme se esta data é conveniente para você. Obrigado!`;
    setNotificationMessage(autoMessage);
    
    setSelectedMatch(match);
    setShowNotifyDialog(true);
    
    toast.success("Inspeção domiciliar agendada com sucesso!");
  };

  const completeAdoption = (matchId: string) => {
    setMatches(prevMatches => 
      prevMatches.map(match => 
        match.id === matchId 
          ? { 
              ...match, 
              currentStage: "completed",
              updatedAt: new Date().toISOString(),
              notes: match.notes + "\n\nAdoção concluída em " + new Date().toLocaleDateString('pt-BR')
            } 
          : match
      )
    );
    
    toast.success("Adoção concluída com sucesso!");
  };

  const handleCompleteAdoption = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    
    if (match) {
      completeAdoption(matchId);
      
      const autoMessage = generateAdoptionStageMessage(match.petName, "completed");
      setNotificationMessage(autoMessage);
      
      setSelectedMatch(match);
      setShowNotifyDialog(true);
    }
  };

  const getStageLabel = (stage: AdoptionStage) => {
    return adoptionStages.find(s => s.id === stage)?.label || stage;
  };

  const getStageColor = (stage: AdoptionStage) => {
    switch (stage) {
      case "interested":
        return "bg-pink-100 text-pink-800";
      case "pending_approval":
        return "bg-orange-100 text-orange-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "visit_scheduled":
        return "bg-blue-100 text-blue-800";
      case "home_inspection":
        return "bg-indigo-100 text-indigo-800";
      case "completed":
        return "bg-primary-100 text-primary-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const matchesByStage = adoptionStages.reduce((acc, stage) => {
    acc[stage.id] = matches.filter(match => match.currentStage === stage.id);
    return acc;
  }, {} as Record<AdoptionStage, AdoptionMatch[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Adoções</CardTitle>
        <CardDescription>
          Acompanhe e gerencie o processo de adoção dos animais
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {adoptionStages.map(stage => (
              <TabsTrigger key={stage.id} value={stage.id}>
                {stage.label} ({matchesByStage[stage.id]?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all">
            <div className="space-y-4">
              {matches.length > 0 ? (
                matches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    onStageChange={handleStageChange}
                    onScheduleVisit={handleScheduleVisit}
                    onScheduleHomeInspection={handleScheduleHomeInspection}
                    onCompleteAdoption={handleCompleteAdoption}
                    getStageLabel={getStageLabel}
                    getStageColor={getStageColor}
                    formatDate={formatDate}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  Nenhuma solicitação de adoção encontrada.
                </div>
              )}
            </div>
          </TabsContent>
          
          {adoptionStages.map(stage => (
            <TabsContent key={stage.id} value={stage.id}>
              <div className="space-y-4">
                {matchesByStage[stage.id]?.length > 0 ? (
                  matchesByStage[stage.id].map(match => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      onStageChange={handleStageChange}
                      onScheduleVisit={handleScheduleVisit}
                      onScheduleHomeInspection={handleScheduleHomeInspection}
                      onCompleteAdoption={handleCompleteAdoption}
                      getStageLabel={getStageLabel}
                      getStageColor={getStageColor}
                      formatDate={formatDate}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    Nenhuma solicitação no estágio "{stage.label}".
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Notification Dialog */}
        <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Enviar Notificação</DialogTitle>
              <DialogDescription>
                Envie uma notificação por WhatsApp para o adotante
              </DialogDescription>
            </DialogHeader>
            
            {selectedMatch && (
              <div className="py-4 space-y-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedMatch.petImage} 
                    alt={selectedMatch.petName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{selectedMatch.petName}</p>
                    <p className="text-sm text-muted-foreground">Para: {selectedMatch.userName}</p>
                    <p className="text-xs text-muted-foreground">{selectedMatch.userPhone}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="notification-message" className="text-sm font-medium">
                    Mensagem
                  </label>
                  <Textarea
                    id="notification-message"
                    placeholder="Digite a mensagem para o adotante..."
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNotifyDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendNotification} className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                Enviar WhatsApp
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

interface MatchCardProps {
  match: AdoptionMatch;
  onStageChange: (matchId: string, stage: AdoptionStage) => void;
  onScheduleVisit: (match: AdoptionMatch, date: Date, time: string, notes: string) => void;
  onScheduleHomeInspection: (match: AdoptionMatch, date: Date, time: string, notes: string) => void;
  onCompleteAdoption: (matchId: string) => void;
  getStageLabel: (stage: AdoptionStage) => string;
  getStageColor: (stage: AdoptionStage) => string;
  formatDate: (dateString: string) => string;
}

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
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");
  
  const resetScheduleForm = () => {
    setScheduleDate(undefined);
    setScheduleTime("");
    setScheduleNotes("");
  };
  
  const handleOpenVisitDialog = () => {
    resetScheduleForm();
    setShowVisitDialog(true);
  };
  
  const handleOpenInspectionDialog = () => {
    resetScheduleForm();
    setShowInspectionDialog(true);
  };

  const handleOpenMatchDialog = () => {
    setShowMatchDialog(true);
  };
  
  const handleSubmitVisit = () => {
    if (scheduleDate) {
      onScheduleVisit(match, scheduleDate, scheduleTime, scheduleNotes);
      setShowVisitDialog(false);
    } else {
      toast.error("Por favor, selecione uma data para a visita");
    }
  };
  
  const handleSubmitInspection = () => {
    if (scheduleDate) {
      onScheduleHomeInspection(match, scheduleDate, scheduleTime, scheduleNotes);
      setShowInspectionDialog(false);
    } else {
      toast.error("Por favor, selecione uma data para a inspeção");
    }
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
      
      {/* Match Points Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pontos de Compatibilidade</DialogTitle>
            <DialogDescription>
              Análise de compatibilidade entre o adotante e o animal
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={match.petImage} 
                alt={match.petName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{match.petName}</p>
                <p className="text-sm text-muted-foreground">Adotante: {match.userName}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Pontos de Compatibilidade</h4>
              {match.matchPoints && match.matchPoints.length > 0 ? (
                <div className="space-y-2">
                  {match.matchPoints.map((point, index) => {
                    let badgeClass = "";
                    
                    switch(point.strength) {
                      case "high":
                        badgeClass = "bg-green-100 text-green-800";
                        break;
                      case "medium":
                        badgeClass = "bg-yellow-100 text-yellow-800";
                        break;
                      case "low":
                        badgeClass = "bg-orange-100 text-orange-800";
                        break;
                    }
                    
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center text-lg">
                          {point.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{point.description}</p>
                        </div>
                        <Badge variant="outline" className={badgeClass}>
                          {point.strength === "high" ? "Alto" : point.strength === "medium" ? "Médio" : "Baixo"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum ponto de compatibilidade registrado.</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowMatchDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Visit Scheduling Dialog */}
      <Dialog open={showVisitDialog} onOpenChange={setShowVisitDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agendar Visita</DialogTitle>
            <DialogDescription>
              Agende uma visita para que o adotante conheça o animal
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={match.petImage} 
                alt={match.petName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{match.petName}</p>
                <p className="text-sm text-muted-foreground">Para: {match.userName}</p>
              </div>
            </div>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Data
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduleDate && "text
