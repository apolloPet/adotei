
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Handshake, Users, Calculator, Book } from 'lucide-react';
import { 
  PartnershipOverview, 
  PartnershipForm, 
  PartnershipRequests,
  CostSimulator,
  PartnerDirectory
} from './partnerships';

const PartnershipInterest = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Handshake className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="registration" className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            Registro de Interesse
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Solicitações
          </TabsTrigger>
          <TabsTrigger value="directory" className="flex items-center gap-1">
            <Book className="h-4 w-4" />
            Diretório
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex items-center gap-1">
            <Calculator className="h-4 w-4" />
            Simulador de Custos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <PartnershipOverview />
        </TabsContent>
        
        <TabsContent value="registration">
          <PartnershipForm />
        </TabsContent>
        
        <TabsContent value="requests">
          <PartnershipRequests />
        </TabsContent>
        
        <TabsContent value="directory">
          <PartnerDirectory />
        </TabsContent>
        
        <TabsContent value="simulator">
          <CostSimulator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnershipInterest;
