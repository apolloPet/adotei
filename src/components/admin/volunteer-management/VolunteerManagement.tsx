import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-sonner';
import { apiRequest } from '@/lib/apiClient';
import { isValidEmail, isValidPhoneBR, maskPhoneBR, normalizeEmail } from '@/utils/brMasks';

type BackendUser = {
  id: string;
  authSubject: string;
  fullName: string;
  email: string;
  phone?: string;
  userType?: string;
  roles: string[];
};

type NewVolunteerState = {
  name: string;
  email: string;
  phone: string;
};

const INITIAL_FORM: NewVolunteerState = {
  name: '',
  email: '',
  phone: '',
};

const VolunteerManagement = () => {
  const [volunteers, setVolunteers] = useState<BackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<NewVolunteerState>(INITIAL_FORM);

  const loadVolunteers = async () => {
    setIsLoading(true);
    try {
      const users = await apiRequest<BackendUser[]>('/api/users');
      setVolunteers(users.filter((user) => user.roles.includes('VOLUNTARIO')));
    } catch (error) {
      console.error('Erro ao carregar voluntários:', error);
      toast.error('Erro ao carregar voluntários');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteers();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Informe nome e email do voluntário');
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

    setIsSubmitting(true);
    try {
      await apiRequest('/api/users', {
        method: 'POST',
        body: {
          authSubject: normalizeEmail(form.email),
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
          roles: ['VOLUNTARIO'],
        },
      });

      toast.success('Voluntário criado com sucesso');
      setForm(INITIAL_FORM);
      await loadVolunteers();
    } catch (error) {
      console.error('Erro ao criar voluntário:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar voluntário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (volunteer: BackendUser) => {
    if (!window.confirm(`Deseja remover o voluntário "${volunteer.fullName}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/users/${volunteer.id}`, { method: 'DELETE' });
      toast.success('Voluntário removido com sucesso');
      await loadVolunteers();
    } catch (error) {
      console.error('Erro ao remover voluntário:', error);
      toast.error('Erro ao remover voluntário');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Gestão de Voluntários</CardTitle>
        <CardDescription>Crie voluntários que poderão cadastrar e manter animais no sistema.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="volunteer-name">Nome completo</Label>
            <Input
              id="volunteer-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nome do voluntário"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="volunteer-email">Email</Label>
            <Input
              id="volunteer-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: normalizeEmail(event.target.value) }))}
              placeholder="voluntario@ong.org"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="volunteer-phone">Telefone</Label>
            <Input
              id="volunteer-phone"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: maskPhoneBR(event.target.value) }))}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Criar voluntário'}
            </Button>
          </div>
        </form>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : volunteers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum voluntário cadastrado.
          </p>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteers.map((volunteer) => (
                  <TableRow key={volunteer.id}>
                    <TableCell>{volunteer.fullName}</TableCell>
                    <TableCell>{volunteer.email}</TableCell>
                    <TableCell>{volunteer.phone || '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(volunteer)}
                      >
                        Remover
                      </Button>
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
