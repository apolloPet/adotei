import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-sonner';
import {
  OrganizationPublicDetail,
  UpdateOrganizationProfilePayload,
  updateOrganizationProfile,
} from '@/services/organizationProfileService';

type OrganizationProfileEditDialogProps = {
  open: boolean;
  organization: OrganizationPublicDetail | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (organization: OrganizationPublicDetail) => void;
};

const OrganizationProfileEditDialog = ({
  open,
  organization,
  onOpenChange,
  onSaved,
}: OrganizationProfileEditDialogProps) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UpdateOrganizationProfilePayload | null>(null);

  useEffect(() => {
    if (!organization) {
      setForm(null);
      return;
    }
    setForm({
      legalName: organization.legalName,
      tradeName: organization.tradeName ?? '',
      cnpj: organization.cnpj ?? '',
      primaryContactName: organization.primaryContactName,
      secondaryContactName: organization.secondaryContactName ?? '',
      contactPhone1: organization.contactPhone1,
      contactPhone2: organization.contactPhone2 ?? '',
      contactEmail: organization.contactEmail ?? '',
      addressLine: organization.addressLine ?? '',
      city: organization.city,
      state: organization.state ?? '',
      aboutText: organization.aboutText ?? '',
      storyText: organization.storyText ?? '',
      foundedYear: organization.foundedYear ?? null,
      missionFocus: organization.missionFocus ?? '',
      structureInfo: organization.structureInfo ?? '',
      logoUrl: organization.logoUrl ?? '',
      websiteUrl: organization.websiteUrl ?? '',
      instagramUrl: organization.instagramUrl ?? '',
      facebookUrl: organization.facebookUrl ?? '',
      published: organization.published,
    });
  }, [organization]);

  const updateField = <K extends keyof UpdateOrganizationProfilePayload>(
    key: K,
    value: UpdateOrganizationProfilePayload[K],
  ) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async () => {
    if (!organization || !form) return;
    try {
      setSaving(true);
      const saved = await updateOrganizationProfile(organization.id, {
        ...form,
        tradeName: form.tradeName || null,
        cnpj: form.cnpj || null,
        secondaryContactName: form.secondaryContactName || null,
        contactPhone2: form.contactPhone2 || null,
        contactEmail: form.contactEmail || null,
        addressLine: form.addressLine || null,
        state: form.state || null,
        aboutText: form.aboutText || null,
        storyText: form.storyText || null,
        missionFocus: form.missionFocus || null,
        structureInfo: form.structureInfo || null,
        logoUrl: form.logoUrl || null,
        websiteUrl: form.websiteUrl || null,
        instagramUrl: form.instagramUrl || null,
        facebookUrl: form.facebookUrl || null,
      });
      toast.success('Perfil da ONG atualizado');
      onSaved(saved);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar perfil da ONG:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar perfil da ONG');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[min(96vw,48rem)] max-w-none flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Editar perfil da ONG</DialogTitle>
          <DialogDescription>
            Atualize as informações exibidas na página de ONGs parceiras.
          </DialogDescription>
        </DialogHeader>

        {form && (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-pet-primary-dark">Identificação</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="legalName">Razão social *</Label>
                  <Input
                    id="legalName"
                    value={form.legalName}
                    onChange={(e) => updateField('legalName', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="tradeName">Nome de exibição</Label>
                  <Input
                    id="tradeName"
                    value={form.tradeName ?? ''}
                    onChange={(e) => updateField('tradeName', e.target.value)}
                    placeholder="Como a ONG aparece publicamente"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" value={form.cnpj ?? ''} onChange={(e) => updateField('cnpj', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="foundedYear">Ano de fundação</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    min={1900}
                    max={2100}
                    value={form.foundedYear ?? ''}
                    onChange={(e) =>
                      updateField('foundedYear', e.target.value ? Number(e.target.value) : null)
                    }
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-pet-primary-dark">Contato e localização</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="primaryContactName">Contato principal *</Label>
                  <Input
                    id="primaryContactName"
                    value={form.primaryContactName}
                    onChange={(e) => updateField('primaryContactName', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="secondaryContactName">Contato secundário</Label>
                  <Input
                    id="secondaryContactName"
                    value={form.secondaryContactName ?? ''}
                    onChange={(e) => updateField('secondaryContactName', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contactPhone1">Telefone 1 *</Label>
                  <Input
                    id="contactPhone1"
                    value={form.contactPhone1}
                    onChange={(e) => updateField('contactPhone1', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contactPhone2">Telefone 2</Label>
                  <Input
                    id="contactPhone2"
                    value={form.contactPhone2 ?? ''}
                    onChange={(e) => updateField('contactPhone2', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="contactEmail">E-mail de contato</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={form.contactEmail ?? ''}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="addressLine">Endereço</Label>
                  <Input
                    id="addressLine"
                    value={form.addressLine ?? ''}
                    onChange={(e) => updateField('addressLine', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input id="city" value={form.city} onChange={(e) => updateField('city', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" value={form.state ?? ''} onChange={(e) => updateField('state', e.target.value)} />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-pet-primary-dark">Apresentação</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="aboutText">Quem somos</Label>
                  <Textarea
                    id="aboutText"
                    rows={4}
                    value={form.aboutText ?? ''}
                    onChange={(e) => updateField('aboutText', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="storyText">Nossa história</Label>
                  <Textarea
                    id="storyText"
                    rows={5}
                    value={form.storyText ?? ''}
                    onChange={(e) => updateField('storyText', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="missionFocus">Missão / foco</Label>
                  <Input
                    id="missionFocus"
                    value={form.missionFocus ?? ''}
                    onChange={(e) => updateField('missionFocus', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="structureInfo">Estrutura e atuação</Label>
                  <Textarea
                    id="structureInfo"
                    rows={3}
                    value={form.structureInfo ?? ''}
                    onChange={(e) => updateField('structureInfo', e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-pet-primary-dark">Redes e mídia</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="logoUrl">URL do logo</Label>
                  <Input
                    id="logoUrl"
                    value={form.logoUrl ?? ''}
                    onChange={(e) => updateField('logoUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="websiteUrl">Site</Label>
                  <Input
                    id="websiteUrl"
                    value={form.websiteUrl ?? ''}
                    onChange={(e) => updateField('websiteUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <Input
                    id="instagramUrl"
                    value={form.instagramUrl ?? ''}
                    onChange={(e) => updateField('instagramUrl', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="facebookUrl">Facebook</Label>
                  <Input
                    id="facebookUrl"
                    value={form.facebookUrl ?? ''}
                    onChange={(e) => updateField('facebookUrl', e.target.value)}
                  />
                </div>
              </div>
            </section>

            <div className="flex items-center gap-2 rounded-md border px-3 py-3">
              <Checkbox
                id="published"
                checked={form.published ?? true}
                onCheckedChange={(checked) => updateField('published', checked === true)}
              />
              <Label htmlFor="published" className="font-normal cursor-pointer">
                Exibir esta ONG na página pública de parceiras
              </Label>
            </div>
          </div>
        )}

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !form}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationProfileEditDialog;
