
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AnimalFormData } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";

type VaccineOption = {
  id: string;
  name: string;
  animalType: string;
  active: boolean;
};

export interface AnimalHealthInfoProps {
  formData: AnimalFormData;
  onFormChange: (updates: Partial<AnimalFormData>) => void;
}

const AnimalHealthInfo = ({ formData, onFormChange }: AnimalHealthInfoProps) => {
  const [vaccines, setVaccines] = useState<VaccineOption[]>([]);

  useEffect(() => {
    const loadVaccines = async () => {
      try {
        const data = await apiRequest<VaccineOption[]>('/api/vaccines');
        setVaccines(data.filter((item) => item.active));
      } catch (error) {
        console.error('Erro ao carregar vacinas:', error);
      }
    };
    loadVaccines();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFormChange({ [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    onFormChange({ [name]: checked });
  };

  const handleVaccineToggle = (id: string, checked: boolean) => {
    const next = checked
      ? [...formData.vaccineIds, id]
      : formData.vaccineIds.filter((vaccineId) => vaccineId !== id);
    onFormChange({ vaccineIds: next });
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="grid gap-4 md:grid-cols-2 min-w-0">
        <div className="space-y-2 min-w-0">
          <Label>Vacinas</Label>
          <div className="grid grid-cols-1 gap-2 rounded-md border p-3 max-h-48 overflow-y-auto">
            {vaccines
              .filter((vaccine) => vaccine.animalType === formData.type)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((vaccine) => (
                <div key={vaccine.id} className="flex items-start gap-2 min-w-0">
                  <Checkbox
                    id={`vaccine-${vaccine.id}`}
                    checked={formData.vaccineIds.includes(vaccine.id)}
                    onCheckedChange={(checked) => handleVaccineToggle(vaccine.id, checked === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor={`vaccine-${vaccine.id}`} className="leading-snug break-words">
                    {vaccine.name}
                  </Label>
                </div>
              ))}
            {vaccines.filter((vaccine) => vaccine.animalType === formData.type).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma vacina cadastrada para esse tipo de animal.</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Selecione uma ou mais vacinas.</p>
        </div>

        <div className="space-y-2 min-w-0">
          <Label htmlFor="additionalInfo" className="leading-snug">
            Informações Complementares (Descrição)
          </Label>
          <Textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleInputChange}
            placeholder="Informações complementares sobre o animal"
            rows={4}
          />
        </div>

        <div className="space-y-4 min-w-0">
          <div className="flex items-start gap-3">
            <Switch
              id="specialNeeds"
              checked={formData.specialNeeds}
              onCheckedChange={(checked) => handleSwitchChange('specialNeeds', checked)}
              className="mt-0.5"
            />
            <Label htmlFor="specialNeeds" className="leading-snug">Necessidades Especiais</Label>
          </div>
          
          {formData.specialNeeds && (
            <Textarea
              id="specialNeedsDescription"
              name="specialNeedsDescription"
              value={formData.specialNeedsDescription}
              onChange={handleInputChange}
              placeholder="Descreva as necessidades especiais do animal"
              rows={3}
            />
          )}
        </div>

        <div className="flex items-start gap-3 min-w-0">
          <Switch
            id="sterilized"
            checked={formData.sterilized}
            onCheckedChange={(checked) => handleSwitchChange('sterilized', checked)}
            className="mt-0.5"
          />
          <Label htmlFor="sterilized">Castrado</Label>
        </div>
      </div>
      
    </div>
  );
};

export default AnimalHealthInfo;
