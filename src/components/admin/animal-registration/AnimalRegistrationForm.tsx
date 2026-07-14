import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-sonner";
import { Loader2 } from "lucide-react";
import AnimalBasicInfo from './AnimalBasicInfo';
import AnimalCharacteristics from './AnimalCharacteristics';
import AnimalHealthInfo from './AnimalHealthInfo';
import AnimalImages from './AnimalImages';
import { AnimalFormData, DRAFT_PERSONALITY_ID } from './types';
import AnimalList from './AnimalList';
import { createAnimal } from '@/services/animalService';
import { createPersonality } from '@/services/personalityService';
import { apiRequest } from '@/lib/apiClient';
import VaccineManagement from './VaccineManagement';

const EMPTY_FORM: AnimalFormData = {
  name: '',
  type: 'cachorro',
  breed: '',
  age: '',
  gender: 'macho',
  size: 'medio',
  personalityId: '',
  pendingPersonality: null,
  vaccineIds: [],
  specialNeeds: false,
  specialNeedsDescription: '',
  sterilized: false,
  additionalInfo: '',
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
  raca?: string;
  porte: 'pequeno' | 'medio' | 'grande';
  sexo: 'macho' | 'femea';
  castrado: boolean;
  personalityId: string;
  vaccineIds: string[];
  specialNeeds: boolean;
  specialNeedsDescription?: string;
  additionalInfo?: string;
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

type OrganizationOption = {
  id: string;
  legalName: string;
};

const AnimalRegistrationForm = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState<AnimalFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadUserContext = async () => {
      const currentEmail = localStorage.getItem('userEmail');
      if (!currentEmail) return;

      try {
        const users = await apiRequest<BackendUserContext[]>('/api/users');
        const currentUser = users.find((user) => user.email === currentEmail || user.authSubject === currentEmail);
        if (!currentUser) return;

        if (currentUser.userType === 'VOLUNTARIO') {
          setOrganizationId(currentUser.organizationId);
        } else if (currentUser.userType === 'ADMIN') {
          setIsAdmin(true);
          const orgs = await apiRequest<OrganizationOption[]>('/api/organizations');
          setOrganizations(orgs);
        }
      } catch (error) {
        console.error('Erro ao carregar contexto do usuário:', error);
      }
    };

    loadUserContext();
  }, []);

  const handleChangeMultiple = (updates: Partial<AnimalFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return toast.error("Nome do animal é obrigatório"), false;
    if (!formData.age.trim()) return toast.error("Idade do animal é obrigatória"), false;
    if (!organizationId) return toast.error("Selecione uma ONG para cadastrar o animal"), false;
    if (!formData.personalityId) return toast.error("Selecione uma personalidade e temperamento"), false;
    if (
      formData.personalityId === DRAFT_PERSONALITY_ID &&
      (!formData.pendingPersonality?.name?.trim() || !formData.pendingPersonality?.description?.trim())
    ) {
      return toast.error("Complete os dados da nova personalidade e temperamento"), false;
    }
    if (formData.images.length === 0) return toast.error("Adicione pelo menos uma foto"), false;
    if (formData.images.length > 2) return toast.error("O cadastro aceita no máximo 2 fotos"), false;
    return true;
  };

  const mapFormDataToAnimal = (personalityId: string): AnimalCreateData => ({
    nome: formData.name.trim(),
    idade: parseInt(formData.age, 10) || 0,
    tipo: formData.type as "cachorro" | "gato",
    raca: formData.breed.trim() || undefined,
    porte: formData.size as "pequeno" | "medio" | "grande",
    sexo: formData.gender as "macho" | "femea",
    castrado: formData.sterilized,
    personalityId,
    vaccineIds: formData.vaccineIds,
    specialNeeds: formData.specialNeeds,
    specialNeedsDescription: formData.specialNeedsDescription?.trim() || undefined,
    additionalInfo: formData.additionalInfo?.trim() || undefined,
    goodWithChildren: formData.goodWithChildren,
    goodWithOtherAnimals: formData.goodWithOtherAnimals,
    goodWithSeniors: formData.goodWithSeniors,
    imageFiles: formData.images,
    organizationId,
  });

  const resolvePersonalityId = async (): Promise<string> => {
    if (formData.personalityId !== DRAFT_PERSONALITY_ID) {
      return formData.personalityId;
    }
    if (!organizationId || !formData.pendingPersonality) {
      throw new Error('Rascunho de personalidade inválido');
    }
    const created = await createPersonality(
      {
        name: formData.pendingPersonality.name.trim(),
        description: formData.pendingPersonality.description.trim(),
        active: true,
      },
      organizationId
    );
    return created.id;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setIsSubmitting(true);
      const personalityId = await resolvePersonalityId();
      const animalData = mapFormDataToAnimal(personalityId);
      const currentEmail = localStorage.getItem('userEmail');
      if (currentEmail) {
        const users = await apiRequest<BackendUserContext[]>('/api/users');
        const currentUser = users.find((user) => user.email === currentEmail || user.authSubject === currentEmail);
        if (currentUser) {
          animalData.createdByUserId = currentUser.id;
        }
      }

      await createAnimal(animalData);
      setFormData(EMPTY_FORM);
      if (isAdmin) {
        setOrganizationId(undefined);
      }
      setActiveTab('list');
    } catch (error) {
      console.error("Error submitting animal:", error);
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar animal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="min-w-0 overflow-hidden border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-2xl">Registro de Animais</CardTitle>
        <CardDescription className="text-xs sm:text-sm break-words">
          Cadastro com fotos no S3 via backend e dados completos do animal
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0">
          <TabsList className="mb-4 w-full h-auto p-1 gap-1 overflow-x-auto flex flex-nowrap justify-start">
            <TabsTrigger value="register" className="shrink-0 text-xs sm:text-sm px-2.5 sm:px-3">
              <span className="sm:hidden">Cadastrar</span>
              <span className="hidden sm:inline">Cadastrar Animal</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="shrink-0 text-xs sm:text-sm px-2.5 sm:px-3">
              <span className="sm:hidden">Listar</span>
              <span className="hidden sm:inline">Listar Animais</span>
            </TabsTrigger>
            <TabsTrigger value="vaccines" className="shrink-0 text-xs sm:text-sm px-2.5 sm:px-3">
              <span className="sm:hidden">Vacinas</span>
              <span className="hidden sm:inline">Cadastrar Vacinas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="min-w-0">
            <div className="rounded-lg border bg-card min-w-0">
              <div className="p-3 sm:p-6 space-y-6 sm:space-y-8">
                {isAdmin && (
                  <div className="space-y-2 pb-4 border-b">
                    <Label>ONG*</Label>
                    <Select
                      value={organizationId ?? undefined}
                      onValueChange={(value) => {
                        setOrganizationId(value);
                        handleChangeMultiple({ personalityId: '', pendingPersonality: null });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a ONG responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.legalName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <AnimalBasicInfo
                  formData={formData}
                  organizationId={organizationId}
                  onFormChange={handleChangeMultiple}
                />
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
                  <AnimalCharacteristics formData={formData} onFormChange={handleChangeMultiple} />
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-end mt-6 sm:mt-8">
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="min-w-0">
            <AnimalList />
          </TabsContent>

          <TabsContent value="vaccines" className="min-w-0">
            <VaccineManagement />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnimalRegistrationForm;
