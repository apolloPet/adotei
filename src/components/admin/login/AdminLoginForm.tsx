
import React, { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-sonner";
import { signInAdmin } from '@/services/auth';
import { adminLoginSchema, AdminLoginFormValues } from './types';

interface AdminLoginFormProps {
  onAdminLogin: () => void;
}

const AdminLoginForm = ({ onAdminLogin }: AdminLoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  const handleAdminLogin = async (values: AdminLoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Verificar se é o admin de demonstração
      const isDemoAdmin = values.email === "admin@petmatch.com" && values.password === "admin123";
      
      console.log('Tentando login administrativo com:', { email: values.email, isDemoAdmin });
      
      // Login via signInAdmin (serviço centralizado)
      const success = await signInAdmin(values.email, values.password);
      
      if (success) {
        console.log('Login administrativo realizado com sucesso');
        
        toast.success("Login administrativo realizado com sucesso!");
        
        // Forçar um evento de alteração de autenticação para garantir que outros componentes sejam notificados
        window.dispatchEvent(new Event('authStateChanged'));
        
        // Usar setTimeout com um atraso para garantir que o estado seja atualizado
        setTimeout(() => {
          onAdminLogin();
        }, 500);
      } else {
        console.error('Falha no login administrativo');
        toast.error("Credenciais inválidas ou usuário não tem permissão de administrador");
      }
    } catch (error) {
      console.error("Erro ao fazer login administrativo:", error);
      toast.error("Erro ao processar login administrativo");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleAdminLogin)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  id="admin-email" 
                  type="email" 
                  placeholder="admin@exemplo.com" 
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input 
                  id="admin-password" 
                  type="password" 
                  placeholder="••••••••" 
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              Entrar como Administrador
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AdminLoginForm;
