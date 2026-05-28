import { apiRequest } from '@/lib/apiClient';
import { Pet, PetAdopterProfile } from '@/types/pets';
import { ExtendedProfile, UserProfile } from '@/types/user';
import {
  consumePendingAdopterProfile,
  loadExtendedProfile,
  saveExtendedProfile,
} from '@/utils/adopterProfileStorage';

const COMPATIBILITY_CACHE_VERSION = 'v1';
const COMPATIBILITY_CACHE_TTL_MS = 15 * 60 * 1000;

type BackendMe = {
  id: string;
  userType: string;
};

export type BackendAdopterProfile = {
  id: string;
  userId: string;
  housingType?: string;
  ownershipType?: string;
  rentAllowsPets?: boolean;
  hasYard?: boolean;
  yardWalled?: boolean;
  hasWindowScreens?: boolean;
  residentsCount?: number;
  hasChildren?: boolean;
  childrenAges?: string;
  hadPetsBefore?: boolean;
  currentlyHasPets?: boolean;
  currentPetsCount?: number;
  currentPetsTypes?: string;
  returnedAnimal?: boolean;
  petsVaccinated?: boolean;
  petsNeutered?: boolean;
  awareOfCosts?: boolean;
  monthlyBudget?: string;
  willCoverVaccines?: boolean;
  willCoverNeutering?: boolean;
  willCoverEmergencies?: boolean;
  reasonToAdopt?: string;
  hoursAloneDaily?: number;
  ifDestroyed?: string;
  ifSick?: string;
  willAdapt?: boolean;
  environmentPhotoUrl?: string;
  environmentVideoUrl?: string;
  updatedAt?: string;
};

type CompatibilityCacheEntry = {
  version: string;
  cachedAt: number;
  updatedAt?: string;
  userId: string;
  profile: BackendAdopterProfile;
};

export type CompatibilityQuestion = {
  code: string;
  label: string;
  compatible: boolean;
  adopterValue: string;
  animalRequirement: string;
};

export type CompatibilityScore = {
  scorePercent: number;
  matchedCount: number;
  totalAnsweredCount: number;
  questions: CompatibilityQuestion[];
};

type BackendCompatibilityResponse = {
  scorePercent: number;
  matchedCount: number;
  totalAnsweredCount: number;
  questions: CompatibilityQuestion[];
};

const cacheKey = (userId: string) => `compatibility_profile_cache:${userId}`;

const budgetRank = (value?: string): number => {
  if (!value) return 0;
  if (value === '600+') return 3;
  if (value === '300-600') return 2;
  if (value === '100-300') return 1;
  return 0;
};

const boolText = (value: boolean): string => (value ? 'true' : 'false');

const addQuestion = (
  questions: CompatibilityQuestion[],
  code: string,
  label: string,
  compatible: boolean,
  adopterValue: string,
  animalRequirement: string,
) => {
  questions.push({ code, label, compatible, adopterValue, animalRequirement });
};

