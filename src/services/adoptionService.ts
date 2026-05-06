import { AdoptionMatch, mockAdoptionMatches } from '@/components/admin/adoption/types';
import { AdoptionStage } from '@/components/adoption/AdoptionStages';
import { toast } from '@/hooks/use-sonner';

let localAdoptions: AdoptionMatch[] = [...mockAdoptionMatches];

export const fetchAdoptions = async (): Promise<AdoptionMatch[]> => {
  return localAdoptions;
};

export const updateAdoptionStage = async (
  id: string,
  stage: AdoptionStage,
  notes?: string,
  rejectionReason?: string
): Promise<boolean> => {
  localAdoptions = localAdoptions.map((adoption) =>
    adoption.id === id
      ? {
          ...adoption,
          currentStage: stage,
          notes: notes ?? adoption.notes,
          rejectionReason: rejectionReason ?? adoption.rejectionReason,
          updatedAt: new Date().toISOString(),
        }
      : adoption
  );

  toast.success('Estágio atualizado localmente');
  return true;
};

export type PetMatchType = 'liked' | 'disliked' | 'saved';

const STORAGE_KEY = 'pet_matches_local';

const readMatches = (): Array<{ petId: string; userId: string; matchType: PetMatchType; at: string }> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const getSavedPetIds = (userId: string): string[] =>
  readMatches().filter((m) => m.userId === userId && m.matchType === 'saved').map((m) => m.petId);

export const recordPetMatch = async (
  petId: string,
  userId: string,
  matchType: PetMatchType
): Promise<boolean> => {
  const all = readMatches();
  all.push({ petId, userId, matchType, at: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  if (matchType === 'saved') {
    toast.success('Animal salvo para acompanhar 🔖');
  }
  return true;
};

export const getAdoptionsByStage = async (stage: AdoptionStage): Promise<AdoptionMatch[]> => {
  return localAdoptions.filter((adoption) => adoption.currentStage === stage);
};

export const getPendingFollowUps = async (): Promise<AdoptionMatch[]> => {
  return localAdoptions.filter((adoption) => adoption.currentStage === 'completed');
};

export const assignResponsible = async (
  adoptionId: string,
  responsibleId: string
): Promise<boolean> => {
  localAdoptions = localAdoptions.map((adoption) =>
    adoption.id === adoptionId
      ? { ...adoption, responsibleId, updatedAt: new Date().toISOString() }
      : adoption
  );

  toast.success('Responsável atribuído localmente');
  return true;
};

export const recordFollowUp = async (
  adoptionId: string,
  notes: string,
  status: 'successful' | 'needs_attention' | 'failed'
): Promise<boolean> => {
  console.log('Modo local ativo: acompanhamento registrado localmente', { adoptionId, notes, status });
  toast.success('Acompanhamento registrado localmente');
  return true;
};
