
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnimalFormData } from "./types";

interface AnimalHealthInfoProps {
  formData: AnimalFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const AnimalHealthInfo = ({ formData, handleInputChange }: AnimalHealthInfoProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="medicalInfo">Informações Médicas</Label>
      <Textarea 
        id="medicalInfo" 
        name="medicalInfo" 
        value={formData.medicalInfo} 
        onChange={handleInputChange} 
        placeholder="Vacinas, castração, condições médicas, etc."
        rows={3}
      />
    </div>
  );
};

export default AnimalHealthInfo;
