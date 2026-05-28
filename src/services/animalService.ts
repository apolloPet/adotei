
import { apiRequest, getApiBaseUrl, getAuthToken, handleUnauthorizedIfLoggedIn } from '@/lib/apiClient';
import { toast } from '@/hooks/use-sonner';

export type AnimalStatus = 'DISPONIVEL' | 'OCULTO' | 'ADOTADO';

type CostSimulationData = {
  monthlyTotal: number;
  yearlyTotal: number;
  lifetimeTotal: number;
  foodType?: string;
  healthConditions?: string[];
  specialCareNeeds?: string[];
};

export interface Animal {
  id: string;
  nome: string;
  idade: number;
  tipo: 'cachorro' | 'gato' | 'outro';
  porte: 'pequeno' | 'medio' | 'grande';
  sexo: 'macho' | 'femea';
  castrado: boolean;
  vacinas: string[];
  responsavel_id?: string | null;
  data_cadastro: string;
  descricao?: string;
  status?: AnimalStatus;
  fotoPrincipal?: string;
  fotos?: string[];
  imagens?: {
    id: string;
    url: string;
    ordem: number;
  }[];
  adopterProfile?: {
    suitableHousing: string[];
    requiresYard: boolean;
    requiresWalledYard: boolean;
    requiresWindowScreens: boolean;
    allowsRented: boolean;
    suitableForChildren: boolean;
    suitableForFirstTimers: boolean;
    maxHoursAloneDaily?: number;
    estimatedMonthlyCost?: string;
    requiresEmergencyBudget: boolean;
  };
}

export interface AnimalCreateData {
  nome: string;
  idade: number;
  tipo: 'cachorro' | 'gato';
  raca?: string;
  porte: 'pequeno' | 'medio' | 'grande';
  sexo: 'macho' | 'femea';
  castrado: boolean;
  vacinas?: string[];
  vaccineIds?: string[];
  responsavel_id?: string;
  descricao: string;
  specialNeeds?: boolean;
  specialNeedsDescription?: string;
  tutorName?: string;
  tutorContact?: string;
  personalityTemperament?: string;
  additionalInfo?: string;
  goodWithChildren?: boolean;
  goodWithOtherAnimals?: boolean;
  goodWithSeniors?: boolean;
  imageFiles?: File[];
  fotoPrincipal?: string;
  fotos?: string[];
  organizationId?: string;
  createdByUserId?: string;
  status?: AnimalStatus;
}

type BackendAnimal = {
  id: string;
  name: string;
  animalType: 'cachorro' | 'gato';
  breed?: string;
  ageYears: number;
  sex: 'macho' | 'femea';
  size: 'pequeno' | 'medio' | 'grande';
  description?: string;
  sterilized: boolean;
  vaccineIds?: string[];
  tutorName?: string;
  tutorContact?: string;
  personalityTemperament?: string;
  additionalInfo?: string;
  specialNeeds?: boolean;
  specialNeedsDescription?: string;
  goodWithChildren?: boolean;
  goodWithOtherAnimals?: boolean;
  goodWithSeniors?: boolean;
  location?: string;
  personalityTemperament?: string;
  adopterProfile?: {
    suitableHousing?: string[];
    requiresYard: boolean;
    requiresWalledYard: boolean;
    requiresWindowScreens: boolean;
    allowsRented: boolean;
    minResidentExperience?: string;
    suitableForChildren: boolean;
    suitableForFirstTimers: boolean;
    maxHoursAloneDaily?: number;
    estimatedMonthlyCost?: string;
    requiresEmergencyBudget: boolean;
  };
  images?: { id: string; fileUrl: string; displayOrder: number }[];
  createdAt?: string;
  status?: AnimalStatus;
};

