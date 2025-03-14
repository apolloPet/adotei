
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Filter, ArrowLeft } from 'lucide-react';
import PartnerRequestCard, { PartnerRequestCardProps } from './PartnerRequestCard';

// Mock data for partner requests
const mockPartnerRequests: PartnerRequestCardProps[] = [
  {
    id: '1',
    companyName: 'Pets Health Tech',
    contactName: 'João Silva',
    email: 'joao@petshealth.com',
    phone: '11 99999-8888',
    date: '2023-05-15',
    status: 'new',
    onStatusChange: () => {}
  },
  {
    id: '2',
    companyName: 'Animal Care Solutions',
    contactName: 'Maria Oliveira',
    email: 'maria@animalcare.com',
    phone: '11 97777-6666',
    date: '2023-05-10',
    status: 'contacted',
    onStatusChange: () => {}
  },
  {
    id: '3',
    companyName: 'Pet Smart Technologies',
    contactName: 'Carlos Santos',
    email: 'carlos@petsmart.com',
    phone: '11 95555-4444',
    date: '2023-05-05',
    status: 'in_progress',
    onStatusChange: () => {}
  },
];

const PartnershipRequests = () => {
  const [requests, setRequests] = useState(mockPartnerRequests);

  const handleStatusChange = (id: string, status: string) => {
    setRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, status: status as any } : request
      )
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Solicitações de Parceria</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Nenhuma solicitação de parceria encontrada.</p>
        ) : (
          requests.map(request => (
            <PartnerRequestCard 
              key={request.id}
              {...request}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default PartnershipRequests;
