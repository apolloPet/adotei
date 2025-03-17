
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Pet } from '@/components/pet/types';

// Type for database pets
type DbPet = Database['public']['Tables']['pets']['Row'];
type DbPetImage = Database['public']['Tables']['pet_images']['Row'];

// Convert database pet to frontend pet model
export const dbPetToPet = (
  dbPet: DbPet, 
  images: DbPetImage[]
): Pet => {
  return {
    id: dbPet.id,
    name: dbPet.name,
    species: dbPet.species === 'other' ? 'cat' : dbPet.species, // Default to cat if not dog or other
    breed: dbPet.breed,
    age: `${dbPet.age} ${dbPet.age_unit}`,
    gender: dbPet.gender,
    size: dbPet.size,
    weight: dbPet.weight,
    description: dbPet.description,
    location: dbPet.location,
    shelterTime: dbPet.shelter_time,
    images: images.map(img => img.url).sort((a, b) => {
      // Sort images to ensure primary image is first
      const isPrimaryA = images.find(img => img.url === a)?.is_primary;
      const isPrimaryB = images.find(img => img.url === b)?.is_primary;
      return isPrimaryA ? -1 : isPrimaryB ? 1 : 0;
    }),
    shelter: '', // Will be populated separately if needed
    traits: dbPet.traits || [],
    specialNeeds: dbPet.special_needs,
    healthIssues: dbPet.health_issues,
  };
};

export const fetchPets = async (filters?: any): Promise<Pet[]> => {
  try {
    let query = supabase.from('pets').select('*');
    
    // Apply filters if they exist
    if (filters) {
      if (filters.species && filters.species !== 'all') {
        query = query.eq('species', filters.species);
      }
      
      if (filters.gender && filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
      }
      
      if (filters.size && filters.size !== 'all') {
        query = query.eq('size', filters.size);
      }
      
      if (filters.ageRange && Array.isArray(filters.ageRange) && filters.ageRange.length === 2) {
        query = query
          .gte('age', filters.ageRange[0])
          .lte('age', filters.ageRange[1])
          .eq('age_unit', 'years'); // Assuming age range is in years
      }
    }
    
    const { data: petsData, error: petsError } = await query;
    
    if (petsError) throw petsError;
    if (!petsData) return [];
    
    // For each pet, fetch its images
    const pets = await Promise.all(
      petsData.map(async (pet) => {
        const { data: imagesData, error: imagesError } = await supabase
          .from('pet_images')
          .select('*')
          .eq('pet_id', pet.id);
        
        if (imagesError) throw imagesError;
        
        return dbPetToPet(pet, imagesData || []);
      })
    );
    
    return pets;
  } catch (error) {
    console.error('Error fetching pets:', error);
    return [];
  }
};

export const fetchPetById = async (id: string): Promise<Pet | null> => {
  try {
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (petError) throw petError;
    if (!pet) return null;
    
    const { data: images, error: imagesError } = await supabase
      .from('pet_images')
      .select('*')
      .eq('pet_id', id);
    
    if (imagesError) throw imagesError;
    
    return dbPetToPet(pet, images || []);
  } catch (error) {
    console.error('Error fetching pet by ID:', error);
    return null;
  }
};

