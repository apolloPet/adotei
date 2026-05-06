import { Pet } from '@/types/pets';
import { UserProfile } from '@/types/user';

export interface FilterResult {
  pets: Pet[];
  blocked?: { reason: string };
  warnings: { petId: string; message: string }[];
}

const docileTraits = ['Calmo', 'Carinhoso', 'Sociável', 'Tímido'];

export const filterPetsForUser = (pets: Pet[], profile?: UserProfile | null): FilterResult => {
  const warnings: FilterResult['warnings'] = [];
  const housing = profile?.extended?.housing;
  const experience = profile?.extended?.experience;

  // Bloqueio: aluguel não permite pets
  if (housing?.ownership === 'rented' && housing.rentAllowsPets === false) {
    return {
      pets: [],
      blocked: {
        reason:
          'Seu contrato de aluguel não permite animais. Resolva essa questão antes de adotar.',
      },
      warnings,
    };
  }

  let filtered = [...pets];

  // Apartamento → sem pets grandes
  if (housing?.type === 'apartment') {
    filtered = filtered.filter((p) => p.size !== 'large');
  }

  // Gato sem tela → adicionar warning, não filtrar
  if (housing && housing.hasWindowScreens === false) {
    filtered.forEach((p) => {
      if (p.species === 'cat') {
        warnings.push({
          petId: p.id,
          message: 'Este gato exige telas em janelas — requisito mínimo para adoção.',
        });
      }
    });
  }

  // Iniciante → priorizar dóceis
  if (experience && experience.hadPetsBefore === false) {
    filtered.sort((a, b) => {
      const aScore = a.traits?.filter((t) => docileTraits.includes(t)).length ?? 0;
      const bScore = b.traits?.filter((t) => docileTraits.includes(t)).length ?? 0;
      return bScore - aScore;
    });
  }

  return { pets: filtered, warnings };
};
