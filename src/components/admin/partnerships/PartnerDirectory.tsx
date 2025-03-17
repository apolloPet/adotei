
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, ExternalLink, Phone, Mail, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendWhatsAppMessage } from '@/utils/whatsappUtils';

// Definição de tipos
interface Partner {
  id: string;
  name: string;
  type: string;
  description: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
}

const PARTNER_TYPES = [
  "Clínica Veterinária",
  "Pet Shop",
  "Fornecedor de Ração",
  "Fornecedor de Medicamentos",
  "Serviço de Banho e Tosa",
  "Adestrador",
  "Transporte de Animais",
  "Hotel para Pets",
  "Outro"
];

// Mock data inicial
const INITIAL_PARTNERS: Partner[] = [
  {
    id: "1",
    name: "Clínica Veterinária PetVida",
    type: "Clínica Veterinária",
    description: "Clínica veterinária especializada em cães e gatos com atendimento 24h.",
    phone: "11912345678",
    email: "contato@petvida.com",
    website: "https://www.petvida.com",
    address: "Rua das Flores, 123 - São Paulo, SP",
    contactPerson: "Dra. Ana Silva",
    notes: "Parceria com desconto de 15% para pets do abrigo."
  },
  {
    id: "2",
    name: "Rações Premium",
    type: "Fornecedor de Ração",
    description: "Fornecedor de rações premium para cães e gatos.",
    phone: "11987654321",
    email: "vendas@racoespremium.com",
    website: "https://www.racoespremium.com",
    contactPerson: "Carlos Oliveira",
    notes: "Entrega grátis para pedidos acima de R$300."
  },
  {
    id: "3",
    name: "PetTaxi",
    type: "Transporte de Animais",
    description: "Serviço de transporte especializado para animais de estimação.",
    phone: "11955556666",
    email: "contato@pettaxi.com",
    contactPerson: "Roberto Almeida"
  }
];

const PartnerDirectory = () => {
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPartner, setNewPartner] = useState<Omit<Partner, 'id'>>({
    name: "",
    type: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    contactPerson: "",
    notes: ""
  });

  // Filtrar parceiros com base no termo de pesquisa
  const filteredPartners = partners.filter(partner => 
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manipular mudanças no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPartner(prev => ({ ...prev, [name]: value }));
  };

  // Manipular seleção de tipo
  const handleTypeSelect = (value: string) => {
    setNewPartner(prev => ({ ...prev, type: value }));
  };

  // Adicionar novo parceiro
  const handleAddPartner = () => {
    if (!newPartner.name || !newPartner.type || !newPartner.phone || !newPartner.email) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const newId = (partners.length + 1).toString();
    const partnerToAdd = { ...newPartner, id: newId };
    
    setPartners(prev => [...prev, partnerToAdd as Partner]);
    
    // Reset form
    setNewPartner({
      name: "",
      type: "",
      description: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      contactPerson: "",
      notes: ""
    });
    
    setIsAddDialogOpen(false);
    toast.success("Fornecedor adicionado com sucesso!");
  };

  // Enviar mensagem via WhatsApp
  const handleWhatsAppContact = (partner: Partner) => {
    const message = `Olá ${partner.contactPerson || partner.name}, gostaria de mais informações sobre seus serviços.`;
    const phone = partner.phone.replace(/\D/g, '');
    
    sendWhatsAppMessage(phone, message);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Diretório de Fornecedores</CardTitle>
            <CardDescription>Gerencie seus fornecedores e parceiros</CardDescription>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Fornecedor</DialogTitle>
                <DialogDescription>
                  Preencha as informações do fornecedor. Os campos com * são obrigatórios.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newPartner.name}
                    onChange={handleInputChange}
                    placeholder="Nome da empresa"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={newPartner.type} onValueChange={handleTypeSelect}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecione o tipo de fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTNER_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newPartner.description}
                    onChange={handleInputChange}
                    placeholder="Breve descrição dos serviços oferecidos"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={newPartner.phone}
                      onChange={handleInputChange}
                      placeholder="Ex: 11912345678"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      value={newPartner.email}
                      onChange={handleInputChange}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={newPartner.website}
                    onChange={handleInputChange}
                    placeholder="https://www.exemplo.com"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    name="address"
                    value={newPartner.address}
                    onChange={handleInputChange}
                    placeholder="Rua, número, cidade, estado"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="contactPerson">Pessoa de Contato</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={newPartner.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Nome da pessoa de contato"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={newPartner.notes}
                    onChange={handleInputChange}
                    placeholder="Condições especiais, descontos, observações gerais..."
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" onClick={handleAddPartner}>Adicionar Fornecedor</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar fornecedores..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPartners.length > 0 ? (
              filteredPartners.map(partner => (
                <Card key={partner.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">{partner.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground mb-3">{partner.description}</p>
                    
                    <div className="space-y-2">
                      {partner.contactPerson && (
                        <div className="text-sm">
                          <span className="font-medium">Contato:</span> {partner.contactPerson}
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{partner.phone}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{partner.email}</span>
                      </div>
                      
                      {partner.website && (
                        <div className="flex items-center text-sm">
                          <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleWhatsAppContact(partner)}
                      className="flex items-center"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contato WhatsApp
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-2 py-10 text-center">
                <p className="text-muted-foreground">Nenhum fornecedor encontrado.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PartnerDirectory;