const backendAnimalToAnimal = (animal: BackendAnimal): Animal => {
  const sortedImages = [...(animal.images || [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const orderedImages = sortedImages
    .map((image) => image.id ? `${getApiBaseUrl()}/api/animals/images/${image.id}` : image.fileUrl);
  return {
    id: animal.id,
    nome: animal.name,
    idade: animal.ageYears,
    tipo: animal.animalType,
    porte: animal.size,
    sexo: animal.sex,
    castrado: animal.sterilized,
    vacinas: animal.vaccineIds ?? [],
    responsavel_id: null,
    data_cadastro: animal.createdAt || '',
    descricao: animal.description,
    status: animal.status ?? 'DISPONIVEL',
    fotoPrincipal: orderedImages[0],
    fotos: orderedImages,
    imagens: sortedImages.map((image) => ({
      id: image.id,
      url: image.id ? `${getApiBaseUrl()}/api/animals/images/${image.id}` : image.fileUrl,
      ordem: image.displayOrder,
    })),
    ...(animal.location ? { location: animal.location } : {}),
    ...(animal.personalityTemperament
      ? { caracteristicas: [animal.personalityTemperament] }
      : {}),
    adopterProfile: animal.adopterProfile
      ? {
          suitableHousing: animal.adopterProfile.suitableHousing ?? [],
          requiresYard: animal.adopterProfile.requiresYard,
          requiresWalledYard: animal.adopterProfile.requiresWalledYard,
          requiresWindowScreens: animal.adopterProfile.requiresWindowScreens,
          allowsRented: animal.adopterProfile.allowsRented,
          suitableForChildren: animal.adopterProfile.suitableForChildren,
          suitableForFirstTimers: animal.adopterProfile.suitableForFirstTimers,
          maxHoursAloneDaily: animal.adopterProfile.maxHoursAloneDaily,
          estimatedMonthlyCost: animal.adopterProfile.estimatedMonthlyCost,
          requiresEmergencyBudget: animal.adopterProfile.requiresEmergencyBudget,
        }
      : undefined,
  };
};

type BackendAnimalImageResponse = {
  id: string;
  fileUrl: string;
  contentType: string;
  displayOrder: number;
};

const uploadAnimalImageInternal = async (animalId: string, file: File, displayOrder: number): Promise<BackendAnimalImageResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('displayOrder', String(displayOrder));

  const token = getAuthToken();
  const response = await fetch(`${getApiBaseUrl()}/api/animals/${animalId}/images`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    let message = `Erro HTTP ${response.status}`;
    try {
      const errorBody = await response.json() as { message?: string };
      if (errorBody?.message) message = errorBody.message;
    } catch {
      // noop
    }
    if (response.status === 401) {
      handleUnauthorizedIfLoggedIn();
    }
    throw new Error(message);
  }

  return response.json() as Promise<BackendAnimalImageResponse>;
};

const estimatedMonthlyCostBySize = (size: 'pequeno' | 'medio' | 'grande'): string => {
  if (size === 'grande') return '600+';
  if (size === 'medio') return '300-600';
  return '100-300';
};

export const createAnimal = async (animalData: AnimalCreateData): Promise<Animal | null> => {
  try {
    if (!animalData.nome || animalData.nome.trim() === '') {
      toast.error('O nome do animal é obrigatório', {
        description: 'Por favor, informe um nome válido para o animal.'
      });
      throw new Error('O nome do animal é obrigatório');
    }
    
    if (animalData.idade === undefined || isNaN(animalData.idade) || animalData.idade < 0) {
      toast.error('Idade inválida', {
        description: 'A idade do animal deve ser um número positivo.'
      });
      throw new Error('A idade do animal deve ser um número positivo');
    }
    
    if (!animalData.tipo) {
      toast.error('Tipo de animal não especificado', {
        description: 'Por favor, selecione se é cachorro ou gato.'
      });
      throw new Error('Tipo de animal não especificado');
    }
    
    if (!animalData.porte) {
      toast.error('Porte do animal não especificado', {
        description: 'Por favor, selecione o porte do animal (pequeno, médio ou grande).'
      });
      throw new Error('Porte do animal não especificado');
    }
    
    if (!animalData.sexo) {
      toast.error('Sexo do animal não especificado', {
        description: 'Por favor, selecione o sexo do animal (macho ou fêmea).'
      });
      throw new Error('Sexo do animal não especificado');
    }
    
    if (!animalData.descricao || animalData.descricao.trim() === '') {
      toast.error('Descrição do animal é obrigatória', {
        description: 'Por favor, forneça uma breve descrição sobre o animal.'
      });
      throw new Error('Descrição do animal é obrigatória');
    }
    toast.loading('Cadastrando animal...', { id: 'animal-creation' });

    const created = await apiRequest<BackendAnimal>('/api/animals', {
      method: 'POST',
      body: {
        name: animalData.nome.trim(),
        animalType: animalData.tipo,
        breed: animalData.raca,
        ageYears: animalData.idade,
        sex: animalData.sexo,
        size: animalData.porte,
        description: animalData.descricao?.trim(),
        sterilized: animalData.castrado,
        vaccineIds: animalData.vaccineIds ?? [],
        specialNeeds: animalData.specialNeeds ?? false,
        specialNeedsDescription: animalData.specialNeedsDescription,
        tutorName: animalData.tutorName,
        tutorContact: animalData.tutorContact,
        personalityTemperament: animalData.personalityTemperament,
        additionalInfo: animalData.additionalInfo,
        goodWithChildren: animalData.goodWithChildren ?? false,
        goodWithOtherAnimals: animalData.goodWithOtherAnimals ?? false,
        goodWithSeniors: animalData.goodWithSeniors ?? false,
        adopterProfile: {
          suitableHousing: ['house', 'apartment', 'farm'],
          requiresYard: animalData.porte === 'grande',
          requiresWalledYard: false,
          requiresWindowScreens: animalData.tipo === 'gato',
          allowsRented: true,
          minResidentExperience: 'none',
          suitableForChildren: animalData.goodWithChildren ?? true,
          suitableForFirstTimers: true,
          maxHoursAloneDaily: animalData.tipo === 'gato' ? 10 : 8,
          estimatedMonthlyCost: estimatedMonthlyCostBySize(animalData.porte),
          requiresEmergencyBudget: animalData.specialNeeds ?? false,
        },
        organizationId: animalData.organizationId,
        createdByUserId: animalData.createdByUserId,
        status: animalData.status,
      },
    });

    if (animalData.imageFiles?.length) {
      const limitedFiles = animalData.imageFiles.slice(0, 2);
      for (let index = 0; index < limitedFiles.length; index += 1) {
        await uploadAnimalImageInternal(created.id, limitedFiles[index], index);
      }
    }

    const data = await apiRequest<BackendAnimal>(`/api/animals/${created.id}`);

    toast.success('Animal cadastrado com sucesso!', {
      id: 'animal-creation',
      description: `${animalData.nome} foi adicionado ao sistema.`,
    });
    return backendAnimalToAnimal(data);
  } catch (error) {
    console.error('Erro em createAnimal:', error);
    if (error instanceof Error) {
      toast.error('Erro ao cadastrar animal', {
        id: 'animal-creation',
        description: error.message
      });
    } else {
      toast.error('Erro ao cadastrar animal', {
        id: 'animal-creation',
        description: 'Erro desconhecido ao cadastrar animal'
      });
    }
    throw error;
  }
};

export const getAnimals = async (filters?: {
  nome?: string;
  tipo?: string;
  porte?: string;
  responsavel_id?: string;
}): Promise<Animal[]> => {
  try {
    const data = await apiRequest<BackendAnimal[]>('/api/animals');
    let mappedAnimals = data.map(backendAnimalToAnimal);

    if (filters?.nome) {
      mappedAnimals = mappedAnimals.filter((animal) =>
        animal.nome.toLowerCase().includes(filters.nome!.toLowerCase()),
      );
    }
    if (filters?.tipo && filters.tipo !== 'all') {
      mappedAnimals = mappedAnimals.filter((animal) => animal.tipo === filters.tipo);
    }
    if (filters?.porte && filters.porte !== 'all') {
      mappedAnimals = mappedAnimals.filter((animal) => animal.porte === filters.porte);
    }

    return mappedAnimals;
  } catch (error) {
    console.error('Error in getAnimals:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao buscar animais');
    }
    throw error;
  }
};

export const getAnimalById = async (id: string): Promise<Animal | null> => {
  try {
    const data = await apiRequest<BackendAnimal>(`/api/animals/${id}`);
    return data ? backendAnimalToAnimal(data) : null;
  } catch (error) {
    console.error('Error in getAnimalById:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao buscar animal');
    }
    throw error;
  }
};

