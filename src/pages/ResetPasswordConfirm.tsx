import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-sonner";
import { updatePassword } from '@/services/auth';

const ResetPasswordConfirm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if this page was accessed with a valid token
    const hash = window.location.hash;
    if (!hash.includes('type=recovery')) {
      setIsTokenValid(false);
      toast.error("Link inválido ou expirado. Por favor, solicite um novo link de recuperação.");
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const success = await updatePassword(password);
      
      if (success) {
        toast.success("Senha atualizada com sucesso!");
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Erro ao atualizar senha. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Link Inválido</h1>
            <p className="text-gray-500 mb-4">
              Este link de recuperação é inválido ou já expirou.
            </p>
            <Button onClick={() => navigate('/reset-password')}>
              Solicitar novo link
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Redefinir Senha</h1>
            <p className="text-gray-500">
              Digite sua nova senha abaixo
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500">
                A senha deve ter pelo menos 6 caracteres.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;
