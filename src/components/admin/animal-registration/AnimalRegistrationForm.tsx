
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-sonner";
import { AnimalFormData, FormStep } from "./types";
import AnimalBasicInfo from "./AnimalBasicInfo";
import AnimalHealthInfo from "./AnimalHealthInfo";
import AnimalCharacteristics from "./AnimalCharacteristics";
import AnimalImages from "./AnimalImages";
import AnimalLocationStaff from "./AnimalLocationStaff";
import AnimalRequirements from "./AnimalRequirements";
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/lib/supabase';

const steps: FormStep[] = [
  {
    id: "basic-info",
    title: "Informações Básicas",
    description: "Cadastre os dados básicos do animal"
  },
  {
    id: "health-info",
    title: "Saúde",
    description: "Informe dados sobre a saúde do animal"
  },
  {
    id: "characteristics",
    title: "Características",
    description: "Descreva o temperamento e comportamento"
  },
  {
    id: "images",
    title: "Imagens",
    description: "Carregue fotos do animal"
  },
  {
    id: "location-staff",
    title: "Localização",
    description: "Informe onde o animal está"
  },
  {
    id: "requirements",
    title: "Requisitos",
    description: "Defina requisitos para adoção"
  }
];

const AnimalRegistrationForm = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState("basic-info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<AnimalFormData>({
    // Basic info
    name: "",
    type: "dog",
    breed: "",
    age: "",
    gender: "male",
    size: "medium",
    description: "",
    
    // Health info
    vaccinationStatus: "unknown",
    veterinaryInfo: "",
    healthConditions: "",
    specialNeeds: false,
    specialNeedsDescription: "",
    tutorName: "",
    tutorContact: "",
    
    // Characteristics
    temperament: [],
    goodWith: [],
    energyLevel: "medium",
    trainability: "moderate",
    characteristics: [], // Added this field initialization
    
    // Images
    images: [],
    previewImages: [],
    
    // Location and staff
    location: "",
    responsible: "",
    responsibleContact: "",
    
    // Requirements
    adoptionRequirements: [],
    requirements: [] // Added this field initialization
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleArrayChange = (name: string, values: string[]) => {
    setFormData(prev => ({ ...prev, [name]: values }));
  };
  
  const handleImageChange = (images: File[], previews: string[]) => {
    setFormData(prev => ({
      ...prev,
      images,
      previewImages: previews
    }));
  };

  const handleResponsibleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      responsible: value
    }));
  };
  
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === activeStep);
  };
  
  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
    }
  };
  
  const goToPrevStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
    }
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!formData.name || !formData.type || !formData.breed || !formData.age || !formData.description) {
        toast.error("Por favor, preencha todos os campos obrigatórios");
        setActiveStep("basic-info");
        return;
      }
      
      // Format animal data for Supabase
      const animalData = {
        nome: formData.name,
        tipo: formData.type,
        porte: formData.size,
        idade: parseInt(formData.age, 10),
        sexo: formData.gender,
        descricao: formData.description,
        responsavel_id: user?.id,
        // Convert other form data as needed
        // Use the fields that match your database schema
      };
      
      console.log('Submitting animal data:', animalData);
      
      // Use the animals edge function to create the animal
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/animals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(animalData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cadastrar animal');
      }
      
      toast.success("Animal cadastrado com sucesso!");
      
      // Reset form
      setFormData({
        name: "",
        type: "dog",
        breed: "",
        age: "",
        gender: "male",
        size: "medium",
        description: "",
        vaccinationStatus: "unknown",
        veterinaryInfo: "",
        healthConditions: "",
        specialNeeds: false,
        specialNeedsDescription: "",
        tutorName: "",
        tutorContact: "",
        temperament: [],
        goodWith: [],
        energyLevel: "medium",
        trainability: "moderate",
        images: [],
        previewImages: [],
        location: "",
        responsible: "",
        responsibleContact: "",
        adoptionRequirements: []
      });
      
      // Reset to first step
      setActiveStep("basic-info");
      
    } catch (error) {
      console.error('Error submitting animal:', error);
      toast.error(`Erro ao cadastrar animal: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cadastro de Animais</CardTitle>
        <CardDescription>
          Adicione informações sobre o animal para adoção
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            {steps.map((step) => (
              <TabsTrigger key={step.id} value={step.id} className="text-xs md:text-sm">
                {step.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="mt-4 space-y-4">
            <TabsContent value="basic-info">
              <AnimalBasicInfo
                formData={formData}
                handleInputChange={handleInputChange}
                handleRadioChange={handleRadioChange}
              />
            </TabsContent>
            
            <TabsContent value="health-info">
              <AnimalHealthInfo
                formData={formData}
                handleInputChange={handleInputChange}
                handleSwitchChange={handleSwitchChange}
                handleRadioChange={handleRadioChange}
              />
            </TabsContent>
            
            <TabsContent value="characteristics">
              <AnimalCharacteristics
                formData={formData}
                handleArrayChange={handleArrayChange}
                handleRadioChange={handleRadioChange}
              />
            </TabsContent>
            
            <TabsContent value="images">
              <AnimalImages
                images={formData.images}
                previewImages={formData.previewImages}
                onChange={handleImageChange}
              />
            </TabsContent>
            
            <TabsContent value="location-staff">
              <AnimalLocationStaff
                formData={formData}
                handleInputChange={handleInputChange}
                handleResponsibleChange={handleResponsibleChange}
              />
            </TabsContent>
            
            <TabsContent value="requirements">
              <AnimalRequirements
                formData={formData}
                handleArrayChange={handleArrayChange}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={goToPrevStep}
          disabled={activeStep === "basic-info" || isSubmitting}
        >
          Voltar
        </Button>
        
        <div className="flex gap-2">
          {activeStep !== steps[steps.length - 1].id ? (
            <Button onClick={goToNextStep} disabled={isSubmitting}>
              Próximo
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Enviando..." : "Cadastrar Animal"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AnimalRegistrationForm;
