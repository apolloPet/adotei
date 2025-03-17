
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from "@/components/ui/slider";
import { CostSimulatorFormData } from './types';

interface AnimalBasicInfoProps {
  formData: CostSimulatorFormData;
  onAnimalTypeChange: (value: string) => void;
  onAgeChange: (value: number) => void;
  onWeightChange: (value: number) => void;
}

const AnimalBasicInfo: React.FC<AnimalBasicInfoProps> = ({
  formData,
  onAnimalTypeChange,
  onAgeChange,
  onWeightChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="animal-type">Tipo de Animal</Label>
        <Select value={formData.animalType} onValueChange={onAnimalTypeChange}>
          <SelectTrigger id="animal-type">
            <SelectValue placeholder="Selecione o tipo de animal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dog">Cachorro</SelectItem>
            <SelectItem value="cat">Gato</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="age">Idade (meses)</Label>
          <span className="text-sm font-medium">{formData.ageMonths} meses</span>
        </div>
        <Slider 
          id="age" 
          min={1} 
          max={180} 
          step={1} 
          value={[formData.ageMonths]} 
          onValueChange={(vals) => onAgeChange(vals[0])} 
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 mês</span>
          <span>15 anos</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="weight">Peso (kg)</Label>
          <span className="text-sm font-medium">{formData.weight} kg</span>
        </div>
        <Slider 
          id="weight" 
          min={1} 
          max={formData.animalType === 'dog' ? 60 : 15} 
          step={0.5} 
          value={[formData.weight]} 
          onValueChange={(vals) => onWeightChange(vals[0])} 
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 kg</span>
          <span>{formData.animalType === 'dog' ? '60 kg' : '15 kg'}</span>
        </div>
      </div>
    </div>
  );
};

export default AnimalBasicInfo;
