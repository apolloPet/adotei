import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-sonner";
import { Loader2 } from "lucide-react";
import AnimalBasicInfo from './AnimalBasicInfo';
import AnimalCharacteristics from './AnimalCharacteristics';
import AnimalHealthInfo from './AnimalHealthInfo';
import AnimalImages from './AnimalImages';
import AnimalLocationStaff from './AnimalLocationStaff';
import { AnimalFormData } from './types';
import AnimalList from './AnimalList';
import { createAnimal } from '@/services/animalService';
import { apiRequest } from '@/lib/apiClient';
import VaccineManagement from './VaccineManagement';

const EMPTY_FORM: AnimalFormData = {
  name: '',
  type: 'cachorro',
  breed: '',
  age: '',
  gender: 'macho',
  size: 'medio',
  description: '',
  vaccineIds: [],
  specialNeeds: false,
  specialNeedsDescription: '',
  sterilized: false,
  additionalInfo: '',
  tutorName: '',
  tutorContact: '',
  personalityTemperament: '',
  goodWithChildren: false,
  goodWithOtherAnimals: false,
  goodWithSeniors: false,
  images: [],
  previewImages: [],
};

interface AnimalCreateData {
  nome: string;
  idade: number;
  tipo: 'cachorro' | 'gato';
  raca: string;
  porte: 'pequeno' | 'medio' | 'grande';
  sexo: 'macho' | 'femea';
  castrado: boolean;
  descricao: string;
  vaccineIds: string[];
  specialNeeds: boolean;
  specialNeedsDescription?: string;
  tutorName: string;
  tutorContact: string;
  additionalInfo?: string;
  personalityTemperament?: string;
  goodWithChildren: boolean;
  goodWithOtherAnimals: boolean;
  goodWithSeniors: boolean;
  imageFiles: File[];
  organizationId?: string;
  createdByUserId?: string;
}

interface BackendUserContext {
  id: string;
  authSubject: string;
  email: string;
  userType: string;
  organizationId?: string;
  roles: string[];
}

const AnimalRegistrationForm = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState<AnimalFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangeMultiple = (updates: Partial<AnimalFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return toast.error("Nome do animal é obrigatório"), false;
    if (!formData.breed.trim()) return toast.error("Raça do animal é obrigatória"), false;
    if (!formData.age.trim()) return toast.error("Idade do animal é obrigatória"), false;
    if (!formData.description.trim()) return toast.error("Descrição do animal é obrigatória"), false;
    if (!formData.tutorName.trim()) return toast.error("Nome do tutor é obrigatório"), false;
    if (!formData.tutorContact.trim()) return toast.error("Contato do tutor é obrigatório"), false;
    if (formData.images.length === 0) return toast.error("Adicione pelo menos uma foto"), false;
    if (formData.images.length > 2) return toast.error("O cadastro aceita no máximo 2 fotos"), false;
    return true;
  };

  const mapFormDataToAnimal = (): AnimalCreateData => ({
    nome: formData.name.trim(),
    idade: parseInt(formData.age, 10) || 0,
    tipo: formData.type as "cachorro" | "gato",
    raca: formData.breed.trim(),
    porte: formData.size as "pequeno" | "medio" | "grande",
    sexo: formData.gender as "macho" | "femea",
    castrado: formData.sterilized,
    descricao: formData.description.trim(),
    vaccineIds: formData.vaccineIds,
    specialNeeds: formData.specialNeeds,
    specialNeedsDescription: formData.specialNeedsDescription?.trim() || undefined,
    tutorName: formData.tutorName.trim(),
    tutorContact: formData.tutorContact.trim(),
    additionalInfo: formData.additionalInfo?.trim() || undefined,
    personalityTemperament: formData.personalityTemperament?.trim() || undefined,
    goodWithChildren: formData.goodWithChildren,
    goodWithOtherAnimals: formData.goodWithOtherAnimals,
    goodWithSeniors: formData.goodWithSeniors,
    imageFiles: formData.images,
  });

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setIsSubmitting(true);
      const animalData = mapFormDataToAnimal();
      const currentEmail = localStorage.getItem('userEmail');
      if (currentEmail) {
        const users = await apiRequest<BackendUserContext[]>('/api/users');
        const currentUser = users.find((user) => user.email === currentEmail || user.authSubject === currentEmail);
        if (currentUser) {
          animalData.createdByUserId = currentUser.id;
          if (currentUser.userType === 'VOLUNTARIO') {
            if (!currentUser.organizationId) {
              toast.error('Voluntário sem ONG vinculada. Vincule o voluntário a uma ONG antes de cadastrar animais.');
              return;
            }
            animalData.organizationId = currentUser.organizationId;
          }
        }
      }

      await createAnimal(animalData);
      setFormData(EMPTY_FORM);
      setActiveTab('list');
    } catch (error) {
      console.error("Error submitting animal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Animais</CardTitle>
        <CardDescription>
          Cadastro com fotos no S3 via backend e dados completos do animal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="register">Cadastrar Animal</TabsTrigger>
            <TabsTrigger value="list">Listar Animais</TabsTrigger>
            <TabsTrigger value="vaccines">Cadastrar Vacinas</TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <Card>
              <CardContent className="pt-6 space-y-8">
                <AnimalBasicInfo formData={formData} onFormChange={handleChangeMultiple} />
                <div className="pt-6 border-t">
                  <h4 className="text-sm font-semibold mb-3">Fotos do animal</h4>
                  <AnimalImages
                    images={formData.images}
                    previewImages={formData.previewImages}
                    onChange={(images, previews) => handleChangeMultiple({ images, previewImages: previews })}
                  />
                </div>
                <div className="pt-6 border-t">
                  <AnimalHealthInfo formData={formData} onFormChange={handleChangeMultiple} />
                </div>
                <div className="pt-6 border-t">
                  <AnimalLocationStaff formData={formData} onFormChange={handleChangeMultiple} />
                </div>
                <div className="pt-6 border-t">
                  <AnimalCharacteristics formData={formData} onFormChange={handleChangeMultiple} />
                </div>
                <div className="flex justify-end mt-8">
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      'Cadastrar Animal'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <AnimalList />
          </TabsContent>

          <TabsContent value="vaccines">
            <VaccineManagement />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnimalRegistrationForm;
