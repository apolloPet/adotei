
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { User } from './types';

interface UserSimpleViewProps {
  users: User[];
  formatDate: (dateString: string) => string;
  onEdit?: (user: User) => void;
}

const UserSimpleView = ({ users, formatDate, onEdit }: UserSimpleViewProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum usuário encontrado com os critérios de busca.
      </div>
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {users.map((user) => (
          <div key={user.id} className="border rounded-lg p-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm truncate">{user.name}</p>
              {onEdit && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onEdit(user)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-xs">
              <div>
                <span className="text-muted-foreground">Tel: </span>
                <span>{user.phone || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cadastro: </span>
                <span>{formatDate(user.registrationDate)}</span>
              </div>
              <div className="col-span-2 truncate">
                <span className="text-muted-foreground">Local: </span>
                <span>{user.address?.city || '-'}/{user.address?.neighborhood || '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cidade/Bairro</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              {onEdit && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>
                  {user.address?.city || '-'}/{user.address?.neighborhood || '-'}
                </TableCell>
                <TableCell>{formatDate(user.registrationDate)}</TableCell>
                {onEdit && (
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default UserSimpleView;
