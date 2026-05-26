
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { signIn } from '@/services/auth';
import { useAuth } from '@/hooks/auth';
import { toast } from "@/hooks/use-sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LoginFormProps {
  initialEmail?: string;
  initialPassword?: string;
}

const LoginForm = ({ initialEmail = '', initialPassword = '' }: LoginFormProps) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchUserData } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    setEmail(initialEmail);
    setPassword(initialPassword);
  }, [initialEmail, initialPassword]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log("LoginForm: Attempting login with", email);
      const success = await signIn(email, password);
      
      if (success) {
        console.log("LoginForm: Login successful, fetching user data");
        // Call fetchUserData to update the auth state
        if (fetchUserData) {
          await fetchUserData();
        }
        
        toast.success("Login realizado com sucesso!");
        navigate('/browse');
      } else {
        console.log("LoginForm: Login failed - invalid credentials");
        toast.error("Credenciais inválidas. Verifique seu email e senha.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Erro ao fazer login. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className={`w-full max-w-md mx-auto ${isMobile ? 'shadow-sm' : 'shadow'}`}>
      <CardHeader className={isMobile ? 'px-4 py-4' : 'p-6'}>
        <CardTitle className={isMobile ? 'text-xl' : 'text-2xl'}>Acessar sua conta</CardTitle>
        <CardDescription>
          Entre com seu email e senha
        </CardDescription>
      </CardHeader>
      
      <CardContent className={isMobile ? 'px-4 py-2' : 'px-6 py-4'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="seu.email@exemplo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="w-full"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : 'Entrar'}
          </Button>
          <div className="text-sm text-right mt-2">
            <Link to="/reset-password" className="text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className={isMobile ? 'px-4 py-4' : 'p-6'}>
        <p className="text-sm text-muted-foreground text-center w-full">
          Não tem uma conta? <Link to="/register" className="text-primary hover:underline">Crie uma conta</Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
