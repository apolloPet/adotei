
import { Animal } from "@/services/animalService";
import { Pet } from "@/components/pet/types";

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
    images: imageUrls, // Now properly returns string[] as expected by Pet
    age: animal.idade.toString(),
    gender: animal.sexo === 'macho' ? 'male' : 'female',
    size: animal.porte === 'pequeno' ? 'small' : 
          animal.porte === 'medio' ? 'medium' : 'large',
    breed: "Sem raça definida", // Podemos adicionar raça no futuro
    species: animal.tipo === 'cachorro' ? 'dog' : 
             animal.tipo === 'gato' ? 'cat' : 'other',
    description: animal.descricao || '',
    location: "Próximo a você", // Podemos adicionar localização real no futuro
    shelterTime: "recente",
    weight: 0, // Não temos este dado ainda
    personality: [],
    specialNeeds: false,
    healthIssues: false,
    shelter: "PetMatch",
    traits: animal.castrado ? ["castrado"] : [],
    medicalInfo: "", // Adding the required medicalInfo property
    primaryImage: imageUrls[0] || fallbackImageUrl
  };
};