export const updateAnimal = async (id: string, animalData: Partial<Animal>): Promise<Animal | null> => {
  try {
    const current = await apiRequest<BackendAnimal>(`/api/animals/${id}`);

    const data = await apiRequest<BackendAnimal>(`/api/animals/${id}`, {
      method: 'PUT',
      body: {
        name: animalData.nome ?? current.name,
        animalType: animalData.tipo ?? current.animalType,
        breed: animalData.raca ?? current.breed,
        ageYears: animalData.idade ?? current.ageYears,
        sex: animalData.sexo ?? current.sex,
        size: animalData.porte ?? current.size,
        description: animalData.descricao ?? current.description,
        sterilized: animalData.castrado ?? current.sterilized,
        vaccineIds: animalData.vaccineIds ?? current.vaccineIds,
        tutorName: animalData.tutorName ?? current.tutorName,
        tutorContact: animalData.tutorContact ?? current.tutorContact,
        personalityTemperament: animalData.personalityTemperament ?? current.personalityTemperament,
        additionalInfo: animalData.additionalInfo ?? current.additionalInfo,
        specialNeeds: animalData.specialNeeds ?? current.specialNeeds ?? false,
        specialNeedsDescription: animalData.specialNeedsDescription ?? current.specialNeedsDescription,
        goodWithChildren: animalData.goodWithChildren ?? current.goodWithChildren ?? false,
        goodWithOtherAnimals: animalData.goodWithOtherAnimals ?? current.goodWithOtherAnimals ?? false,
        goodWithSeniors: animalData.goodWithSeniors ?? current.goodWithSeniors ?? false,
        status: animalData.status ?? current.status,
        adopterProfile: current.adopterProfile ?? {
          suitableHousing: ['house', 'apartment', 'farm'],
          requiresYard: (animalData.porte ?? current.size) === 'grande',
          requiresWalledYard: false,
          requiresWindowScreens: (animalData.tipo ?? current.animalType) === 'gato',
          allowsRented: true,
          minResidentExperience: 'none',
          suitableForChildren: animalData.goodWithChildren ?? current.goodWithChildren ?? true,
          suitableForFirstTimers: true,
          maxHoursAloneDaily: (animalData.tipo ?? current.animalType) === 'gato' ? 10 : 8,
          estimatedMonthlyCost: estimatedMonthlyCostBySize((animalData.porte ?? current.size) as 'pequeno' | 'medio' | 'grande'),
          requiresEmergencyBudget: animalData.specialNeeds ?? current.specialNeeds ?? false,
        },
      },
    });

    return backendAnimalToAnimal(data);
  } catch (error) {
    console.error('Error in updateAnimal:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao atualizar animal');
    }
    throw error;
  }
};

