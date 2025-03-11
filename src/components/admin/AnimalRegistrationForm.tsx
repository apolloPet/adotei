
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-sonner";
import { Upload, X } from "lucide-react";

interface AnimalFormData {
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: string;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  description: string;
  medicalInfo: string;
  location: string;
  characteristics: string[];
  requirements: string[];
  responsibleId: string;
}

const defaultFormData: AnimalFormData = {
  name: '',
  type: 'dog',
  breed: '',
  age: '',
  gender: 'male',
  size: 'medium',
  description: '',
  medicalInfo: '',
  location: '',
  characteristics: [],
  requirements: [],
  responsibleId: ''
};

const commonCharacteristics = ['Dócil', 'Castrado', 'Vacinado', 'Sociável', 'Brincalhão', 'Calmo', 'Independente'];
const commonRequirements = ['Tela nas janelas', 'Ambiente calmo', 'Passeios diários', 'Visitas de acompanhamento', 'Sem outros animais'];

// Mock staff members for the dropdown
const staffMembers = [
  { id: "staff-1", name: "Mariana Silva" },
  { id: "staff-2", name: "Lucas Pereira" },
  { id: "staff-3", name: "Camila Santos" },
  { id: "staff-4", name: "Rafael Oliveira" },
  { id: "staff-5", name: "Juliana Costa" }
];

const AnimalRegistrationForm = () => {
  const [formData, setFormData] = useState<AnimalFormData>(defaultFormData);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [customCharacteristic, setCustomCharacteristic] = useState('');
  const [customRequirement, setCustomRequirement] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCharacteristicToggle = (characteristic: string) => {
    setFormData(prev => {
      const isSelected = prev.characteristics.includes(characteristic);
      
      return {
        ...prev,
        characteristics: isSelected
          ? prev.characteristics.filter(c => c !== characteristic)
          : [...prev.characteristics, characteristic]
      };
    });
  };

  const handleRequirementToggle = (requirement: string) => {
    setFormData(prev => {
      const isSelected = prev.requirements.includes(requirement);
      
      return {
        ...prev,
        requirements: isSelected
          ? prev.requirements.filter(r => r !== requirement)
          : [...prev.requirements, requirement]
      };
    });
  };

  const addCustomCharacteristic = () => {
    if (customCharacteristic.trim() && !formData.characteristics.includes(customCharacteristic.trim())) {
      setFormData(prev => ({
        ...prev,
        characteristics: [...prev.characteristics, customCharacteristic.trim()]
      }));
      setCustomCharacteristic('');
    }
  };

  const addCustomRequirement = () => {
    if (customRequirement.trim() && !formData.requirements.includes(customRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, customRequirement.trim()]
      }));
      setCustomRequirement('');
    }
  };

  const handleResponsibleChange = (value: string) => {
    setFormData({
      ...formData,
      responsibleId: value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Limit to 5 images max
      if (images.length + newFiles.length > 5) {
        toast.error("Máximo de 5 imagens permitido.");
        return;
      }
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setImages(prev => [...prev, ...newFiles]);
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    // Release object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.description || !formData.breed || !formData.age) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (images.length === 0) {
      toast.error("Pelo menos uma imagem é necessária.");
      return;
    }
    
    // Here you would typically send the data to an API
    console.log("Animal data:", formData);
    console.log("Images:", images);
    
    // Success feedback
    toast.success("Animal cadastrado com sucesso!");

    // Reset form
    setFormData(defaultFormData);
    
    // Clean up image previews
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreviewUrls([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Novo Animal</CardTitle>
        <CardDescription>Adicione um novo animal para adoção</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label htmlFor="age">Idade*</Label>
              <Input 
                id="age" 
                name="age" 
                value={formData.age} 
                onChange={handleInputChange} 
                placeholder="Ex: 2 anos" 
                required 
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
            <Label htmlFor="description">Descrição*</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              placeholder="Descreva o animal, seu comportamento e características" 
              required 
              rows={4}
            />
          </div>
          
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
                value={formData.responsibleId} 
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
          
          <div className="space-y-4">
            <Label>Características</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {commonCharacteristics.map((char) => (
                <div key={char} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`char-${char}`} 
                    checked={formData.characteristics.includes(char)}
                    onCheckedChange={() => handleCharacteristicToggle(char)}
                  />
                  <Label htmlFor={`char-${char}`}>{char}</Label>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Input
                value={customCharacteristic}
                onChange={(e) => setCustomCharacteristic(e.target.value)}
                placeholder="Adicionar outra característica"
              />
              <Button 
                type="button" 
                onClick={addCustomCharacteristic}
                variant="outline"
              >
                Adicionar
              </Button>
            </div>
            
            {formData.characteristics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.characteristics.map((char) => (
                  <div 
                    key={char} 
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {char}
                    <button 
                      type="button" 
                      onClick={() => handleCharacteristicToggle(char)}
                      className="text-secondary-foreground/70 hover:text-secondary-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
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
          
          <div className="space-y-4">
            <Label>Fotos do Animal*</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square bg-muted rounded-md overflow-hidden">
                  <img 
                    src={url} 
                    alt={`Preview ${index}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {imagePreviewUrls.length < 5 && (
                <label className="aspect-square border-2 border-dashed rounded-md border-input flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50">
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Adicione até 5 fotos. A primeira será a foto principal.
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">Cadastrar Animal</Button>
      </CardFooter>
    </Card>
  );
};

export default AnimalRegistrationForm;
