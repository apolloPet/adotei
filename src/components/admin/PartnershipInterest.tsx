import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Building2, Users, Handshake } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const partnerFormSchema = z.object({
  companyName: z.string().min(2, { message: 'Nome da empresa é obrigatório' }),
  contactName: z.string().min(2, { message: 'Nome do contato é obrigatório' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }),
  companySize: z.string().min(1, { message: 'Selecione o tamanho da empresa' }),
  message: z.string().optional()
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

interface PartnerRequestCardProps {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  date: string;
  status: 'new' | 'contacted' | 'in_progress' | 'partnered' | 'declined';
  onStatusChange: (id: string, status: string) => void;
}

const statusOptions = [
  { value: 'new', label: 'Novo' },
  { value: 'contacted', label: 'Contatado' },
  { value: 'in_progress', label: 'Em Progresso' },
  { value: 'partnered', label: 'Parceria Fechada' },
  { value: 'declined', label: 'Recusado' }
];

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

const PartnerRequestCard = ({ id, companyName, contactName, email, phone, date, status, onStatusChange }: PartnerRequestCardProps) => {
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

const PartnershipInterest = () => {
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      companySize: '',
      message: ''
    }
  });

  const [requests, setRequests] = useState(mockPartnerRequests);

  const onSubmit = (data: PartnerFormValues) => {
    console.log('Form data:', data);
    toast.success('Formulário enviado com sucesso! Entraremos em contato em breve.');
    form.reset();
  };

  const handleStatusChange = (id: string, status: string) => {
    setRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, status: status as any } : request
      )
    );
  };

  return (
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
          Solicitações Recebidas
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
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
      </TabsContent>
      
      <TabsContent value="registration">
        <Card>
          <CardHeader>
            <CardTitle>Formulário de Interesse em Parceria</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo para manifestar interesse em se tornar um parceiro tech animal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da sua empresa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Contato</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="seu.email@empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tamanho da Empresa</FormLabel>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          {...field}
                        >
                          <option value="">Selecione...</option>
                          <option value="1-10">1-10 funcionários</option>
                          <option value="11-50">11-50 funcionários</option>
                          <option value="51-200">51-200 funcionários</option>
                          <option value="201-500">201-500 funcionários</option>
                          <option value="501+">501+ funcionários</option>
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Conte-nos como sua empresa poderia contribuir para o ecossistema tech animal..." 
                          className="h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Compartilhe detalhes sobre seu interesse na parceria, tecnologias que utiliza ou propostas de colaboração.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full md:w-auto">
                  Enviar Interesse
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="requests">
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
      </TabsContent>
    </Tabs>
  );
};

export default PartnershipInterest;
