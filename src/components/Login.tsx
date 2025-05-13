
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-sonner";
import { ArrowLeft, Loader2 } from 'lucide-react';
import { signIn } from '@/services/auth';
import { useAuth } from '@/hooks/auth';

interface LoginProps {
  onLogin?: () => void;
}

const Login = ({ onLogin }: LoginProps = {}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, fetchUserData } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Login: Usuário já está autenticado, redirecionando para /browse');
      navigate('/browse', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Login: Tentando login com", email);
      
      // Performance: processamento de login otimizado
      const success = await signIn(email, password);
      
      if (success) {
        toast.success("Login realizado com sucesso!");
        
        // Performance: apenas uma chamada de função para atualizar dados
        if (fetchUserData) {
          console.log("Login: Login bem-sucedido, buscando dados do usuário");
          // Executar de forma assíncrona sem aguardar a conclusão
          fetchUserData().catch(error => {
            console.error("Erro ao buscar dados do usuário:", error);
          });
        }
        
        // Chamar callback se fornecido
        if (onLogin) {
          onLogin();
        }
        
        // Performance: redirecionar imediatamente sem setTimeout
        navigate("/browse", { replace: true });
      } else {
        console.log("Login: Falha no login - credenciais inválidas");
        toast.error("Credenciais inválidas. Verifique seu email e senha.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro ao fazer login. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Se o usuário já estiver autenticado, não renderizar o formulário
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a página inicial
        </Link>
      </div>
      
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
          <CardDescription>
            Entre com seu email e senha para acessar sua conta
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="/reset-password" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember-me" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                disabled={isLoading}
              />
              <Label htmlFor="remember-me" className="text-sm">Lembrar de mim</Label>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : 'Entrar'}
            </Button>
            
            {/* Performance: adicionar informações demo para facilitar testes */}
            <div className="text-center mt-4 text-sm text-muted-foreground">
              <p>Para fins de demonstração, use:</p>
              <p><strong>Email:</strong> usuario@petmatch.com</p>
              <p><strong>Senha:</strong> senha123</p>
              <p className="mt-2"><strong>Admin:</strong> admin@petmatch.com</p>
              <p><strong>Senha:</strong> admin123</p>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col">
          <div className="text-center mt-2">
            <span className="text-sm text-muted-foreground">
              Ainda não tem uma conta?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
