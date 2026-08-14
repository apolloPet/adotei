
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animal, deleteAnimalImage, uploadAnimalImage } from '@/services/animalService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-sonner';
import AuthedImage from '@/components/ui/authed-image';
import { apiRequest } from '@/lib/apiClient';
import AnimalBasicInfo from './AnimalBasicInfo';
import AnimalHealthInfo from './AnimalHealthInfo';
import AnimalCharacteristics from './AnimalCharacteristics';
import { AnimalFormData } from './types';

interface AnimalEditFormProps {
  animal: Animal;
  onSave: (updatedAnimal: Animal) => Promise<Animal | null>;
  onComplete: (updatedAnimal: Animal) => void;
  onCancel: () => void;
}

type PendingImage = {
  file: File;
  previewUrl: string;
};

type TraitOption = { id: string; description: string; active: boolean };
type RequirementOption = { id: string; name: string; active: boolean };
type OrganizationOption = { id: string; legalName: string };

interface BackendUserContext {
  id: string;
  userType: string;
  organizationId?: string;
  organizationName?: string;
}

/** Campos do cadastro (AnimalFormData) -> campos do animal salvo (Animal). */
const FIELD_MAP: Record<string, keyof Animal> = {
  name: 'nome',
  type: 'tipo',
  breed: 'raca',
  age: 'idade',
  gender: 'sexo',
  size: 'porte',
  sterilized: 'castrado',
  shelterEntryDate: 'data_entrada_abrigo',
};

