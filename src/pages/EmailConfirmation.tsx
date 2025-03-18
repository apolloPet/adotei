
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { resendVerificationEmail } from '@/services/authService';
import { toast } from '@/hooks/use-sonner';

const EmailConfirmation = () => {
  const [confirmationStatus, setConfirmationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [email, setEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Verificar query params para tipos de confirmação
        const queryParams = new URLSearchParams(window.location.search);
        const type = queryParams.get('type');
        
        if (type === 'signup' || type === 'recovery') {
          setConfirmationStatus('success');
          
          // Se o usuário já está autenticado, redirecione
          if (isAuthenticated) {
            toast.success('Email confirmado com sucesso!');
            setTimeout(() => navigate('/browse'), 2000);
          }
        } else {
          setConfirmationStatus('error');
        }
        
        // Recuperar email da URL ou do localStorage
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          setEmail(userEmail);
        }
      } catch (error) {
        console.error('Error confirming email:', error);
        setConfirmationStatus('error');
      }
    };
    
    confirmEmail();
  }, [isAuthenticated, navigate]);
  
  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Não foi possível identificar seu email');
      return;
    }
    
    setIsResending(true);
    
    try {
      const success = await resendVerificationEmail(email);
      if (success) {
        toast.success('Email de verificação reenviado com sucesso!');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast.error('Erro ao reenviar email de verificação');
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8">
          {confirmationStatus === 'pending' && (
            <div className="text-center">
              <div className="animate-pulse flex justify-center">
                <div className="h-12 w-12 rounded-full bg-primary/20"></div>
              </div>
              <h1 className="text-2xl font-bold mt-4">Verificando...</h1>
              <p className="text-muted-foreground mt-2">Estamos processando sua confirmação de email.</p>
            </div>
          )}
          
          {confirmationStatus === 'success' && (
            <div className="text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mt-4">Email Confirmado!</h1>
              <p className="text-muted-foreground mt-2">
                Seu email foi verificado com sucesso. Agora você pode acessar todos os recursos da plataforma.
              </p>
              <div className="mt-8 flex flex-col gap-4">
                {isAuthenticated ? (
                  <Button asChild>
                    <Link to="/browse">Explorar Pets</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/login">Fazer Login</Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/">Voltar para Home</Link>
                </Button>
              </div>
            </div>
          )}
          
          {confirmationStatus === 'error' && (
            <div className="text-center">
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mt-4">Algo deu errado</h1>
              <p className="text-muted-foreground mt-2">
                Não foi possível confirmar seu email. O link pode ter expirado ou já foi utilizado.
              </p>
              <div className="mt-6">
                <Button 
                  onClick={handleResendEmail} 
                  disabled={isResending}
                  className="gap-2"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Reenviar Email de Verificação
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-8 flex flex-col gap-4">
                <Button variant="outline" asChild>
                  <Link to="/login">Voltar para Login</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
