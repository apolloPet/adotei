
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createPartnership } from '@/services/partnershipService';
import { useAuth } from '@/hooks/auth';
import { Loader2 } from 'lucide-react';

// Schema de validação aprimorado com mensagens personalizadas
const formSchema = z.object({
  company_name: z.string().min(2, { message: "Nome da empresa deve ter pelo menos 2 caracteres" }),
  contact_name: z.string().min(2, { message: "Nome do contato deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone deve ter pelo menos 10 dígitos" })
    .regex(/^[0-9()+\-\s]*$/, { message: "Telefone deve conter apenas números, parênteses, traços e espaços" }),
  company_size: z.string().optional(),
  company_website: z.string().url({ message: "URL inválida" }).optional().or(z.literal('')),
  partnership_type: z.string().min(1, { message: "Tipo de parceria é obrigatório" }),
  notes: z.string().optional()
});

// Tamanhos de empresa - usando constantes para facilitar manutenção
const COMPANY_SIZES = [
  "Micro (1-9 funcionários)",
  "Pequena (10-49 funcionários)",
  "Média (50-249 funcionários)",
  "Grande (250+ funcionários)"
];

// Tipos de parceria - usando constantes para facilitar manutenção
const PARTNERSHIP_TYPES = [
  "Clínica Veterinária",
  "Fornecedor de Produtos",
  "Abrigo de Animais",
  "Loja de Pets",
  "Serviço de Adestramento",
  "ONG",
  "Empresa de Tecnologia",
  "Marketing e Divulgação",
  "Financeiro",
  "Outros"
];

const PartnershipForm = () => {
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Inicializar formulário com react-hook-form e resolver do zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      company_size: "",
      company_website: "",
      partnership_type: "",
      notes: ""
    }
  });

  // Efeito para preencher email se o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      form.setValue('email', user.email);
    }
  }, [isAuthenticated, user, form]);

  // Manipulador de envio com logs aprimorados
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      console.log('[Partnership] Iniciando solicitação de parceria:', {
        company: data.company_name,
        type: data.partnership_type,
        timestamp: new Date().toISOString()
      });
      
      // A validação do formulário garante que os campos obrigatórios estão presentes
      await createPartnership({
        company_name: data.company_name,
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone,
        company_size: data.company_size,
        company_website: data.company_website,
        partnership_type: data.partnership_type,
        notes: data.notes,
        status: 'pending'
      });
      
      // Log de sucesso
      console.log('[Partnership] Solicitação enviada com sucesso:', {
        company: data.company_name,
        type: data.partnership_type,
        timestamp: new Date().toISOString()
      });
      
      toast.success("Solicitação de parceria enviada com sucesso! Entraremos em contato em breve.");
      form.reset();
      
      // Dispara evento para webhook (se implementado)
      try {
        const event = new CustomEvent('partnership:created', { 
          detail: { 
            company: data.company_name,
            type: data.partnership_type,
            email: data.email
          }
        });
        window.dispatchEvent(event);
      } catch (eventError) {
        console.error('[Partnership] Erro ao disparar evento:', eventError);
      }
    } catch (error) {
      console.error("[Partnership] Erro ao enviar formulário:", error);
      toast.error("Erro ao enviar formulário. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Registro de Interesse em Parceria</CardTitle>
        <CardDescription>
          Preencha o formulário abaixo para registrar seu interesse em estabelecer uma parceria com nossa plataforma
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa *</FormLabel>
                    <FormControl>
                      <Input placeholder="Pet Tech Solutions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato *</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
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
                      <Input placeholder="contato@empresa.com" {...field} />
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
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho da Empresa</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tamanho da empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company_website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.empresa.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Se disponível, informe o website da sua empresa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="partnership_type"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Tipo de Parceria *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de parceria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PARTNERSHIP_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva com mais detalhes sua proposta de parceria..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Solicitação'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PartnershipForm;
