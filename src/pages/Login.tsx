import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, PawPrint, Heart, Shield } from 'lucide-react';
import LoginForm from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/auth';
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const prefillEmail = (location.state as { prefillEmail?: string } | null)?.prefillEmail ?? '';
  const prefillPassword = (location.state as { prefillPassword?: string } | null)?.prefillPassword ?? '';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/browse');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse flex flex-col items-center p-8">
          <div className="h-6 w-24 bg-muted rounded mb-4" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <main className={`container mx-auto px-4 ${isMobile ? 'pt-16 pb-12' : 'pt-32 pb-20'}`}>
        <div className="max-w-5xl mx-auto">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left: brand / welcome */}
            <div className="hidden md:flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 self-start bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                <PawPrint className="h-4 w-4" />
                Bem-vindo de volta
              </div>
              <h1 className="text-4xl font-bold leading-tight">
                Reencontre seu<br />
                <span className="text-primary">novo amigo</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Acesse sua conta para continuar conhecendo pets disponíveis para adoção e
                acompanhar suas conversas com as ONGs parceiras.
              </p>

              <div className="grid gap-3 mt-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-card border">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Heart className="h-4 w-4 fill-current" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Pets compatíveis com seu perfil</p>
                    <p className="text-xs text-muted-foreground">
                      Usamos suas informações de cadastro para sugerir o match ideal.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-card border">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Adoção segura e responsável</p>
                    <p className="text-xs text-muted-foreground">
                      Acompanhe o processo de adoção com total transparência.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div>
              <div className="md:hidden mb-6">
                <h1 className="text-2xl font-bold">Entrar na sua conta</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Continue de onde parou e encontre seu novo amigo.
                </p>
              </div>

              <LoginForm initialEmail={prefillEmail} initialPassword={prefillPassword} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
