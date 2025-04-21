import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-sonner";
import { PlusCircle, Trash2, Shield } from "lucide-react";
import { AdminUser, createAdminUser, getAdminUsers, updateAdminPermissions, removeAdminRole } from '@/services/adminUserService';

const AdminUserManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const adminsData = await getAdminUsers();
      setAdmins(adminsData);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Erro ao buscar administradores');
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

    setIsLoading(true);
    
    try {
      const result = await createAdminUser(
        newAdmin.email,
        newAdmin.password,
        newAdmin.name,
        newAdmin.permissions
      );
      
      if (result.success) {
        toast.success(result.message);
        setIsDialogOpen(false);
        await fetchAdmins();
        
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
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error('Erro ao criar administrador');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionUpdate = async (id: string, currentPermissions: AdminUser['permissions']) => {
    try {
      const success = await updateAdminPermissions(id, currentPermissions);
      if (success) {
        await fetchAdmins();
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Erro ao atualizar permissões');
    }
  };

  const handleAdminRemoval = async (id: string, email: string) => {
    if (confirm(`Tem certeza que deseja remover ${email} como administrador?`)) {
      try {
        const success = await removeAdminRole(id);
        if (success) {
          await fetchAdmins();
        }
      } catch (error) {
        console.error('Error removing admin:', error);
        toast.error('Erro ao remover administrador');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
                <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? "Criando..." : "Criar Administrador"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>Desde</TableHead>
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
                    <div className="flex flex-wrap gap-1">
                      {admin.permissions.manageAnimals && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Animais
                        </span>
                      )}
                      {admin.permissions.approveAdoptions && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Adoções
                        </span>
                      )}
                      {admin.permissions.manageSettings && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Parâmetros
                        </span>
                      )}
                      {admin.permissions.manageAdmins && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Administradores
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{admin.created_at ? formatDate(admin.created_at) : 'N/A'}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleAdminRemoval(admin.id, admin.email)}
                      disabled={admin.email === 'admin@petmatch.com'}
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
        {admins.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {isLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            ) : (
              "Nenhum administrador cadastrado."
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUserManagement;
