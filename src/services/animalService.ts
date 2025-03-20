
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

export interface Animal {
  id: string;
  nome: string;
  idade: number;
  tipo: 'cachorro' | 'gato' | 'outro';
  porte: 'pequeno' | 'medio' | 'grande';
  sexo: 'macho' | 'femea';
  castrado: boolean;
  vacinas: string[];
  responsavel_id?: string;
  data_cadastro: string;
  descricao?: string;
  fotoPrincipal?: string;
  fotos?: string[];
}

export interface AnimalCreateData {
  nome: string;
  idade: number;
  tipo: 'cachorro' | 'gato' | 'outro';
  porte: 'pequeno' | 'medio' | 'grande';
  sexo: 'macho' | 'femea';
  castrado: boolean;
  vacinas?: string[];
  responsavel_id?: string;
  descricao?: string;
  fotoPrincipal?: string;
  fotos?: string[];
}

// Create a new animal
export const createAnimal = async (animalData: AnimalCreateData): Promise<Animal | null> => {
  try {
    // Check for duplicated animal with same name and responsible
    if (animalData.responsavel_id) {
      const { data: existingAnimals, error: checkError } = await supabase
        .from('animals')
        .select('id')
        .eq('nome', animalData.nome)
        .eq('responsavel_id', animalData.responsavel_id);

      if (checkError) {
        console.error('Error checking for duplicate animal:', checkError);
        throw new Error('Erro ao verificar animal duplicado');
      }

      if (existingAnimals && existingAnimals.length > 0) {
        throw new Error('Já existe um animal com esse nome para este responsável');
      }
    }

    // Insert the new animal
    const { data, error } = await supabase
      .from('animals')
      .insert({
        nome: animalData.nome,
        idade: animalData.idade,
        tipo: animalData.tipo,
        porte: animalData.porte,
        sexo: animalData.sexo, 
        castrado: animalData.castrado,
        vacinas: animalData.vacinas || [],
        responsavel_id: animalData.responsavel_id,
        descricao: animalData.descricao,
        fotoPrincipal: animalData.fotoPrincipal,
        fotos: animalData.fotos || []
      })
      .select();

    if (error) {
      console.error('Error creating animal:', error);
      throw new Error(error.message);
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in createAnimal:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao criar animal');
    }
    throw error;
  }
};

// Get all animals with optional filters
export const getAnimals = async (filters?: {
  nome?: string;
  tipo?: string;
  porte?: string;
  responsavel_id?: string;
}): Promise<Animal[]> => {
  try {
    let query = supabase
      .from('animals')
      .select('*');

    // Apply filters if provided
    if (filters) {
      if (filters.nome) {
        query = query.ilike('nome', `%${filters.nome}%`);
      }
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo);
      }
      if (filters.porte) {
        query = query.eq('porte', filters.porte);
      }
      if (filters.responsavel_id) {
        query = query.eq('responsavel_id', filters.responsavel_id);
      }
    }

    const { data, error } = await query.order('data_cadastro', { ascending: false });

    if (error) {
      console.error('Error fetching animals:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAnimals:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao buscar animais');
    }
    throw error;
  }
};

// Get a single animal by ID
export const getAnimalById = async (id: string): Promise<Animal | null> => {
  try {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned error
        return null;
      }
      console.error('Error fetching animal:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error in getAnimalById:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao buscar animal');
    }
    throw error;
  }
};

// Update an animal
export const updateAnimal = async (id: string, animalData: Partial<AnimalCreateData>): Promise<Animal | null> => {
  try {
    const { data, error } = await supabase
      .from('animals')
      .update(animalData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating animal:', error);
      throw new Error(error.message);
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in updateAnimal:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao atualizar animal');
    }
    throw error;
  }
};

// Delete an animal
export const deleteAnimal = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting animal:', error);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAnimal:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao excluir animal');
    }
    throw error;
  }
};