const computeFromProfiles = (
  profile: BackendAdopterProfile,
  adopterRequirements?: PetAdopterProfile,
): CompatibilityScore => {
  if (!adopterRequirements) {
    return { scorePercent: 0, matchedCount: 0, totalAnsweredCount: 0, questions: [] };
  }

  const questions: CompatibilityQuestion[] = [];

  if (profile.hasYard !== undefined) {
    const compatible = !adopterRequirements.requiresYard || profile.hasYard;
    addQuestion(questions, 'yard', 'Possui quintal quando exigido', compatible, boolText(profile.hasYard), boolText(!!adopterRequirements.requiresYard));
  }
  if (profile.yardWalled !== undefined) {
    const compatible = !adopterRequirements.requiresWalledYard || profile.yardWalled;
    addQuestion(questions, 'walled_yard', 'Quintal murado quando exigido', compatible, boolText(profile.yardWalled), boolText(!!adopterRequirements.requiresWalledYard));
  }
  if (profile.hasWindowScreens !== undefined) {
    const compatible = !adopterRequirements.requiresWindowScreens || profile.hasWindowScreens;
    addQuestion(questions, 'window_screens', 'Tela em janelas quando exigido', compatible, boolText(profile.hasWindowScreens), boolText(!!adopterRequirements.requiresWindowScreens));
  }
  if (profile.ownershipType) {
    const isRented = profile.ownershipType === 'rented';
    const compatible = !isRented || (!!adopterRequirements.allowsRented && profile.rentAllowsPets === true);
    addQuestion(
      questions,
      'rented_policy',
      'Compatibilidade com moradia alugada',
      compatible,
      isRented ? `rented:${String(profile.rentAllowsPets)}` : profile.ownershipType,
      boolText(!!adopterRequirements.allowsRented),
    );
  }
  if (profile.hasChildren !== undefined && adopterRequirements.suitableForChildren !== undefined) {
    const compatible = !profile.hasChildren || adopterRequirements.suitableForChildren;
    addQuestion(
      questions,
      'children',
      'Compatibilidade com crianças',
      compatible,
      boolText(profile.hasChildren),
      boolText(!!adopterRequirements.suitableForChildren),
    );
  }
  if (profile.hadPetsBefore !== undefined && adopterRequirements.suitableForFirstTimers !== undefined) {
    const compatible = profile.hadPetsBefore || adopterRequirements.suitableForFirstTimers;
    addQuestion(
      questions,
      'first_timers',
      'Experiencia previa ou pet para iniciantes',
      compatible,
      boolText(profile.hadPetsBefore),
      boolText(!!adopterRequirements.suitableForFirstTimers),
    );
  }
  if (profile.willCoverEmergencies !== undefined && adopterRequirements.requiresEmergencyBudget !== undefined) {
    const compatible = !adopterRequirements.requiresEmergencyBudget || profile.willCoverEmergencies;
    addQuestion(
      questions,
      'emergency_budget',
      'Cobertura de emergencias veterinarias',
      compatible,
      boolText(profile.willCoverEmergencies),
      boolText(!!adopterRequirements.requiresEmergencyBudget),
    );
  }
  if (profile.hoursAloneDaily !== undefined && adopterRequirements.maxHoursAloneDaily !== undefined) {
    const compatible = profile.hoursAloneDaily <= adopterRequirements.maxHoursAloneDaily;
    addQuestion(
      questions,
      'hours_alone',
      'Tempo maximo sozinho por dia',
      compatible,
      String(profile.hoursAloneDaily),
      String(adopterRequirements.maxHoursAloneDaily),
    );
  }
  if (profile.monthlyBudget && adopterRequirements.estimatedMonthlyCost) {
    const compatible = budgetRank(profile.monthlyBudget) >= budgetRank(adopterRequirements.estimatedMonthlyCost);
    addQuestion(
      questions,
      'monthly_budget',
      'Orcamento mensal estimado',
      compatible,
      profile.monthlyBudget,
      adopterRequirements.estimatedMonthlyCost,
    );
  }

  const matchedCount = questions.filter((q) => q.compatible).length;
  const totalAnsweredCount = questions.length;
  const scorePercent = totalAnsweredCount === 0 ? 0 : Math.round((matchedCount * 100) / totalAnsweredCount);
  return { scorePercent, matchedCount, totalAnsweredCount, questions };
};

