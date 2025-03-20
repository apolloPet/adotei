
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnimalFormData } from "./types";

interface AnimalBasicInfoProps {
  formData: AnimalFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleRadioChange: (name: string, value: string) => void;
}

const AnimalBasicInfo = ({ formData, handleInputChange, handleRadioChange }: AnimalBasicInfoProps) => {
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Animal*</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            placeholder="Ex: Rex" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label>Tipo de Animal*</Label>
          <RadioGroup 
            value={formData.type} 
            onValueChange={(value) => handleRadioChange('type', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dog" id="dog" />
              <Label htmlFor="dog">Cachorro</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cat" id="cat" />
              <Label htmlFor="cat">Gato</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other_animal" />
              <Label htmlFor="other_animal">Outro</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="breed">Raça*</Label>
          <Input 
            id="breed" 
            name="breed" 
            value={formData.breed} 
            onChange={handleInputChange} 
            placeholder="Ex: Labrador" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="age">Idade* (apenas números)</Label>
          <Input 
            id="age" 
            name="age" 
            value={formData.age} 
            onChange={handleAgeChange} 
            placeholder="Ex: 2" 
            required 
            inputMode="numeric"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Gênero*</Label>
          <RadioGroup 
            value={formData.gender} 
            onValueChange={(value) => handleRadioChange('gender', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Macho</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Fêmea</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label>Tamanho*</Label>
          <RadioGroup 
            value={formData.size} 
            onValueChange={(value) => handleRadioChange('size', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="small" id="small" />
              <Label htmlFor="small">Pequeno</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Médio</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="large" id="large" />
              <Label htmlFor="large">Grande</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição* (máximo 200 caracteres)</Label>
        <Textarea 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleDescriptionChange} 
          placeholder="Descreva o animal, seu comportamento e características" 
          required 
          rows={4}
          maxLength={200}
        />
        <div className="text-xs text-gray-500 text-right">
          {formData.description.length}/200 caracteres
        </div>
      </div>
    </div>
  );
};

export default AnimalBasicInfo;
