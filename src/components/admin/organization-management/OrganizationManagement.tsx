import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-sonner';
import { createShelter, deleteShelter, fetchShelters, Shelter, updateShelter } from '@/services/shelterService';
import { apiRequest } from '@/lib/apiClient';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { isValidCNPJ, isValidEmail, isValidPhoneBR, maskCNPJ, maskPhoneBR, normalizeEmail } from '@/utils/brMasks';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';

type OrganizationFormState = {
  name: string;
  cnpj: string;
  phone: string;
  city: string;
  state: string;
};

const INITIAL_FORM: OrganizationFormState = {
  name: '',
  cnpj: '',
  phone: '',
  city: '',
  state: '',
};

type BackendVolunteer = {
  id: string;
  authSubject: string;
  fullName: string;
  email: string;
  phone?: string;
  userType?: string;
  organizationId?: string;
  roles: string[];
  organizationResponsible?: boolean;
};

type VolunteerFormState = {
  id?: string;
  authSubject?: string;
  name: string;
  email: string;
  phone: string;
  organizationResponsible: boolean;
  password: string;
};

const INITIAL_VOLUNTEER_FORM: VolunteerFormState = {
  name: '',
  email: '',
  phone: '',
  organizationResponsible: false,
  password: '',
};

const PAGE_SIZE = 8;
const onlyDigits = (value?: string) => (value ?? '').replace(/\D/g, '');

