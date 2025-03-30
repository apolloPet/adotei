import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Calendar,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdoptionStage, adoptionStages } from '../../adoption/AdoptionStages';
import { Badge } from "@/components/ui/badge";
import { toast } from '@/hooks/use-sonner';
import { sendWhatsAppMessage, generateAdoptionStageMessage } from '@/utils/whatsappUtils';
import MatchCard from './MatchCard';
import NotificationDialog from './NotificationDialog';
import AdoptionContractDialog from './AdoptionContractDialog';
import { AdoptionMatch, formatDate } from './types';
import { getStageLabel, getStageColor } from './helpers';
import FollowUpDialog from './FollowUpDialog';
import RejectionDialog from './RejectionDialog';
import UserMetricsDashboard from '../dashboard/UserMetricsDashboard';
import { 
  fetchAdoptions, 
  updateAdoptionStage, 
  getPendingFollowUps,
  assignResponsible
} from '@/services/adoptionService';
import { createFollowUpRecord } from '@/services/followUpService';

const AdoptionManagement = () => {
  const [matches, setMatches] = useState<AdoptionMatch[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<AdoptionMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<AdoptionMatch | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [showAdoptionContract, setShowAdoptionContract] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingFollowUps, setPendingFollowUps] = useState<AdoptionMatch[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadAdoptions();
    loadPendingFollowUps();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [matches, searchTerm, statusFilter]);

  const loadAdoptions = async () => {
    setIsLoading(true);
    try {
      const adoptionData = await fetchAdoptions();
      setMatches(adoptionData);
      setFilteredMatches(adoptionData);
    } catch (error) {
      console.error("Error loading adoptions:", error);
      toast.error("Erro ao carregar adoções");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingFollowUps = async () => {
    try {
      const pendingFollowUpData = await getPendingFollowUps();
      setPendingFollowUps(pendingFollowUpData);
    } catch (error) {
      console.error("Error loading pending follow-ups:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...matches];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(match => 
        match.petName.toLowerCase().includes(term) || 
        match.userName.toLowerCase().includes(term) || 
        match.userEmail.toLowerCase().includes(term) ||
        match.userPhone.includes(term)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(match => match.currentStage === statusFilter);
    }
    
    setFilteredMatches(filtered);
  };

  const handleStageChange = async (matchId: string, newStage: AdoptionStage, notes?: string, rejectionReason?: string) => {
    const match = matches.find(m => m.id === matchId);
    
    if (match) {
      if (newStage === 'rejected') {
        setSelectedMatch(match);
        setShowRejectionDialog(true);
        return;
      }
      
      const success = await updateAdoptionStage(matchId, newStage, notes, rejectionReason);
      
      if (success) {
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
    }
  };

  const handleRejectAdoption = async (matchId: string, reason: string) => {
    const match = matches.find(m => m.id === matchId);
    
    if (match) {
      const success = await updateAdoptionStage(matchId, 'rejected', undefined, undefined, undefined, undefined, undefined, reason);
      
      if (success) {
        setMatches(prevMatches => 
          prevMatches.map(m => 
            m.id === matchId 
              ? { 
                  ...m, 
                  currentStage: 'rejected', 
                  updatedAt: new Date().toISOString(),
                  rejectionReason: reason
                } 
              : m
          )
        );
        
        const autoMessage = `Lamentamos informar que sua solicitação de adoção para ${match.petName} não foi aprovada. Motivo: ${reason}. Agradecemos seu interesse e esperamos que você encontre um companheiro em breve.`;
        setNotificationMessage(autoMessage);
        
        setSelectedMatch(match);
        setShowNotifyDialog(true);
        
        toast.success(`Adoção rejeitada`);
      }
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

  const handleScheduleVisit = async (match: AdoptionMatch, date: Date, time: string, notes: string) => {
    if (!date) {
      toast.error("Por favor, selecione uma data para a visita");
      return;
    }

    if (!time) {
      toast.error("Por favor, informe um horário para a visita");
      return;
    }

    const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);
    const dateString = date.toISOString().split('T')[0];
    
    const updatedNotes = `${match.notes}\n\nVisita agendada para ${formattedDate} às ${time}. ${notes}`;
    
    const success = await updateAdoptionStage(
      match.id, 
      "visit_scheduled", 
      updatedNotes, 
      `${dateString} ${time}`
    );
    
    if (success) {
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
    }
  };

  const handleScheduleHomeInspection = async (match: AdoptionMatch, date: Date, time: string, notes: string) => {
    if (!date) {
      toast.error("Por favor, selecione uma data para a inspeção");
      return;
    }

    if (!time) {
      toast.error("Por favor, informe um horário para a inspeção");
      return;
    }

    const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);
    const dateString = date.toISOString().split('T')[0];

    const updatedNotes = `${match.notes}\n\nInspeção domiciliar agendada para ${formattedDate} às ${time}. ${notes}`;
    
    const success = await updateAdoptionStage(
      match.id, 
      "home_inspection", 
      updatedNotes, 
      undefined, 
      `${dateString} ${time}`
    );
    
    if (success) {
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
    }
  };

  const handleScheduleFollowUp = async (match: AdoptionMatch, date: Date, notes: string) => {
    if (!date) {
      toast.error("Por favor, selecione uma data para o acompanhamento");
      return;
    }

    const dateString = date.toISOString().split('T')[0];
    
    const followUp = await createFollowUpRecord({
      adoption_id: match.id,
      follow_up_date: dateString,
      notes: notes,
      status: 'pending'
    });
    
    if (followUp) {
      const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);
      
      setMatches(prevMatches => 
        prevMatches.map(m => 
          m.id === match.id 
            ? { 
                ...m, 
                notes: `${m.notes}\n\nAcompanhamento agendado para ${formattedDate}. ${notes}`,
                nextFollowUpDate: dateString,
                followUpStatus: 'pending'
              } 
            : m
        )
      );
      
      const autoMessage = `Olá ${match.userName}! Gostaríamos de fazer um acompanhamento da adoção de ${match.petName}. Entraremos em contato no dia ${formattedDate}. Obrigado!`;
      setNotificationMessage(autoMessage);
      
      setSelectedMatch(match);
      setShowNotifyDialog(true);
      
      toast.success("Acompanhamento agendado com sucesso!");
    }
  };

  const completeAdoption = async (matchId: string) => {
    const success = await updateAdoptionStage(
      matchId, 
      "completed", 
      undefined, 
      undefined, 
      undefined, 
      true, 
      true
    );
    
    if (success) {
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
    }
  };

  const handleCompleteAdoption = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    
    if (match) {
      setSelectedMatch(match);
      setShowAdoptionContract(true);
      
      completeAdoption(matchId);
      
      const autoMessage = generateAdoptionStageMessage(match.petName, "completed");
      setNotificationMessage(autoMessage);
      
      setShowNotifyDialog(true);
      
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 14);
      
      handleScheduleFollowUp(match, followUpDate, "Primeiro acompanhamento pós-adoção");
    }
  };

  const matchesByStage = adoptionStages.reduce((acc, stage) => {
    acc[stage.id] = filteredMatches.filter(match => match.currentStage === stage.id);
    return acc;
  }, {} as Record<AdoptionStage, AdoptionMatch[]>);

  return (
    <Tabs defaultValue="management" className="w-full space-y-6">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="management">Gerenciamento de Adoções</TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="followups" className="flex items-center">
          Acompanhamentos
          {pendingFollowUps.length > 0 && (
            <Badge variant="destructive" className="ml-2">{pendingFollowUps.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard">
        <UserMetricsDashboard />
      </TabsContent>
      
      <TabsContent value="followups">
        <Card>
          <CardHeader>
            <CardTitle>Acompanhamentos Pendentes</CardTitle>
            <CardDescription>
              Acompanhamentos agendados que precisam ser realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingFollowUps.length > 0 ? (
              <div className="space-y-4">
                {pendingFollowUps.map(match => (
                  <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg bg-amber-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-full">
                        <Bell className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{match.petName} ({match.userName})</h3>
                        <p className="text-sm text-muted-foreground">
                          Acompanhamento agendado: {formatDate(match.nextFollowUpDate || '')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedMatch(match);
                          setShowFollowUpDialog(true);
                        }}
                      >
                        <Calendar className="mr-1 h-4 w-4" />
                        Reagendar
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => {
                          setSelectedMatch(match);
                          setNotificationMessage(
                            `Olá ${match.userName}! Estamos realizando o acompanhamento da adoção de ${match.petName}. Como está tudo? Por favor nos atualize sobre a adaptação.`
                          );
                          setShowNotifyDialog(true);
                        }}
                      >
                        Notificar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Nenhum acompanhamento pendente.
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="management">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Gerenciamento de Adoções</CardTitle>
                <CardDescription>
                  Acompanhe e gerencie o processo de adoção dos animais
                </CardDescription>
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email, telefone..."
                    className="pl-8 w-full md:w-[240px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {adoptionStages.map(stage => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Tabs 
              defaultValue="all" 
              className="w-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  Todos ({filteredMatches.length})
                </TabsTrigger>
                {adoptionStages.map(stage => (
                  <TabsTrigger key={stage.id} value={stage.id}>
                    {stage.label} ({matchesByStage[stage.id]?.length || 0})
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredMatches.length > 0 ? (
                    filteredMatches.map(match => (
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
                      {searchTerm || statusFilter !== "all" ? 
                        "Nenhuma solicitação de adoção encontrada com os filtros atuais." :
                        "Nenhuma solicitação de adoção encontrada."
                      }
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {adoptionStages.map(stage => (
                <TabsContent key={stage.id} value={stage.id}>
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : matchesByStage[stage.id]?.length > 0 ? (
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
          </CardContent>
        </Card>
        
        <NotificationDialog 
          open={showNotifyDialog}
          onOpenChange={setShowNotifyDialog}
          match={selectedMatch}
          message={notificationMessage}
          onMessageChange={setNotificationMessage}
          onSend={handleSendNotification}
        />
        
        <AdoptionContractDialog 
          open={showAdoptionContract}
          onOpenChange={setShowAdoptionContract}
          match={selectedMatch}
        />
        
        <FollowUpDialog
          open={showFollowUpDialog}
          onOpenChange={setShowFollowUpDialog}
          match={selectedMatch}
          onSubmit={handleScheduleFollowUp}
        />
        
        <RejectionDialog
          open={showRejectionDialog}
          onOpenChange={setShowRejectionDialog}
          onConfirm={(reason) => {
            if (selectedMatch) {
              handleRejectAdoption(selectedMatch.id, reason);
            }
          }}
          petName={selectedMatch?.petName || ''}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AdoptionManagement;
