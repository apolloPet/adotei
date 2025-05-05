
import React, { useState } from 'react';
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/hooks/auth';
import SessionManagement from '@/components/auth/SessionManagement';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Edit, Eye, EyeOff, KeyRound, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-sonner';
import { changeAdminPassword } from '@/services/auth';
import { Link } from 'react-router-dom';

const SecuritySettings = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("password");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await changeAdminPassword(currentPassword, newPassword);
      
      if (success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Senha alterada com sucesso!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <Container className="py-10">
        <div className="max-w-3xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
          <p className="mb-6">Você precisa estar logado para acessar esta página.</p>
          <Button asChild>
            <Link to="/login">Fazer Login</Link>
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Configurações de Segurança</h1>
        <p className="text-muted-foreground mb-6">
          Gerencie configurações de segurança, senhas e sessões ativas.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="password" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Senha
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sessões Ativas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="password">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Mantenha sua conta segura usando uma senha forte e única. 
                Recomendamos usar uma combinação de letras, números e caracteres especiais.
              </p>
              
              <form onSubmit={handlePasswordChange}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></span>
                          Alterando...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Salvar Nova Senha
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="sessions">
            <SessionManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default SecuritySettings;