const OrganizationManagement = () => {
  const [organizations, setOrganizations] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<OrganizationFormState>(INITIAL_FORM);
  const [volunteers, setVolunteers] = useState<BackendVolunteer[]>([]);
  const [isVolunteersLoading, setIsVolunteersLoading] = useState(false);
  const [isVolunteerSubmitting, setIsVolunteerSubmitting] = useState(false);
  const [editingVolunteerId, setEditingVolunteerId] = useState<string | null>(null);
  const [volunteerForm, setVolunteerForm] = useState<VolunteerFormState>(INITIAL_VOLUNTEER_FORM);

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchShelters();
      setOrganizations(data);
    } catch (error) {
      console.error('Erro ao carregar ONGs:', error);
      toast.error('Erro ao carregar ONGs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadVolunteers = async (organizationId: string) => {
    setIsVolunteersLoading(true);
    try {
      const data = await apiRequest<BackendVolunteer[]>(`/api/users/organization/${organizationId}/volunteers`);
      setVolunteers(data);
    } catch (error) {
      console.error('Erro ao carregar voluntários da ONG:', error);
      toast.error('Erro ao carregar voluntários da ONG');
    } finally {
      setIsVolunteersLoading(false);
    }
  };

  const filteredOrganizations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const searchDigits = onlyDigits(search);

    if (!normalizedSearch) {
      return organizations;
    }

    return organizations.filter((organization) => {
      const matchesName = organization.name.toLowerCase().includes(normalizedSearch);
      const matchesCnpj = searchDigits.length > 0 && onlyDigits(organization.cnpj).includes(searchDigits);
      return matchesName || matchesCnpj;
    });
  }, [organizations, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOrganizations.length / PAGE_SIZE));
  const paginatedOrganizations = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrganizations.slice(start, start + PAGE_SIZE);
  }, [filteredOrganizations, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setEditingVolunteerId(null);
    setVolunteers([]);
    setVolunteerForm(INITIAL_VOLUNTEER_FORM);
    setMode('form');
  };

  const openEditForm = (organization: Shelter) => {
    setEditingId(organization.id);
    setForm({
      name: organization.name,
      cnpj: organization.cnpj ?? '',
      phone: organization.phone,
      city: organization.city,
      state: organization.state,
    });
    setEditingVolunteerId(null);
    setVolunteerForm(INITIAL_VOLUNTEER_FORM);
    setMode('form');
    void loadVolunteers(organization.id);
  };

  const backToList = () => {
    setMode('list');
    setEditingId(null);
    setEditingVolunteerId(null);
    setForm(INITIAL_FORM);
    setVolunteers([]);
    setVolunteerForm(INITIAL_VOLUNTEER_FORM);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.city.trim()) {
      toast.error('Preencha nome, telefone e cidade da ONG');
      return;
    }
    if (!isValidPhoneBR(form.phone)) {
      toast.error('Telefone da ONG inválido');
      return;
    }
    if (form.cnpj && !isValidCNPJ(form.cnpj)) {
      toast.error('CNPJ inválido');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: `${form.name.trim().toLowerCase().replace(/\s+/g, '.')}@entidade.local`,
        phone: form.phone.trim(),
        address: '',
        city: form.city.trim(),
        state: form.state.trim(),
        zip: '',
        cnpj: form.cnpj || undefined,
      };

      const saved = editingId
        ? await updateShelter(editingId, payload)
        : await createShelter(payload);

      if (!saved) {
        throw new Error(`Falha ao ${editingId ? 'atualizar' : 'cadastrar'} ONG`);
      }

      toast.success(editingId ? 'ONG atualizada com sucesso' : 'ONG cadastrada com sucesso');
      await loadOrganizations();
      backToList();
    } catch (error) {
      console.error('Erro ao salvar ONG:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar ONG');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (organization: Shelter) => {
    if (!window.confirm(`Deseja remover a ONG "${organization.name}"?`)) {
      return;
    }
    try {
      const ok = await deleteShelter(organization.id);
      if (!ok) {
        throw new Error('Falha ao excluir ONG');
      }
      toast.success('ONG removida com sucesso');
      await loadOrganizations();
    } catch (error) {
      console.error('Erro ao remover ONG:', error);
      toast.error('Erro ao remover ONG');
    }
  };

  const startVolunteerEdit = (volunteer: BackendVolunteer) => {
    setEditingVolunteerId(volunteer.id);
    setVolunteerForm({
      id: volunteer.id,
      authSubject: volunteer.authSubject,
      name: volunteer.fullName,
      email: volunteer.email,
      phone: volunteer.phone || '',
      organizationResponsible: volunteer.organizationResponsible === true,
      password: '',
    });
  };

  const cancelVolunteerEdit = () => {
    setEditingVolunteerId(null);
    setVolunteerForm(INITIAL_VOLUNTEER_FORM);
  };

  const handleCreateVolunteer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingId) {
      toast.error('Salve a ONG antes de cadastrar voluntários.');
      return;
    }

    if (!volunteerForm.name.trim() || !volunteerForm.email.trim()) {
      toast.error('Informe nome e email do voluntário');
      return;
    }
    if (!isValidEmail(volunteerForm.email)) {
      toast.error('Email do voluntário inválido');
      return;
    }
    if (volunteerForm.phone && !isValidPhoneBR(volunteerForm.phone)) {
      toast.error('Telefone do voluntário inválido');
      return;
    }

    const isEditingVolunteer = Boolean(editingVolunteerId);
    if (!isEditingVolunteer && !volunteerForm.password.trim()) {
      toast.error('Senha é obrigatória para cadastro do voluntário.');
      return;
    }

    setIsVolunteerSubmitting(true);
    try {
      const requestBody = {
        authSubject: normalizeEmail(volunteerForm.email),
        fullName: volunteerForm.name.trim(),
        email: normalizeEmail(volunteerForm.email),
        phone: volunteerForm.phone.trim() || null,
        userType: 'VOLUNTARIO',
        addressLine: null,
        addressNumber: null,
        neighborhood: null,
        city: null,
        state: null,
        zipCode: null,
        organizationId: editingId,
        organizationResponsible: volunteerForm.organizationResponsible,
        password: volunteerForm.password.trim() || null,
        roles: ['VOLUNTARIO'],
      };

      await apiRequest(isEditingVolunteer ? `/api/users/${editingVolunteerId}` : '/api/users', {
        method: isEditingVolunteer ? 'PUT' : 'POST',
        body: {
          ...requestBody,
          authSubject: volunteerForm.authSubject || requestBody.authSubject,
        },
      });
      toast.success(isEditingVolunteer ? 'Voluntário atualizado com sucesso' : 'Voluntário cadastrado com sucesso');
      cancelVolunteerEdit();
      setVolunteerForm(INITIAL_VOLUNTEER_FORM);
      await loadVolunteers(editingId);
    } catch (error) {
      console.error('Erro ao cadastrar voluntário:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar voluntário');
    } finally {
      setIsVolunteerSubmitting(false);
    }
  };

  const handleDeleteVolunteer = async (volunteer: BackendVolunteer) => {
    if (!editingId) {
      return;
    }
    if (!window.confirm(`Deseja remover o voluntário "${volunteer.fullName}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/users/${volunteer.id}`, { method: 'DELETE' });
      toast.success('Voluntário removido com sucesso');
      await loadVolunteers(editingId);
    } catch (error) {
      console.error('Erro ao remover voluntário:', error);
      toast.error('Erro ao remover voluntário');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">ONGs</CardTitle>
        <CardDescription>
          Consulte, cadastre e edite ONGs em uma experiência simplificada.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {mode === 'list' ? (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nome ou CNPJ"
                  className="pl-9"
                />
              </div>
              <Button onClick={openCreateForm} className="md:self-end">
                <Plus className="mr-2 h-4 w-4" />
                Nova ONG
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredOrganizations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma ONG encontrada para os filtros informados.
              </p>
            ) : (
              <>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Cidade/UF</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrganizations.map((organization) => (
                        <TableRow key={organization.id}>
                          <TableCell className="font-medium">{organization.name}</TableCell>
                          <TableCell>{organization.cnpj || '—'}</TableCell>
                          <TableCell>{organization.phone || '—'}</TableCell>
                          <TableCell>
                            {organization.city || '—'} / {organization.state || '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditForm(organization)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(organization)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="org-name">Nome da ONG</Label>
                  <Input
                    id="org-name"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Ex: ONG Amigos dos Animais"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="org-cnpj">CNPJ</Label>
                  <Input
                    id="org-cnpj"
                    value={form.cnpj}
                    onChange={(event) => setForm((prev) => ({ ...prev, cnpj: maskCNPJ(event.target.value) }))}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="org-phone">Telefone</Label>
                  <Input
                    id="org-phone"
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: maskPhoneBR(event.target.value) }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="org-city">Cidade</Label>
                  <Input
                    id="org-city"
                    value={form.city}
                    onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                    placeholder="São Paulo"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="org-state">UF</Label>
                  <Input
                    id="org-state"
                    value={form.state}
                    onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value.toUpperCase().slice(0, 2) }))}
                    placeholder="SP"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={backToList} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar ONG'}
                </Button>
              </div>
            </form>

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Voluntários da ONG</h3>
                <p className="text-sm text-muted-foreground">
                  Cadastre voluntários e marque quem é responsável da entidade.
                </p>
              </div>

              {!editingId ? (
                <p className="text-sm text-muted-foreground">
                  Salve a ONG primeiro para habilitar o cadastro de voluntários.
                </p>
              ) : (
                <>
                  <form onSubmit={handleCreateVolunteer} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="volunteer-name">Nome</Label>
                      <Input
                        id="volunteer-name"
                        value={volunteerForm.name}
                        onChange={(event) => setVolunteerForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="volunteer-email">Email</Label>
                      <Input
                        id="volunteer-email"
                        type="email"
                        value={volunteerForm.email}
                        onChange={(event) => setVolunteerForm((prev) => ({ ...prev, email: normalizeEmail(event.target.value) }))}
                        placeholder="voluntario@ong.org"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="volunteer-password">
                        {editingVolunteerId ? 'Nova senha (opcional)' : 'Senha'}
                      </Label>
                      <Input
                        id="volunteer-password"
                        type="password"
                        value={volunteerForm.password}
                        onChange={(event) => setVolunteerForm((prev) => ({ ...prev, password: event.target.value }))}
                        placeholder={editingVolunteerId ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="volunteer-phone">Telefone</Label>
                      <Input
                        id="volunteer-phone"
                        value={volunteerForm.phone}
                        onChange={(event) => setVolunteerForm((prev) => ({ ...prev, phone: maskPhoneBR(event.target.value) }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Responsável da entidade</Label>
                      <div className="h-10 rounded-md border px-3 flex items-center justify-between">
                        <span className="text-sm">Marcar como responsável</span>
                        <Checkbox
                          checked={volunteerForm.organizationResponsible}
                          onCheckedChange={(checked) =>
                            setVolunteerForm((prev) => ({ ...prev, organizationResponsible: checked === true }))
                          }
                        />
                      </div>
                    </div>
                    <div className="md:col-span-4 flex justify-end gap-2">
                      {editingVolunteerId && (
                        <Button type="button" variant="outline" onClick={cancelVolunteerEdit} disabled={isVolunteerSubmitting}>
                          Cancelar edição
                        </Button>
                      )}
                      <Button type="submit" disabled={isVolunteerSubmitting}>
                        {isVolunteerSubmitting ? 'Salvando...' : editingVolunteerId ? 'Salvar voluntário' : 'Cadastrar voluntário'}
                      </Button>
                    </div>
                  </form>

                  {isVolunteersLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : volunteers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum voluntário cadastrado para esta ONG.
                    </p>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Responsável</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {volunteers.map((volunteer) => (
                            <TableRow key={volunteer.id}>
                              <TableCell className="font-medium">{volunteer.fullName}</TableCell>
                              <TableCell>{volunteer.email}</TableCell>
                              <TableCell>{volunteer.phone || '—'}</TableCell>
                              <TableCell>{volunteer.organizationResponsible ? 'Sim' : 'Não'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => startVolunteerEdit(volunteer)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteVolunteer(volunteer)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrganizationManagement;
