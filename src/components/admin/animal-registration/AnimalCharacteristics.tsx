
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { AnimalFormData, commonCharacteristics } from "./types";

interface AnimalCharacteristicsProps {
  formData: AnimalFormData;
  customCharacteristic: string;
  setCustomCharacteristic: (value: string) => void;
  handleCharacteristicToggle: (characteristic: string) => void;
  addCustomCharacteristic: () => void;
}

const AnimalCharacteristics = ({ 
  formData, 
  customCharacteristic, 
  setCustomCharacteristic,
  handleCharacteristicToggle,
  addCustomCharacteristic
}: AnimalCharacteristicsProps) => {
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
    </div>
  );
};

export default AnimalCharacteristics;
