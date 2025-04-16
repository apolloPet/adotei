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
  
  // Add fotoPrincipal if it's valid and not already in the list
  if (animal.fotoPrincipal && !animal.fotoPrincipal.startsWith('blob:') && 
      !processedImageUrls.includes(animal.fotoPrincipal)) {
    processedImageUrls.unshift(animal.fotoPrincipal);
  }
  
  // If no valid images, use fallback image
  const fallbackImageUrl = '/placeholder.svg';
  const imageUrls = processedImageUrls.length > 0 ? processedImageUrls : [fallbackImageUrl];

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
    personality: [],
    specialNeeds: false,
    healthIssues: false,
    shelter: "PetMatch",
    traits: animal.castrado ? ["castrado"] : [],
    medicalInfo: "",
    primaryImage: imageUrls[0] || fallbackImageUrl
  };
};
