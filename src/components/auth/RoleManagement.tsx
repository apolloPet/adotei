import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserCheck } from 'lucide-react';
import { setUserRole, getUserRole } from '@/services/auth/authCore';
import { useAuth } from '@/hooks/auth';

const RoleManagement = () => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRoleState] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setUserId(user.id);
      fetchUserRole(user.id);
    }
  }, [user]);

  const fetchUserRole = async (userId: string) => {
    setIsLoading(true);
    try {
      const role = await getUserRole(userId);
      setUserRoleState(role);
    } catch (error) {
      console.error("Error fetching user role:", error);
      toast.error("Erro ao buscar função do usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!userId || !role) {
      toast.error("Por favor, selecione um usuário e uma função.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await setUserRole(userId, role);
      if (success) {
        toast.success("Função do usuário atualizada com sucesso!");
        fetchUserRole(userId); // Refresh the role
      } else {
        toast.error("Falha ao atualizar função do usuário.");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Erro ao atualizar função do usuário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Gerenciar Funções de Usuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando...
          </div>
        )}
        {userRole && (
          <div className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4 text-green-500" />
            <p className="text-sm text-muted-foreground">
              Função atual do usuário: {userRole}
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Select onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar Função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="moderator">Moderador</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleRoleUpdate} disabled={isLoading} className="w-full">
          Atualizar Função
        </Button>
      </CardContent>
    </Card>
  );
};

export default RoleManagement;