export const mapExtendedToBackendProfile = (userId: string, extended?: ExtendedProfile): BackendAdopterProfile => ({
  id: '',
  userId,
  housingType: extended?.housing?.type,
  ownershipType: extended?.housing?.ownership,
  rentAllowsPets: extended?.housing?.rentAllowsPets,
  hasYard: extended?.housing?.hasYard,
  yardWalled: extended?.housing?.yardWalled,
  hasWindowScreens: extended?.housing?.hasWindowScreens,
  residentsCount: extended?.housing?.numResidents,
  hasChildren: extended?.housing?.hasChildren,
  childrenAges: extended?.housing?.childrenAges,
  hadPetsBefore: extended?.experience?.hadPetsBefore,
  currentlyHasPets: extended?.experience?.currentlyHasPets,
  currentPetsCount: extended?.experience?.currentPetsCount,
  currentPetsTypes: extended?.experience?.currentPetsTypes,
  returnedAnimal: extended?.experience?.returnedAnimal,
  petsVaccinated: extended?.experience?.petsVaccinated,
  petsNeutered: extended?.experience?.petsNeutered,
  awareOfCosts: extended?.financial?.awareOfCosts,
  monthlyBudget: extended?.financial?.monthlyBudget,
  willCoverVaccines: extended?.financial?.willCoverVaccines,
  willCoverNeutering: extended?.financial?.willCoverNeutering,
  willCoverEmergencies: extended?.financial?.willCoverEmergencies,
  reasonToAdopt: extended?.intention?.reasonToAdopt,
  hoursAloneDaily: extended?.intention?.hoursAloneDaily,
  ifDestroyed: extended?.intention?.ifDestroyed,
  ifSick: extended?.intention?.ifSick,
  willAdapt: extended?.intention?.willAdapt,
  environmentPhotoUrl: extended?.proof?.environmentPhotoUrl,
});

const optionalBool = (value?: boolean | null) => (value == null ? undefined : value);

export const mapBackendProfileToExtended = (profile: BackendAdopterProfile): ExtendedProfile => ({
  housing: {
    type: (profile.housingType as 'house' | 'apartment' | 'farm') || 'house',
    ownership: (profile.ownershipType as 'owned' | 'rented') || 'owned',
    rentAllowsPets: optionalBool(profile.rentAllowsPets),
    hasYard: Boolean(profile.hasYard),
    yardWalled: optionalBool(profile.yardWalled),
    hasWindowScreens: optionalBool(profile.hasWindowScreens),
    numResidents: profile.residentsCount ?? 1,
    hasChildren: Boolean(profile.hasChildren),
    childrenAges: profile.childrenAges,
  },
  experience: {
    hadPetsBefore: Boolean(profile.hadPetsBefore),
    currentlyHasPets: Boolean(profile.currentlyHasPets),
    currentPetsCount: profile.currentPetsCount,
    currentPetsTypes: profile.currentPetsTypes,
    returnedAnimal: Boolean(profile.returnedAnimal),
    petsVaccinated: optionalBool(profile.petsVaccinated),
    petsNeutered: optionalBool(profile.petsNeutered),
  },
  financial: {
    awareOfCosts: Boolean(profile.awareOfCosts),
    monthlyBudget: (profile.monthlyBudget as '100-300' | '300-600' | '600+') || '300-600',
    willCoverVaccines: Boolean(profile.willCoverVaccines),
    willCoverNeutering: Boolean(profile.willCoverNeutering),
    willCoverEmergencies: Boolean(profile.willCoverEmergencies),
  },
  intention: {
    reasonToAdopt: profile.reasonToAdopt || '',
    hoursAloneDaily: profile.hoursAloneDaily ?? 4,
    ifDestroyed: profile.ifDestroyed || '',
    ifSick: profile.ifSick || '',
    willAdapt: profile.willAdapt ?? true,
  },
  proof: {
    environmentPhotoUrl: profile.environmentPhotoUrl,
  },
});

export const invalidateCompatibilityProfileCache = (userId?: string) => {
  if (userId) {
    localStorage.removeItem(cacheKey(userId));
    return;
  }
  const keysToRemove: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith('compatibility_profile_cache:')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

const fetchMyAdopterProfileOrNull = async (): Promise<BackendAdopterProfile | null> => {
  try {
    return await apiRequest<BackendAdopterProfile>('/api/users/me/adopter-profile');
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('nao encontrado') || message.includes('404')) {
      return null;
    }
    throw error;
  }
};

