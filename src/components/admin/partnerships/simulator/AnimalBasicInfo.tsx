
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimalCostFormData } from "./types";

interface AnimalBasicInfoProps {
  formData: AnimalCostFormData;
  onInputChange: (field: string, value: any) => void;
}

const AnimalBasicInfo = ({ formData, onInputChange }: AnimalBasicInfoProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Tipo de Animal</Label>
          <RadioGroup 
            className="flex flex-wrap gap-4 mt-2" 
            value={formData.animalType}
            onValueChange={(value) => onInputChange('animalType', value)}
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

        <div>
          <Label>Porte do Animal</Label>
          <RadioGroup 
            className="flex flex-wrap gap-4 mt-2" 
            value={formData.animalSize}
            onValueChange={(value) => onInputChange('animalSize', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="small" />
              <Label htmlFor="small">Pequeno</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Médio</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="large" />
              <Label htmlFor="large">Grande</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ageYears">Idade (Anos)</Label>
            <Input
              id="ageYears"
              type="number"
              min="0"
              value={formData.ageYears}
              onChange={(e) => onInputChange('ageYears', parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ageMonths">Idade (Meses)</Label>
            <Input
              id="ageMonths"
              type="number"
              min="0"
              max="11"
              value={formData.ageMonths}
              onChange={(e) => onInputChange('ageMonths', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div>
          <Label>Nível de Atividade</Label>
          <Select 
            value={formData.activityLevel}
            onValueChange={(value) => onInputChange('activityLevel', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione o nível de atividade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixo (Sedentário)</SelectItem>
              <SelectItem value="moderate">Moderado (Regular)</SelectItem>
              <SelectItem value="high">Alto (Muito ativo)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AnimalBasicInfo;
