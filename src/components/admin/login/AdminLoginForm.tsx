
import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-sonner";
import { signInAdmin } from '@/services/auth';

interface AdminLoginFormProps {
  onAdminLogin: () => void;
}

const AdminLoginForm = ({ onAdminLogin }: AdminLoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verificar se é o admin de demonstração
      const isDemoAdmin = email === "admin@petmatch.com" && password === "admin123";
      
      console.log('Tentando login administrativo com:', { email, isDemoAdmin });
      
      // Login via signInAdmin (serviço centralizado)
      const success = await signInAdmin(email, password);
      
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
    <form onSubmit={handleAdminLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="admin-email">Email</Label>
        <Input 
          id="admin-email" 
          type="email" 
          placeholder="admin@exemplo.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="admin-password">Senha</Label>
        <Input 
          id="admin-password" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        <KeyRound className="h-4 w-4" />
        {isLoading ? "Processando..." : "Entrar como Administrador"}
      </Button>
    </form>
  );
};

export default AdminLoginForm;
