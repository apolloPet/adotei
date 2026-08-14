import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-sonner';
import { apiRequest } from '@/lib/apiClient';
import { isValidEmail, isValidPhoneBR, maskPhoneBR, normalizeEmail } from '@/utils/brMasks';
import {
  DEFAULT_VOLUNTEER_PERMISSIONS,
  VolunteerPermissionBadges,
  VolunteerPermissionFields,
  VolunteerPermissions,
  readVolunteerPermissions,
} from './permissions';

type BackendVolunteer = {
  id: string;
  authSubject: string;
  fullName: string;
  email: string;
  phone?: string;
  organizationId?: string;
  organizationResponsible?: boolean;
  permissions?: Partial<VolunteerPermissions> | null;
};

type FormState = {
  authSubject?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  organizationResponsible: boolean;
  permissions: VolunteerPermissions;
};

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  organizationResponsible: false,
  permissions: DEFAULT_VOLUNTEER_PERMISSIONS,
};

const VolunteerManagement = () => {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [volunteers, setVolunteers] = useState<BackendVolunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const loadVolunteers = async (orgId: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<BackendVolunteer[]>(`/api/users/organization/${orgId}/volunteers`);
      setVolunteers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários da ONG:', error);
      toast.error('Erro ao carregar usuários da ONG');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const me = await apiRequest<{ organizationId?: string }>('/api/users/me');
        if (!me.organizationId) {
          setIsLoading(false);
          return;
        }
        setOrganizationId(me.organizationId);
        await loadVolunteers(me.organizationId);
      } catch (error) {
        console.error('Erro ao identificar a ONG do usuário:', error);
        toast.error('Erro ao identificar a ONG do usuário');
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const startEdit = (volunteer: BackendVolunteer) => {
    setEditingId(volunteer.id);
    setForm({
      authSubject: volunteer.authSubject,
      name: volunteer.fullName,
      email: volunteer.email,
      phone: volunteer.phone || '',
      password: '',
      organizationResponsible: volunteer.organizationResponsible === true,
      permissions: readVolunteerPermissions(volunteer.permissions),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!organizationId) {
      return;
    }
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Informe nome e email do usuário');
      return;
    }
    if (!isValidEmail(form.email)) {
      toast.error('Email inválido');
      return;
    }
    if (form.phone && !isValidPhoneBR(form.phone)) {
      toast.error('Telefone inválido');
      return;
    }
    if (!editingId && !form.password.trim()) {
      toast.error('Senha é obrigatória para novos usuários');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest(editingId ? `/api/users/${editingId}` : '/api/users', {
        method: editingId ? 'PUT' : 'POST',
        body: {
          authSubject: form.authSubject || normalizeEmail(form.email),
          fullName: form.name.trim(),
          email: normalizeEmail(form.email),
          phone: form.phone.trim() || null,
          userType: 'VOLUNTARIO',
          addressLine: null,
          addressNumber: null,
          neighborhood: null,
          city: null,
          state: null,
          zipCode: null,
          organizationId,
          organizationResponsible: form.organizationResponsible,
          password: form.password.trim() || null,
          permissions: form.permissions,
          roles: ['VOLUNTARIO'],
        },
      });
      toast.success(editingId ? 'Usuário atualizado com sucesso' : 'Usuário cadastrado com sucesso');
      cancelEdit();
      await loadVolunteers(organizationId);
    } catch (error) {
      console.error('Erro ao salvar usuário da ONG:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar usuário da ONG');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (volunteer: BackendVolunteer) => {
    if (!organizationId) {
      return;
    }
    if (!window.confirm(`Deseja remover o usuário "${volunteer.fullName}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/users/${volunteer.id}`, { method: 'DELETE' });
      toast.success('Usuário removido com sucesso');
      await loadVolunteers(organizationId);
    } catch (error) {
      console.error('Erro ao remover usuário da ONG:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao remover usuário da ONG');
    }
  };

  if (!isLoading && !organizationId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Seu usuário não está vinculado a uma ONG.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-xl">Usuários da ONG</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Cadastre, edite e defina as permissões dos usuários da sua ONG.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-3 sm:p-6 pt-0 sm:pt-0">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label htmlFor="ong-user-name">Nome</Label>
            <Input
              id="ong-user-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nome completo"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ong-user-email">Email</Label>
            <Input
              id="ong-user-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: normalizeEmail(event.target.value) }))}
              placeholder="usuario@ong.org"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ong-user-password">{editingId ? 'Nova senha (opcional)' : 'Senha'}</Label>
            <Input
              id="ong-user-password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder={editingId ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ong-user-phone">Telefone</Label>
            <Input
              id="ong-user-phone"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: maskPhoneBR(event.target.value) }))}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="md:col-span-4">
            <VolunteerPermissionFields
              value={form.permissions}
              onChange={(permissions) => setForm((prev) => ({ ...prev, permissions }))}
              disabled={isSubmitting}
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-2 rounded-md border px-3 h-10">
            <Checkbox
              id="ong-user-responsible"
              checked={form.organizationResponsible}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, organizationResponsible: checked === true }))
              }
            />
            <Label htmlFor="ong-user-responsible" className="cursor-pointer text-sm font-normal">
              Responsável da entidade
            </Label>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={isSubmitting}>
                Cancelar edição
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : editingId ? 'Salvar usuário' : 'Cadastrar usuário'}
            </Button>
          </div>
        </form>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : volunteers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum usuário cadastrado nesta ONG.</p>
        ) : (
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteers.map((volunteer) => (
                  <TableRow key={volunteer.id}>
                    <TableCell className="font-medium">{volunteer.fullName}</TableCell>
                    <TableCell>{volunteer.email}</TableCell>
                    <TableCell>{volunteer.phone || '—'}</TableCell>
                    <TableCell>
                      <VolunteerPermissionBadges permissions={volunteer.permissions} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(volunteer)}>
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(volunteer)}>
                          Remover
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VolunteerManagement;