export const createPet = async (pet: Omit<Pet, 'id'>, images: File[]): Promise<Pet | null> => {
  try {
    // Convert frontend pet to database pet
    const dbPet = {
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: parseInt(pet.age.split(' ')[0]),
      age_unit: pet.age.includes('ano') ? 'years' : 
                pet.age.includes('mês') || pet.age.includes('mese') ? 'months' : 'days',
      gender: pet.gender,
      size: pet.size,
      weight: pet.weight,
      description: pet.description,
      location: pet.location,
      shelter_id: '', // This would need to be set based on the logged-in shelter
      shelter_time: pet.shelterTime,
      traits: pet.traits,
      special_needs: pet.specialNeeds || false,
      health_issues: pet.healthIssues || false,
    };
    
    // Insert pet into database
    const { data: newPet, error: petError } = await supabase
      .from('pets')
      .insert(dbPet)
      .select()
      .single();
    
    if (petError) throw petError;
    if (!newPet) throw new Error('Failed to create pet');
    
    // Upload images to storage
    const uploadedImages = await Promise.all(
      images.map(async (file, index) => {
        const filePath = `pets/${newPet.id}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pet-images')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('pet-images')
          .getPublicUrl(filePath);
        
        // Insert image record
        const { data: imageData, error: imageError } = await supabase
          .from('pet_images')
          .insert({
            pet_id: newPet.id,
            url: urlData.publicUrl,
            is_primary: index === 0, // First image is primary
          })
          .select()
          .single();
        
        if (imageError) throw imageError;
        
        return imageData;
      })
    );
    
    return dbPetToPet(newPet, uploadedImages);
  } catch (error) {
    console.error('Error creating pet:', error);
    return null;
  }
};

export const updatePet = async (id: string, updates: Partial<Pet>, newImages?: File[]): Promise<Pet | null> => {
  try {
    // Convert frontend updates to database updates
    const dbUpdates: any = {};
    
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.species) dbUpdates.species = updates.species;
    if (updates.breed) dbUpdates.breed = updates.breed;
    if (updates.age) {
      const ageParts = updates.age.split(' ');
      dbUpdates.age = parseInt(ageParts[0]);
      dbUpdates.age_unit = ageParts[1].includes('ano') ? 'years' : 
                          ageParts[1].includes('mês') || ageParts[1].includes('mese') ? 'months' : 'days';
    }
    if (updates.gender) dbUpdates.gender = updates.gender;
    if (updates.size) dbUpdates.size = updates.size;
    if (updates.weight) dbUpdates.weight = updates.weight;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.shelterTime) dbUpdates.shelter_time = updates.shelterTime;
    if (updates.traits) dbUpdates.traits = updates.traits;
    if (updates.specialNeeds !== undefined) dbUpdates.special_needs = updates.specialNeeds;
    if (updates.healthIssues !== undefined) dbUpdates.health_issues = updates.healthIssues;
    
    // Update pet in database
    const { data: updatedPet, error: updateError } = await supabase
      .from('pets')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    if (!updatedPet) throw new Error('Failed to update pet');
    
    // Handle new images if provided
    let images = [];
    if (newImages && newImages.length > 0) {
      const uploadedImages = await Promise.all(
        newImages.map(async (file, index) => {
          const filePath = `pets/${id}/${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('pet-images')
            .upload(filePath, file);
          
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('pet-images')
            .getPublicUrl(filePath);
          
          // Insert image record
          const { data: imageData, error: imageError } = await supabase
            .from('pet_images')
            .insert({
              pet_id: id,
              url: urlData.publicUrl,
              is_primary: false, // New images are not primary by default
            })
            .select()
            .single();
          
          if (imageError) throw imageError;
          
          return imageData;
        })
      );
      
      images = uploadedImages;
    }
    
    // Fetch existing images
    const { data: existingImages, error: imagesError } = await supabase
      .from('pet_images')
      .select('*')
      .eq('pet_id', id);
    
    if (imagesError) throw imagesError;
    
    return dbPetToPet(updatedPet, [...(existingImages || []), ...images]);
  } catch (error) {
    console.error('Error updating pet:', error);
    return null;
  }
};

export const deletePet = async (id: string): Promise<boolean> => {
  try {
    // First delete all images for this pet
    const { error: deleteImagesError } = await supabase
      .from('pet_images')
      .delete()
      .eq('pet_id', id);
    
    if (deleteImagesError) throw deleteImagesError;
    
    // Delete pet from database
    const { error: deletePetError } = await supabase
      .from('pets')
      .delete()
      .eq('id', id);
    
    if (deletePetError) throw deletePetError;
    
    return true;
  } catch (error) {
    console.error('Error deleting pet:', error);
    return false;
  }
};
