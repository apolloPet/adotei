
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-sonner";
import { AlertTriangle, Bell, Info } from "lucide-react";
import { 
  fetchAdoptions, 
  updateAdoptionStage,
  getPendingFollowUps
} from '@/services/adoptionService';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdoptionStage } from "@/components/adoption/AdoptionStages";
import { AdoptionMatch } from './types';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdoptionDetailsPanel from './AdoptionDetailsPanel';

interface AdoptionManagementProps {
  // Define any props here
}

const AdoptionManagement: React.FC<AdoptionManagementProps> = () => {
  const [matches, setMatches] = useState<AdoptionMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingFollowUps, setPendingFollowUps] = useState<AdoptionMatch[]>([]);
  const [showPendingFollowUps, setShowPendingFollowUps] = useState(false);
  const [selectedAdoption, setSelectedAdoption] = useState<AdoptionMatch | null>(null);
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<AdoptionStage | 'all'>('all');
  const [rejectionReason, setRejectionReason] = useState('');
  
  useEffect(() => {
    fetchMatchData();
    fetchPendingFollowUps();
  }, []);

  const fetchMatchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching adoption matches...');
      const adoptionMatches = await fetchAdoptions();
      console.log('Fetched adoption matches:', adoptionMatches);
      
      if (adoptionMatches && adoptionMatches.length > 0) {
        setMatches(adoptionMatches);
        toast.success(`${adoptionMatches.length} solicitações de adoção carregadas`);
      } else {
        console.warn('No adoption matches found, using mock data');
        if (import.meta.env.DEV) {
          const { mockAdoptionMatches } = await import('./types');
          setMatches(mockAdoptionMatches);
          toast.info('Dados mockados carregados para desenvolvimento');
        } else {
          setMatches([]);
          toast.info('Nenhuma solicitação de adoção encontrada');
        }
      }
    } catch (error) {
      console.error('Error fetching adoption matches:', error);
      setError('Erro ao carregar solicitações de adoção.');
      toast.error('Erro ao carregar solicitações de adoção');
      
      if (import.meta.env.DEV) {
        const { mockAdoptionMatches } = await import('./types');
        setMatches(mockAdoptionMatches);
        toast.info('Dados mockados carregados para desenvolvimento devido a erro');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingFollowUps = async () => {
    try {
      const followUps = await getPendingFollowUps();
      setPendingFollowUps(followUps);
    } catch (error) {
      console.error('Error fetching pending follow-ups:', error);
      toast.error('Erro ao carregar acompanhamentos pendentes');
    }
  };

  const handleStageChange = async (newStage: AdoptionStage) => {
    if (!selectedAdoption) return;
    
    try {
      setIsLoading(true);
      
      // Confirm for rejections
      if (newStage === 'rejected' && !rejectionReason) {
        toast.error('É necessário informar o motivo da rejeição');
        return;
      }
      
      console.log(`Updating adoption ${selectedAdoption.id} to stage ${newStage}`);
      console.log('Additional data:', { 
        notes, 
        rejectionReason: newStage === 'rejected' ? rejectionReason : undefined
      });
      
      await updateAdoptionStage(
        selectedAdoption.id, 
        newStage,
        notes,
        newStage === 'rejected' ? rejectionReason : undefined
      );
      
      await fetchMatchData();
      setShowStageDialog(false);
      setNotes('');
      setRejectionReason('');
      toast.success(`Status da adoção atualizado para: ${getStageLabel(newStage)}`);
    } catch (error) {
      console.error('Error updating adoption stage:', error);
      toast.error('Erro ao atualizar estágio da adoção');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStageDialog = (adoption: AdoptionMatch) => {
    setSelectedAdoption(adoption);
    setNotes(adoption.notes || '');
    setShowStageDialog(true);
    setRejectionReason('');
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  // Mapeia o estágio detalhado para um status simplificado exibido ao admin
  type SimpleStatus = 'new' | 'in_review' | 'approved' | 'rejected';
  const getSimpleStatus = (stage: AdoptionStage): SimpleStatus => {
    switch (stage) {
      case 'interested': return 'new';
      case 'pending_approval':
      case 'visit_scheduled':
      case 'home_inspection': return 'in_review';
      case 'approved':
      case 'completed': return 'approved';
      case 'rejected': return 'rejected';
      default: return 'in_review';
    }
  };

  const getSimpleStatusLabel = (s: SimpleStatus): string => ({
    new: 'Novo Interesse',
    in_review: 'Em Análise',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
  }[s]);

  const getSimpleStatusClasses = (s: SimpleStatus): string => ({
    new: 'bg-pink-100 text-pink-800 border-pink-200',
    in_review: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }[s]);

  const getStageColor = (stage: AdoptionStage): "default" | "secondary" | "destructive" | "outline" => {
    switch (stage) {
      case 'rejected': return "destructive";
      case 'completed':
      case 'approved': return "default";
      default: return "secondary";
    }
  };

  const getStageLabel = (stage: AdoptionStage): string => {
    switch (stage) {
      case 'interested': return 'Interesse Demonstrado';
      case 'pending_approval': return 'Em Análise';
      case 'approved': return 'Aprovado';
      case 'visit_scheduled': return 'Visita Agendada';
      case 'home_inspection': return 'Inspeção Domiciliar';
      case 'completed': return 'Concluído';
      case 'rejected': return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  const filteredMatches = activeTab === 'all'
    ? matches
    : matches.filter(match => getSimpleStatus(match.currentStage) === (activeTab as unknown as SimpleStatus));

  const nextAvailableStages = (currentStage: AdoptionStage): AdoptionStage[] => {
    switch(currentStage) {
      case 'interested':
        return ['pending_approval', 'rejected'];
      case 'pending_approval':
        return ['approved', 'rejected'];
      case 'approved':
        return ['visit_scheduled', 'rejected'];
      case 'visit_scheduled':
        return ['home_inspection', 'rejected'];
      case 'home_inspection':
        return ['completed', 'rejected'];
      case 'completed':
        return [];
      case 'rejected':
        return ['interested'];
      default:
        return [];
    }
  };
  
  const handleRefresh = async () => {
    await fetchMatchData();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Gerenciamento de Adoções</CardTitle>
          <CardDescription>Acompanhe e gerencie as solicitações de adoção</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Atualizar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => {
              setShowPendingFollowUps(true);
            }}
          >
            <Bell className="h-4 w-4" />
            {pendingFollowUps.length > 0 ? pendingFollowUps.length.toString() : "0"} acompanhamentos
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AdoptionStage | 'all')} className="mb-6">
          <TabsList className="w-full mb-4 overflow-x-auto flex flex-nowrap whitespace-nowrap">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="interested">Interesse</TabsTrigger>
            <TabsTrigger value="pending_approval">Em Análise</TabsTrigger>
            <TabsTrigger value="approved">Aprovados</TabsTrigger>
            <TabsTrigger value="visit_scheduled">Visita Agendada</TabsTrigger>
            <TabsTrigger value="home_inspection">Inspeção</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <AlertTriangle className="h-8 w-8 mb-2 text-red-500" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => fetchMatchData()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Animal</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Data da Solicitação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">{match.userName}</TableCell>
                    <TableCell>{match.petName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{match.userPhone}</span>
                        <span className="text-sm text-muted-foreground">{match.userEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(match.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={getStageColor(match.currentStage) as "default" | "secondary" | "destructive" | "outline"}>
                        {getStageLabel(match.currentStage)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenStageDialog(match)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        disabled={match.currentStage === 'completed' || isLoading}
                      >
                        Atualizar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <Info className="h-8 w-8 mb-2 text-amber-500" />
            <p>Nenhuma solicitação de adoção encontrada neste estágio.</p>
            {activeTab !== 'all' && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setActiveTab('all')}
              >
                Ver todas as solicitações
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      <Dialog open={showPendingFollowUps} onOpenChange={setShowPendingFollowUps}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acompanhamentos Pendentes</DialogTitle>
            <DialogDescription>
              Lista de adoções que necessitam de acompanhamento.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] w-full">
            {pendingFollowUps.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {pendingFollowUps.map((followUp) => (
                  <div key={followUp.id} className="py-4">
                    <p className="text-sm font-medium">
                      Adoção ID: {followUp.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Animal: {followUp.petName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Data da Adoção: {formatDate(followUp.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum acompanhamento pendente no momento.
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="sm:justify-start">
            <Button type="button" onClick={() => setShowPendingFollowUps(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showStageDialog} onOpenChange={setShowStageDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Análise da Solicitação de Adoção</DialogTitle>
            <DialogDescription>
              {selectedAdoption && (
                <>Adoção: {selectedAdoption.petName} por {selectedAdoption.userName}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedAdoption && <AdoptionDetailsPanel match={selectedAdoption} />}

            <div className="space-y-2">
              <h4 className="font-medium">Estágio Atual</h4>
              <Badge variant={selectedAdoption ? getStageColor(selectedAdoption.currentStage) : "secondary"}>
                {selectedAdoption ? getStageLabel(selectedAdoption.currentStage) : ''}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Notas</h4>
              <Textarea
                placeholder="Adicione observações sobre este processo de adoção..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            {selectedAdoption && (
              <div className="space-y-2">
                <h4 className="font-medium">Próximo Estágio</h4>
                <div className="flex flex-wrap gap-2">
                  {nextAvailableStages(selectedAdoption.currentStage).map((stage) => (
                    <React.Fragment key={stage}>
                      {stage === 'rejected' ? (
                        <div className="w-full">
                          <Button 
                            variant="destructive"
                            size="sm"
                            className="mb-2"
                            onClick={() => {
                              if (window.confirm("Tem certeza que deseja rejeitar esta adoção?")) {
                                setRejectionReason('');
                                const dialogElem = document.getElementById('rejection-reason');
                                if (dialogElem) {
                                  (dialogElem as HTMLDialogElement).showModal();
                                }
                              }
                            }}
                          >
                            Rejeitar Adoção
                          </Button>
                          
                          <dialog id="rejection-reason" className="p-6 rounded-lg shadow-lg border border-gray-200">
                            <h3 className="text-lg font-medium mb-4">Motivo da Rejeição</h3>
                            <Textarea
                              placeholder="Informe o motivo da rejeição..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              rows={3}
                              className="mb-4"
                            />
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  const dialogElem = document.getElementById('rejection-reason');
                                  if (dialogElem) {
                                    (dialogElem as HTMLDialogElement).close();
                                  }
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => {
                                  if (rejectionReason.trim() === '') {
                                    toast.error('Por favor, informe o motivo da rejeição');
                                    return;
                                  }
                                  
                                  const dialogElem = document.getElementById('rejection-reason');
                                  if (dialogElem) {
                                    (dialogElem as HTMLDialogElement).close();
                                  }
                                  
                                  handleStageChange('rejected');
                                }}
                              >
                                Confirmar Rejeição
                              </Button>
                            </div>
                          </dialog>
                        </div>
                      ) : (
                        <Button 
                          key={stage}
                          variant={stage === 'completed' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleStageChange(stage)}
                          disabled={isLoading}
                        >
                          {getStageLabel(stage)}
                        </Button>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setShowStageDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdoptionManagement;
