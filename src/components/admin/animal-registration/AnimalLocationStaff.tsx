
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AnimalFormData } from "./types";

export interface AnimalLocationStaffProps {
  formData: AnimalFormData;
  onFormChange: (updates: Partial<AnimalFormData>) => void;
}

const AnimalLocationStaff = ({ formData, onFormChange }: AnimalLocationStaffProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFormChange({ [name]: value });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="tutorName">Nome do Tutor*</Label>
        <Input 
          id="tutorName" 
          name="tutorName" 
          value={formData.tutorName} 
          onChange={handleInputChange} 
          placeholder="Nome do tutor responsável" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tutorContact">Contato do Tutor*</Label>
        <Input
          id="tutorContact"
          name="tutorContact"
          value={formData.tutorContact}
          onChange={handleInputChange}
          placeholder="Telefone ou email do tutor"
          required
        />
      </div>
    </div>
  );
};

export default AnimalLocationStaff;
