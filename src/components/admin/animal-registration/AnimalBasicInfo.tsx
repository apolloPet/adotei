
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnimalFormData } from "./types";
import { AlertCircle } from "lucide-react";
import PersonalitySelect from "./PersonalitySelect";
import type { Personality } from "@/services/personalityService";

export interface AnimalBasicInfoProps {
  formData: AnimalFormData;
  organizationId?: string;
  onFormChange: (updates: Partial<AnimalFormData>) => void;
}

const AnimalBasicInfo = ({ formData, organizationId, onFormChange }: AnimalBasicInfoProps) => {
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      handleInputChange(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFormChange({ [name]: value });
  };

  const handleRadioChange = (name: string, value: string) => {
    onFormChange({ [name]: value });
  };

  const handlePersonalityChange = (personalityId: string, personality?: Personality) => {
    onFormChange({
      personalityId,
      ...(personality ? { personalityDescription: personality.description } : {}),
    });
  };

  const handlePendingPersonalityChange = (
    pendingPersonality: AnimalFormData['pendingPersonality']
  ) => {
    onFormChange({ pendingPersonality: pendingPersonality ?? null });
  };

  const isFieldEmpty = (value: string): boolean => value.trim() === '';

  return (
    <div className="space-y-6 min-w-0">
      <div className="grid gap-4 md:grid-cols-2 min-w-0">
        <div className="space-y-2 min-w-0">
          <Label htmlFor="name" className="flex flex-wrap items-center gap-x-1">
            Nome do Animal*
            {isFieldEmpty(formData.name) && (
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            )}
          </Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            placeholder="Ex: Rex" 
            required 
            className={isFieldEmpty(formData.name) ? "border-destructive" : ""}
            aria-invalid={isFieldEmpty(formData.name)}
          />
          {isFieldEmpty(formData.name) && (
            <p className="text-sm text-destructive">Nome é obrigatório</p>
          )}
        </div>
        
        <div className="space-y-2 min-w-0">
          <Label className="flex flex-wrap items-center gap-x-1">
            Tipo de Animal*
            {!formData.type && (
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            )}
          </Label>
          <RadioGroup 
            value={formData.type} 
            onValueChange={(value) => handleRadioChange('type', value)}
            className="flex flex-wrap gap-x-4 gap-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cachorro" id="dog" />
              <Label htmlFor="dog">Cachorro</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gato" id="cat" />
              <Label htmlFor="cat">Gato</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="breed">Raça</Label>
          <Input 
            id="breed" 
            name="breed" 
            value={formData.breed} 
            onChange={handleInputChange} 
            placeholder="Ex: Labrador" 
            className=""
          />
        </div>
        
        <div className="space-y-2 min-w-0">
          <Label htmlFor="age" className="flex flex-wrap items-center gap-x-1 leading-snug">
            <span>Idade*</span>
            <span className="text-muted-foreground font-normal text-sm">(apenas números)</span>
            {isFieldEmpty(formData.age) && (
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            )}
          </Label>
          <Input 
            id="age" 
            name="age" 
            value={formData.age} 
            onChange={handleAgeChange} 
            placeholder="Ex: 2" 
            required 
            inputMode="numeric"
            className={isFieldEmpty(formData.age) ? "border-destructive" : ""}
            aria-invalid={isFieldEmpty(formData.age)}
          />
          {isFieldEmpty(formData.age) && (
            <p className="text-sm text-destructive">Idade é obrigatória</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Sexo*</Label>
          <RadioGroup 
            value={formData.gender} 
            onValueChange={(value) => handleRadioChange('gender', value)}
            className="flex flex-wrap gap-x-4 gap-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="macho" id="male" />
              <Label htmlFor="male">Macho</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="femea" id="female" />
              <Label htmlFor="female">Fêmea</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label>Porte*</Label>
          <RadioGroup 
            value={formData.size} 
            onValueChange={(value) => handleRadioChange('size', value)}
            className="flex flex-wrap gap-x-4 gap-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pequeno" id="small" />
              <Label htmlFor="small">Pequeno</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medio" id="medium" />
              <Label htmlFor="medium">Médio</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="grande" id="large" />
              <Label htmlFor="large">Grande</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <PersonalitySelect
        organizationId={organizationId}
        value={formData.personalityId}
        onChange={handlePersonalityChange}
        deferCreateUntilAnimalSubmit
        pendingPersonality={formData.pendingPersonality}
        onPendingPersonalityChange={handlePendingPersonalityChange}
      />
    </div>
  );
};

export default AnimalBasicInfo;
