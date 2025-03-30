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
  }, [matches, searchTerm, statusFilter, activeTab]);

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
    
    if (activeTab !== "all") {
      filtered = filtered.filter(match => match.currentStage === activeTab);
    }
    
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
      
      const success = await updateAdoptionStage(matchId, newStage, notes);
      
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
      const success = await updateAdoptionStage(matchId, 'rejected', undefined, reason);
      
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
      updatedNotes
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
      updatedNotes
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
      
      const autoMessage = `Olá ${match.userName}! Gostaríamos de agendar uma visita de inspeção domiciliar para o processo de adoção do ${match.petName}. A data sugerida é ${formattedDate} às ${time}. Por favor, confirme se esta data é conveniente para você. Obrigado!`;
      setNotificationMessage(autoMessage);
      
      setSelectedMatch(match);
      setShowNotifyDialog(true);
      
      toast.success("Inspeção domiciliar agendada com sucesso!");
    }
  };

  const handleCompleteAdoption = async (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    
    if (match) {
      setSelectedMatch(match);
      setShowAdoptionContract(true);
    }
  };

  const handleAdoptionContractSigned = async (matchId: string, contractSigned: boolean, paymentComplete: boolean) => {
    const match = matches.find(m => m.id === matchId);
    
    if (match) {
      const success = await updateAdoptionStage(
        matchId, 
        "completed", 
        `${match.notes}\n\nAdoção concluída. Contrato ${contractSigned ? 'assinado' : 'não assinado'}. Pagamento ${paymentComplete ? 'completo' : 'pendente'}.`
      );
      
      if (success) {
        setMatches(prevMatches => 
          prevMatches.map(m => 
            m.id === matchId 
              ? { 
                  ...m, 
                  currentStage: "completed", 
                  updatedAt: new Date().toISOString() 
                } 
              : m
          )
        );
        
        setShowAdoptionContract(false);
        
        const autoMessage = `Parabéns ${match.userName}! A adoção do ${match.petName} foi concluída com sucesso. Desejamos muita alegria a vocês nessa nova jornada. Nossa equipe entrará em contato para acompanhamento nos próximos 30 dias.`;
        setNotificationMessage(autoMessage);
        
        setSelectedMatch(match);
        setShowNotifyDialog(true);
        
        toast.success(`Adoção concluída com sucesso!`);
      }
    }
  };

  const handleRecordFollowUp = async (matchId: string, status: string, notes: string, nextDate: Date | null) => {
    const match = matches.find(m => m.id === matchId);
    
    if (!match) {
      toast.error("Adoção não encontrada");
      return;
    }
    
    try {
      const success = await createFollowUpRecord(matchId, status, notes);
      
      if (success) {
        setPendingFollowUps(prevFollowUps => 
          prevFollowUps.filter(f => f.id !== matchId)
        );
        
        setShowFollowUpDialog(false);
        toast.success("Acompanhamento registrado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao registrar acompanhamento:", error);
      toast.error("Erro ao registrar acompanhamento");
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">Gerenciamento de Adoções</CardTitle>
        <CardDescription>
          Acompanhe e gerencie os processos de adoção em diferentes estágios.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-full md:w-2/3">
              <UserMetricsDashboard />
            </div>
            
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex gap-2">
                <Input 
                  placeholder="Buscar adoções..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                  prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                />
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estágios</SelectItem>
                    {adoptionStages.map(stage => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {pendingFollowUps.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full flex gap-2 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  onClick={() => {
                    setSelectedMatch(pendingFollowUps[0]);
                    setShowFollowUpDialog(true);
                  }}
                >
                  <Bell className="h-4 w-4" />
                  {pendingFollowUps.length} acompanhamentos pendentes
                </Button>
              )}
            </div>
          </div>
          
          <Tabs 
            defaultValue="all" 
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all">
                Todos 
                <Badge variant="outline" className="ml-2 bg-gray-100">
                  {matches.length.toString()}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="interested">
                Interessados
                <Badge variant="outline" className="ml-2 bg-blue-100">
                  {matches.filter(m => m.currentStage === "interested").length.toString()}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Aprovados
                <Badge variant="outline" className="ml-2 bg-green-100">
                  {matches.filter(m => ["approved", "visit_scheduled", "home_inspection"].includes(m.currentStage)).length.toString()}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Concluídos
                <Badge variant="outline" className="ml-2 bg-purple-100">
                  {matches.filter(m => m.currentStage === "completed").length.toString()}
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="text-center p-8">Carregando...</div>
              ) : filteredMatches.length > 0 ? (
                <div className="grid gap-4">
                  {filteredMatches.map(match => (
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
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  Nenhuma adoção encontrada com os filtros aplicados.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="interested" className="space-y-4">
              {isLoading ? (
                <div className="text-center p-8">Carregando...</div>
              ) : filteredMatches.filter(m => m.currentStage === "interested").length > 0 ? (
                <div className="grid gap-4">
                  {filteredMatches
                    .filter(m => m.currentStage === "interested")
                    .map(match => (
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
                    ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  Nenhuma adoção no estágio "Interessados" encontrada.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approved" className="space-y-4">
              {isLoading ? (
                <div className="text-center p-8">Carregando...</div>
              ) : filteredMatches.filter(m => ["approved", "visit_scheduled", "home_inspection"].includes(m.currentStage)).length > 0 ? (
                <div className="grid gap-4">
                  {filteredMatches
                    .filter(m => ["approved", "visit_scheduled", "home_inspection"].includes(m.currentStage))
                    .map(match => (
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
                    ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  Nenhuma adoção nos estágios "Aprovados/Agendados" encontrada.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {isLoading ? (
                <div className="text-center p-8">Carregando...</div>
              ) : filteredMatches.filter(m => m.currentStage === "completed").length > 0 ? (
                <div className="grid gap-4">
                  {filteredMatches
                    .filter(m => m.currentStage === "completed")
                    .map(match => (
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
                    ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  Nenhuma adoção no estágio "Concluídos" encontrada.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      
      {selectedMatch && (
        <>
          <NotificationDialog 
            open={showNotifyDialog}
            onOpenChange={setShowNotifyDialog}
            message={notificationMessage}
            onSend={handleSendNotification}
            onMessageChange={setNotificationMessage}
            recipient={selectedMatch?.userName || ""}
            phone={selectedMatch?.userPhone || ""}
          />
          
          <AdoptionContractDialog 
            open={showAdoptionContract}
            onOpenChange={setShowAdoptionContract}
            match={selectedMatch}
            onComplete={handleAdoptionContractSigned}
          />
          
          <FollowUpDialog 
            open={showFollowUpDialog}
            onOpenChange={setShowFollowUpDialog}
            match={selectedMatch}
            onSubmit={handleRecordFollowUp}
          />
          
          <RejectionDialog 
            open={showRejectionDialog}
            onOpenChange={setShowRejectionDialog}
            matchId={selectedMatch?.id || ""}
            petName={selectedMatch?.petName || ""}
            onReject={handleRejectAdoption}
          />
        </>
      )}
    </Card>
  );
};

export default AdoptionManagement;
