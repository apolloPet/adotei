import { supabase } from '@/integrations/supabase/client';
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
  console.log('Convertendo animal do banco para interface:', dbAnimal);
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
    console.log('Iniciando cadastro de animal com dados:', animalData);
    
    // Validar dados críticos antes de prosseguir
    if (!animalData.nome || animalData.nome.trim() === '') {
      toast.error('O nome do animal é obrigatório', {
        description: 'Por favor, informe um nome válido para o animal.'
      });
      throw new Error('O nome do animal é obrigatório');
    }
    
    if (animalData.idade === undefined || isNaN(animalData.idade) || animalData.idade < 0) {
      toast.error('Idade inválida', {
        description: 'A idade do animal deve ser um número positivo.'
      });
      throw new Error('A idade do animal deve ser um número positivo');
    }
    
    if (!animalData.tipo) {
      toast.error('Tipo de animal não especificado', {
        description: 'Por favor, selecione se é um cachorro, gato ou outro animal.'
      });
      throw new Error('Tipo de animal não especificado');
    }
    
    if (!animalData.porte) {
      toast.error('Porte do animal não especificado', {
        description: 'Por favor, selecione o porte do animal (pequeno, médio ou grande).'
      });
      throw new Error('Porte do animal não especificado');
    }
    
    if (!animalData.sexo) {
      toast.error('Sexo do animal não especificado', {
        description: 'Por favor, selecione o sexo do animal (macho ou fêmea).'
      });
      throw new Error('Sexo do animal não especificado');
    }
    
    if (!animalData.descricao || animalData.descricao.trim() === '') {
      toast.error('Descrição do animal é obrigatória', {
        description: 'Por favor, forneça uma breve descrição sobre o animal.'
      });
      throw new Error('Descrição do animal é obrigatória');
    }
    
    // Get the current session to check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    // IMPORTANT: Set the responsavel_id to the current user if not provided
    // This is critical for RLS policies
    if (!animalData.responsavel_id) {
      const userId = session?.user?.id;
      
      if (userId) {
        animalData.responsavel_id = userId;
        console.log(`Definindo responsável para usuário autenticado: ${userId}`);
      } else if (localStorage.getItem("isAdmin") === "true") {
        // For demo admin mode, use a hardcoded ID or null (depending on your RLS policy)
        animalData.responsavel_id = "00000000-0000-0000-0000-000000000000";
        console.log(`Definindo responsável para modo admin: ${animalData.responsavel_id}`);
      } else {
        console.error('Nenhum ID de usuário disponível para cadastro');
        toast.error('Autenticação necessária', {
          description: 'Você precisa estar autenticado para cadastrar um animal.'
        });
        throw new Error('Você precisa estar autenticado para cadastrar um animal');
      }
    }
    
    // Prepare animal data for insertion, ensuring arrays are properly handled
    const animalForInsertion = {
      nome: animalData.nome.trim(),
      idade: animalData.idade,
      tipo: animalData.tipo,
      porte: animalData.porte,
      sexo: animalData.sexo, 
      castrado: animalData.castrado,
      vacinas: animalData.vacinas || [],
      responsavel_id: animalData.responsavel_id,
      descricao: animalData.descricao.trim(),
      fotoprincipal: animalData.fotoPrincipal,
      fotos: animalData.fotos || []
    };
    
    console.log('Dados preparados para inserção:', animalForInsertion);

    // Check if we're using admin demo mode and need to use edge function
    if (localStorage.getItem("isAdmin") === "true" && !session?.user) {
      try {
        console.log('Chamando Edge Function usando Supabase client.');
        
        toast.loading('Cadastrando animal...', {id: 'animal-creation'});
        
        // Use the edge function directly via Supabase client
        const { data, error } = await supabase.functions.invoke('animals', {
          body: animalForInsertion
        });
        
        if (error) {
          console.error('Erro na Edge Function:', error);
          toast.error('Erro ao cadastrar animal', {
            id: 'animal-creation',
            description: error.message || 'Falha no processamento'
          });
          throw new Error(`Erro na Edge Function: ${error.message}`);
        }
        
        console.log('Animal cadastrado com sucesso via Edge Function! Dados:', data);
        toast.success('Animal cadastrado com sucesso!', {
          id: 'animal-creation',
          description: `${animalForInsertion.nome} foi adicionado ao sistema.`
        });
        return data ? dbAnimalToAnimal(data) : null;
      } catch (error) {
        console.error('Erro na chamada à Edge Function:', error);
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch')) {
            toast.error('Erro de conexão', {
              id: 'animal-creation',
              description: 'Não foi possível conectar à Edge Function. Verifique sua conexão com a internet e as configurações do Supabase.'
            });
          } else {
            toast.error('Erro ao cadastrar animal', {
              id: 'animal-creation',
              description: error.message
            });
          }
        } else {
          toast.error('Erro ao cadastrar animal', {
            id: 'animal-creation',
            description: 'Erro desconhecido ao cadastrar animal via Edge Function'
          });
        }
        throw error;
      }
    } else {
      // For authenticated users, use the regular Supabase client
      toast.loading('Cadastrando animal...', {id: 'animal-creation'});
      
      const { data, error } = await supabase
        .from('animals')
        .insert(animalForInsertion)
        .select()
        .single();

      if (error) {
        console.error('Erro ao cadastrar animal:', error);
        if (error.code === '42501') {
          toast.error('Permissão negada', {
            id: 'animal-creation',
            description: 'Verifique se você tem acesso para cadastrar animais.'
          });
          throw new Error('Permissão negada. Verifique se você tem acesso para cadastrar animais.');
        } else if (error.code === '23505') {
          toast.error('Animal já cadastrado', {
            id: 'animal-creation',
            description: 'Este animal já existe no sistema.'
          });
          throw new Error('Este animal já existe no sistema.');
        } else {
          toast.error('Erro ao cadastrar animal', {
            id: 'animal-creation',
            description: error.message
          });
          throw new Error(`Erro ao cadastrar animal: ${error.message}`);
        }
      }

      if (!data) {
        console.error('Nenhum dado retornado após inserção');
        toast.error('Falha ao criar animal', {
          id: 'animal-creation',
          description: 'Nenhum dado retornado do servidor'
        });
        throw new Error('Falha ao criar animal: Nenhum dado retornado do servidor');
      }

      console.log('Animal cadastrado com sucesso! Dados:', data);
      toast.success('Animal cadastrado com sucesso!', {
        id: 'animal-creation',
        description: `${animalForInsertion.nome} foi adicionado ao sistema.`
      });
      return data ? dbAnimalToAnimal(data) : null;
    }
  } catch (error) {
    console.error('Erro em createAnimal:', error);
    if (error instanceof Error) {
      toast.error('Erro ao cadastrar animal', {
        id: 'animal-creation',
        description: error.message
      });
    } else {
      toast.error('Erro ao cadastrar animal', {
        id: 'animal-creation',
        description: 'Erro desconhecido ao cadastrar animal'
      });
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
