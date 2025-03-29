
import { Animal } from "@/services/animalService";
import { Pet } from "@/components/pet/types";

/**
 * Converte um animal do modelo de banco de dados para o modelo de interface Pet
 */
export const animalToPet = (animal: Animal): Pet => {
  return {
    id: animal.id,
    name: animal.nome,
    images: animal.fotos || [animal.fotoPrincipal].filter(Boolean),
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
    traits: animal.castrado ? ["castrado"] : []
  };
};
