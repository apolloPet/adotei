
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-sonner";
import AnimalBasicInfo from './AnimalBasicInfo';
import AnimalCharacteristics from './AnimalCharacteristics';
import AnimalHealthInfo from './AnimalHealthInfo';
import AnimalImages from './AnimalImages';
import AnimalLocationStaff from './AnimalLocationStaff';
import AnimalRequirements from './AnimalRequirements';
import { Animal, AnimalFormData } from './types';
import AnimalList from './AnimalList';
import { createAnimal } from '@/services/animalService';

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
    goodWithChildren: false,
    goodWithOtherAnimals: false,
    goodWithSeniors: false,
    goodWith: [],
    energyLevel: 'medium',
    trainability: 'moderate',
    characteristics: [],
    images: [],
    previewImages: [],
    location: '',
    responsible: '',
    responsibleContact: '',
    adoptionRequirements: [],
    requirements: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const totalSteps = 6;
  
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
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
  
  const validateForm = () => {
    // Required fields validation
    if (!formData.name.trim()) {
      toast.error("Nome do animal é obrigatório");
      return false;
    }
    
    if (!formData.type) {
      toast.error("Tipo de animal é obrigatório");
      return false;
    }
    
    if (!formData.age.trim()) {
      toast.error("Idade do animal é obrigatória");
      return false;
    }
    
    if (!formData.gender) {
      toast.error("Sexo do animal é obrigatório");
      return false;
    }
    
    if (!formData.size) {
      toast.error("Porte do animal é obrigatório");
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
      nome: formData.name,
      idade: parseInt(formData.age) || 0,
      tipo: formData.type as "cachorro" | "gato" | "outro",
      porte: formData.size as "pequeno" | "medio" | "grande",
      sexo: formData.gender as "macho" | "femea",
      castrado: formData.sterilized,
      vacinas: formData.vaccinationStatus ? [formData.vaccinationStatus] : [],
      descricao: formData.description,
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
      
      toast.success("Animal cadastrado com sucesso!");
      
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
        goodWithChildren: false,
        goodWithOtherAnimals: false,
        goodWithSeniors: false,
        goodWith: [],
        energyLevel: 'medium',
        trainability: 'moderate',
        characteristics: [],
        images: [],
        previewImages: [],
        location: '',
        responsible: '',
        responsibleContact: '',
        adoptionRequirements: [],
        requirements: []
      });
      
      // Reset to first step
      setCurrentStep(1);
      
      // Switch to the list tab
      setActiveTab('list');
    } catch (error) {
      console.error("Error submitting animal:", error);
      
      let errorMessage = "Erro ao cadastrar animal";
      if (error instanceof Error) {
        errorMessage = `Error submitting animal: ${error.message}`;
      }
      
      toast.error(errorMessage);
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
                      formData={formData}
                      onFormChange={handleChangeMultiple}
                    />
                  )}
                  
                  {currentStep === 5 && (
                    <AnimalLocationStaff 
                      formData={formData}
                      onFormChange={handleChangeMultiple}
                    />
                  )}
                  
                  {currentStep === 6 && (
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
                        {isSubmitting ? "Cadastrando..." : "Cadastrar Animal"}
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
