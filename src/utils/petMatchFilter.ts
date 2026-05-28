import { Pet } from '@/types/pets';
import { UserProfile } from '@/types/user';

export interface FilterResult {
  pets: Pet[];
  warnings: { petId: string; message: string }[];
}

const docileTraits = ['Calmo', 'Carinhoso', 'Sociável', 'Tímido'];

export const filterPetsForUser = (pets: Pet[], profile?: UserProfile | null): FilterResult => {
  const warnings: FilterResult['warnings'] = [];
  const housing = profile?.extended?.housing;
  const experience = profile?.extended?.experience;

  // Compatibilidade nunca bloqueia exibição; apenas orienta.
  if (housing?.ownership === 'rented' && housing.rentAllowsPets === false) {
    warnings.push({
      petId: '__global__',
      message: 'Seu contrato de aluguel indica restrição para animais. A compatibilidade pode ficar baixa.',
    });
  }

  const filtered = [...pets];

  // Apartamento: sinaliza pets grandes, mas não remove da listagem.
  if (housing?.type === 'apartment') {
    filtered.forEach((p) => {
      if (p.size === 'large') {
        warnings.push({
          petId: p.id,
          message: 'Este pet de porte grande pode exigir mais espaco do que um apartamento comum.',
        });
      }
    });
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
