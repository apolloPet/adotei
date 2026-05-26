
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
        console.log('Admin User Management: Initializing admin status');
        
        if (localStorage.getItem("userEmail") === "admin@petmatch.com") {
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("isLoggedIn", "true");
          
          console.log('Admin User Management: Found main admin (admin@petmatch.com), ensuring access');
          const accessEnsured = await ensureMainAdminAccess();
          console.log('Admin User Management: Main admin access ensured:', accessEnsured);
        } else {
          console.log('Admin User Management: Not main admin, checking session');
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
      console.log('Admin User Management: Fetching admin users');
      const adminsData = await getAdminUsers();
      console.log('Admin User Management: Fetched admins:', adminsData);
      setAdmins(adminsData);
    } catch (error) {
      console.error("Erro ao buscar administradores:", error);
      toast.error("Erro ao buscar administradores");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionUpdate = async (id: string, currentPermissions: AdminUser["permissions"]) => {
    try {
      console.log('Admin User Management: Updating permissions for user:', id);
      const success = await updateAdminPermissions(id, currentPermissions);
      if (success) {
        console.log('Admin User Management: Permissions updated successfully');
        await fetchAdmins();
      }
    } catch (error) {
      console.error("Erro ao atualizar permissões:", error);
      toast.error("Erro ao atualizar permissões");
    }
  };

  const handleAdminRemoval = async (id: string, email: string) => {
    if (confirm(`Tem certeza que deseja remover ${email} como administrador?`)) {
      try {
        console.log('Admin User Management: Removing admin role from user:', id);
        const success = await removeAdminRole(id);
        if (success) {
          console.log('Admin User Management: Admin role removed successfully');
          await fetchAdmins();
        }
      } catch (error) {
        console.error("Erro ao remover administrador:", error);
        toast.error("Erro ao remover administrador");
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6">
        <div className="min-w-0">
          <CardTitle className="text-base sm:text-xl">Gerenciamento de Administradores</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Adicione e gerencie usuários com acesso administrativo
          </CardDescription>
        </div>
        <NewAdminDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          onSuccess={fetchAdmins}
        />
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
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
