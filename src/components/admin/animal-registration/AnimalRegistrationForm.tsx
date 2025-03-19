
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimalFormData, defaultFormData } from "./types";
import AnimalBasicInfo from "./AnimalBasicInfo";
import AnimalCharacteristics from "./AnimalCharacteristics";
import AnimalRequirements from "./AnimalRequirements";
import AnimalImages from "./AnimalImages";
import AnimalHealthInfo from "./AnimalHealthInfo";
import AnimalLocationStaff from "./AnimalLocationStaff";
import CostSimulator from "../partnerships/CostSimulator";
import AnimalList from "./AnimalList";

const AnimalRegistrationForm = () => {
  const [formData, setFormData] = useState<AnimalFormData>(defaultFormData);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [customCharacteristic, setCustomCharacteristic] = useState('');
  const [customRequirement, setCustomRequirement] = useState('');
  const [activeTab, setActiveTab] = useState('animal-list');
  const [registrationStep, setRegistrationStep] = useState<1 | 2>(1);
  const [costSimulationCompleted, setCostSimulationCompleted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('caretaker')) {
      const caretakerField = name.replace('caretaker', '').charAt(0).toLowerCase() + name.replace('caretaker', '').slice(1);
      setFormData({
        ...formData,
        caretaker: {
          ...formData.caretaker!,
          [caretakerField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
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

  const handleTutorSelect = (tutorId: string) => {
    setFormData({
      ...formData,
      responsibleId: tutorId
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

  const handleCostSimulationComplete = () => {
    setCostSimulationCompleted(true);
    toast.success("Simulação de custos concluída com sucesso!");
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.breed.trim() !== '' &&
      formData.age.trim() !== '' &&
      formData.location.trim() !== '' &&
      images.length > 0 &&
      costSimulationCompleted
    );
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

    if (!costSimulationCompleted) {
      toast.error("Por favor, complete a simulação de custos antes de cadastrar o animal.");
      return;
    }
    
    // Here you would typically send the data to an API
    console.log("Animal data:", formData);
    console.log("Images:", images);
    
    // Success feedback
    toast.success("Animal cadastrado com sucesso!");

    // Reset form
    setFormData(defaultFormData);
    setRegistrationStep(1);
    setCostSimulationCompleted(false);
    
    // Clean up image previews
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setImagePreviewUrls([]);
    
    // Switch to animal list tab
    setActiveTab('animal-list');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Animais</CardTitle>
        <CardDescription>Visualize, cadastre e gerencie os animais disponíveis para adoção</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="animal-list">Lista de Animais</TabsTrigger>
            <TabsTrigger value="register-animal" id="register-animal">Cadastrar Animal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="animal-list">
            <AnimalList />
          </TabsContent>
          
          <TabsContent value="register-animal">
            <div className="space-y-6">
              <Tabs defaultValue={registrationStep === 1 ? "animal-info" : "cost-simulator"}>
                <TabsList className="mb-4">
                  <TabsTrigger 
                    value="animal-info" 
                    onClick={() => setRegistrationStep(1)}
                    disabled={registrationStep === 2 && !costSimulationCompleted}
                  >
                    1. Informações do Animal
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cost-simulator" 
                    onClick={() => setRegistrationStep(2)}
                  >
                    2. Simulador de Custos
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="animal-info">
                  <form className="space-y-6">
                    <AnimalBasicInfo 
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleRadioChange={handleRadioChange}
                    />
                    
                    <AnimalHealthInfo 
                      formData={formData}
                      handleInputChange={handleInputChange}
                      handleTutorSelect={handleTutorSelect}
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
                    
                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        onClick={() => {
                          if (formData.name && formData.description && formData.breed && formData.age) {
                            setRegistrationStep(2);
                          } else {
                            toast.error("Por favor, preencha todos os campos obrigatórios antes de prosseguir.");
                          }
                        }}
                      >
                        Próximo: Simulador de Custos
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="cost-simulator">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Simulador de Custos</CardTitle>
                        <CardDescription>
                          Complete a simulação de custos para este animal. Esta informação é importante para potenciais adotantes.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CostSimulator onSimulationComplete={handleCostSimulationComplete} />
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setRegistrationStep(1)}
                      >
                        Voltar
                      </Button>
                      
                      <Button 
                        type="button" 
                        onClick={handleSubmit}
                        disabled={!isFormValid()}
                      >
                        Finalizar Cadastro
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnimalRegistrationForm;
