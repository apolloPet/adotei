
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-sonner";
import { KeyRound, ShieldAlert } from 'lucide-react';
import { signInAdmin } from '@/services/authService';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();
  
  if (isAdmin && isAuthenticated) {
    navigate('/admin');
    return null;
  }
  
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Método simples para login de demonstração
      if (email === "admin@petmatch.com" && password === "admin123") {
        console.log("Demo admin login attempt");
        
        // Tenta fazer login via Supabase também
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) {
            console.warn("Supabase login failed, falling back to localStorage", error);
          } else {
            console.log("Successfully authenticated with Supabase as admin");
          }
        } catch (supabaseError) {
          console.warn("Supabase auth error, using localStorage fallback", supabaseError);
        }
        
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("userEmail", email);
        
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('authStateChanged'));
        
        if (onLogin) {
          onLogin();
        }
        
        toast.success("Login administrativo realizado com sucesso!");
        navigate("/admin");
        return;
      }
      
      // Tentativa de login regular de administrador
      const success = await signInAdmin(email, password);
      
      if (success) {
        if (onLogin) {
          onLogin();
        }
        navigate("/admin");
      } else {
        toast.error("Credenciais inválidas ou usuário não tem permissão de administrador");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error("Erro ao processar login");
    } finally {
      setIsLoading(false);
    }
  };
  
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