export const buildExtendedFromLegacyProfile = (profile?: UserProfile | null): ExtendedProfile | null => {
  if (!profile) return null;
  const hasLegacyData =
    profile.housingType ||
    profile.hasChildren !== undefined ||
    profile.hadPetsBefore !== undefined ||
    profile.workSchedule;
  if (!hasLegacyData) return null;

  return {
    housing: {
      type: (profile.housingType as 'house' | 'apartment' | 'farm') || 'house',
      ownership: 'owned',
      hasYard: false,
      numResidents: 1,
      hasChildren: Boolean(profile.hasChildren),
      childrenAges: profile.childrenAges,
    },
    experience: {
      hadPetsBefore: Boolean(profile.hadPetsBefore),
      currentlyHasPets: false,
      returnedAnimal: false,
    },
    financial: {
      awareOfCosts: true,
      monthlyBudget: '300-600',
      willCoverVaccines: true,
      willCoverNeutering: true,
      willCoverEmergencies: true,
    },
    intention: {
      reasonToAdopt: profile.workSchedule || '',
      hoursAloneDaily: 4,
      ifDestroyed: '',
      ifSick: '',
      willAdapt: true,
    },
  };
};

const hasExtendedAnswers = (extended?: ExtendedProfile | null): boolean => {
  if (!extended) return false;
  return Boolean(
    extended.housing ||
      extended.experience ||
      extended.financial ||
      extended.intention ||
      extended.proof,
  );
};

export const syncAdopterProfileToBackend = async (
  userId: string,
  extended: ExtendedProfile,
): Promise<BackendAdopterProfile> => {
  const payload = mapExtendedToBackendProfile(userId, extended);
  await saveMyAdopterProfile(payload);
  invalidateCompatibilityProfileCache(userId);
  const saved = await fetchMyAdopterProfileOrNull();
  if (saved) {
    saveExtendedProfile(userId, mapBackendProfileToExtended(saved));
    return saved;
  }
  return payload;
};

export const syncPendingAdopterProfileAfterLogin = async (): Promise<void> => {
  const email = localStorage.getItem('userEmail');
  const rawUser = localStorage.getItem('authUser');
  if (!email || !rawUser) return;

  let authUser: { id: string; userType?: string };
  try {
    authUser = JSON.parse(rawUser) as { id: string; userType?: string };
  } catch {
    return;
  }
  if (authUser.userType && authUser.userType !== 'ADOTANTE') {
    return;
  }

  const existing = await fetchMyAdopterProfileOrNull();
  if (existing) {
    saveExtendedProfile(authUser.id, mapBackendProfileToExtended(existing));
    return;
  }

  const pending = consumePendingAdopterProfile(email);
  const local = loadExtendedProfile(authUser.id);
  const source = pending || local;
  if (!hasExtendedAnswers(source)) {
    return;
  }

  await syncAdopterProfileToBackend(authUser.id, source);
};

export const getMyAdopterProfile = async (): Promise<BackendAdopterProfile | null> => {
  const me = await apiRequest<BackendMe>('/api/users/me');
  if (me.userType !== 'ADOTANTE') {
    return null;
  }
  return fetchMyAdopterProfileOrNull();
};

export const saveMyAdopterProfile = async (profile: BackendAdopterProfile): Promise<void> => {
  const payload = {
    housingType: profile.housingType,
    ownershipType: profile.ownershipType,
    rentAllowsPets: profile.rentAllowsPets,
    hasYard: profile.hasYard,
    yardWalled: profile.yardWalled,
    hasWindowScreens: profile.hasWindowScreens,
    residentsCount: profile.residentsCount,
    hasChildren: profile.hasChildren,
    childrenAges: profile.childrenAges,
    hadPetsBefore: profile.hadPetsBefore,
    currentlyHasPets: profile.currentlyHasPets,
    currentPetsCount: profile.currentPetsCount,
    currentPetsTypes: profile.currentPetsTypes,
    returnedAnimal: profile.returnedAnimal,
    petsVaccinated: profile.petsVaccinated,
    petsNeutered: profile.petsNeutered,
    awareOfCosts: profile.awareOfCosts,
    monthlyBudget: profile.monthlyBudget,
    willCoverVaccines: profile.willCoverVaccines,
    willCoverNeutering: profile.willCoverNeutering,
    willCoverEmergencies: profile.willCoverEmergencies,
    reasonToAdopt: profile.reasonToAdopt,
    hoursAloneDaily: profile.hoursAloneDaily,
    ifDestroyed: profile.ifDestroyed,
    ifSick: profile.ifSick,
    willAdapt: profile.willAdapt,
    environmentPhotoUrl: profile.environmentPhotoUrl,
  };
  await apiRequest('/api/users/me/adopter-profile', {
    method: 'PUT',
    body: payload,
  });
};

