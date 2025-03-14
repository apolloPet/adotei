
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdoptionStage, adoptionStages } from '../../adoption/AdoptionStages';
import { toast } from '@/hooks/use-sonner';
import { sendWhatsAppMessage, generateAdoptionStageMessage } from '@/utils/whatsappUtils';
import MatchCard from './MatchCard';
import NotificationDialog from './NotificationDialog';
import AdoptionContractDialog from './AdoptionContractDialog';
import { AdoptionMatch, formatDate, mockAdoptionMatches } from './types';
import { getStageLabel, getStageColor } from './helpers';

const AdoptionManagement = () => {
  const [matches, setMatches] = useState<AdoptionMatch[]>(mockAdoptionMatches);
  const [selectedMatch, setSelectedMatch] = useState<AdoptionMatch | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [showAdoptionContract, setShowAdoptionContract] = useState(false);

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

    const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);

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

    const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);

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
      // Show adoption contract dialog
      setSelectedMatch(match);
      setShowAdoptionContract(true);
      
      completeAdoption(matchId);
      
      const autoMessage = generateAdoptionStageMessage(match.petName, "completed");
      setNotificationMessage(autoMessage);
      
      setShowNotifyDialog(true);
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
        
        {/* Dialogs */}
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
      </CardContent>
    </Card>
  );
};

export default AdoptionManagement;
