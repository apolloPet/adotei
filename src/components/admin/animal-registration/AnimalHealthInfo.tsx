
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AnimalFormData } from "./types";

export interface AnimalHealthInfoProps {
  formData: AnimalFormData;
  onFormChange: (updates: Partial<AnimalFormData>) => void;
}

const AnimalHealthInfo = ({ formData, onFormChange }: AnimalHealthInfoProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFormChange({ [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    onFormChange({ [name]: checked });
  };

  const handleRadioChange = (name: string, value: string) => {
    onFormChange({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Vacinação</Label>
          <RadioGroup
            value={formData.vaccinationStatus}
            onValueChange={(value) => handleRadioChange('vaccinationStatus', value)}
            className="grid grid-cols-1 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="complete" id="complete" />
              <Label htmlFor="complete">Completa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partial" id="partial" />
              <Label htmlFor="partial">Parcial</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none">Não vacinado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="unknown" />
              <Label htmlFor="unknown">Desconhecido</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="veterinaryInfo">Informações Veterinárias</Label>
          <Textarea
            id="veterinaryInfo"
            name="veterinaryInfo"
            value={formData.veterinaryInfo}
            onChange={handleInputChange}
            placeholder="Histórico de consultas, vacinas específicas, etc."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="healthConditions">Condições de Saúde</Label>
          <Textarea
            id="healthConditions"
            name="healthConditions"
            value={formData.healthConditions}
            onChange={handleInputChange}
            placeholder="Lista de condições de saúde, se houver"
            rows={4}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="specialNeeds"
              checked={formData.specialNeeds}
              onCheckedChange={(checked) => handleSwitchChange('specialNeeds', checked)}
            />
            <Label htmlFor="specialNeeds">Necessidades Especiais</Label>
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

        <div className="flex items-center space-x-2">
          <Switch
            id="sterilized"
            checked={formData.sterilized}
            onCheckedChange={(checked) => handleSwitchChange('sterilized', checked)}
          />
          <Label htmlFor="sterilized">Castrado/Esterilizado</Label>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Informações do Tutor</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tutorName">Nome do Tutor</Label>
            <Input
              id="tutorName"
              name="tutorName"
              value={formData.tutorName}
              onChange={handleInputChange}
              placeholder="Nome do tutor responsável"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tutorContact">Contato do Tutor</Label>
            <Input
              id="tutorContact"
              name="tutorContact"
              value={formData.tutorContact}
              onChange={handleInputChange}
              placeholder="Telefone ou email do tutor"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalHealthInfo;
