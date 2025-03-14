
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnimalFormData } from "./types";

interface AnimalHealthInfoProps {
  formData: AnimalFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const AnimalHealthInfo = ({ formData, handleInputChange }: AnimalHealthInfoProps) => {
  return (
    <div className="space-y-6">
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
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações do Tutor Responsável (Uso Interno)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caretakerName">Nome do Tutor</Label>
              <Input 
                id="caretakerName" 
                name="caretakerName" 
                value={formData.caretaker?.name || ''} 
                onChange={handleInputChange} 
                placeholder="Nome do funcionário responsável" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caretakerRole">Função</Label>
              <Input 
                id="caretakerRole" 
                name="caretakerRole" 
                value={formData.caretaker?.role || ''} 
                onChange={handleInputChange} 
                placeholder="Ex: Veterinário, Cuidador" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caretakerPhone">Telefone</Label>
              <Input 
                id="caretakerPhone" 
                name="caretakerPhone" 
                value={formData.caretaker?.phone || ''} 
                onChange={handleInputChange} 
                placeholder="(00) 00000-0000" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caretakerEmail">Email</Label>
              <Input 
                id="caretakerEmail" 
                name="caretakerEmail" 
                value={formData.caretaker?.email || ''} 
                onChange={handleInputChange} 
                placeholder="email@exemplo.com" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="caretakerNotes">Observações</Label>
            <Textarea 
              id="caretakerNotes" 
              name="caretakerNotes" 
              value={formData.caretaker?.notes || ''} 
              onChange={handleInputChange} 
              placeholder="Informações adicionais sobre o responsável"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalHealthInfo;
