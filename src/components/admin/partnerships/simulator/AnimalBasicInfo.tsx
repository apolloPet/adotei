
import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

interface AnimalBasicInfoProps {
  animalType: 'dog' | 'cat' | 'other';
  animalSize: 'small' | 'medium' | 'large';
  ageMonths: number;
  foodType: 'basic' | 'premium' | 'special';
  onAnimalTypeChange: (value: 'dog' | 'cat' | 'other') => void;
  onAnimalSizeChange: (value: 'small' | 'medium' | 'large') => void;
  onAgeChange: (value: number) => void;
  onFoodTypeChange: (value: 'basic' | 'premium' | 'special') => void;
}

const AnimalBasicInfo: React.FC<AnimalBasicInfoProps> = ({
  animalType,
  animalSize,
  ageMonths,
  foodType,
  onAnimalTypeChange,
  onAnimalSizeChange,
  onAgeChange,
  onFoodTypeChange
}) => {
  const getAgeLabel = () => {
    if (ageMonths < 12) {
      return `${ageMonths} meses`;
    } else {
      const years = Math.floor(ageMonths / 12);
      const months = ageMonths % 12;
      if (months === 0) {
        return years === 1 ? "1 ano" : `${years} anos`;
      } else {
        return years === 1 
          ? `1 ano e ${months} ${months === 1 ? 'mês' : 'meses'}`
          : `${years} anos e ${months} ${months === 1 ? 'mês' : 'meses'}`;
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo de Animal</Label>
        <RadioGroup 
          defaultValue={animalType} 
          onValueChange={(value) => onAnimalTypeChange(value as 'dog' | 'cat' | 'other')}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dog" id="dog" />
            <Label htmlFor="dog">Cachorro</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cat" id="cat" />
            <Label htmlFor="cat">Gato</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Outro</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Porte do Animal</Label>
        <RadioGroup 
          defaultValue={animalSize} 
          onValueChange={(value) => onAnimalSizeChange(value as 'small' | 'medium' | 'large')}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="small" />
            <Label htmlFor="small">Pequeno (até 10kg)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium">Médio (10-25kg)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="large" />
            <Label htmlFor="large">Grande (acima de 25kg)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="age">Idade</Label>
          <span className="text-sm font-medium">{getAgeLabel()}</span>
        </div>
        <Slider 
          id="age" 
          min={1} 
          max={240} 
          step={1} 
          value={[ageMonths]} 
          onValueChange={(vals) => onAgeChange(vals[0])} 
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 mês</span>
          <span>20 anos</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tipo de Alimentação</Label>
        <RadioGroup 
          defaultValue={foodType} 
          onValueChange={(value) => onFoodTypeChange(value as 'basic' | 'premium' | 'special')}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="basic" id="basic" />
            <Label htmlFor="basic">Ração Básica</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="premium" id="premium" />
            <Label htmlFor="premium">Ração Premium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="special" id="special" />
            <Label htmlFor="special">Ração Especial/Medicamentosa</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default AnimalBasicInfo;
