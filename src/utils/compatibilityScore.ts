import { Pet } from '@/types/pets';
import { ExtendedProfile, HousingProfile, ExperienceProfile, FinancialProfile } from '@/types/user';

export interface AdopterCandidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  housingType?: string;
  hasChildren?: boolean;
  hadPetsBefore?: boolean;
  hasAllergies?: boolean;
  extended?: ExtendedProfile;
}

export interface CompatibilityResult {
  candidate: AdopterCandidate;
  score: number; // 0-100
  reasons: { positive: string[]; negative: string[]; blockers: string[] };
}

/** Derive matching requirements from a Pet (mock-friendly). */
const deriveAnimalRequirements = (pet: Pet) => {
  const isLarge = pet.size === 'large';
  const isCat = pet.species === 'cat';
  return {
    requiresYard: isLarge,
    blocksApartmentForLarge: isLarge,
    requiresWindowScreens: isCat,
    suitableForFirstTimers: !!pet.traits?.some((t) =>
      ['Calmo', 'Carinhoso', 'Sociável', 'Tímido'].includes(t)
    ),
    requiresEmergencyBudget: true,
    minMonthlyBudget: isLarge ? '300-600' : '100-300',
  };
};

const budgetRank = (b?: string) => (b === '600+' ? 3 : b === '300-600' ? 2 : b === '100-300' ? 1 : 0);

export const scoreCandidate = (pet: Pet, candidate: AdopterCandidate): CompatibilityResult => {
  const req = deriveAnimalRequirements(pet);
  const ext = candidate.extended || {};
  const housing: Partial<HousingProfile> = ext.housing || {
    type: candidate.housingType === 'apartment' ? 'apartment' : 'house',
    ownership: 'owned',
    hasYard: candidate.housingType !== 'apartment',
    numResidents: 1,
    hasChildren: !!candidate.hasChildren,
  };
  const exp: Partial<ExperienceProfile> = ext.experience || {
    hadPetsBefore: !!candidate.hadPetsBefore,
    currentlyHasPets: false,
    returnedAnimal: false,
  };
  const fin: Partial<FinancialProfile> = ext.financial || {
    awareOfCosts: true,
    monthlyBudget: '300-600',
    willCoverVaccines: true,
    willCoverNeutering: true,
    willCoverEmergencies: true,
  };

  const positive: string[] = [];
  const negative: string[] = [];
  const blockers: string[] = [];
  let score = 50;

  // Hard blockers
  if (housing.ownership === 'rented' && housing.rentAllowsPets === false) {
    blockers.push('Aluguel não permite animais');
    score -= 50;
  }
  if (candidate.hasAllergies) {
    negative.push('Possui alergia declarada');
    score -= 15;
  }
  if (exp.returnedAnimal) {
    negative.push('Já devolveu um animal');
    score -= 20;
  }

  // Housing match
  if (req.blocksApartmentForLarge && housing.type === 'apartment') {
    negative.push('Pet de grande porte em apartamento');
    score -= 25;
  } else if (housing.type === 'house' || housing.type === 'farm') {
    positive.push('Moradia compatível com o porte');
    score += 10;
  }
  if (req.requiresYard) {
    if (housing.hasYard) {
      positive.push('Possui quintal' + (housing.yardWalled ? ' murado' : ''));
      score += housing.yardWalled ? 10 : 5;
    } else {
      negative.push('Pet precisa de quintal e adotante não tem');
      score -= 15;
    }
  }
  if (req.requiresWindowScreens) {
    if (housing.hasWindowScreens) {
      positive.push('Janelas teladas (essencial p/ gatos)');
      score += 15;
    } else {
      negative.push('Sem telas em janelas (gato)');
      score -= 20;
    }
  }

  // Experience
  if (exp.hadPetsBefore) {
    positive.push('Já teve pets anteriormente');
    score += 8;
  } else if (req.suitableForFirstTimers) {
    positive.push('Pet dócil — adequado a iniciantes');
    score += 5;
  } else {
    negative.push('Sem experiência prévia');
    score -= 5;
  }
  if (exp.petsVaccinated) score += 3;
  if (exp.petsNeutered) score += 3;

  // Financial
  if (budgetRank(fin.monthlyBudget) >= budgetRank(req.minMonthlyBudget)) {
    positive.push(`Orçamento mensal compatível (${fin.monthlyBudget})`);
    score += 10;
  } else {
    negative.push(`Orçamento abaixo do recomendado (${fin.monthlyBudget})`);
    score -= 10;
  }
  if (fin.willCoverEmergencies) {
    positive.push('Cobre emergências veterinárias');
    score += 8;
  } else {
    negative.push('Não cobre emergências veterinárias');
    score -= 12;
  }
  if (fin.willCoverVaccines) score += 2;
  if (fin.willCoverNeutering) score += 2;

  // Children context
  if (housing.hasChildren && pet.size === 'large') {
    negative.push('Possui crianças com pet de grande porte — atenção');
    score -= 5;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { candidate, score, reasons: { positive, negative, blockers } };
};

export const rankCandidates = (pet: Pet, candidates: AdopterCandidate[]): CompatibilityResult[] =>
  candidates.map((c) => scoreCandidate(pet, c)).sort((a, b) => b.score - a.score);
