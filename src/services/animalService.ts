
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { Json } from '@/lib/database.types';

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

// Helper function to convert database type to interface type
const dbAnimalToAnimal = (dbAnimal: any): Animal => {
  console.log('Converting DB animal to interface:', dbAnimal);
  return {
    id: dbAnimal.id,
    nome: dbAnimal.nome,
    idade: dbAnimal.idade,
    tipo: dbAnimal.tipo as 'cachorro' | 'gato' | 'outro',
    porte: dbAnimal.porte as 'pequeno' | 'medio' | 'grande',
    sexo: dbAnimal.sexo as 'macho' | 'femea',
    castrado: dbAnimal.castrado,
    vacinas: Array.isArray(dbAnimal.vacinas) ? dbAnimal.vacinas : 
             (dbAnimal.vacinas as Json) ? (dbAnimal.vacinas as any) : [],
    responsavel_id: dbAnimal.responsavel_id,
    data_cadastro: dbAnimal.data_cadastro,
    descricao: dbAnimal.descricao,
    fotoPrincipal: dbAnimal.fotoprincipal,
    fotos: Array.isArray(dbAnimal.fotos) ? dbAnimal.fotos : 
           (dbAnimal.fotos as Json) ? (dbAnimal.fotos as any) : []
  };
};

// Create a new animal
export const createAnimal = async (animalData: AnimalCreateData): Promise<Animal | null> => {
  try {
    console.log('Creating animal with data:', animalData);
    
    // Get the current session to check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    // IMPORTANT: Set the responsavel_id to the current user if not provided
    // This is critical for RLS policies
    if (!animalData.responsavel_id) {
      const userId = session?.user?.id;
      
      if (userId) {
        animalData.responsavel_id = userId;
        console.log(`Setting responsavel_id to current authenticated user: ${userId}`);
      } else if (localStorage.getItem("isAdmin") === "true") {
        // For demo admin mode, use a hardcoded ID or null (depending on your RLS policy)
        animalData.responsavel_id = "00000000-0000-0000-0000-000000000000";
        console.log(`Setting responsavel_id to demo admin: ${animalData.responsavel_id}`);
      } else {
        console.error('No user ID available for animal creation');
        throw new Error('Você precisa estar autenticado para cadastrar um animal');
      }
    }
    
    // Prepare animal data for insertion, ensuring arrays are properly handled
    const animalForInsertion = {
      nome: animalData.nome,
      idade: animalData.idade,
      tipo: animalData.tipo,
      porte: animalData.porte,
      sexo: animalData.sexo, 
      castrado: animalData.castrado,
      vacinas: animalData.vacinas || [],
      responsavel_id: animalData.responsavel_id,
      descricao: animalData.descricao,
      fotoprincipal: animalData.fotoPrincipal,
      fotos: animalData.fotos || []
    };
    
    console.log('Preparing to insert animal with data:', animalForInsertion);

    // Check if we're using admin demo mode and need to use edge function
    if (localStorage.getItem("isAdmin") === "true" && !session?.user) {
      // For demo admin, use the edge function that has bypass_rls capability
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/animals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify(animalForInsertion)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from edge function:', errorData);
        throw new Error(errorData.error || 'Falha ao criar animal via edge function');
      }
      
      const data = await response.json();
      console.log('Animal created successfully via edge function. Raw data:', data);
      return data ? dbAnimalToAnimal(data) : null;
    } else {
      // For authenticated users, use the regular Supabase client
      const { data, error } = await supabase
        .from('animals')
        .insert(animalForInsertion)
        .select()
        .single();

      if (error) {
        console.error('Error creating animal:', error);
        throw new Error(error.message);
      }

      if (!data) {
        console.error('No data returned after inserting animal');
        throw new Error('Falha ao criar animal: Nenhum dado retornado');
      }

      console.log('Animal created successfully. Raw data:', data);
      return data ? dbAnimalToAnimal(data) : null;
    }
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
    console.log('Getting animals with filters:', filters);
    
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

    console.log('Animals fetched successfully. Raw data:', data);
    
    if (!data || data.length === 0) {
      console.log('No animals found with the given filters');
      return [];
    }
    
    const mappedAnimals = data.map(dbAnimalToAnimal);
    console.log('Mapped animals:', mappedAnimals);
    
    return mappedAnimals;
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

    return data ? dbAnimalToAnimal(data) : null;
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

    return data?.[0] ? dbAnimalToAnimal(data[0]) : null;
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

// Save cost simulation for an animal
export const saveCostSimulation = async (animalId: string, simulationData: any): Promise<boolean> => {
  try {
    // Make sure the animal exists
    const animal = await getAnimalById(animalId);
    if (!animal) {
      throw new Error('Animal não encontrado');
    }

    const { error } = await supabase
      .from('cost_simulations')
      .insert({
        animal_id: animalId,
        animal_type: animal.tipo,
        animal_size: animal.porte,
        age_months: animal.idade * 12, // Convert years to months for consistency
        estimated_monthly_cost: simulationData.monthlyTotal,
        estimated_yearly_cost: simulationData.yearlyTotal,
        estimated_lifetime_cost: simulationData.lifetimeTotal,
        food_type: simulationData.foodType || 'basic',
        health_conditions: simulationData.healthConditions || [],
        special_care_needs: simulationData.specialCareNeeds || [],
        results_json: simulationData
      });

    if (error) {
      console.error('Error saving cost simulation:', error);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error in saveCostSimulation:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('Erro ao salvar simulação de custos');
    }
    throw error;
  }
};
