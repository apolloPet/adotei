
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-sonner";
import {
  AdminUser,
  getAdminUsers,
  updateAdminPermissions,
  removeAdminRole,
  ensureMainAdminAccess,
} from "@/services/adminUserService";
import { NewAdminDialog } from "./NewAdminDialog";
import { AdminTable } from "./AdminTable";

export const AdminUserManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        if (localStorage.getItem("userEmail") === "admin@petmatch.com") {
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("isLoggedIn", "true");
          await ensureMainAdminAccess();
        }
      } catch (error) {
        console.error("Erro ao inicializar permissões do admin:", error);
      } finally {
        fetchAdmins();
      }
    };
    initializeAdmin();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const adminsData = await getAdminUsers();
      setAdmins(adminsData);
    } catch (error) {
      toast.error("Erro ao buscar administradores");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionUpdate = async (id: string, currentPermissions: AdminUser["permissions"]) => {
    try {
      const success = await updateAdminPermissions(id, currentPermissions);
      if (success) await fetchAdmins();
    } catch {
      toast.error("Erro ao atualizar permissões");
    }
  };

  const handleAdminRemoval = async (id: string, email: string) => {
    if (confirm(`Tem certeza que deseja remover ${email} como administrador?`)) {
      try {
        const success = await removeAdminRole(id);
        if (success) await fetchAdmins();
      } catch {
        toast.error("Erro ao remover administrador");
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
          <CardDescription>
            Adicione e gerencie usuários com acesso administrativo
          </CardDescription>
        </div>
        <NewAdminDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          onSuccess={fetchAdmins}
        />
      </CardHeader>
      <CardContent>
        <AdminTable
          admins={admins}
          isLoading={isLoading}
          onRemove={handleAdminRemoval}
          onUpdatePermissions={handlePermissionUpdate}
          formatDate={formatDate}
        />
      </CardContent>
    </Card>
  );
};

export default AdminUserManagement;