const AnimalEditForm: React.FC<AnimalEditFormProps> = ({ animal, onSave, onComplete, onCancel }) => {
  const [formData, setFormData] = useState<Animal>({ ...animal });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState(animal.imagens ?? []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [removedExistingImageIds, setRemovedExistingImageIds] = useState<string[]>([]);
  const [traits, setTraits] = useState<TraitOption[]>([]);
  const [requirements, setRequirements] = useState<RequirementOption[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userOrganizationName, setUserOrganizationName] = useState<string | undefined>();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof Animal, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormDataChange = (updates: Partial<AnimalFormData>) => {
    setFormData((prev) => {
      const next: Record<string, unknown> = { ...prev };
      Object.entries(updates).forEach(([key, value]) => {
        const field = FIELD_MAP[key] ?? key;
        next[field] = field === 'idade' ? parseInt(String(value), 10) || 0 : value;
      });
      return next as unknown as Animal;
    });
  };

  const basicFormData: AnimalFormData = useMemo(() => ({
    name: formData.nome ?? '',
    type: formData.tipo,
    breed: formData.raca ?? '',
    age: formData.idade === undefined || formData.idade === null ? '' : String(formData.idade),
    gender: formData.sexo,
    size: formData.porte,
    personalityId: formData.personalityId ?? '',
    shelterEntryDate: formData.data_entrada_abrigo ?? '',
    pendingPersonality: null,
    vaccineIds: formData.vaccineIds ?? [],
    specialNeeds: formData.specialNeeds ?? false,
    specialNeedsDescription: formData.specialNeedsDescription ?? '',
    sterilized: formData.castrado ?? false,
    additionalInfo: formData.additionalInfo ?? '',
    goodWithChildren: formData.goodWithChildren ?? false,
    goodWithOtherAnimals: formData.goodWithOtherAnimals ?? false,
    goodWithSeniors: formData.goodWithSeniors ?? false,
    images: [],
    previewImages: [],
  }), [formData]);

  const organizationName = isAdmin
    ? organizations.find((org) => org.id === formData.organizationId)?.legalName
    : userOrganizationName;

  const handleCatalogToggle = (field: 'temperamentTraitIds' | 'requirementIds', id: string, checked: boolean) => {
    const currentIds = formData[field] ?? [];
    handleChange(field, checked ? [...currentIds, id] : currentIds.filter((currentId) => currentId !== id));
  };

  useEffect(() => {
    return () => {
      pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [pendingImages]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [traitData, requirementData] = await Promise.all([
          apiRequest<TraitOption[]>('/api/temperament-traits'),
          apiRequest<RequirementOption[]>('/api/adoption-requirements'),
        ]);
        setTraits(traitData.filter((trait) => trait.active));
        setRequirements(requirementData.filter((requirement) => requirement.active));
      } catch (error) {
        console.error('Erro ao carregar catálogos:', error);
        toast.error('Não foi possível carregar traços e requisitos.');
      }
    };

    const loadUserContext = async () => {
      try {
        const currentUser = await apiRequest<BackendUserContext>('/api/users/me');
        if (currentUser.userType === 'ADMIN') {
          setIsAdmin(true);
          setOrganizations(await apiRequest<OrganizationOption[]>('/api/organizations'));
        } else {
          setUserOrganizationName(currentUser.organizationName);
        }
      } catch (error) {
        console.error('Erro ao carregar contexto do usuário:', error);
      }
    };

    void loadCatalogs();
    void loadUserContext();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizationId) {
      toast.error(
        isAdmin
          ? 'Selecione a ONG responsável pelo animal'
          : 'Você precisa estar vinculado a uma ONG para editar o animal',
      );
      return;
    }
    if (!formData.personalityId) {
      toast.error('Selecione uma personalidade e temperamento');
      return;
    }
    setIsSubmitting(true);

    try {
      const savedAnimal = await onSave(formData);
      if (!savedAnimal) {
        throw new Error('Falha ao salvar dados do animal');
      }

      let latestAnimal: Animal | null = savedAnimal;
      for (const imageId of removedExistingImageIds) {
        latestAnimal = await deleteAnimalImage(savedAnimal.id, imageId);
      }

      const baseOrder = existingImages.length;
      for (let index = 0; index < pendingImages.length; index += 1) {
        latestAnimal = await uploadAnimalImage(
          savedAnimal.id,
          pendingImages[index].file,
          baseOrder + index,
        );
      }

      pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      onComplete(latestAnimal ?? savedAnimal);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    const imageCount = existingImages.length + pendingImages.length;
    const remainingSlots = Math.max(0, 2 - imageCount);
    if (remainingSlots <= 0) {
      toast.error('Este animal já possui o máximo de 2 imagens.');
      event.target.value = '';
      return;
    }

    const files = Array.from(event.target.files).slice(0, remainingSlots);
    const validFiles = files.filter((file) => {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`O arquivo ${file.name} excede 5MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`O arquivo ${file.name} não é uma imagem válida.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      event.target.value = '';
      return;
    }

    const newPending = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPendingImages((prev) => [...prev, ...newPending]);
    event.target.value = '';
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setExistingImages((prev) => prev.filter((image) => image.id !== imageId));
    setRemovedExistingImageIds((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]));
  };

  const handleRemovePendingImage = (index: number) => {
    setPendingImages((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(index, 1);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return updated;
    });
  };

  const openImagePicker = () => {
    const imageCount = existingImages.length + pendingImages.length;
    if (imageCount >= 2) {
      toast.error('Este animal já possui o máximo de 2 imagens.');
      return;
    }
    imageInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 min-w-0">
      {isAdmin ? (
        <div className="space-y-2 pb-4 border-b">
          <Label>ONG*</Label>
          <Select
            value={formData.organizationId ?? undefined}
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                organizationId: value,
                // Personalidade é por ONG: ao transferir o animal é preciso escolher de novo.
                ...(value === prev.organizationId ? {} : { personalityId: undefined }),
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a ONG responsável" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.legalName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Alterar a ONG transfere o animal e exige selecionar uma personalidade da nova ONG.
          </p>
        </div>
      ) : (
        <div className="space-y-1 pb-4 border-b">
          <Label>ONG</Label>
          <p className="text-sm text-muted-foreground break-words">
            {organizationName ?? 'ONG não identificada'}
          </p>
        </div>
      )}

      <AnimalBasicInfo
        formData={basicFormData}
        organizationId={formData.organizationId}
        organizationLocked={!isAdmin}
        deferPersonalityCreate={false}
        fallbackPersonalityText={formData.personalityName ?? formData.personalityTemperament}
        onFormChange={handleFormDataChange}
      />

      <div className="pt-6 border-t">
        <h4 className="text-sm font-semibold mb-3">Fotos do animal</h4>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImportImages}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between mb-3">
          <Label>Imagens do animal</Label>
          <Button
            type="button"
            variant="outline"
            onClick={openImagePicker}
            disabled={isSubmitting}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar novas imagens
          </Button>
        </div>

        {existingImages.length + pendingImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {existingImages.map((imagem, index) => (
              <div key={imagem.id} className="relative aspect-square rounded-md overflow-hidden border">
                <AuthedImage
                  src={imagem.url}
                  alt={`Imagem ${index + 1} de ${formData.nome}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 disabled:opacity-50"
                  onClick={() => handleRemoveExistingImage(imagem.id)}
                  disabled={isSubmitting}
                  aria-label="Excluir imagem"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {pendingImages.map((imagem, index) => (
              <div key={`${imagem.file.name}-${index}`} className="relative aspect-square rounded-md overflow-hidden border border-dashed">
                <img
                  src={imagem.previewUrl}
                  alt={`Nova imagem ${index + 1} de ${formData.nome}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute left-2 top-2 rounded bg-amber-500/90 px-2 py-1 text-[11px] font-medium text-white">
                  Nova
                </div>
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 disabled:opacity-50"
                  onClick={() => handleRemovePendingImage(index)}
                  disabled={isSubmitting}
                  aria-label="Excluir nova imagem"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            Nenhuma imagem cadastrada para este animal.
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Máximo de 2 imagens por animal.
        </p>
      </div>

      <div className="pt-6 border-t">
        <AnimalHealthInfo formData={basicFormData} onFormChange={handleFormDataChange} />
      </div>

      <div className="pt-6 border-t">
        <AnimalCharacteristics formData={basicFormData} onFormChange={handleFormDataChange} />
      </div>

      <section className="space-y-4 rounded-lg border p-4">
        <div>
          <h3 className="font-semibold">Saúde complementar</h3>
          <p className="text-sm text-muted-foreground">Dados de acompanhamento veterinário disponíveis apenas na edição.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vaccinationStatus">Status de vacinação</Label>
            <Input id="vaccinationStatus" value={formData.vaccinationStatus ?? ''} onChange={(e) => handleChange('vaccinationStatus', e.target.value)} placeholder="Ex.: vacinação em dia" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="energyLevel">Nível de energia</Label>
            <Input id="energyLevel" value={formData.energyLevel ?? ''} onChange={(e) => handleChange('energyLevel', e.target.value)} placeholder="Ex.: alto, moderado" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="veterinaryInfo">Informações veterinárias</Label>
            <Textarea id="veterinaryInfo" value={formData.veterinaryInfo ?? ''} onChange={(e) => handleChange('veterinaryInfo', e.target.value)} placeholder="Consultas, tratamentos ou observações veterinárias" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="healthConditions">Condições de saúde</Label>
            <Textarea id="healthConditions" value={formData.healthConditions ?? ''} onChange={(e) => handleChange('healthConditions', e.target.value)} placeholder="Ex.: alergias, doenças crônicas ou restrições" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="trainability">Treinabilidade</Label>
            <Textarea id="trainability" value={formData.trainability ?? ''} onChange={(e) => handleChange('trainability', e.target.value)} placeholder="Ex.: responde bem a comandos básicos" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Traços de temperamento</Label>
            <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
              {traits.map((trait) => <div key={trait.id} className="flex items-start gap-2"><Checkbox id={`trait-${trait.id}`} checked={(formData.temperamentTraitIds ?? []).includes(trait.id)} onCheckedChange={(checked) => handleCatalogToggle('temperamentTraitIds', trait.id, checked === true)} /><Label htmlFor={`trait-${trait.id}`} className="leading-snug">{trait.description}</Label></div>)}
              {traits.length === 0 && <p className="text-sm text-muted-foreground">Nenhum traço de temperamento cadastrado.</p>}
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Requisitos para adoção</Label>
            <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
              {requirements.map((requirement) => <div key={requirement.id} className="flex items-start gap-2"><Checkbox id={`requirement-${requirement.id}`} checked={(formData.requirementIds ?? []).includes(requirement.id)} onCheckedChange={(checked) => handleCatalogToggle('requirementIds', requirement.id, checked === true)} /><Label htmlFor={`requirement-${requirement.id}`} className="leading-snug">{requirement.name}</Label></div>)}
              {requirements.length === 0 && <p className="text-sm text-muted-foreground">Nenhum requisito cadastrado.</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Localização e responsáveis</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2"><Label htmlFor="location">Localização</Label><Input id="location" value={formData.location ?? ''} onChange={(e) => handleChange('location', e.target.value)} placeholder="Cidade/UF ou endereço de referência" /></div>
          <div className="space-y-2"><Label htmlFor="tutorName">Nome do tutor/responsável</Label><Input id="tutorName" value={formData.tutorName ?? ''} onChange={(e) => handleChange('tutorName', e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="tutorContact">Contato do tutor/responsável</Label><Input id="tutorContact" value={formData.tutorContact ?? ''} onChange={(e) => handleChange('tutorContact', e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="responsibleName">Responsável pelo cadastro</Label><Input id="responsibleName" value={formData.responsibleName ?? ''} onChange={(e) => handleChange('responsibleName', e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="responsibleContact">Contato do responsável</Label><Input id="responsibleContact" value={formData.responsibleContact ?? ''} onChange={(e) => handleChange('responsibleContact', e.target.value)} /></div>
        </div>
      </section>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
};

export default AnimalEditForm;
