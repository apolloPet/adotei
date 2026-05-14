
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  X, Sparkles, Cloud, Heart, Search, Compass, Users,
  Shield, EyeOff, Zap, BedDouble, Repeat, Flag, PawPrint,
} from "lucide-react";
import { AnimalFormData, commonCharacteristics } from "./types";

const characteristicIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Brincalhão": Sparkles,
  "Calmo": Cloud,
  "Carinhoso": Heart,
  "Curioso": Search,
  "Independente": Compass,
  "Sociável": Users,
  "Protetor": Shield,
  "Tímido": EyeOff,
  "Ativo": Zap,
  "Dorminhoco": BedDouble,
  "Adaptável": Repeat,
  "Territorial": Flag,
};

export interface AnimalCharacteristicsProps {
  formData: AnimalFormData;
  onFormChange: (updates: Partial<AnimalFormData>) => void;
}

const AnimalCharacteristics = ({ formData, onFormChange }: AnimalCharacteristicsProps) => {
  const [customCharacteristic, setCustomCharacteristic] = useState("");

  const handleCharacteristicToggle = (characteristic: string) => {
    const updatedCharacteristics = formData.characteristics.includes(characteristic)
      ? formData.characteristics.filter(char => char !== characteristic)
      : [...formData.characteristics, characteristic];
    
    onFormChange({ characteristics: updatedCharacteristics });
  };

  const addCustomCharacteristic = () => {
    if (customCharacteristic.trim() && !formData.characteristics.includes(customCharacteristic.trim())) {
      onFormChange({ characteristics: [...formData.characteristics, customCharacteristic.trim()] });
      setCustomCharacteristic("");
    }
  };

  const handleGoodWithChange = (type: 'children' | 'animals' | 'seniors', checked: boolean) => {
    if (type === 'children') {
      onFormChange({ goodWithChildren: checked });
    } else if (type === 'animals') {
      onFormChange({ goodWithOtherAnimals: checked });
    } else if (type === 'seniors') {
      onFormChange({ goodWithSeniors: checked });
    }
  };

  const handleRadioChange = (name: string, value: string) => {
    onFormChange({ [name]: value });
  };

  return (
    <div className="space-y-4">
      <Label>Características</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {commonCharacteristics.map((char) => (
          <div key={char} className="flex items-center space-x-2">
            <Checkbox 
              id={`char-${char}`} 
              checked={formData.characteristics.includes(char)}
              onCheckedChange={() => handleCharacteristicToggle(char)}
            />
            <Label htmlFor={`char-${char}`}>{char}</Label>
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <Input
          value={customCharacteristic}
          onChange={(e) => setCustomCharacteristic(e.target.value)}
          placeholder="Adicionar outra característica"
        />
        <Button 
          type="button" 
          onClick={addCustomCharacteristic}
          variant="outline"
        >
          Adicionar
        </Button>
      </div>
      
      {formData.characteristics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {formData.characteristics.map((char) => (
            <div 
              key={char} 
              className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {char}
              <button 
                type="button" 
                onClick={() => handleCharacteristicToggle(char)}
                className="text-secondary-foreground/70 hover:text-secondary-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Bom com</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="goodWithChildren" 
              checked={formData.goodWithChildren}
              onCheckedChange={(checked) => handleGoodWithChange('children', checked as boolean)}
            />
            <Label htmlFor="goodWithChildren">Crianças</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="goodWithOtherAnimals" 
              checked={formData.goodWithOtherAnimals}
              onCheckedChange={(checked) => handleGoodWithChange('animals', checked as boolean)}
            />
            <Label htmlFor="goodWithOtherAnimals">Outros animais</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="goodWithSeniors" 
              checked={formData.goodWithSeniors}
              onCheckedChange={(checked) => handleGoodWithChange('seniors', checked as boolean)}
            />
            <Label htmlFor="goodWithSeniors">Idosos</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalCharacteristics;
