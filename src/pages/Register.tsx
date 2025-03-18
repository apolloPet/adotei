
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RegisterForm from "@/components/auth/RegisterForm";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Register = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/browse');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-lg mx-auto">
          <div className="mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            
            <h1 className="text-2xl font-bold mb-2">Crie sua conta</h1>
            <p className="text-muted-foreground">
              Preencha o formulário abaixo para começar a encontrar seu novo amigo.
            </p>
          </div>
          
          <RegisterForm />
          
          <div className="text-center mt-8 text-sm text-muted-foreground">
            Já tem uma conta? <Link to="/login" className="text-primary hover:underline">Faça login</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
