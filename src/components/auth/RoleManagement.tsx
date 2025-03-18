
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { getUserRole, setUserRole } from '@/services/authService';
import { UserRole } from '@/types/user';
import { toast } from '@/hooks/use-sonner';
import { Label } from "@/components/ui/label";
import { Shield, ShieldCheck, ShieldAlert, ShieldX, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
}

// Componente simulado para administradores - em uma implementação real, buscaríamos usuários do Supabase
const RoleManagement = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Admin Principal', email: 'admin@ong.com', role: 'admin' },
    { id: '2', name: 'Coordenador de Adoções', email: 'moderador@ong.com', role: 'moderator' },
    { id: '3', name: 'Funcionário', email: 'staff@ong.com', role: 'staff' },
    { id: '4', name: 'Usuário Comum', email: 'usuario@exemplo.com', role: 'user' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const roleIcons = {
    admin: <ShieldAlert className="h-4 w-4 text-red-500" />,
    moderator: <ShieldCheck className="h-4 w-4 text-green-500" />,
    staff: <Shield className="h-4 w-4 text-blue-500" />,
    user: <ShieldX className="h-4 w-4 text-gray-500" />
  };

  const roleLabels = {
    admin: 'Administrador',
    moderator: 'Moderador',
    staff: 'Funcionário',
    user: 'Usuário'
  };

  const roleDescriptions = {
    admin: 'Acesso completo a todas as áreas',
    moderator: 'Pode gerenciar adoções e pets',
    staff: 'Pode atualizar informações de pets',
    user: 'Acesso padrão ao sistema'
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    
    try {
      // Em uma implementação real, chamaríamos a função setUserRole
      // const success = await setUserRole(userId, newRole);
      
      // Simulação de atualização bem-sucedida
      const success = true;
      
      if (success) {
        // Atualizar o estado local
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        
        toast.success(`Função do usuário atualizada para ${roleLabels[newRole]}`);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Erro ao atualizar função do usuário');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Funções</CardTitle>
            <CardDescription>Definir funções e permissões para usuários</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função Atual</TableHead>
              <TableHead>Alterar Função</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.role && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {roleIcons[user.role]}
                      {roleLabels[user.role]}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <RadioGroup 
                    value={user.role || ''} 
                    className="flex gap-4"
                    onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                  >
                    {Object.entries(roleLabels).map(([role, label]) => (
                      <div key={role} className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={role} 
                          id={`${user.id}-${role}`} 
                          disabled={updatingUserId === user.id}
                        />
                        <Label 
                          htmlFor={`${user.id}-${role}`}
                          className="cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                    
                    {updatingUserId === user.id && (
                      <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                    )}
                  </RadioGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-medium">Descrição das Funções</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(roleLabels).map(([role, label]) => (
              <div key={role} className="border rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  {roleIcons[role as UserRole]}
                  <span className="font-medium">{label}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {roleDescriptions[role as UserRole]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleManagement;
