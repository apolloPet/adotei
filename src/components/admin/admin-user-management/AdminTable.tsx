import { Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminTableProps } from "./types";
import { useAuth } from "@/hooks/auth";

export const AdminTable = ({
  admins,
  isLoading,
  onRemove,
  formatDate,
}: AdminTableProps) => {
  const { user } = useAuth();
  const currentEmail = user?.email?.toLowerCase();

  const canDelete = (email: string) =>
    email !== "admin@petmatch.com" && email.toLowerCase() !== currentEmail;

  const renderPermBadges = (admin: AdminTableProps["admins"][number]) => (
    <div className="flex flex-wrap gap-1">
      {admin.permissions.manageAnimals && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Animais</span>
      )}
      {admin.permissions.approveAdoptions && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Adoções</span>
      )}
      {admin.permissions.manageSettings && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Parâmetros</span>
      )}
      {admin.permissions.manageAdmins && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Admins</span>
      )}
      {admin.permissions.manageUsers && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Usuários</span>
      )}
    </div>
  );

  if (admins.length === 0) {
    return (
      <div className="border rounded-md text-center py-8 text-muted-foreground">
        {isLoading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
        ) : (
          "Nenhum administrador cadastrado."
        )}
      </div>
    );
  }

  return (
    <>
      <div className="md:hidden space-y-3">
        {admins.map((admin) => (
          <div key={admin.id} className="border rounded-lg p-3 bg-card">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium text-sm truncate">{admin.email}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(admin.id, admin.email)}
                disabled={!canDelete(admin.email)}
                title={!canDelete(admin.email) ? "Não é possível remover esta conta" : "Remover administrador"}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {renderPermBadges(admin)}
            <p className="text-xs text-muted-foreground mt-2">
              Desde: {admin.created_at ? formatDate(admin.created_at) : "N/A"}
            </p>
          </div>
        ))}
      </div>

      <div className="hidden md:block border rounded-md overflow-x-auto">
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
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    {admin.email}
                  </div>
                </TableCell>
                <TableCell>{renderPermBadges(admin)}</TableCell>
                <TableCell>{admin.created_at ? formatDate(admin.created_at) : "N/A"}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(admin.id, admin.email)}
                    disabled={!canDelete(admin.email)}
                    title={!canDelete(admin.email) ? "Não é possível remover esta conta" : "Remover administrador"}
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
    </>
  );
};
