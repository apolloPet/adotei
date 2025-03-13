
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Solicitações de Parceria</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            Filtrar
          </Button>
        </div>
      </div>
      
      {requests.map(request => (
        <PartnerRequestCard 
          key={request.id}
          {...request}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
};

export default PartnershipRequests;
