import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-sonner";
import { KeyRound, ShieldAlert, UserPlus } from 'lucide-react';
import { signInAdmin } from '@/services/auth';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminLogin = ({ onLogin }: { onLogin?: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redirectChecked, setRedirectChecked] = useState(false);
  const [showNewAdminDialog, setShowNewAdminDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    name: ''
  });
  
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, fetchUserData } = useAuth();
  const hasRedirected = useRef(false);
  
  // Verificação única de status de admin na montagem
  useEffect(() => {
    // Evitar verificações repetidas
    if (redirectChecked || hasRedirected.current) return;
    
    const checkAdminStatus = async () => {
      try {
        console.log('AdminLogin: Verificando status inicial', { isAdmin, isAuthenticated });
        
        // Verificar localStorage primeiro (método mais rápido)
        const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
        const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        
        if ((isAdmin || localStorageAdmin) && (isAuthenticated || localStorageLoggedIn)) {
          console.log('AdminLogin: Usuário já autenticado como admin, redirecionando para /admin');
          hasRedirected.current = true;
          navigate('/admin', { replace: true });
        }
        
        setRedirectChecked(true);
      } catch (error) {
        console.error('Erro ao verificar status admin:', error);
      }
    };
    
    checkAdminStatus();
  }, [isAdmin, isAuthenticated, navigate, redirectChecked]);
  
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
        
        // Atualizar estado global - obrigatório
        if (fetchUserData) {
          await fetchUserData();
        }
        
        // Callback opcional
        if (onLogin) {
          onLogin();
        }
        
        toast.success("Login administrativo realizado com sucesso!");
        
        // Marcar que já redirecionamos
        hasRedirected.current = true;
        
        // Forçar um evento de alteração de autenticação para garantir que outros componentes sejam notificados
        window.dispatchEvent(new Event('authStateChanged'));
        
        // Usar setTimeout com um atraso para garantir que o estado seja atualizado
        setTimeout(() => {
          navigate("/admin", { replace: true });
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
  
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdmin.email || !newAdmin.password || !newAdmin.name) {
      toast.error("Preencha todos os campos para criar o administrador");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Registrar novo usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          data: {
            name: newAdmin.name,
            isAdmin: true
          }
        }
      });
      
      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        toast.error(`Erro ao criar usuário: ${authError.message}`);
        setIsLoading(false);
        return;
      }
      
      if (!authData.user) {
        toast.error("Erro ao criar usuário");
        setIsLoading(false);
        return;
      }
      
      // Atribuir papel de admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'admin',
          permissions: {
            manageAnimals: true,
            approveAdoptions: true,
            manageSettings: true,
            manageAdmins: true
          }
        });
      
      if (roleError) {
        console.error('Erro ao atribuir papel de admin:', roleError);
        toast.error(`Erro ao atribuir papel de administrador: ${roleError.message}`);
      } else {
        toast.success("Administrador criado com sucesso!");
        toast.info(`Email: ${newAdmin.email}, Senha: ${newAdmin.password}`);
        
        setNewAdmin({
          email: '',
          password: '',
          name: ''
        });
        
        setShowNewAdminDialog(false);
      }
    } catch (error) {
      console.error("Erro ao criar administrador:", error);
      toast.error("Erro ao processar criação de administrador");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Não renderizar se já foi confirmado como admin
  if ((isAdmin || localStorage.getItem("isAdmin") === "true") && 
      (isAuthenticated || localStorage.getItem("isLoggedIn") === "true") && 
      redirectChecked) {
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
            
            <div className="mt-6">
              <Dialog open={showNewAdminDialog} onOpenChange={setShowNewAdminDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Novo Administrador
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Administrador</DialogTitle>
                    <DialogDescription>
                      Preencha os dados para criar uma nova conta administrativa com acesso total.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-admin-name">Nome</Label>
                      <Input 
                        id="new-admin-name" 
                        placeholder="Nome do administrador" 
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-admin-email">Email</Label>
                      <Input 
                        id="new-admin-email" 
                        type="email" 
                        placeholder="novo.admin@exemplo.com" 
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-admin-password">Senha</Label>
                      <Input 
                        id="new-admin-password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                        required
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? "Criando..." : "Criar Administrador"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
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
