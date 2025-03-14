
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from "@/hooks/use-sonner";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send the form data to a server
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
  };

  return (
    <div className="container max-w-6xl px-4 py-12 mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Entre em Contato</h1>
        <p className="text-muted-foreground">Estamos aqui para ajudar. Entre em contato conosco.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Envie uma mensagem</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo e responderemos o mais breve possível.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" placeholder="Seu nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input id="subject" placeholder="Assunto da mensagem" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea 
                  id="message" 
                  placeholder="Descreva em detalhes como podemos ajudar..." 
                  rows={5}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
            <CardDescription>
              Outras formas de entrar em contato conosco.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">contato@petmatch.com.br</p>
                <p className="text-muted-foreground">suporte@petmatch.com.br</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Telefone</h3>
                <p className="text-muted-foreground">(11) 4002-8922</p>
                <p className="text-muted-foreground">(11) 98765-4321</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Endereço</h3>
                <p className="text-muted-foreground">Av. Paulista, 1000</p>
                <p className="text-muted-foreground">São Paulo, SP - CEP 01310-100</p>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t">
              <h3 className="font-medium mb-2">Horário de Atendimento</h3>
              <p className="text-sm text-muted-foreground">Segunda a Sexta: 9h às 18h</p>
              <p className="text-sm text-muted-foreground">Sábado: 9h às 13h</p>
              <p className="text-sm text-muted-foreground">Domingo: Fechado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
