
import React, { useState, useEffect } from 'react';
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
import { Plus, Search, ExternalLink, Phone, Mail, MessageSquare, Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendWhatsAppMessage } from '@/utils/whatsappUtils';
import { createSupplier, getSuppliers, rateSupplier, Supplier } from '@/services/supplierService';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  type: z.string().min(1, { message: "Tipo é obrigatório" }),
  description: z.string().optional(),
  phone: z.string().min(10, { message: "Telefone deve ter pelo menos 10 dígitos" }),
  email: z.string().email({ message: "Email inválido" }),
  website: z.string().url({ message: "URL inválida" }).optional().or(z.literal('')),
  address: z.string().optional(),
  contact_person: z.string().optional(),
  notes: z.string().optional()
});

const PartnerDirectory = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      contact_person: "",
      notes: ""
    }
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, typeFilter]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    let filtered = [...suppliers];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(supplier => 
        supplier.name.toLowerCase().includes(term) ||
        supplier.type.toLowerCase().includes(term) ||
        (supplier.description && supplier.description.toLowerCase().includes(term))
      );
    }
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(supplier => supplier.type === typeFilter);
    }
    
    setFilteredSuppliers(filtered);
  };

  const handleAddSupplier = async (data: z.infer<typeof formSchema>) => {
    try {
      // The form validation ensures required fields are present
      const newSupplier = await createSupplier({
        name: data.name,
        type: data.type,
        description: data.description,
        phone: data.phone,
        email: data.email,
        website: data.website,
        address: data.address,
        contact_person: data.contact_person,
        notes: data.notes
      });
      
      if (newSupplier) {
        setSuppliers(prev => [...prev, newSupplier]);
        setIsAddDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error("Erro ao adicionar fornecedor");
    }
  };

  const handleRateSupplier = async () => {
    if (!currentSupplier) return;
    
    try {
      const success = await rateSupplier(
        currentSupplier.id,
        ratingValue,
        ratingComment
      );
      
      if (success) {
        // Refresh suppliers to get updated ratings
        fetchSuppliers();
        setIsRatingDialogOpen(false);
        setRatingValue(0);
        setRatingComment("");
        setCurrentSupplier(null);
      }
    } catch (error) {
      console.error("Error rating supplier:", error);
      toast.error("Erro ao avaliar fornecedor");
    }
  };

  const openRatingDialog = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setRatingValue(0);
    setRatingComment("");
    setIsRatingDialogOpen(true);
  };

  const handleWhatsAppContact = (partner: Supplier) => {
    const message = `Olá ${partner.contact_person || partner.name}, gostaria de mais informações sobre seus serviços.`;
    const phone = partner.phone.replace(/\D/g, '');
    
    sendWhatsAppMessage(phone, message);
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm">
          {rating ? rating.toFixed(1) : 'Sem avaliações'}
        </span>
      </div>
    );
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
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddSupplier)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome da empresa" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de fornecedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PARTNER_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Breve descrição dos serviços oferecidos"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone/WhatsApp *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ex: 11912345678"
                            />
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
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="email@exemplo.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://www.exemplo.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Rua, número, cidade, estado"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contact_person"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pessoa de Contato</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nome da pessoa de contato"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Condições especiais, descontos, observações gerais..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">Adicionar Fornecedor</Button>
                  </DialogFooter>
                </form>
              </Form>
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
          <div className="flex gap-2 mt-3 flex-wrap">
            <Badge 
              variant={!typeFilter ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setTypeFilter(null)}
            >
              Todos
            </Badge>
            {PARTNER_TYPES.map(type => (
              <Badge 
                key={type}
                variant={typeFilter === type ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
        
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <Skeleton className="h-16 w-full mb-3" />
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Skeleton className="h-4 w-4 mr-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Skeleton className="h-4 w-4 mr-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end pt-2">
                    <Skeleton className="h-9 w-32" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map(supplier => (
                  <Card key={supplier.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{supplier.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">{supplier.type}</Badge>
                          {renderRatingStars(supplier.average_rating || 0)}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground mb-3">
                        {supplier.description || "Sem descrição disponível"}
                      </p>
                      
                      <div className="space-y-2">
                        {supplier.contact_person && (
                          <div className="text-sm">
                            <span className="font-medium">Contato:</span> {supplier.contact_person}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{supplier.phone}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{supplier.email}</span>
                        </div>
                        
                        {supplier.website && (
                          <div className="flex items-center text-sm">
                            <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                            <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                        onClick={() => openRatingDialog(supplier)}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Avaliar
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleWhatsAppContact(supplier)}
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
          )}
        </ScrollArea>
        
        <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Avaliar Fornecedor</DialogTitle>
              <DialogDescription>
                {currentSupplier?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div>
                <Label>Sua avaliação</Label>
                <div className="flex items-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer ${
                        star <= ratingValue
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                      onClick={() => setRatingValue(star)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="comment">Comentário (opcional)</Label>
                <Textarea
                  id="comment"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Compartilhe sua experiência com este fornecedor..."
                  className="mt-1"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                onClick={handleRateSupplier}
                disabled={ratingValue === 0}
              >
                Enviar Avaliação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PartnerDirectory;
