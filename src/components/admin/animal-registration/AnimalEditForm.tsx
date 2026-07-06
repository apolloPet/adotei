
import React, { useEffect, useRef, useState } from 'react';
import { Animal, deleteAnimalImage, uploadAnimalImage } from '@/services/animalService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-sonner';
import PersonalitySelect from './PersonalitySelect';

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

const AnimalEditForm: React.FC<AnimalEditFormProps> = ({ animal, onSave, onComplete, onCancel }) => {
  const [formData, setFormData] = useState<Animal>({ ...animal });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState(animal.imagens ?? []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [removedExistingImageIds, setRemovedExistingImageIds] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof Animal, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    return () => {
      pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [pendingImages]);

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
        onChange={(personalityId) => handleChange('personalityId', personalityId)}
      />

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
                <img
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
