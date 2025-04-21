
import { Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminTableProps } from "./types";

export const AdminTable = ({
  admins,
  isLoading,
  onRemove,
  onUpdatePermissions,
  formatDate,
}: AdminTableProps) => (
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
            <TableCell>
              {admin.created_at ? formatDate(admin.created_at) : "N/A"}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(admin.id, admin.email)}
                disabled={admin.email === "admin@petmatch.com"}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    {admins.length === 0 && (
      <div className="text-center py-8 text-muted-foreground">
        {isLoading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
        ) : (
          "Nenhum administrador cadastrado."
        )}
      </div>
    )}
  </div>
);
