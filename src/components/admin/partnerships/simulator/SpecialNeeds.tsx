
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimalCostFormData } from "./types";

interface SpecialNeedsProps {
  formData: AnimalCostFormData;
  onToggleNeed: (field: string, value: string) => void;
}

const SpecialNeeds = ({ formData, onToggleNeed }: SpecialNeedsProps) => {
  const commonSpecialNeeds = [
    { id: "mobility_aid", label: "Auxílio de Mobilidade (cadeirinha, prótese)" },
    { id: "behavior", label: "Treinamento de Comportamento" },
    { id: "daily_medication", label: "Medicação Diária" },
    { id: "grooming", label: "Cuidados de Higiene Especiais" },
    { id: "special_diet", label: "Dieta Especializada" },
    { id: "therapy", label: "Fisioterapia ou outro tratamento regular" },
  ];
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Frequência de Banho e Tosa</Label>
          <Select 
            value={formData.groomingFrequency}
            onValueChange={(value) => onToggleNeed('groomingFrequency', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rarely">Raramente (a cada 3 meses ou menos)</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="biweekly">Quinzenal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <Label>Necessidades Especiais (selecione todas as aplicáveis)</Label>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {commonSpecialNeeds.map((need) => (
              <div key={need.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={need.id} 
                  checked={formData.specialCareNeeds.includes(need.label)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onToggleNeed('specialCareNeeds', need.label);
                    } else {
                      onToggleNeed('specialCareNeeds', need.label);
                    }
                  }}
                />
                <Label htmlFor={need.id}>{need.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialNeeds;
