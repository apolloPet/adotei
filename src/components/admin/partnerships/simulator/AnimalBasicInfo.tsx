
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface AnimalBasicInfoProps {
  animalType: "dog" | "cat" | "other";
  animalSize: "small" | "medium" | "large";
  age: number;
  activityLevel: "low" | "moderate" | "high";
  onTypeChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onAgeChange: (value: number[]) => void;
  onActivityLevelChange: (value: string) => void;
}

const AnimalBasicInfo = ({
  animalType,
  animalSize,
  age,
  activityLevel,
  onTypeChange,
  onSizeChange,
  onAgeChange,
  onActivityLevelChange
}: AnimalBasicInfoProps) => {
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Tipo de animal</Label>
          <Select value={animalType} onValueChange={onTypeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">Cachorro</SelectItem>
              <SelectItem value="cat">Gato</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Porte do animal</Label>
          <Select value={animalSize} onValueChange={onSizeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione o porte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeno</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <Label>Idade (anos)</Label>
            <span className="text-sm text-muted-foreground">{age} {age === 1 ? 'ano' : 'anos'}</span>
          </div>
          <Slider 
            value={[age]} 
            onValueChange={onAgeChange} 
            min={0} 
            max={20} 
            step={1} 
            className="mt-2"
          />
        </div>
        
        <div>
          <Label>Nível de atividade</Label>
          <Select value={activityLevel} onValueChange={onActivityLevelChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione o nível de atividade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixo</SelectItem>
              <SelectItem value="moderate">Moderado</SelectItem>
              <SelectItem value="high">Alto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AnimalBasicInfo;
