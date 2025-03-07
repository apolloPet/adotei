
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-sonner";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    // In a real app, this would call an authentication API
    console.log("Login attempt with:", { email, password, rememberMe });
    
    // For demo purposes, we'll just show a success message and redirect
    toast.success("Login realizado com sucesso!");
    
    // Simulating a redirect after successful login
    setTimeout(() => {
      window.location.href = "/browse";
    }, 1500);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
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
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember-me" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <Label htmlFor="remember-me" className="text-sm">Lembrar de mim</Label>
          </div>
          
          <Button type="submit" className="w-full">
            Entrar
          </Button>
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
  );
};

export default Login;
