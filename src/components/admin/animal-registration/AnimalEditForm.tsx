
import React, { useEffect, useRef, useState } from 'react';
import { Animal, deleteAnimalImage, uploadAnimalImage } from '@/services/animalService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-sonner';
import PersonalitySelect from './PersonalitySelect';
import AuthedImage from '@/components/ui/authed-image';
import { apiRequest } from '@/lib/apiClient';

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

type VaccineOption = {
  id: string;
  name: string;
  animalType: string;
  active: boolean;
};

type TraitOption = { id: string; description: string; active: boolean };
type RequirementOption = { id: string; name: string; active: boolean };

const AnimalEditForm: React.FC<AnimalEditFormProps> = ({ animal, onSave, onComplete, onCancel }) => {
  const [formData, setFormData] = useState<Animal>({ ...animal });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState(animal.imagens ?? []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [removedExistingImageIds, setRemovedExistingImageIds] = useState<string[]>([]);
  const [vaccines, setVaccines] = useState<VaccineOption[]>([]);
  const [traits, setTraits] = useState<TraitOption[]>([]);
  const [requirements, setRequirements] = useState<RequirementOption[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof Animal, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVaccineToggle = (vaccineId: string, checked: boolean) => {
    const currentIds = formData.vaccineIds ?? [];
    handleChange(
      'vaccineIds',
      checked ? [...currentIds, vaccineId] : currentIds.filter((id) => id !== vaccineId),
    );
  };

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
    const loadVaccines = async () => {
      try {
        const [vaccineData, traitData, requirementData] = await Promise.all([
          apiRequest<VaccineOption[]>('/api/vaccines'),
          apiRequest<TraitOption[]>('/api/temperament-traits'),
          apiRequest<RequirementOption[]>('/api/adoption-requirements'),
        ]);
        setVaccines(vaccineData.filter((vaccine) => vaccine.active));
        setTraits(traitData.filter((trait) => trait.active));
        setRequirements(requirementData.filter((requirement) => requirement.active));
      } catch (error) {
        console.error('Erro ao carregar vacinas:', error);
        toast.error('Não foi possível carregar as vacinas disponíveis.');
      }
    };
    void loadVaccines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            required
          />
        </div>

        {/* Tipo */}
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo</Label>
          <Select 
            value={formData.tipo} 
            onValueChange={(value) => handleChange('tipo', value)}
          >
            <SelectTrigger id="tipo">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cachorro">Cachorro</SelectItem>
              <SelectItem value="gato">Gato</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="raca">Raça</Label>
          <Input
            id="raca"
            value={formData.raca ?? ''}
            onChange={(e) => handleChange('raca', e.target.value)}
            placeholder="Ex.: Sem raça definida"
          />
        </div>

        {/* Idade */}
        <div className="space-y-2">
          <Label htmlFor="idade">Idade (anos)</Label>
          <Input
            id="idade"
            type="number"
            min="0"
            value={formData.idade}
            onChange={(e) => handleChange('idade', parseInt(e.target.value) || 0)}
            required
          />
        </div>

        {/* Sexo */}
        <div className="space-y-2">
          <Label htmlFor="sexo">Sexo</Label>
          <Select 
            value={formData.sexo} 
            onValueChange={(value) => handleChange('sexo', value)}
          >
            <SelectTrigger id="sexo">
              <SelectValue placeholder="Selecione o sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="macho">Macho</SelectItem>
              <SelectItem value="femea">Fêmea</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Porte */}
        <div className="space-y-2">
          <Label htmlFor="porte">Porte</Label>
          <Select 
            value={formData.porte} 
            onValueChange={(value) => handleChange('porte', value)}
          >
            <SelectTrigger id="porte">
              <SelectValue placeholder="Selecione o porte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pequeno">Pequeno</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="grande">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Castrado */}
        <div className="flex items-center justify-between">
          <Label htmlFor="castrado">Castrado</Label>
          <Switch
            id="castrado"
            checked={formData.castrado}
            onCheckedChange={(checked) => handleChange('castrado', checked)}
          />
        </div>
      </div>

      {/* Personalidade */}
      <PersonalitySelect
        organizationId={formData.organizationId}
        value={formData.personalityId ?? ''}
        fallbackPersonalityText={formData.personalityName ?? formData.personalityTemperament}
        onChange={(personalityId) => handleChange('personalityId', personalityId)}
      />

      <section className="space-y-4 rounded-lg border p-4">
        <div>
          <h3 className="font-semibold">Saúde e vacinas</h3>
          <p className="text-sm text-muted-foreground">Atualize vacinas, condições de saúde e cuidados especiais.</p>
        </div>
        <div className="space-y-2">
          <Label>Vacinas</Label>
          <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
            {vaccines.filter((vaccine) => vaccine.animalType === formData.tipo).sort((a, b) => a.name.localeCompare(b.name)).map((vaccine) => (
              <div key={vaccine.id} className="flex items-start gap-2">
                <Checkbox id={`edit-vaccine-${vaccine.id}`} checked={(formData.vaccineIds ?? []).includes(vaccine.id)} onCheckedChange={(checked) => handleVaccineToggle(vaccine.id, checked === true)} />
                <Label htmlFor={`edit-vaccine-${vaccine.id}`} className="leading-snug">{vaccine.name}</Label>
              </div>
            ))}
            {vaccines.filter((vaccine) => vaccine.animalType === formData.tipo).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma vacina cadastrada para este tipo de animal.</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vaccinationStatus">Status de vacinação</Label>
            <Input id="vaccinationStatus" value={formData.vaccinationStatus ?? ''} onChange={(e) => handleChange('vaccinationStatus', e.target.value)} placeholder="Ex.: vacinação em dia" />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-md border p-3">
            <Label htmlFor="specialNeeds">Possui necessidades especiais</Label>
            <Switch id="specialNeeds" checked={formData.specialNeeds ?? false} onCheckedChange={(checked) => handleChange('specialNeeds', checked)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="veterinaryInfo">Informações veterinárias</Label>
            <Textarea id="veterinaryInfo" value={formData.veterinaryInfo ?? ''} onChange={(e) => handleChange('veterinaryInfo', e.target.value)} placeholder="Consultas, tratamentos ou observações veterinárias" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="healthConditions">Condições de saúde</Label>
            <Textarea id="healthConditions" value={formData.healthConditions ?? ''} onChange={(e) => handleChange('healthConditions', e.target.value)} placeholder="Ex.: alergias, doenças crônicas ou restrições" />
          </div>
          {(formData.specialNeeds ?? false) && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="specialNeedsDescription">Descrição das necessidades especiais</Label>
              <Textarea id="specialNeedsDescription" value={formData.specialNeedsDescription ?? ''} onChange={(e) => handleChange('specialNeedsDescription', e.target.value)} placeholder="Descreva os cuidados necessários" />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <div>
          <h3 className="font-semibold">Comportamento e convivência</h3>
          <p className="text-sm text-muted-foreground">Esses dados ajudam a encontrar o adotante mais adequado.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between gap-4 rounded-md border p-3"><Label htmlFor="goodWithChildren">Convive bem com crianças</Label><Switch id="goodWithChildren" checked={formData.goodWithChildren ?? false} onCheckedChange={(checked) => handleChange('goodWithChildren', checked)} /></div>
          <div className="flex items-center justify-between gap-4 rounded-md border p-3"><Label htmlFor="goodWithOtherAnimals">Convive bem com outros animais</Label><Switch id="goodWithOtherAnimals" checked={formData.goodWithOtherAnimals ?? false} onCheckedChange={(checked) => handleChange('goodWithOtherAnimals', checked)} /></div>
          <div className="flex items-center justify-between gap-4 rounded-md border p-3"><Label htmlFor="goodWithSeniors">Convive bem com idosos</Label><Switch id="goodWithSeniors" checked={formData.goodWithSeniors ?? false} onCheckedChange={(checked) => handleChange('goodWithSeniors', checked)} /></div>
          <div className="space-y-2"><Label htmlFor="energyLevel">Nível de energia</Label><Input id="energyLevel" value={formData.energyLevel ?? ''} onChange={(e) => handleChange('energyLevel', e.target.value)} placeholder="Ex.: alto, moderado" /></div>
          <div className="space-y-2 md:col-span-2"><Label htmlFor="trainability">Treinabilidade</Label><Textarea id="trainability" value={formData.trainability ?? ''} onChange={(e) => handleChange('trainability', e.target.value)} placeholder="Ex.: responde bem a comandos básicos" /></div>
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
          <div className="space-y-2 md:col-span-2"><Label htmlFor="additionalInfo">Informações complementares</Label><Textarea id="additionalInfo" value={formData.additionalInfo ?? ''} onChange={(e) => handleChange('additionalInfo', e.target.value)} /></div>
        </div>
      </section>

      {/* Imagens atuais */}
      <div className="space-y-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImportImages}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between">
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
        <p className="text-xs text-muted-foreground">
          Máximo de 2 imagens por animal.
        </p>
      </div>

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
