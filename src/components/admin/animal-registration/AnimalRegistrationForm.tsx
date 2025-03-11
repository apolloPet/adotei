
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-sonner";
import { AnimalFormData, defaultFormData } from "./types";
import AnimalBasicInfo from "./AnimalBasicInfo";
import AnimalCharacteristics from "./AnimalCharacteristics";
import AnimalRequirements from "./AnimalRequirements";
import AnimalImages from "./AnimalImages";
import AnimalHealthInfo from "./AnimalHealthInfo";
import AnimalLocationStaff from "./AnimalLocationStaff";

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
          <AnimalBasicInfo 
            formData={formData}
            handleInputChange={handleInputChange}
            handleRadioChange={handleRadioChange}
          />
          
          <AnimalHealthInfo 
            formData={formData}
            handleInputChange={handleInputChange}
          />
          
          <AnimalLocationStaff 
            formData={formData}
            handleInputChange={handleInputChange}
            handleResponsibleChange={handleResponsibleChange}
          />
          
          <AnimalCharacteristics 
            formData={formData}
            customCharacteristic={customCharacteristic}
            setCustomCharacteristic={setCustomCharacteristic}
            handleCharacteristicToggle={handleCharacteristicToggle}
            addCustomCharacteristic={addCustomCharacteristic}
          />
          
          <AnimalRequirements 
            formData={formData}
            customRequirement={customRequirement}
            setCustomRequirement={setCustomRequirement}
            handleRequirementToggle={handleRequirementToggle}
            addCustomRequirement={addCustomRequirement}
          />
          
          <AnimalImages 
            images={images}
            imagePreviewUrls={imagePreviewUrls}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
          />
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">Cadastrar Animal</Button>
      </CardFooter>
    </Card>
  );
};

export default AnimalRegistrationForm;
