
import { supabase } from "@/lib/supabase";
import { AdoptionDetails } from "./types";
import { getAdoptionFee } from "./settingsService";

// Function to get adoption by ID
export const getAdoptionById = async (id: string): Promise<AdoptionDetails | null> => {
  try {
    // Try to get from API
    const { data, error } = await supabase
      .from('adoptions')
      .select(`
        id,
        current_stage,
        adoption_fee_paid,
        pets:pet_id (
          id,
          name
        ),
        users:user_id (name),
        animals:animal_id (
          id,
          nome
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching adoption:', error);
      return null;
    }
    
    if (data) {
      // Check if we use pet_id or animal_id
      // First check if pets and animals are valid objects before accessing their properties
      const hasAnimals = data.animals !== null && typeof data.animals === 'object';
      const petName = data.pets?.name || 
        (hasAnimals && 'nome' in data.animals! ? 
          data.animals!.nome : "Pet");
      
      // Initialize petImage as empty string
      let petImage = '';
      
      // Try to fetch pet image if we have a pet_id
      if (data.pets?.id) {
        const { data: imageData } = await supabase
          .from('pet_images')
          .select('url')
          .eq('pet_id', data.pets.id)
          .eq('is_primary', true)
          .maybeSingle();
        
        // Type guard to ensure imageData exists and url is a string
        if (imageData && typeof imageData === 'object' && 
            'url' in imageData && typeof imageData.url === 'string') {
          petImage = imageData.url;
        }
      }
      
      return {
        id: data.id,
        petName,
        petImage,
        status: data.current_stage,
        fee: await getAdoptionFee(),
        userName: data.users?.name || "Adotante"
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in getAdoptionById:', error);
    return null;
  }
};
