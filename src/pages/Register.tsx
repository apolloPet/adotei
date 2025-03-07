
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from "@/components/Header";
import UserRegistration from "@/components/UserRegistration";
import { Button } from "@/components/ui/button";

const Register = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
          
          <UserRegistration />
          
          <div className="text-center mt-8 text-sm text-muted-foreground">
            Já tem uma conta? <Link to="/login" className="text-primary hover:underline">Faça login</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
