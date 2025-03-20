
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnimalCostFormData } from "./types";

interface NutritionInfoProps {
  formData: AnimalCostFormData;
  onInputChange: (field: string, value: any) => void;
}

const NutritionInfo = ({ formData, onInputChange }: NutritionInfoProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Tipo de Alimentação</Label>
          <RadioGroup 
            className="flex flex-col space-y-3 mt-2" 
            value={formData.foodType}
            onValueChange={(value) => onInputChange('foodType', value)}
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="basic" id="basic" />
              <div>
                <Label htmlFor="basic" className="font-medium">Básica</Label>
                <p className="text-sm text-muted-foreground">
                  Ração standard, com ingredientes de qualidade média.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="premium" id="premium" />
              <div>
                <Label htmlFor="premium" className="font-medium">Premium</Label>
                <p className="text-sm text-muted-foreground">
                  Ração de alta qualidade, com melhores ingredientes e valores nutricionais.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="special" id="special" />
              <div>
                <Label htmlFor="special" className="font-medium">Especial</Label>
                <p className="text-sm text-muted-foreground">
                  Alimentação especializada, inclui rações terapêuticas, dietas prescritas por veterinários, ou alimentos naturais preparados.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default NutritionInfo;
