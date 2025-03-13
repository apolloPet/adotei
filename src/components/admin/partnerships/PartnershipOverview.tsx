
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Handshake, Mail, Users } from 'lucide-react';

const PartnershipOverview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Programa de Parcerias Tech Animal</CardTitle>
        <CardDescription>
          Conectando empresas tecnológicas ao ecossistema de cuidados animais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Parcerias Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">12</div>
              <p className="text-sm text-muted-foreground">Empresas parceiras</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Novos Interesses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">5</div>
              <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Em Negociação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">8</div>
              <p className="text-sm text-muted-foreground">Parcerias em progresso</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Benefícios para Parceiros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Acesso à Rede</h4>
                <p className="text-sm text-muted-foreground">
                  Conecte-se com ONGs, veterinários e tutores de animais.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Visibilidade da Marca</h4>
                <p className="text-sm text-muted-foreground">
                  Exposição para um público engajado e apaixonado por pets.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Handshake className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Oportunidades de Negócio</h4>
                <p className="text-sm text-muted-foreground">
                  Desenvolva novos produtos e serviços no ecossistema animal.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Suporte Técnico</h4>
                <p className="text-sm text-muted-foreground">
                  Integração facilitada com nossa plataforma e APIs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnershipOverview;
