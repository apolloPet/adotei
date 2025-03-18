
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-sonner";
import { KeyRound, ShieldAlert } from 'lucide-react';
import { signInAdmin } from '@/services/auth';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/lib/supabase';

const AdminLogin = ({ onLogin }: { onLogin?: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, fetchUserData } = useAuth();
  
  // Redirect to admin panel if already authenticated as admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      // Verificar localStorage primeiro
      const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
      
      if ((isAdmin || localStorageAdmin) && isAuthenticated) {
        console.log('AdminLogin: Usuário já está autenticado como admin, redirecionando para /admin');
        navigate('/admin', { replace: true });
      }
    };
    
    checkAdminStatus();
  }, [isAdmin, isAuthenticated, navigate]);
  
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
      
      console.log('Tentando login administrativo com:', { 
        email, 
        isDemoAdmin 
      });
      
      // Verificar se o usuário tem papel de admin na tabela user_roles
      let adminUserFound = false;
      
      if (!isDemoAdmin) {
        // Primeiro fazer login normal
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (authError) {
          console.error('Falha no login:', authError);
          toast.error("Credenciais inválidas. Verifique seu email e senha.");
          setIsLoading(false);
          return;
        }
        
        if (!authData.user) {
          toast.error("Usuário não encontrado");
          setIsLoading(false);
          return;
        }
        
        // Agora verificar se o usuário tem papel de admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', authData.user.id)
          .eq('role', 'admin')
          .single();
        
        // Verificar se o email indica administrador
        const isAdminEmail = 
          email.includes('@admin') || 
          email.includes('@ong') || 
          email === 'admin@petmatch.com';
          
        adminUserFound = !!roleData || isAdminEmail;
        
        if (adminUserFound) {
          console.log('Login administrativo bem-sucedido via validação de papel/email');
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("userEmail", email);
        } else {
          // Fazer logout se não for admin
          await supabase.auth.signOut();
          toast.error("Você não tem permissão de administrador");
          setIsLoading(false);
          return;
        }
      } else {
        // Força definição no localStorage para admin de demonstração
        console.log('Login administrativo de demonstração realizado com sucesso!');
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("userEmail", email);
        adminUserFound = true;
      }
      
      if (adminUserFound) {
        // Atualizar estado global
        if (fetchUserData) {
          await fetchUserData();
        }
        
        if (onLogin) {
          onLogin();
        }
        
        toast.success("Login administrativo realizado com sucesso!");
        
        // Usar setTimeout para permitir que o estado de autenticação seja atualizado primeiro
        setTimeout(() => {
          navigate("/admin", { replace: true });
        }, 100);
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
  
  // Se o usuário já estiver autenticado como admin, não renderizar o formulário
  if (isAdmin && isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <ShieldAlert className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Acesso Administrativo</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          
          <CardContent>
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
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Use estas credenciais para demonstração:</p>
              <p><strong>Email:</strong> admin@petmatch.com</p>
              <p><strong>Senha:</strong> admin123</p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button variant="link" onClick={() => navigate("/login")}>
              Voltar para login normal
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
