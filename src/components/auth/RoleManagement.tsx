
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/hooks/use-sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/lib/supabase';

interface UserRoleType {
  id: string;
  user_id: string;
  role: string;
  permissions?: {
    manageAnimals?: boolean;
    approveAdoptions?: boolean;
    manageSettings?: boolean;
    manageAdmins?: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

const RoleManagement = () => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRoleType[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setUserId(user.id);
      fetchUserRoles(user.id);
    }
  }, [user]);

  const fetchUserRoles = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      // This is where the error was occurring - we need to cast the data to include permissions
      const rolesWithPermissions = (data || []).map(role => ({
        ...role,
        permissions: role.permissions || {}
      })) as UserRoleType[];
      
      setUserRoles(rolesWithPermissions);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      toast.error("Erro ao buscar funções do usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!userId || !role) {
      toast.error("Por favor, selecione uma função.");
      return;
    }

    setIsLoading(true);
    try {
      const existingRole = userRoles.find(r => r.role === role);
      
      if (existingRole) {
        toast.error(`Usuário já possui a função ${role}`);
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          permissions: getDefaultPermissions(role)
        });

      if (error) throw error;
      
      toast.success(`Função ${role} adicionada com sucesso!`);
      fetchUserRoles(userId); // Refresh roles
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Erro ao atualizar função do usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleRemove = async (roleId: string, roleName: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
      
      toast.success(`Função ${roleName} removida com sucesso!`);
      fetchUserRoles(userId); // Refresh roles
    } catch (error) {
      console.error("Error removing user role:", error);
      toast.error("Erro ao remover função do usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultPermissions = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          manageAnimals: true,
          approveAdoptions: true,
          manageSettings: true,
          manageAdmins: true
        };
      case 'moderator':
        return {
          manageAnimals: true,
          approveAdoptions: true,
          manageSettings: false,
          manageAdmins: false
        };
      default:
        return {};
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Gerenciar Funções de Usuário</CardTitle>
        <CardDescription>
          Adicione ou remova funções para o usuário atual
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Carregando...</span>
          </div>
        )}
        
        {!isLoading && userRoles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Funções Atuais:</h3>
            <div className="space-y-2">
              {userRoles.map(userRole => (
                <div key={userRole.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium capitalize">{userRole.role}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRoleRemove(userRole.id, userRole.role)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-medium">Adicionar Nova Função:</h3>
          <div className="space-y-2">
            <Select onValueChange={setRole} value={role}>
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
          <Button 
            onClick={handleRoleUpdate} 
            disabled={isLoading || !role} 
            className="w-full"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
            Adicionar Função
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleManagement;
