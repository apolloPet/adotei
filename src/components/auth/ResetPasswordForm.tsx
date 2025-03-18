
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-sonner";
import { resetPassword } from '@/services/authService';

const ResetPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor, digite seu email");
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor digite um e-mail válido");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const success = await resetPassword(email);
      
      if (success) {
        setIsSubmitted(true);
        console.log("Email de recuperação enviado para:", email);
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Erro ao solicitar recuperação de senha. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6">
        <Link to="/login" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Login
        </Link>
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Recuperar Senha</h1>
          <p className="text-gray-500">
            Digite seu email para receber um link de recuperação de senha
          </p>
        </div>
        
        {isSubmitted ? (
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-medium text-green-800 mb-2">Email enviado!</h3>
            <p className="text-green-700">
              Enviamos um link de recuperação para <strong>{email}</strong>. 
              Por favor, verifique sua caixa de entrada e siga as instruções.
            </p>
            <div className="mt-4">
              <Link to="/login" className="text-primary hover:underline">
                Voltar para página de login
              </Link>
            </div>
          </div>
        ) : (
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
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;
