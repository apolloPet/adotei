import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-sonner';
import { ExtendedProfile, UserProfile } from '@/types/user';
import { getProfile, updateProfile } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/auth';
import { fileToDataUrl } from '@/utils/fileUpload';
import {
  housingSchema,
  experienceSchema,
  financialSchema,
  intentionSchema,
  HousingForm,
  ExperienceForm,
  FinancialForm,
  IntentionForm,
} from '@/lib/schemas/profile';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { changeAdminPassword } from '@/services/auth';
import {
  getMyAdopterProfile,
  mapBackendProfileToExtended,
  mapExtendedToBackendProfile,
  saveMyAdopterProfile,
  invalidateCompatibilityProfileCache,
  syncAdopterProfileToBackend,
} from '@/services/compatibilityService';
import { loadExtendedProfile, saveExtendedProfile } from '@/utils/adopterProfileStorage';

const EXTENDED_KEY = 'user_profile_extended';

const loadExtended = (userId?: string): ExtendedProfile => {
  if (!userId) return {};
  try {
    const all = JSON.parse(localStorage.getItem(EXTENDED_KEY) || '{}');
    return all[userId] || {};
  } catch {
    return {};
  }
};
const saveExtended = (userId: string, ext: ExtendedProfile) => {
  const all = JSON.parse(localStorage.getItem(EXTENDED_KEY) || '{}');
  all[userId] = ext;
  localStorage.setItem(EXTENDED_KEY, JSON.stringify(all));
};

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const userId = user?.id ?? null;
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [extended, setExtended] = useState<ExtendedProfile>({});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [removingProof, setRemovingProof] = useState(false);
  const proofFileInputKey = useRef(0);

  // Forms
  const housingForm = useForm<HousingForm>({
    resolver: zodResolver(housingSchema),
    defaultValues: {
      type: 'house',
      ownership: 'owned',
      hasYard: false,
      numResidents: 1,
      hasChildren: false,
    },
  });
  const experienceForm = useForm<ExperienceForm>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { hadPetsBefore: false, currentlyHasPets: false, returnedAnimal: false },
  });
  const financialForm = useForm<FinancialForm>({
    resolver: zodResolver(financialSchema),
    defaultValues: {
      awareOfCosts: false,
      monthlyBudget: '300-600',
      willCoverVaccines: true,
      willCoverNeutering: true,
      willCoverEmergencies: true,
    },
  });
  const intentionForm = useForm<IntentionForm>({
    resolver: zodResolver(intentionSchema),
    defaultValues: {
      reasonToAdopt: '',
      hoursAloneDaily: 4,
      ifDestroyed: '',
      ifSick: '',
      willAdapt: true,
    },
  });

  useEffect(() => {
    (async () => {
      if (!userId || !user) return;
      const isInitialLoad = !hasLoadedRef.current;
      if (isInitialLoad) {
        setLoading(true);
      }
      try {
        const fetched = await getProfile();
        const base: UserProfile = fetched ?? {
          id: userId,
          firstName: user.user_metadata?.firstName || '',
          lastName: user.user_metadata?.lastName || '',
          email: user.email || '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          avatarUrl: '',
          housingType: 'house',
          hasChildren: false,
          childrenAges: '',
          hadPetsBefore: false,
          hasAllergies: false,
          allergiesDescription: '',
          workSchedule: '',
        };
        setProfile(base);
        let ext = loadExtended(userId) || loadExtendedProfile(userId) || {};
        try {
          const backendProfile = await getMyAdopterProfile();
          if (backendProfile) {
            ext = mapBackendProfileToExtended(backendProfile);
            saveExtended(userId, ext);
            saveExtendedProfile(userId, ext);
          } else if (isInitialLoad && Object.keys(ext).length > 0) {
            const synced = await syncAdopterProfileToBackend(userId, ext);
            ext = mapBackendProfileToExtended(synced);
            saveExtended(userId, ext);
          }
        } catch {
          // fallback para cache local quando o perfil estendido ainda nao existir
        }
        setExtended(ext);
        if (isInitialLoad) {
          if (ext.housing) {
            housingForm.reset({
              type: ext.housing.type ?? 'house',
              ownership: ext.housing.ownership ?? 'owned',
              rentAllowsPets: ext.housing.rentAllowsPets ?? undefined,
              hasYard: ext.housing.hasYard ?? false,
              yardWalled: ext.housing.yardWalled ?? undefined,
              hasWindowScreens: ext.housing.hasWindowScreens ?? undefined,
              numResidents: ext.housing.numResidents ?? 1,
              hasChildren: ext.housing.hasChildren ?? false,
              childrenAges: ext.housing.childrenAges,
            });
          }
          if (ext.experience) experienceForm.reset(ext.experience as ExperienceForm);
          if (ext.financial) financialForm.reset(ext.financial as FinancialForm);
          if (ext.intention) intentionForm.reset(ext.intention as IntentionForm);
        }
        hasLoadedRef.current = true;
      } catch (e) {
        console.error(e);
        if (isInitialLoad) {
          toast.error('Erro ao carregar perfil');
        }
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSavePersonal = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile(profile);
    } finally {
      setSaving(false);
    }
  };

  const persistExtended = async (next: ExtendedProfile) => {
    if (!user?.id) return;
    try {
      const payload = mapExtendedToBackendProfile(user.id, next);
      await saveMyAdopterProfile(payload);
      invalidateCompatibilityProfileCache();
      setExtended(next);
      saveExtended(user.id, next);
      toast.success('Informações salvas');
    } catch (error) {
      console.error(error);
      toast.error('Nao foi possivel salvar o perfil estendido no servidor');
    }
  };

  const handleHousing = housingForm.handleSubmit(async (data) => persistExtended({ ...extended, housing: data as any }));
  const handleExperience = experienceForm.handleSubmit(async (data) => persistExtended({ ...extended, experience: data as any }));
  const handleFinancial = financialForm.handleSubmit(async (data) => persistExtended({ ...extended, financial: data as any }));
  const handleIntention = intentionForm.handleSubmit(async (data) => persistExtended({ ...extended, intention: data as any }));

  const handleProofUpload = async (file: File) => {
    try {
      const url = await fileToDataUrl(file, 2 * 1024 * 1024, 'image/');
      const next = {
        ...extended,
        proof: {
          ...(extended.proof || {}),
          environmentPhotoUrl: url,
        },
      };
      await persistExtended(next);
      proofFileInputKey.current += 1;
    } catch (e: any) {
      toast.error(e.message || 'Erro no upload');
    }
  };

  const handleProofRemove = async () => {
    if (!user?.id || !extended.proof?.environmentPhotoUrl) return;
    setRemovingProof(true);
    try {
      const next: ExtendedProfile = {
        ...extended,
        proof: {
          ...extended.proof,
          environmentPhotoUrl: undefined,
        },
      };
      const payload = mapExtendedToBackendProfile(user.id, next);
      await saveMyAdopterProfile({ ...payload, environmentPhotoUrl: '' });
      invalidateCompatibilityProfileCache(user.id);
      setExtended(next);
      saveExtended(user.id, next);
      proofFileInputKey.current += 1;
      toast.success('Comprovação removida');
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível remover a comprovação');
    } finally {
      setRemovingProof(false);
    }
  };

  const handleAdminPasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('As novas senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setChangingPassword(true);
    try {
      const success = await changeAdminPassword(currentPassword, newPassword);
      if (success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <Card className="max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Você precisa estar logado para ver esta página</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading || !profile) {
    return (
      <Card className="max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Carregando suas informações...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const housingOwn = housingForm.watch('ownership');
  const housingHasChildren = housingForm.watch('hasChildren');
  const expHasPets = experienceForm.watch('currentlyHasPets');
  const reasonLen = intentionForm.watch('reasonToAdopt')?.length ?? 0;

  return (
    <div className="container mx-auto p-4 pt-32">
      <Card className="max-w-4xl mx-auto my-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Seu Perfil</CardTitle>
          <CardDescription>
            Complete todas as etapas para se tornar elegível para adoção.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="personal">Pessoal</TabsTrigger>
              <TabsTrigger value="housing">Moradia</TabsTrigger>
              <TabsTrigger value="experience">Experiência</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="intention">Intenção</TabsTrigger>
              <TabsTrigger value="proof">Comprovação</TabsTrigger>
            </TabsList>

            {/* PERSONAL */}
            <TabsContent value="personal" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={profile.firstName || ''} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Sobrenome</Label>
                  <Input value={profile.lastName || ''} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Endereço</Label>
                  <Input value={profile.address || ''} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input value={profile.state || ''} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input value={profile.zip || ''} onChange={(e) => setProfile({ ...profile, zip: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>Possui alergia a animais</Label>
                    <Switch
                      checked={!!profile.hasAllergies}
                      onCheckedChange={(checked) => setProfile({ ...profile, hasAllergies: checked, allergiesDescription: checked ? profile.allergiesDescription : '' })}
                    />
                  </div>
                  {profile.hasAllergies && (
                    <Textarea
                      placeholder="Descreva a alergia"
                      value={profile.allergiesDescription || ''}
                      onChange={(e) => setProfile({ ...profile, allergiesDescription: e.target.value })}
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSavePersonal} disabled={saving}>Salvar</Button>
              </div>
            </TabsContent>

            {/* HOUSING */}
            <TabsContent value="housing" className="pt-4">
              <form onSubmit={handleHousing} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de moradia</Label>
                    <Select value={housingForm.watch('type')} onValueChange={(v) => housingForm.setValue('type', v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">Casa</SelectItem>
                        <SelectItem value="apartment">Apartamento</SelectItem>
                        <SelectItem value="farm">Chácara/sítio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Imóvel</Label>
                    <Select value={housingOwn} onValueChange={(v) => housingForm.setValue('ownership', v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owned">Próprio</SelectItem>
                        <SelectItem value="rented">Alugado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {housingOwn === 'rented' && (
                    <div className="md:col-span-2 flex items-center justify-between rounded-md border p-3">
                      <Label>Aluguel permite animais?</Label>
                      <Switch
                        checked={!!housingForm.watch('rentAllowsPets')}
                        onCheckedChange={(c) => housingForm.setValue('rentAllowsPets', c, { shouldValidate: true })}
                      />
                    </div>
                  )}
                  {housingForm.formState.errors.rentAllowsPets && (
                    <p className="text-xs text-destructive md:col-span-2">{housingForm.formState.errors.rentAllowsPets.message}</p>
                  )}

                  <div className="flex items-center justify-between rounded-md border p-3">
                    <Label>Possui quintal?</Label>
                    <Switch checked={!!housingForm.watch('hasYard')} onCheckedChange={(c) => housingForm.setValue('hasYard', c)} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <Label>Quintal é murado?</Label>
                    <Switch checked={!!housingForm.watch('yardWalled')} onCheckedChange={(c) => housingForm.setValue('yardWalled', c)} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <Label>Tela em janelas (gatos)?</Label>
                    <Switch checked={!!housingForm.watch('hasWindowScreens')} onCheckedChange={(c) => housingForm.setValue('hasWindowScreens', c)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantas pessoas moram com você?</Label>
                    <Input type="number" min={1} {...housingForm.register('numResidents')} />
                    {housingForm.formState.errors.numResidents && (
                      <p className="text-xs text-destructive">{housingForm.formState.errors.numResidents.message}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <Label>Tem crianças?</Label>
                    <Switch checked={!!housingHasChildren} onCheckedChange={(c) => housingForm.setValue('hasChildren', c)} />
                  </div>
                  {housingHasChildren && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Idades das crianças</Label>
                      <Input placeholder="Ex: 5, 8, 12" {...housingForm.register('childrenAges')} />
                    </div>
                  )}
                </div>
                <div className="flex justify-end"><Button type="submit">Salvar moradia</Button></div>
              </form>
            </TabsContent>

            {/* EXPERIENCE */}
            <TabsContent value="experience" className="pt-4">
              <form onSubmit={handleExperience} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <Label>Já teve pets antes?</Label>
                    <Switch checked={!!experienceForm.watch('hadPetsBefore')} onCheckedChange={(c) => experienceForm.setValue('hadPetsBefore', c)} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <Label>Atualmente tem pets?</Label>
                    <Switch checked={!!expHasPets} onCheckedChange={(c) => experienceForm.setValue('currentlyHasPets', c)} />
                  </div>
                  {expHasPets && (
                    <>
                      <div className="space-y-2">
                        <Label>Quantos?</Label>
                        <Input type="number" min={0} {...experienceForm.register('currentPetsCount')} />
                      </div>
                      <div className="space-y-2">
                        <Label>Quais?</Label>
                        <Input placeholder="Ex: 1 cão SRD, 1 gato" {...experienceForm.register('currentPetsTypes')} />
                      </div>
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <Label>Vacinados?</Label>
                        <Switch checked={!!experienceForm.watch('petsVaccinated')} onCheckedChange={(c) => experienceForm.setValue('petsVaccinated', c)} />
                      </div>
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <Label>Castrados?</Label>
                        <Switch checked={!!experienceForm.watch('petsNeutered')} onCheckedChange={(c) => experienceForm.setValue('petsNeutered', c)} />
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between rounded-md border p-3 md:col-span-2">
                    <Label>Já devolveu algum animal?</Label>
                    <Switch checked={!!experienceForm.watch('returnedAnimal')} onCheckedChange={(c) => experienceForm.setValue('returnedAnimal', c)} />
                  </div>
                </div>
                <div className="flex justify-end"><Button type="submit">Salvar experiência</Button></div>
              </form>
            </TabsContent>

            {/* FINANCIAL */}
            <TabsContent value="financial" className="pt-4">
              <form onSubmit={handleFinancial} className="space-y-4">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <Label>Está ciente dos custos mensais de um pet?</Label>
                  <Switch checked={!!financialForm.watch('awareOfCosts')} onCheckedChange={(c) => financialForm.setValue('awareOfCosts', c)} />
                </div>
                <div className="space-y-2">
                  <Label>Estimativa de gasto mensal viável</Label>
                  <Select
                    value={financialForm.watch('monthlyBudget')}
                    onValueChange={(v) => financialForm.setValue('monthlyBudget', v as any)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100-300">R$ 100–300</SelectItem>
                      <SelectItem value="300-600">R$ 300–600</SelectItem>
                      <SelectItem value="600+">R$ 600+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <Label>Vacinas?</Label>
                    <Switch checked={!!financialForm.watch('willCoverVaccines')} onCheckedChange={(c) => financialForm.setValue('willCoverVaccines', c)} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <Label>Castração?</Label>
                    <Switch checked={!!financialForm.watch('willCoverNeutering')} onCheckedChange={(c) => financialForm.setValue('willCoverNeutering', c)} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <Label>Emergências vet.?</Label>
                    <Switch checked={!!financialForm.watch('willCoverEmergencies')} onCheckedChange={(c) => financialForm.setValue('willCoverEmergencies', c)} />
                  </div>
                </div>
                <div className="flex justify-end"><Button type="submit">Salvar financeiro</Button></div>
              </form>
            </TabsContent>

            {/* INTENTION */}
            <TabsContent value="intention" className="pt-4">
              <form onSubmit={handleIntention} className="space-y-4">
                <div className="space-y-2">
                  <Label>Por que deseja adotar? (máx. 1000 caracteres)</Label>
                  <Textarea rows={8} maxLength={1000} {...intentionForm.register('reasonToAdopt')} />
                  <p className={`text-xs ${reasonLen > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {reasonLen}/1000
                  </p>
                  {intentionForm.formState.errors.reasonToAdopt && (
                    <p className="text-xs text-destructive">{intentionForm.formState.errors.reasonToAdopt.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Quanto tempo o animal ficaria sozinho por dia (horas)?</Label>
                  <Input type="number" min={0} max={24} {...intentionForm.register('hoursAloneDaily')} />
                </div>
                <div className="space-y-2">
                  <Label>O que faria se o animal destruísse algo?</Label>
                  <Textarea {...intentionForm.register('ifDestroyed')} />
                  {intentionForm.formState.errors.ifDestroyed && (
                    <p className="text-xs text-destructive">{intentionForm.formState.errors.ifDestroyed.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>O que faria se o animal ficasse doente?</Label>
                  <Textarea {...intentionForm.register('ifSick')} />
                  {intentionForm.formState.errors.ifSick && (
                    <p className="text-xs text-destructive">{intentionForm.formState.errors.ifSick.message}</p>
                  )}
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <Label>Está disposto à adaptação inicial?</Label>
                  <Switch checked={!!intentionForm.watch('willAdapt')} onCheckedChange={(c) => intentionForm.setValue('willAdapt', c)} />
                </div>
                <div className="flex justify-end"><Button type="submit">Salvar intenção</Button></div>
              </form>
            </TabsContent>

            {/* PROOF */}
            <TabsContent value="proof" className="pt-4 space-y-6">
              <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm flex gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <span>
                  Você pode enviar uma foto opcional do ambiente onde o animal viverá. Isso ajuda a ONG a validar a adoção.
                </span>
              </div>
              <div className="space-y-2">
                <Label>Foto do local (opcional, máx. 2MB)</Label>
                <Input
                  key={proofFileInputKey.current}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleProofUpload(e.target.files[0])}
                />
                {extended.proof?.environmentPhotoUrl && (
                  <div className="mt-2 space-y-2">
                    <img
                      src={extended.proof.environmentPhotoUrl}
                      alt="Local"
                      className="rounded-md max-h-48 w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={removingProof}
                      onClick={handleProofRemove}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {removingProof ? 'Removendo...' : 'Excluir comprovação'}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {isAdmin && (
            <div className="mt-8 rounded-lg border p-4 space-y-4">
              <h3 className="text-lg font-semibold">Segurança do Administrador</h3>
              <p className="text-sm text-muted-foreground">
                Altere sua senha de administrador diretamente em Meu Perfil.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Senha atual</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nova senha</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar nova senha</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAdminPasswordChange} disabled={changingPassword}>
                  {changingPassword ? 'Salvando...' : 'Alterar senha'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
