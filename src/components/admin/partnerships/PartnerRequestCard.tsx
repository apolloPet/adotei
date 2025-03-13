
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail } from 'lucide-react';
import { toast } from "sonner";

export interface PartnerRequestCardProps {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  date: string;
  status: 'new' | 'contacted' | 'in_progress' | 'partnered' | 'declined';
  onStatusChange: (id: string, status: string) => void;
}

export const statusOptions = [
  { value: 'new', label: 'Novo' },
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
  onStatusChange 
}: PartnerRequestCardProps) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  
  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus as any);
    onStatusChange(id, newStatus);
    toast.success(`Status alterado para: ${statusOptions.find(option => option.value === newStatus)?.label}`);
  };
  
  const getStatusBadgeClass = () => {
    switch(currentStatus) {
      case 'new': return 'bg-blue-100 text-blue-800';
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
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Enviar Email
        </Button>
        <select 
          className="rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          value={currentStatus}
          onChange={(e) => handleStatusChange(e.target.value)}
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
