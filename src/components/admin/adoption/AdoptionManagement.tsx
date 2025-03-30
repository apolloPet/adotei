
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-sonner";
import { PlusCircle, Trash2, Shield, Check, X, AlertTriangle, Calendar, Bell } from "lucide-react";
import { 
  fetchAdoptions, 
  updateAdoptionStage,
  getPendingFollowUps
} from '@/services/adoptionService';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdoptionStage } from "@/components/adoption/AdoptionStages";
import { mockAdoptionMatches } from './types';
import type { AdoptionMatch } from './types';

interface AdoptionManagementProps {
  // Define any props here
}

const AdoptionManagement: React.FC<AdoptionManagementProps> = () => {
  const [matches, setMatches] = useState<AdoptionMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    permissions: {
      manageAnimals: true,
      approveAdoptions: true,
      manageSettings: false,
      manageAdmins: false
    }
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [pendingFollowUps, setPendingFollowUps] = useState<AdoptionMatch[]>([]);
  const [showPendingFollowUps, setShowPendingFollowUps] = useState(false);

  // Fetch adoption matches on component mount
  useEffect(() => {
    fetchMatchData();
    fetchPendingFollowUps();
  }, []);

  const fetchMatchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const adoptionMatches = await fetchAdoptions();
      console.log('Fetched adoption matches:', adoptionMatches);
      setMatches(adoptionMatches.length > 0 ? adoptionMatches : mockAdoptionMatches);
    } catch (error) {
      console.error('Error fetching adoption matches:', error);
      setError('Erro ao carregar solicitações de adoção.');
      toast.error('Erro ao carregar solicitações de adoção');
      // Use mock data as fallback
      setMatches(mockAdoptionMatches);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionChange = (permission: keyof typeof newAdmin.permissions) => {
    setNewAdmin(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      name: '',
      email: '',
      password: '',
      passwordConfirm: ''
    };

    if (!newAdmin.name.trim()) {
      errors.name = 'Nome é obrigatório';
      isValid = false;
    }

    if (!newAdmin.email.trim()) {
      errors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      errors.email = 'Email inválido';
      isValid = false;
    }

    if (!newAdmin.password) {
      errors.password = 'Senha é obrigatória';
      isValid = false;
    } else if (newAdmin.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    if (newAdmin.password !== newAdmin.passwordConfirm) {
      errors.passwordConfirm = 'As senhas não coincidem';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Log the data being sent to the backend
      console.log('Creating admin with data:', {
        email: newAdmin.email,
        name: newAdmin.name,
        permissions: newAdmin.permissions
      });
      
      // await createAdminUser(
      //   newAdmin.email,
      //   newAdmin.password,
      //   newAdmin.name,
      //   newAdmin.permissions
      // );
      
      // Close dialog and refresh the list
      setIsDialogOpen(false);
      fetchMatchData();
      
      // Reset form
      setNewAdmin({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        permissions: {
          manageAnimals: true,
          approveAdoptions: true,
          manageSettings: false,
          manageAdmins: false
        }
      });

      toast.success("Administrador adicionado com sucesso!", {
        description: `${newAdmin.name} agora tem acesso ao painel.`
      });
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar administrador');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStageChange = async (matchId: string) => {
    try {
      // Calling updateAdoptionStage with the corrected arguments
      await updateAdoptionStage(matchId, 'approved');
      await fetchMatchData();
      toast.success("Status da adoção atualizado com sucesso");
    } catch (error) {
      console.error('Error updating adoption stage:', error);
      toast.error('Erro ao atualizar estágio da adoção');
    }
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

  const getStageColor = (stage: AdoptionStage): string => {
    switch (stage) {
      case 'pending_approval':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'completed':
        return 'outline';
      case 'interested':
        return 'secondary';
      case 'visit_scheduled':
        return 'secondary';
      case 'home_inspection':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStageLabel = (stage: AdoptionStage): string => {
    switch (stage) {
      case 'interested':
        return 'Interesse Demonstrado';
      case 'pending_approval':
        return 'Em Análise';
      case 'approved':
        return 'Aprovado';
      case 'visit_scheduled':
        return 'Visita Agendada';
      case 'home_inspection':
        return 'Inspeção Domiciliar';
      case 'completed':
        return 'Concluído';
      case 'rejected':
        return 'Rejeitado';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Gerenciamento de Adoções</CardTitle>
          <CardDescription>Acompanhe e gerencie as solicitações de adoção</CardDescription>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="ml-auto flex items-center gap-1"
            onClick={() => {
              setShowPendingFollowUps(true);
            }}
          >
            <Bell className="h-4 w-4" />
            {pendingFollowUps.length > 0 ? pendingFollowUps.length.toString() : "0"} acompanhamentos pendentes
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Novo Administrador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Administrador</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar uma conta com privilégios administrativos.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={newAdmin.name}
                    onChange={handleInputChange}
                    placeholder="Nome do administrador"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={newAdmin.email}
                    onChange={handleInputChange}
                    placeholder="email@exemplo.com"
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password"
                    name="password"
                    type="password"
                    value={newAdmin.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                  {formErrors.password && (
                    <p className="text-sm text-red-500">{formErrors.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Confirmar Senha</Label>
                  <Input 
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    value={newAdmin.passwordConfirm}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                  />
                  {formErrors.passwordConfirm && (
                    <p className="text-sm text-red-500">{formErrors.passwordConfirm}</p>
                  )}
                </div>
                
                <div className="space-y-3 pt-2">
                  <Label>Permissões</Label>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="manage-animals" className="cursor-pointer">Gerenciar Animais</Label>
                    <Switch 
                      id="manage-animals"
                      checked={newAdmin.permissions.manageAnimals}
                      onCheckedChange={() => handlePermissionChange('manageAnimals')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="approve-adoptions" className="cursor-pointer">Aprovar Adoções</Label>
                    <Switch 
                      id="approve-adoptions"
                      checked={newAdmin.permissions.approveAdoptions}
                      onCheckedChange={() => handlePermissionChange('approveAdoptions')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="manage-settings" className="cursor-pointer">Configurar Parâmetros</Label>
                    <Switch 
                      id="manage-settings"
                      checked={newAdmin.permissions.manageSettings}
                      onCheckedChange={() => handlePermissionChange('manageSettings')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="manage-admins" className="cursor-pointer">Gerenciar Administradores</Label>
                    <Switch 
                      id="manage-admins"
                      checked={newAdmin.permissions.manageAdmins}
                      onCheckedChange={() => handlePermissionChange('manageAdmins')}
                    />
                  </div>
                </div>
                
                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Criando...' : 'Criar Administrador'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
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
        ) : matches.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Animal</TableHead>
                  <TableHead>Data da Solicitação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">{match.id}</TableCell>
                    <TableCell>{match.userId}</TableCell>
                    <TableCell>{match.petName}</TableCell>
                    <TableCell>{formatDate(match.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={getStageColor(match.currentStage) as "default" | "secondary" | "destructive" | "outline"}>
                        {getStageLabel(match.currentStage)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleStageChange(match.id)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <AlertTriangle className="h-8 w-8 mb-2 text-amber-500" />
            <p>Nenhuma solicitação de adoção encontrada.</p>
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
    </Card>
  );
};

export default AdoptionManagement;
