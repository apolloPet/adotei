import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-sonner';
import { Pet } from '@/types/pets';
import { getAnimals, Animal } from './animalService';
import { animalToPet } from '@/utils/animalAdapter';
import { PetFilters } from './petService';

/**
 * Adaptador de filtros para buscar animais com os filtros da interface
 */
export const fetchAnimalsForBrowse = async (filters?: PetFilters): Promise<Pet[]> => {
  try {
    // Converter filtros do formato da interface para o formato do serviço de animais
    const animalFilters: any = {};
    
    if (filters) {
      if (filters.species && filters.species !== 'all') {
        animalFilters.tipo = filters.species === 'dog' ? 'cachorro' : 
                           filters.species === 'cat' ? 'gato' : 'outro';
      }
      
      if (filters.gender && filters.gender !== 'all') {
        animalFilters.sexo = filters.gender === 'male' ? 'macho' : 'femea';
      }
      
      if (filters.size && filters.size !== 'all') {
        animalFilters.porte = filters.size === 'small' ? 'pequeno' : 
                            filters.size === 'medium' ? 'medio' : 'grande';
      }
      
      if (filters.searchTerm) {
        animalFilters.nome = filters.searchTerm;
      }
    }
    
    // Buscar os animais usando o serviço existente
    const animals = await getAnimals(animalFilters);
    
    // Log para debug
    console.log('Animals fetched for browse:', animals);
    
    // Converter animais para o formato usado pela interface
    const pets = animals.map(animalToPet);
    
    // Log para debug
    console.log('Converted pets for browse:', pets);
    
    return pets;
  } catch (error) {
    console.error('Error fetching animals for browse:', error);
    toast.error('Erro ao buscar animais para exploração');
    return [];
  }
};
