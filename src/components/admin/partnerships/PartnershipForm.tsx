
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

export type PartnerFormValues = z.infer<typeof partnerFormSchema>;

const PartnershipForm = () => {
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

  const onSubmit = (data: PartnerFormValues) => {
    console.log('Form data:', data);
    toast.success('Formulário enviado com sucesso! Entraremos em contato em breve.');
    form.reset();
  };

  return (
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
  );
};

export default PartnershipForm;
