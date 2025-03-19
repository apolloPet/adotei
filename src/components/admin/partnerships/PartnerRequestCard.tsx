
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare } from 'lucide-react';
import { toast } from "@/hooks/use-sonner";
import { updatePartnershipStatus, Partnership } from '@/services/partnershipService';
import { sendWhatsAppMessage } from '@/utils/whatsappUtils';

export interface PartnerRequestCardProps {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  date: string;
  status: Partnership['status'];
  notes?: string;
  onStatusChange: (id: string, status: Partnership['status']) => void;
}

export const statusOptions = [
  { value: 'pending', label: 'Novo' },
  { value: 'contacted', label: 'Contatado' },
  { value: 'in_progress', label: 'Em Progresso' },
  { value: 'partnered', label: 'Parceria Fechada' },
  { value: 'declined', label: 'Recusado' }
];

const PartnerRequestCard = ({ 
  id, 
  companyName, 
  contactName, 
  email, 
  phone, 
  date, 
  status, 
  notes,
  onStatusChange 
}: PartnerRequestCardProps) => {
  const [currentStatus, setCurrentStatus] = useState<Partnership['status']>(status);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleStatusChange = async (newStatus: Partnership['status']) => {
    setIsUpdating(true);
    try {
      const updated = await updatePartnershipStatus(id, newStatus, notes);
      
      if (updated) {
        setCurrentStatus(newStatus);
        onStatusChange(id, newStatus);
        toast.success(`Status alterado para: ${statusOptions.find(option => option.value === newStatus)?.label}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getStatusBadgeClass = () => {
    switch(currentStatus) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'partnered': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = () => {
    return statusOptions.find(option => option.value === currentStatus)?.label || 'Desconhecido';
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleWhatsAppContact = () => {
    const message = `Olá ${contactName}, estamos entrando em contato sobre sua solicitação de parceria com nossa plataforma.`;
    sendWhatsAppMessage(phone, message);
  };

  const handleEmailContact = () => {
    window.location.href = `mailto:${email}?subject=Solicitação%20de%20Parceria&body=Olá%20${contactName},%0A%0AEstamos%20entrando%20em%20contato%20sobre%20sua%20solicitação%20de%20parceria%20com%20nossa%20plataforma.%0A%0AAtenciosamente,%0AEquipe%20Pet%20Match`;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{companyName}</CardTitle>
            <CardDescription>{contactName} • {formatDate(date)}</CardDescription>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass()}`}>
            {getStatusLabel()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground text-xs">Email</Label>
            <p className="font-medium">{email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Telefone</Label>
            <p className="font-medium">{phone}</p>
          </div>
        </div>
        {notes && (
          <div className="mt-3">
            <Label className="text-muted-foreground text-xs">Observações</Label>
            <p className="text-sm mt-1">{notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleEmailContact}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleWhatsAppContact}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
        </div>
        <select 
          className="rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value as Partnership['status'])}
          disabled={isUpdating}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </CardFooter>
    </Card>
  );
};

export default PartnerRequestCard;
