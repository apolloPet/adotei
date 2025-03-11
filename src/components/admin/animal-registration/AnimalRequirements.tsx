
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { AnimalFormData, commonRequirements } from "./types";

interface AnimalRequirementsProps {
  formData: AnimalFormData;
  customRequirement: string;
  setCustomRequirement: (value: string) => void;
  handleRequirementToggle: (requirement: string) => void;
  addCustomRequirement: () => void;
}

const AnimalRequirements = ({ 
  formData, 
  customRequirement, 
  setCustomRequirement,
  handleRequirementToggle,
  addCustomRequirement
}: AnimalRequirementsProps) => {
  return (
    <div className="space-y-4">
      <Label>Requisitos para Adoção</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {commonRequirements.map((req) => (
          <div key={req} className="flex items-center space-x-2">
            <Checkbox 
              id={`req-${req}`} 
              checked={formData.requirements.includes(req)}
              onCheckedChange={() => handleRequirementToggle(req)}
            />
            <Label htmlFor={`req-${req}`}>{req}</Label>
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <Input
          value={customRequirement}
          onChange={(e) => setCustomRequirement(e.target.value)}
          placeholder="Adicionar outro requisito"
        />
        <Button 
          type="button" 
          onClick={addCustomRequirement}
          variant="outline"
        >
          Adicionar
        </Button>
      </div>
      
      {formData.requirements.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {formData.requirements.map((req) => (
            <div 
              key={req} 
              className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {req}
              <button 
                type="button" 
                onClick={() => handleRequirementToggle(req)}
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

export default AnimalRequirements;
