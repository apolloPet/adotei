
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NutritionInfoProps {
  foodType: 'basic' | 'premium' | 'special';
  foodQuantity: number;
  onFoodTypeChange: (value: string) => void;
  onFoodQuantityChange: (value: number[]) => void;
}

const NutritionInfo = ({
  foodType,
  foodQuantity,
  onFoodTypeChange,
  onFoodQuantityChange
}: NutritionInfoProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Tipo de ração</Label>
          <Select value={foodType} onValueChange={onFoodTypeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione o tipo de ração" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Básica</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="special">Especial / Medicinal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <Label>Quantidade mensal (kg)</Label>
            <span className="text-sm text-muted-foreground">{foodQuantity} kg</span>
          </div>
          <Slider 
            value={[foodQuantity]} 
            onValueChange={onFoodQuantityChange} 
            min={1} 
            max={50} 
            step={1} 
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
};

export default NutritionInfo;
