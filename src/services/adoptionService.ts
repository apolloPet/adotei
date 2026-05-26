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

type BackendUser = {
  id: string;
  authSubject: string;
  fullName: string;
  email: string;
  phone?: string;
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

const toStage = (matchType: PetMatchType): AdoptionStage =>
  matchType === 'liked' ? 'interested' : 'pending_approval';

const readLegacyPetMatches = (): Array<{ petId: string; userId: string; matchType: PetMatchType; at: string }> => {
  try {
    return JSON.parse(localStorage.getItem(STAGE_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
};

const ensureFromLegacyMatches = () => {
  const existing = readAdoptions();
  if (existing.length > 0) {
    return;
  }

  const legacy = readLegacyPetMatches()
    .filter((m) => m.matchType === 'liked' || m.matchType === 'saved')
    .map<StoredAdoption>((m, index) => ({
      id: `adoption-${index + 1}-${m.at}`,
      petId: m.petId,
      userId: m.userId,
      currentStage: toStage(m.matchType),
      createdAt: m.at,
      updatedAt: m.at,
    }));

  if (legacy.length > 0) {
    writeAdoptions(legacy);
  }
};

export const fetchAdoptions = async (): Promise<AdoptionMatch[]> => {
  ensureFromLegacyMatches();

  const [animals, users] = await Promise.all([
    getAnimals(),
    apiRequest<BackendUser[]>('/api/users'),
  ]);

  const animalById = new Map(animals.map((animal) => [animal.id, animal]));
  const userByIdOrEmail = new Map<string, BackendUser>();
  users.forEach((user) => {
    userByIdOrEmail.set(user.id, user);
    userByIdOrEmail.set(user.email, user);
    userByIdOrEmail.set(user.authSubject, user);
  });

  return readAdoptions().map((adoption) => {
    const animal = animalById.get(adoption.petId);
    const user = userByIdOrEmail.get(adoption.userId);

    return {
      id: adoption.id,
      petId: adoption.petId,
      petName: animal?.nome || 'Animal não encontrado',
      petImage: animal?.fotoPrincipal || animal?.fotos?.[0] || '/placeholder.svg',
      userId: user?.id || adoption.userId,
      userName: user?.fullName || adoption.userId,
      userEmail: user?.email || adoption.userId,
      userPhone: user?.phone || '',
      currentStage: adoption.currentStage,
      createdAt: adoption.createdAt,
      updatedAt: adoption.updatedAt,
      notes: adoption.notes,
      rejectionReason: adoption.rejectionReason,
      responsibleId: adoption.responsibleId,
      followUpStatus: adoption.followUpStatus,
      lastFollowUpDate: adoption.lastFollowUpDate,
      nextFollowUpDate: adoption.nextFollowUpDate,
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
  const updated = readAdoptions().map((adoption) =>
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
  writeAdoptions(updated);
  toast.success('Estágio atualizado');
  return true;
};

export type PetMatchType = 'liked' | 'disliked' | 'saved';

const readMatches = (): Array<{ petId: string; userId: string; matchType: PetMatchType; at: string }> => {
  try {
    return JSON.parse(localStorage.getItem(STAGE_HISTORY_KEY) || '[]');
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
  try {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      const parsed = JSON.parse(authUser) as { userType?: string; roles?: string[] };
      const isVolunteer = parsed.userType === 'VOLUNTARIO' || Boolean(parsed.roles?.includes('VOLUNTARIO'));
      if (isVolunteer) {
        toast.error('Voluntários de ONG não podem realizar ações de tutor/adotante.');
        return false;
      }
    }
  } catch {
    // noop: se não conseguir ler sessão, segue validação normal
  }

  const at = new Date().toISOString();
  const all = readMatches();
  all.push({ petId, userId, matchType, at });
  localStorage.setItem(STAGE_HISTORY_KEY, JSON.stringify(all));

  if (matchType === 'liked' || matchType === 'saved') {
    const adoptions = readAdoptions();
    const exists = adoptions.some((a) => a.petId === petId && a.userId === userId);
    if (!exists) {
      adoptions.push({
        id: `adoption-${crypto.randomUUID?.() || `${petId}-${Date.now()}`}`,
        petId,
        userId,
        currentStage: toStage(matchType),
        createdAt: at,
        updatedAt: at,
      });
      writeAdoptions(adoptions);
    }
  }

  if (matchType === 'saved') {
    toast.success('Animal salvo para acompanhar 🔖');
  }
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
  const updated = readAdoptions().map((adoption) =>
    adoption.id === adoptionId
      ? { ...adoption, responsibleId, updatedAt: new Date().toISOString() }
      : adoption
  );
  writeAdoptions(updated);
  toast.success('Responsável atribuído');
  return true;
};

export const recordFollowUp = async (
  adoptionId: string,
  notes: string,
  status: 'successful' | 'needs_attention' | 'failed'
): Promise<boolean> => {
  const now = new Date().toISOString();
  const updated = readAdoptions().map((adoption) =>
    adoption.id === adoptionId
      ? {
          ...adoption,
          notes: notes || adoption.notes,
          followUpStatus: status,
          lastFollowUpDate: now,
          updatedAt: now,
        }
      : adoption
  );
  writeAdoptions(updated);
  toast.success('Acompanhamento registrado');
  return true;
};
