
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-sonner";
import { signIn } from '@/services/auth';
import { useAuth } from '@/hooks/auth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, fetchUserData } = useAuth();
  
  // Verificar estado de autenticação quando o componente é montado
  useEffect(() => {
    // Redirecionar se já estiver logado
    if (isAuthenticated && user) {
      console.log('LoginForm: Usuário já está autenticado, redirecionando para /browse');
      navigate('/browse');
    }
  }, [isAuthenticated, navigate, user]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Iniciando processo de login com:', email);
      
      const success = await signIn(email, password);
      
      if (success) {
        console.log('Login bem-sucedido, atualizando dados do usuário');
        
        // Atualizar explicitamente os dados do usuário após login
        if (fetchUserData) {
          await fetchUserData();
          
          // Após atualizar os dados do usuário, verificar se está autenticado antes de redirecionar
          console.log('Redirecionando para /browse após login bem-sucedido');
          toast.success('Login realizado com sucesso!');
          
          // Adicionar um pequeno atraso para garantir que o estado seja atualizado
          setTimeout(() => {
            navigate('/browse', { replace: true });
          }, 500);
        } else {
          // Caso fetchUserData não esteja disponível, redirecionar mesmo assim
          console.log('fetchUserData não disponível, redirecionando mesmo assim');
          toast.success('Login realizado com sucesso!');
          navigate('/browse', { replace: true });
        }
      } else {
        console.log('Login falhou');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro ao fazer login. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Se o usuário estiver autenticado, não renderizar o formulário
  if (isAuthenticated && user) {
    return null;
  }
  
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="text-gray-500">
            Entre com seu email e senha para acessar sua conta
          </p>
        </div>
        
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
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          
          <div className="text-center mt-4">
            <span className="text-sm text-muted-foreground">
              Ainda não tem uma conta?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </span>
          </div>
          
          <div className="text-center mt-4 text-sm text-muted-foreground">
            <p>Para fins de demonstração, use:</p>
            <p><strong>Email:</strong> usuario@petmatch.com</p>
            <p><strong>Senha:</strong> senha123</p>
            <p className="mt-2"><strong>Admin:</strong> admin@petmatch.com</p>
            <p><strong>Senha:</strong> admin123</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
