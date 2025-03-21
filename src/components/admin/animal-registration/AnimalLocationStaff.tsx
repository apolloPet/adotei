
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimalFormData, staffMembers } from "./types";

interface AnimalLocationStaffProps {
  formData: AnimalFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleResponsibleChange: (value: string) => void;
}

const AnimalLocationStaff = ({ 
  formData, 
  handleInputChange, 
  handleResponsibleChange 
}: AnimalLocationStaffProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="location">Localização do Animal*</Label>
        <Input 
          id="location" 
          name="location" 
          value={formData.location} 
          onChange={handleInputChange} 
          placeholder="Ex: ONG Amigos dos Animais - São Paulo, SP" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="responsible">Responsável na ONG</Label>
        <Select 
          value={formData.responsible} 
          onValueChange={handleResponsibleChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um responsável" />
          </SelectTrigger>
          <SelectContent>
            {staffMembers.map(staff => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          O responsável receberá notificações sobre o processo de adoção.
        </p>
      </div>
    </div>
  );
};

export default AnimalLocationStaff;
