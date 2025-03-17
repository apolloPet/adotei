
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { CostSimulatorFormData } from './types';

interface AnimalHealthOptionsProps {
  formData: CostSimulatorFormData;
  onSpecialNeedsChange: (value: boolean) => void;
  onSterilizedChange: (value: boolean) => void;
  onVaccineCountChange: (value: number) => void;
}

const AnimalHealthOptions: React.FC<AnimalHealthOptionsProps> = ({
  formData,
  onSpecialNeedsChange,
  onSterilizedChange,
  onVaccineCountChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="special-needs">Necessidades Especiais</Label>
          <p className="text-muted-foreground text-xs">Animal com condições crônicas ou especiais</p>
        </div>
        <Switch
          checked={formData.hasSpecialNeeds}
          onCheckedChange={onSpecialNeedsChange}
          id="special-needs"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="sterilized">Já Castrado/Esterilizado</Label>
          <p className="text-muted-foreground text-xs">Animal já passou por procedimento de castração</p>
        </div>
        <Switch
          checked={formData.isSterilized}
          onCheckedChange={onSterilizedChange}
          id="sterilized"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="vaccines">Vacinas Necessárias (por ano)</Label>
          <span className="text-sm font-medium">{formData.vaccineCount}</span>
        </div>
        <Slider 
          id="vaccines" 
          min={0} 
          max={8} 
          step={1} 
          value={[formData.vaccineCount]} 
          onValueChange={(vals) => onVaccineCountChange(vals[0])} 
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>8</span>
        </div>
      </div>
    </div>
  );
};

export default AnimalHealthOptions;
