
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimalCostFormData } from "./types";
import { Switch } from "@/components/ui/switch";

interface HealthInfoProps {
  formData: AnimalCostFormData;
  onToggleCondition: (field: string, value: string) => void;
}

const HealthInfo = ({ formData, onToggleCondition }: HealthInfoProps) => {
  const commonHealthConditions = [
    { id: "cardiac", label: "Problemas Cardíacos" },
    { id: "dermatological", label: "Problemas Dermatológicos" },
    { id: "respiratory", label: "Problemas Respiratórios" },
    { id: "orthopedic", label: "Problemas Ortopédicos" },
    { id: "dental", label: "Problemas Dentários" },
    { id: "renal", label: "Problemas Renais" },
    { id: "allergies", label: "Alergias" },
    { id: "chronic_disease", label: "Doença Crônica" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="sterilized" 
            checked={formData.isSterilized}
            onCheckedChange={(checked) => onToggleCondition('isSterilized', checked.toString())}
          />
          <Label htmlFor="sterilized">Animal já castrado/esterilizado</Label>
        </div>

        <div className="space-y-3">
          <Label>Condições de Saúde (selecione todas as aplicáveis)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {commonHealthConditions.map((condition) => (
              <div key={condition.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={condition.id} 
                  checked={formData.healthConditions.includes(condition.label)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onToggleCondition('healthConditions', condition.label);
                    } else {
                      onToggleCondition('healthConditions', condition.label);
                    }
                  }}
                />
                <Label htmlFor={condition.id}>{condition.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthInfo;
