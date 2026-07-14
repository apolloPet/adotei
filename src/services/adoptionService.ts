import { AdoptionMatch } from '@/components/admin/adoption/types';
import { AdoptionStage } from '@/components/adoption/AdoptionStages';
import { toast } from '@/hooks/use-sonner';
import { apiRequest } from '@/lib/apiClient';
import { getAnimals } from './animalService';

type StoredAdoption = {
  id: string;
  petId: string;
  userId: string;
  currentStage: AdoptionStage;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  rejectionReason?: string;
  responsibleId?: string;
  followUpStatus?: string;
  lastFollowUpDate?: string | null;
  nextFollowUpDate?: string | null;
};

const STORAGE_KEY = 'adoption_matches_local';
const STAGE_HISTORY_KEY = 'pet_matches_local';

const readAdoptions = (): StoredAdoption[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeAdoptions = (rows: StoredAdoption[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
};

export const fetchAdoptions = async (): Promise<AdoptionMatch[]> => {
  const [interests, animals] = await Promise.all([
    apiRequest<BackendAdoptionInterest[]>('/api/animals/interests'),
    getAnimals(),
  ]);

  const animalById = new Map(animals.map((animal) => [animal.id, animal]));
  const localOverrides = new Map(readAdoptions().map((row) => [row.id, row]));

  return interests.map((interest) => {
    const animal = animalById.get(interest.animalId);
    const override = localOverrides.get(interest.id);
    const stageFromInterest: AdoptionStage =
      interest.interestType === 'LIKED' ? 'interested' : 'pending_approval';

    return {
      id: interest.id,
      petId: interest.animalId,
      petName: animal?.nome || 'Animal não encontrado',
      petImage: animal?.fotoPrincipal || animal?.fotos?.[0] || '/placeholder.svg',
      userId: interest.userId,
      userName: interest.userFullName || interest.userId,
      userEmail: interest.userEmail || interest.userId,
      userPhone: interest.userPhone || '',
      currentStage: override?.currentStage ?? stageFromInterest,
      createdAt: interest.createdAt,
      updatedAt: override?.updatedAt ?? interest.updatedAt,
      notes: override?.notes,
      rejectionReason: override?.rejectionReason,
      responsibleId: override?.responsibleId,
      followUpStatus: override?.followUpStatus,
      lastFollowUpDate: override?.lastFollowUpDate,
      nextFollowUpDate: override?.nextFollowUpDate,
      matchPoints: [],
    };
  });
};

export const updateAdoptionStage = async (
  id: string,
  stage: AdoptionStage,
  notes?: string,
  rejectionReason?: string
): Promise<boolean> => {
  const existing = readAdoptions();
  const index = existing.findIndex((adoption) => adoption.id === id);
  const now = new Date().toISOString();

  if (index >= 0) {
    existing[index] = {
      ...existing[index],
      currentStage: stage,
      notes: notes ?? existing[index].notes,
      rejectionReason: rejectionReason ?? existing[index].rejectionReason,
      updatedAt: now,
    };
  } else {
    existing.push({
      id,
      petId: '',
      userId: '',
      currentStage: stage,
      createdAt: now,
      updatedAt: now,
      notes,
      rejectionReason,
    });
  }

  writeAdoptions(existing);
  toast.success('Estágio atualizado');
  return true;
};

export type PetMatchType = 'liked' | 'disliked' | 'saved';

export type BackendInterestType = 'LIKED' | 'SAVED';

export type BackendAdoptionInterest = {
  id: string;
  animalId: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  userPhone?: string;
  interestType: BackendInterestType;
  createdAt: string;
  updatedAt: string;
};

const mapMatchTypeToInterestType = (matchType: PetMatchType): BackendInterestType | null => {
  if (matchType === 'liked') return 'LIKED';
  if (matchType === 'saved') return 'SAVED';
  return null;
};

const interestTypeLabel = (interestType: BackendInterestType): string =>
  interestType === 'LIKED' ? 'Interesse em adoção' : 'Salvo para acompanhar';

export const fetchAnimalInterests = async (animalId: string): Promise<BackendAdoptionInterest[]> =>
  apiRequest<BackendAdoptionInterest[]>(`/api/animals/${animalId}/interests`);

export const fetchAnimalIdsWithInterests = async (): Promise<string[]> =>
  apiRequest<string[]>('/api/animals/interests/animal-ids');

export const fetchMyAnimalIdsWithInterests = async (): Promise<string[]> =>
  apiRequest<string[]>('/api/animals/interests/my-animal-ids');

export { interestTypeLabel };

const readMatches = (): Array<{ petId: string; userId: string; matchType: PetMatchType; at: string }> => {
  try {
    return JSON.parse(localStorage.getItem(STAGE_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
};

const hasRecordedInterest = (
  matches: Array<{ petId: string; userId: string; matchType: PetMatchType; at: string }>,
  userId: string,
  petId: string
): boolean => matches.some((m) => m.userId === userId && m.petId === petId && (m.matchType === 'liked' || m.matchType === 'saved'));

export const getSavedPetIds = (userId: string): string[] =>
  readMatches().filter((m) => m.userId === userId && m.matchType === 'saved').map((m) => m.petId);

export const recordPetMatch = async (
  petId: string,
  userId: string,
  matchType: PetMatchType
): Promise<boolean> => {
  const interestType = mapMatchTypeToInterestType(matchType);
  if (!interestType) {
    return true;
  }

  const existingMatches = readMatches();
  if (hasRecordedInterest(existingMatches, userId, petId)) {
    return true;
  }

  try {
    const me = await apiRequest<{ userType?: string; roles?: string[] }>('/api/users/me');
    const isVolunteerUser =
      me.userType === 'VOLUNTARIO' || Boolean(me.roles?.includes('VOLUNTARIO'));
    const isAdminUser =
      me.userType === 'ADMIN' || Boolean(me.roles?.includes('ADMIN'));
    if (isVolunteerUser) {
      toast.error('Voluntários de ONG não podem realizar ações de tutor/adotante.');
      return false;
    }
    if (isAdminUser) {
      toast.error('Administradores não podem registrar interesse em animais. Use uma conta de adotante.');
      return false;
    }
  } catch {
    toast.error('Você precisa estar autenticado para realizar esta ação.');
    return false;
  }

  await apiRequest<BackendAdoptionInterest>(`/api/animals/${petId}/interests`, {
    method: 'POST',
    body: { interestType },
  });

  const at = new Date().toISOString();
  existingMatches.push({ petId, userId, matchType, at });
  localStorage.setItem(STAGE_HISTORY_KEY, JSON.stringify(existingMatches));

  return true;
};

export const getAdoptionsByStage = async (stage: AdoptionStage): Promise<AdoptionMatch[]> => {
  const all = await fetchAdoptions();
  return all.filter((adoption) => adoption.currentStage === stage);
};

export const getPendingFollowUps = async (): Promise<AdoptionMatch[]> => {
  const all = await fetchAdoptions();
  return all.filter((adoption) => adoption.currentStage === 'completed');
};

export const assignResponsible = async (
  adoptionId: string,
  responsibleId: string
): Promise<boolean> => {
  const existing = readAdoptions();
  const index = existing.findIndex((adoption) => adoption.id === adoptionId);
  const now = new Date().toISOString();

  if (index >= 0) {
    existing[index] = { ...existing[index], responsibleId, updatedAt: now };
  } else {
    existing.push({
      id: adoptionId,
      petId: '',
      userId: '',
      currentStage: 'interested',
      createdAt: now,
      updatedAt: now,
      responsibleId,
    });
  }

  writeAdoptions(existing);
  toast.success('Responsável atribuído');
  return true;
};

export const recordFollowUp = async (
  adoptionId: string,
  notes: string,
  status: 'successful' | 'needs_attention' | 'failed'
): Promise<boolean> => {
  const now = new Date().toISOString();
  const existing = readAdoptions();
  const index = existing.findIndex((adoption) => adoption.id === adoptionId);

  if (index >= 0) {
    existing[index] = {
      ...existing[index],
      notes: notes || existing[index].notes,
      followUpStatus: status,
      lastFollowUpDate: now,
      updatedAt: now,
    };
  } else {
    existing.push({
      id: adoptionId,
      petId: '',
      userId: '',
      currentStage: 'completed',
      createdAt: now,
      updatedAt: now,
      notes,
      followUpStatus: status,
      lastFollowUpDate: now,
    });
  }

  writeAdoptions(existing);
  toast.success('Acompanhamento registrado');
  return true;
};
