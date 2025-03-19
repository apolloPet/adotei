
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-sonner";
import { PlusCircle, Trash2, Shield, Check, X, AlertTriangle } from "lucide-react";
import { 
  createAdminUser, 
  getAdminUsers, 
  updateAdminPermissions, 
  removeAdminRole,
  AdminUser 
} from '@/services/adminService';

const AdminRoleManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    permissions: {
      manageAnimals: true,
      approveAdoptions: true,
      manageSettings: false,
      manageAdmins: false
    }
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });

  // Fetch admin users on component mount
  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      setIsLoading(true);
      const adminUsers = await getAdminUsers();
      setAdmins(adminUsers);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast.error('Erro ao carregar administradores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionChange = (permission: keyof AdminUser['permissions']) => {
    setNewAdmin(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      name: '',
      email: '',
      password: '',
      passwordConfirm: ''
    };

    if (!newAdmin.name.trim()) {
      errors.name = 'Nome é obrigatório';
      isValid = false;
    }

    if (!newAdmin.email.trim()) {
      errors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      errors.email = 'Email inválido';
      isValid = false;
    }

    if (!newAdmin.password) {
      errors.password = 'Senha é obrigatória';
      isValid = false;
    } else if (newAdmin.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    if (newAdmin.password !== newAdmin.passwordConfirm) {
      errors.passwordConfirm = 'As senhas não coincidem';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      await createAdminUser(
        newAdmin.email,
        newAdmin.password,
        newAdmin.name,
        newAdmin.permissions
      );
      
      // Close dialog and refresh the list
      setIsDialogOpen(false);
      fetchAdminUsers();
      
      // Reset form
      setNewAdmin({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        permissions: {
          manageAnimals: true,
          approveAdoptions: true,
          manageSettings: false,
          manageAdmins: false
        }
      });

      toast.success("Administrador adicionado com sucesso!", {
        description: `${newAdmin.name} agora tem acesso ao painel.`
      });
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar administrador');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermissionUpdate = async (userId: string, permission: keyof AdminUser['permissions'], value: boolean) => {
    try {
      const admin = admins.find(a => a.id === userId);
      if (!admin) return;
      
      const updatedPermissions = {
        ...admin.permissions,
        [permission]: value
      };
      
      await updateAdminPermissions(userId, updatedPermissions);
      
      // Update local state
      setAdmins(prev => 
        prev.map(admin => 
          admin.id === userId 
            ? { ...admin, permissions: updatedPermissions } 
            : admin
        )
      );
      
      toast.success("Permissões atualizadas", {
        description: `As permissões foram atualizadas com sucesso.`
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Erro ao atualizar permissões');
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    const admin = admins.find(a => a.id === userId);
    if (!admin) return;
    
    if (admin.email === 'admin@petmatch.com') {
      toast.error('Não é possível remover o administrador principal');
      return;
    }
    
    if (confirm(`Tem certeza que deseja remover ${admin.email} como administrador?`)) {
      try {
        await removeAdminRole(userId);
        
        // Update local state
        setAdmins(prev => prev.filter(admin => admin.id !== userId));
        
        toast.success("Administrador removido", {
          description: `${admin.email} não tem mais acesso administrativo.`
        });
      } catch (error) {
        console.error('Error removing admin:', error);
        toast.error('Erro ao remover administrador');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Gerenciamento de Administradores</CardTitle>
          <CardDescription>Adicione e gerencie usuários com acesso administrativo</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Novo Administrador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Administrador</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar uma conta com privilégios administrativos.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name"
                  name="name"
                  value={newAdmin.name}
                  onChange={handleInputChange}
                  placeholder="Nome do administrador"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={newAdmin.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password"
                  name="password"
                  type="password"
                  value={newAdmin.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
                {formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirmar Senha</Label>
                <Input 
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  value={newAdmin.passwordConfirm}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
                {formErrors.passwordConfirm && (
                  <p className="text-sm text-red-500">{formErrors.passwordConfirm}</p>
                )}
              </div>
              
              <div className="space-y-3 pt-2">
                <Label>Permissões</Label>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="manage-animals" className="cursor-pointer">Gerenciar Animais</Label>
                  <Switch 
                    id="manage-animals"
                    checked={newAdmin.permissions.manageAnimals}
                    onCheckedChange={() => handlePermissionChange('manageAnimals')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="approve-adoptions" className="cursor-pointer">Aprovar Adoções</Label>
                  <Switch 
                    id="approve-adoptions"
                    checked={newAdmin.permissions.approveAdoptions}
                    onCheckedChange={() => handlePermissionChange('approveAdoptions')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="manage-settings" className="cursor-pointer">Configurar Parâmetros</Label>
                  <Switch 
                    id="manage-settings"
                    checked={newAdmin.permissions.manageSettings}
                    onCheckedChange={() => handlePermissionChange('manageSettings')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="manage-admins" className="cursor-pointer">Gerenciar Administradores</Label>
                  <Switch 
                    id="manage-admins"
                    checked={newAdmin.permissions.manageAdmins}
                    onCheckedChange={() => handlePermissionChange('manageAdmins')}
                  />
                </div>
              </div>
              
              <DialogFooter className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Criando...' : 'Criar Administrador'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : admins.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Gerenciar Animais</TableHead>
                  <TableHead>Aprovar Adoções</TableHead>
                  <TableHead>Configurar Parâmetros</TableHead>
                  <TableHead>Gerenciar Administradores</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      {admin.email}
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={admin.permissions.manageAnimals}
                        onCheckedChange={(checked) => 
                          handlePermissionUpdate(admin.id, 'manageAnimals', checked)
                        }
                        disabled={admin.email === 'admin@petmatch.com'}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={admin.permissions.approveAdoptions}
                        onCheckedChange={(checked) => 
                          handlePermissionUpdate(admin.id, 'approveAdoptions', checked)
                        }
                        disabled={admin.email === 'admin@petmatch.com'}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={admin.permissions.manageSettings}
                        onCheckedChange={(checked) => 
                          handlePermissionUpdate(admin.id, 'manageSettings', checked)
                        }
                        disabled={admin.email === 'admin@petmatch.com'}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={admin.permissions.manageAdmins}
                        onCheckedChange={(checked) => 
                          handlePermissionUpdate(admin.id, 'manageAdmins', checked)
                        }
                        disabled={admin.email === 'admin@petmatch.com'}
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveAdmin(admin.id)}
                        disabled={admin.email === 'admin@petmatch.com'} // Prevent removing the main admin
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <AlertTriangle className="h-8 w-8 mb-2 text-amber-500" />
            <p>Nenhum administrador encontrado no sistema.</p>
            <p className="text-sm mt-1">Clique em "Novo Administrador" para adicionar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRoleManagement;
