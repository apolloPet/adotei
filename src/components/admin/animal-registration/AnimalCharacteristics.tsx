
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimalFormData } from "./types";

export interface AnimalCharacteristicsProps {
  formData: AnimalFormData;
  onFormChange: (updates: Partial<AnimalFormData>) => void;
}

const AnimalCharacteristics = ({ formData, onFormChange }: AnimalCharacteristicsProps) => {
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
    <div className="space-y-4 min-w-0">
      <div className="pt-4 border-t">
        <h3 className="text-base sm:text-lg font-medium mb-4">Bom com</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Checkbox 
              id="goodWithChildren" 
              checked={formData.goodWithChildren}
              onCheckedChange={(checked) => handleGoodWithChange('children', checked as boolean)}
            />
            <Label htmlFor="goodWithChildren">Crianças</Label>
          </div>
          
          <div className="flex items-center gap-2 min-w-0">
            <Checkbox 
              id="goodWithOtherAnimals" 
              checked={formData.goodWithOtherAnimals}
              onCheckedChange={(checked) => handleGoodWithChange('animals', checked as boolean)}
            />
            <Label htmlFor="goodWithOtherAnimals">Outros animais</Label>
          </div>
          
          <div className="flex items-center gap-2 min-w-0">
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