export const deleteAnimal = async (id: string): Promise<boolean> => {
  try {
    await apiRequest(`/api/animals/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error in deleteAnimal:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao excluir animal');
    }
    throw error;
  }
};

export const uploadAnimalImage = async (animalId: string, file: File, displayOrder: number): Promise<Animal | null> => {
  try {
    await uploadAnimalImageInternal(animalId, file, displayOrder);
    return await getAnimalById(animalId);
  } catch (error) {
    console.error('Error in uploadAnimalImage:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao importar imagem');
    }
    throw error;
  }
};

export const deleteAnimalImage = async (animalId: string, imageId: string): Promise<Animal | null> => {
  try {
    await apiRequest(`/api/animals/${animalId}/images/${imageId}`, { method: 'DELETE' });
    return await getAnimalById(animalId);
  } catch (error) {
    console.error('Error in deleteAnimalImage:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao excluir imagem');
    }
    throw error;
  }
};

export const updateAnimalStatus = async (id: string, status: AnimalStatus): Promise<Animal | null> => {
  try {
    const data = await apiRequest<BackendAnimal>(`/api/animals/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
    return backendAnimalToAnimal(data);
  } catch (error) {
    console.error('Error in updateAnimalStatus:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao atualizar status do animal');
    }
    throw error;
  }
};

export const saveCostSimulation = async (animalId: string, simulationData: CostSimulationData): Promise<boolean> => {
  try {
    // Make sure the animal exists
    const animal = await getAnimalById(animalId);
    if (!animal) {
      throw new Error('Animal não encontrado');
    }
    const simulationKey = `cost-simulation-${animalId}-${Date.now()}`;
    localStorage.setItem(simulationKey, JSON.stringify({
      animal_id: animalId,
      animal_type: animal.tipo,
      animal_size: animal.porte,
      age_months: animal.idade * 12,
      estimated_monthly_cost: simulationData.monthlyTotal,
      estimated_yearly_cost: simulationData.yearlyTotal,
      estimated_lifetime_cost: simulationData.lifetimeTotal,
      food_type: simulationData.foodType || 'basic',
      health_conditions: simulationData.healthConditions || [],
      special_care_needs: simulationData.specialCareNeeds || [],
      results_json: simulationData,
    }));

    return true;
  } catch (error) {
    console.error('Error in saveCostSimulation:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao salvar simulação de custos');
    }
    throw error;
  }
};