const cacheProfile = (me: BackendMe, profile: BackendAdopterProfile) => {
  const entry: CompatibilityCacheEntry = {
    version: COMPATIBILITY_CACHE_VERSION,
    cachedAt: Date.now(),
    updatedAt: profile.updatedAt,
    userId: me.id,
    profile,
  };
  localStorage.setItem(cacheKey(me.id), JSON.stringify(entry));
};

export const loadCompatibilityProfileWithCache = async (
  fallbackExtended?: ExtendedProfile,
  legacyProfile?: UserProfile | null,
): Promise<BackendAdopterProfile | null> => {
  let me: BackendMe;
  try {
    me = await apiRequest<BackendMe>('/api/users/me');
  } catch {
    return null;
  }
  if (me.userType !== 'ADOTANTE') {
    return null;
  }

  const key = cacheKey(me.id);
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const cached = JSON.parse(raw) as CompatibilityCacheEntry;
      const notExpired = Date.now() - cached.cachedAt <= COMPATIBILITY_CACHE_TTL_MS;
      if (cached.version === COMPATIBILITY_CACHE_VERSION && notExpired && cached.userId === me.id) {
        return cached.profile;
      }
    } catch {
      // noop
    }
  }

  let profile = await fetchMyAdopterProfileOrNull();
  if (profile) {
    saveExtendedProfile(me.id, mapBackendProfileToExtended(profile));
    cacheProfile(me, profile);
    return profile;
  }

  const localExtended = loadExtendedProfile(me.id);
  const legacyExtended = buildExtendedFromLegacyProfile(legacyProfile);
  const extendedCandidate =
    (hasExtendedAnswers(fallbackExtended) ? fallbackExtended : null) ||
    (hasExtendedAnswers(localExtended) ? localExtended : null) ||
    legacyExtended;

  if (extendedCandidate) {
    try {
      profile = await syncAdopterProfileToBackend(me.id, extendedCandidate);
      cacheProfile(me, profile);
      return profile;
    } catch (error) {
      console.warn('Nao foi possivel sincronizar perfil de adotante:', error);
      const derived = mapExtendedToBackendProfile(me.id, extendedCandidate);
      cacheProfile(me, derived);
      return derived;
    }
  }

  return null;
};

export const computeCompatibilityForPet = async (
  pet: Pet,
  cachedProfile: BackendAdopterProfile | null,
): Promise<CompatibilityScore> => {
  if (!cachedProfile) {
    return { scorePercent: 0, matchedCount: 0, totalAnsweredCount: 0, questions: [] };
  }

  if (pet.adopterProfile) {
    return computeFromProfiles(cachedProfile, pet.adopterProfile);
  }

  try {
    const response = await apiRequest<BackendCompatibilityResponse>(`/api/compatibility/animals/${pet.id}/users/${cachedProfile.userId}`);
    return {
      scorePercent: response.scorePercent,
      matchedCount: response.matchedCount,
      totalAnsweredCount: response.totalAnsweredCount,
      questions: response.questions || [],
    };
  } catch {
    return { scorePercent: 0, matchedCount: 0, totalAnsweredCount: 0, questions: [] };
  }
};
