import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-sonner";
import { Loader2 } from "lucide-react";
import AnimalBasicInfo from './AnimalBasicInfo';
import AnimalCharacteristics from './AnimalCharacteristics';
import AnimalHealthInfo from './AnimalHealthInfo';
import AnimalImages from './AnimalImages';
import AnimalLocationStaff from './AnimalLocationStaff';
import AnimalAdopterProfile from './AnimalAdopterProfile';
import AnimalRequirements from './AnimalRequirements';
import { AnimalFormData } from './types';
import AnimalList from './AnimalList';
import { createAnimal } from '@/services/animalService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AnimalRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState<AnimalFormData>({
    name: '',
    type: 'cachorro',
    breed: '',
    age: '',
    gender: 'macho',
    size: 'medio',
    description: '',
    vaccinationStatus: '',
    veterinaryInfo: '',
    healthConditions: '',
    specialNeeds: false,
    specialNeedsDescription: '',
    sterilized: false,
    tutorName: '',
    tutorContact: '',
    goodWithChildren: false,
    goodWithOtherAnimals: false,
    goodWithSeniors: false,
    goodWith: [],
    energyLevel: 'medium',
    trainability: 'moderate',
    temperament: [],
    characteristics: [],
    images: [],
    previewImages: [],
    location: '',
    responsible: '',
    responsibleContact: '',
    adoptionRequirements: [],
    requirements: [],
    suitableHousing: ['house', 'apartment', 'farm'],
    requiresYard: false,
    requiresWalledYard: false,
    requiresWindowScreens: false,
    allowsRented: true,
    minResidentExperience: 'none',
    suitableForChildren: true,
    suitableForFirstTimers: true,
    maxHoursAloneDaily: 8,
    estimatedMonthlyCost: '300-600',
    requiresEmergencyBudget: true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState<{[key: number]: string}>({});
  
  const totalSteps = 7;
  
  const handleNextStep = () => {
    if (!validateCurrentStep()) return;
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Clear any previous errors for this step
      const updatedErrors = {...stepErrors};
      delete updatedErrors[currentStep];
      setStepErrors(updatedErrors);
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleChange = (field: keyof AnimalFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleChangeMultiple = (updates: Partial<AnimalFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates
    }));
  };
  
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Basic Info
        if (!formData.name.trim()) {
          setStepErrors({...stepErrors, 1: "Nome do animal é obrigatório"});
          toast.error("Nome do animal é obrigatório");
          return false;
        }
        
        if (!formData.breed.trim()) {
          setStepErrors({...stepErrors, 1: "Raça do animal é obrigatória"});
          toast.error("Raça do animal é obrigatória");
          return false;
        }
        
        if (!formData.age.trim()) {
          setStepErrors({...stepErrors, 1: "Idade do animal é obrigatória"});
          toast.error("Idade do animal é obrigatória");
          return false;
        }
        
        if (!formData.description.trim()) {
          setStepErrors({...stepErrors, 1: "Descrição do animal é obrigatória"});
          toast.error("Descrição do animal é obrigatória");
          return false;
        }
        
        if (formData.description.trim().length < 20) {
          setStepErrors({...stepErrors, 1: "A descrição deve ter pelo menos 20 caracteres"});
          toast.error("A descrição deve ter pelo menos 20 caracteres");
          return false;
        }
        break;
        
      case 4: // Images
        if (formData.previewImages.length === 0) {
          setStepErrors({...stepErrors, 4: "É necessário adicionar pelo menos uma foto do animal"});
          toast.error("É necessário adicionar pelo menos uma foto do animal");
          return false;
        }
        break;
    }
    
    return true;
  };
  
  const validateForm = () => {
    // Required fields validation
    if (!formData.name.trim()) {
      toast.error("Nome do animal é obrigatório");
      setCurrentStep(1);
      return false;
    }
    
    if (!formData.type) {
      toast.error("Tipo de animal é obrigatório");
      setCurrentStep(1);
      return false;
    }
    
    if (!formData.age.trim()) {
      toast.error("Idade do animal é obrigatória");
      setCurrentStep(1);
      return false;
    }
    
    if (!formData.gender) {
      toast.error("Sexo do animal é obrigatório");
      setCurrentStep(1);
      return false;
    }
    
    if (!formData.size) {
      toast.error("Porte do animal é obrigatório");
      setCurrentStep(1);
      return false;
    }
    
    if (!formData.description.trim()) {
      toast.error("Descrição do animal é obrigatória");
      setCurrentStep(1);
      return false;
    }
    
    if (formData.previewImages.length === 0) {
      toast.error("É necessário adicionar pelo menos uma foto do animal");
      setCurrentStep(4);
      return false;
    }
    
    // Additional validations as needed
    
    return true;
  };
  
  const mapFormDataToAnimal = (): AnimalCreateData => {
    // Determine goodWith array based on checkboxes
    const goodWith = [];
    if (formData.goodWithChildren) goodWith.push("children");
    if (formData.goodWithOtherAnimals) goodWith.push("animals");
    if (formData.goodWithSeniors) goodWith.push("seniors");
    
    // Create an actual animal object from form data
    return {
      nome: formData.name.trim(),
      idade: parseInt(formData.age) || 0,
      tipo: formData.type as "cachorro" | "gato" | "outro",
      porte: formData.size as "pequeno" | "medio" | "grande",
      sexo: formData.gender as "macho" | "femea",
      castrado: formData.sterilized,
      vacinas: formData.vaccinationStatus ? [formData.vaccinationStatus] : [],
      descricao: formData.description.trim(),
      fotoPrincipal: formData.previewImages[0] || undefined,
      fotos: formData.previewImages
    };
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Map form data to animal data
      const animalData = mapFormDataToAnimal();
      
      console.log("Submitting animal data:", animalData);
      
      // Create the animal using the service function
      const createdAnimal = await createAnimal(animalData);
      
      if (!createdAnimal) {
        throw new Error("Falha ao criar animal");
      }
      
      console.log("Animal created successfully:", createdAnimal);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        type: 'cachorro',
        breed: '',
        age: '',
        gender: 'macho',
        size: 'medio',
        description: '',
        vaccinationStatus: '',
        veterinaryInfo: '',
        healthConditions: '',
        specialNeeds: false,
        specialNeedsDescription: '',
        sterilized: false,
        tutorName: '',
        tutorContact: '',
        goodWithChildren: false,
        goodWithOtherAnimals: false,
        goodWithSeniors: false,
        goodWith: [],
        energyLevel: 'medium',
        trainability: 'moderate',
        temperament: [],
        characteristics: [],
        images: [],
        previewImages: [],
        location: '',
        responsible: '',
        responsibleContact: '',
        adoptionRequirements: [],
        requirements: [],
        suitableHousing: ['house', 'apartment', 'farm'],
        requiresYard: false,
        requiresWalledYard: false,
        requiresWindowScreens: false,
        allowsRented: true,
        minResidentExperience: 'none',
        suitableForChildren: true,
        suitableForFirstTimers: true,
        maxHoursAloneDaily: 8,
        estimatedMonthlyCost: '300-600',
        requiresEmergencyBudget: true,
      });
      
      // Reset to first step
      setCurrentStep(1);
      setStepErrors({});
      
      // Switch to the list tab
      setActiveTab('list');
    } catch (error) {
      console.error("Error submitting animal:", error);
      
      let errorMessage = "Erro ao cadastrar animal";
      if (error instanceof Error) {
        errorMessage = `Erro ao cadastrar animal: ${error.message}`;
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // TypeScript interface for createAnimal's expected data format
  interface AnimalCreateData {
    nome: string;
    idade: number;
    tipo: "cachorro" | "gato" | "outro";
    porte: "pequeno" | "medio" | "grande";
    sexo: "macho" | "femea";
    castrado: boolean;
    vacinas?: string[];
    responsavel_id?: string;
    descricao?: string;
    fotoPrincipal?: string;
    fotos?: string[];
  }

  // Render helper for step indicators
  const renderStepIndicator = () => {
    return (
      <div className="flex justify-between mb-6">
        {Array.from({length: totalSteps}).map((_, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${currentStep > idx + 1 ? 'bg-green-500 text-white' : 
                  currentStep === idx + 1 ? 'bg-primary text-primary-foreground' : 
                  'bg-muted text-muted-foreground'}`}
            >
              {currentStep > idx + 1 ? '✓' : idx + 1}
            </div>
            {idx < totalSteps - 1 && (
              <div className={`h-px w-16 -mx-3 mt-4 
                ${currentStep > idx + 1 ? 'bg-green-500' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Animais</CardTitle>
        <CardDescription>
          Gerencie o cadastro de animais para adoção
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="register">Cadastrar Animal</TabsTrigger>
            <TabsTrigger value="list">Listar Animais</TabsTrigger>
          </TabsList>
          
          <TabsContent value="register">
            <Card>
              <CardContent className="pt-6">
                {renderStepIndicator()}
                
                {stepErrors[currentStep] && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Erro de validação</AlertTitle>
                    <AlertDescription>{stepErrors[currentStep]}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  {currentStep === 1 && (
                    <AnimalBasicInfo 
                      formData={formData}
                      onFormChange={handleChangeMultiple}
                    />
                  )}
                  
                  {currentStep === 2 && (
                    <AnimalCharacteristics 
                      formData={formData}
                      onFormChange={handleChangeMultiple}
                    />
                  )}
                  
                  {currentStep === 3 && (
                    <AnimalHealthInfo 
                      formData={formData}
                      onFormChange={handleChangeMultiple}
                    />
                  )}
                  
                  {currentStep === 4 && (
                    <AnimalImages 
                      images={formData.images}
                      previewImages={formData.previewImages}
                      onChange={(images, previews) => {
                        handleChangeMultiple({
                          images,
                          previewImages: previews
                        });
                      }}
                    />
                  )}
                  
                  {currentStep === 5 && (
                    <AnimalLocationStaff 
                      formData={formData}
                      onFormChange={handleChangeMultiple}
                    />
                  )}
                  
                  {currentStep === 6 && (
                    <AnimalAdopterProfile
                      formData={formData}
                      onFormChange={handleChangeMultiple}
                    />
                  )}

                  {currentStep === 7 && (
                    <AnimalRequirements
                      formData={formData}
                      onFormChange={handleChangeMultiple}
                    />
                  )}
                  
                  <div className="flex justify-between mt-8">
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousStep}
                      disabled={currentStep === 1 || isSubmitting}
                    >
                      Anterior
                    </Button>
                    
                    {currentStep < totalSteps ? (
                      <Button onClick={handleNextStep} disabled={isSubmitting}>
                        Próximo
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cadastrando...
                          </>
                        ) : "Cadastrar Animal"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="list">
            <AnimalList />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnimalRegistrationForm;
