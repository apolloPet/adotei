
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnimalFormData } from "./types";
import { AlertCircle } from "lucide-react";

export interface AnimalBasicInfoProps {
  formData: AnimalFormData;
  onFormChange: (updates: Partial<AnimalFormData>) => void;
}

const AnimalBasicInfo = ({ formData, onFormChange }: AnimalBasicInfoProps) => {
  // Handler for age field to accept only numbers
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^[0-9]+$/.test(value)) {
      handleInputChange(e);
    }
  };

  // Handler for description field to limit to 200 characters
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 200) {
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

  // Helper to check if a field is empty
  const isFieldEmpty = (value: string): boolean => {
    return value.trim() === '';
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center">
            Nome do Animal*
            {isFieldEmpty(formData.name) && (
              <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
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
        
        <div className="space-y-2">
          <Label className="flex items-center">
            Tipo de Animal*
            {!formData.type && (
              <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
            )}
          </Label>
          <RadioGroup 
            value={formData.type} 
            onValueChange={(value) => handleRadioChange('type', value)}
            className="flex space-x-4"
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
          <Label htmlFor="breed" className="flex items-center">
            Raça*
            {isFieldEmpty(formData.breed) && (
              <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
            )}
          </Label>
          <Input 
            id="breed" 
            name="breed" 
            value={formData.breed} 
            onChange={handleInputChange} 
            placeholder="Ex: Labrador" 
            required 
            className={isFieldEmpty(formData.breed) ? "border-destructive" : ""}
            aria-invalid={isFieldEmpty(formData.breed)}
          />
          {isFieldEmpty(formData.breed) && (
            <p className="text-sm text-destructive">Raça é obrigatória</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="age" className="flex items-center">
            Idade* (apenas números)
            {isFieldEmpty(formData.age) && (
              <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
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
            className="flex space-x-4"
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
            className="flex space-x-4"
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
      
      <div className="space-y-2">
        <Label htmlFor="description" className="flex items-center">
          Descrição* (máximo 200 caracteres)
          {isFieldEmpty(formData.description) && (
            <AlertCircle className="h-4 w-4 ml-2 text-destructive" />
          )}
        </Label>
        <Textarea 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleDescriptionChange} 
          placeholder="Descreva o animal, seu comportamento e características" 
          required 
          rows={4}
          maxLength={200}
          className={isFieldEmpty(formData.description) ? "border-destructive" : ""}
          aria-invalid={isFieldEmpty(formData.description)}
        />
        <div className="flex justify-between">
          <div>
            {isFieldEmpty(formData.description) && (
              <p className="text-sm text-destructive">Descrição é obrigatória</p>
            )}
            {!isFieldEmpty(formData.description) && formData.description.length < 20 && (
              <p className="text-sm text-amber-500">A descrição deve ter pelo menos 20 caracteres</p>
            )}
          </div>
          <div className={`text-xs ${
            formData.description.length > 180 ? "text-amber-500" : "text-gray-500"
          }`}>
            {formData.description.length}/200 caracteres
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalBasicInfo;
