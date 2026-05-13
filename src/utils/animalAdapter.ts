import { Animal } from "@/services/animalService";
import { Pet } from "@/types/pets";

/**
 * Converte um animal do modelo de banco de dados para o modelo de interface Pet
 */
export const animalToPet = (animal: Animal): Pet => {
  // Process images, filtering out blob URLs and providing fallbacks
  const processedImageUrls = (animal.fotos || []).filter(url =>
    url && !url.startsWith('blob:')
  );

  if (animal.fotoPrincipal && !animal.fotoPrincipal.startsWith('blob:') &&
      !processedImageUrls.includes(animal.fotoPrincipal)) {
    processedImageUrls.unshift(animal.fotoPrincipal);
  }

  const fallbackImageUrl = '/placeholder.svg';
  const imageUrls = processedImageUrls.length > 0 ? processedImageUrls : [fallbackImageUrl];

  // Vaccinated when status is "complete" or "partial" (legacy: any non-empty entry counts)
  const vaccinationEntries = animal.vacinas || [];
  const vaccinated = vaccinationEntries.some(
    (v) => v === 'complete' || v === 'partial' || (v && v !== 'none' && v !== 'unknown')
  );

  // Days waiting from data_cadastro
  let daysWaiting: number | undefined;
  if (animal.data_cadastro) {
    const created = new Date(animal.data_cadastro).getTime();
    if (!Number.isNaN(created)) {
      daysWaiting = Math.max(0, Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24)));
    }
  }

  // Optional rich fields persisted alongside the core animal record
  const extra = (animal as Animal & {
    caracteristicas?: string[];
    necessidades_especiais?: boolean;
    condicoes_saude?: string;
  });

  const traits = Array.isArray(extra.caracteristicas) && extra.caracteristicas.length > 0
    ? extra.caracteristicas
    : (animal.castrado ? ["Castrado"] : []);

  return {
    id: animal.id,
    name: animal.nome,
    images: imageUrls,
    age: animal.idade.toString(),
    gender: animal.sexo === 'macho' ? 'male' : 'female',
    size: animal.porte === 'pequeno' ? 'small' :
          animal.porte === 'medio' ? 'medium' : 'large',
    breed: "Sem raça definida",
    species: animal.tipo === 'cachorro' ? 'dog' :
             animal.tipo === 'gato' ? 'cat' : 'other',
    description: animal.descricao || '',
    location: "Próximo a você",
    shelterTime: "recente",
    weight: 0,
    traits,
    specialNeeds: !!extra.necessidades_especiais,
    healthIssues: !!(extra.condicoes_saude && extra.condicoes_saude.trim().length > 0),
    vaccinated,
    neutered: !!animal.castrado,
    daysWaiting,
    shelter: "PetMatch",
    medicalInfo: extra.condicoes_saude || "",
    primaryImage: imageUrls[0] || fallbackImageUrl,
  };
};
