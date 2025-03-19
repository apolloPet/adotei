
import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

interface AnimalBasicInfoProps {
  animalType: 'dog' | 'cat' | 'other';
  animalSize: 'small' | 'medium' | 'large';
  ageYears: number;
  ageMonths: number;
  activityLevel: 'low' | 'moderate' | 'high';
  onTypeChange: (value: 'dog' | 'cat' | 'other') => void;
  onSizeChange: (value: 'small' | 'medium' | 'large') => void;
  onAgeYearsChange: (value: number[]) => void;
  onAgeMonthsChange: (value: number[]) => void;
  onActivityLevelChange: (value: 'low' | 'moderate' | 'high') => void;
}

const AnimalBasicInfo: React.FC<AnimalBasicInfoProps> = ({
  animalType,
  animalSize,
  ageYears,
  ageMonths,
  activityLevel,
  onTypeChange,
  onSizeChange,
  onAgeYearsChange,
  onAgeMonthsChange,
  onActivityLevelChange
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo de Animal</Label>
        <RadioGroup 
          value={animalType} 
          onValueChange={(value) => onTypeChange(value as 'dog' | 'cat' | 'other')}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dog" id="animal-dog" />
            <Label htmlFor="animal-dog">Cachorro</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cat" id="animal-cat" />
            <Label htmlFor="animal-cat">Gato</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="animal-other" />
            <Label htmlFor="animal-other">Outro</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Porte do Animal</Label>
        <RadioGroup 
          value={animalSize} 
          onValueChange={(value) => onSizeChange(value as 'small' | 'medium' | 'large')}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="size-small" />
            <Label htmlFor="size-small">Pequeno (até 10kg)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="size-medium" />
            <Label htmlFor="size-medium">Médio (10-25kg)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="size-large" />
            <Label htmlFor="size-large">Grande (acima de 25kg)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="age-years">Idade (Anos)</Label>
          <span className="text-sm font-medium">{ageYears} {ageYears === 1 ? 'ano' : 'anos'}</span>
        </div>
        <Slider 
          id="age-years" 
          min={0} 
          max={20} 
          step={1} 
          value={[ageYears]} 
          onValueChange={onAgeYearsChange} 
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 anos</span>
          <span>20 anos</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="age-months">Idade (Meses)</Label>
          <span className="text-sm font-medium">{ageMonths} {ageMonths === 1 ? 'mês' : 'meses'}</span>
        </div>
        <Slider 
          id="age-months" 
          min={0} 
          max={11} 
          step={1} 
          value={[ageMonths]} 
          onValueChange={onAgeMonthsChange} 
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 meses</span>
          <span>11 meses</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Nível de Atividade</Label>
        <RadioGroup 
          value={activityLevel} 
          onValueChange={(value) => onActivityLevelChange(value as 'low' | 'moderate' | 'high')}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="activity-low" />
            <Label htmlFor="activity-low">Baixo</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="moderate" id="activity-moderate" />
            <Label htmlFor="activity-moderate">Moderado</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="activity-high" />
            <Label htmlFor="activity-high">Alto</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default AnimalBasicInfo;
