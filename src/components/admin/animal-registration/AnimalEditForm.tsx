
import React, { useState } from 'react';
import { Animal } from '@/services/animalService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface AnimalEditFormProps {
  animal: Animal;
  onSave: (updatedAnimal: Animal) => void;
  onCancel: () => void;
}

const AnimalEditForm: React.FC<AnimalEditFormProps> = ({ animal, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Animal>({ ...animal });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof Animal, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao || ''}
          onChange={(e) => handleChange('descricao', e.target.value)}
          rows={5}
        />
      </div>

      {/* Fotos URLs - This would ideally be an image upload component, but for now we'll use a textarea */}
      <div className="space-y-2">
        <Label htmlFor="fotos">URLs das fotos (uma por linha)</Label>
        <Textarea
          id="fotos"
          value={
            Array.isArray(formData.fotos) 
              ? formData.fotos.join('\n') 
              : typeof formData.fotos === 'string'
                ? formData.fotos
                : ''
          }
          onChange={(e) => {
            const urls = e.target.value
              .split('\n')
              .map(url => url.trim())
              .filter(url => url !== '');
            handleChange('fotos', urls);
          }}
          rows={3}
          placeholder="https://exemplo.com/imagem1.jpg&#10;https://exemplo.com/imagem2.jpg"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
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
