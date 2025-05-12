
import { supabase } from "@/lib/supabase";
import { AdoptionDetails } from "./types";
import { getAdoptionFee } from "./settingsService";
import { toast } from "@/hooks/use-toast";

// Function to get adoption by ID using direct Supabase query
export const getAdoptionById = async (id: string): Promise<AdoptionDetails | null> => {
  try {
    // First try to get from edge function for better performance and validation
    const response = await fetch(`https://jwbcrddblmiurmeziszp.supabase.co/functions/v1/get-adoption?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token || '')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from get-adoption function:', errorData);
      
      // Fallback to direct query if edge function fails
      return getAdoptionByIdFallback(id);
    }

    const data: AdoptionDetails = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getAdoptionById:', error);
    
    // Fallback to direct query if edge function call fails
    return getAdoptionByIdFallback(id);
  }
};

// Fallback method using direct Supabase query
const getAdoptionByIdFallback = async (id: string): Promise<AdoptionDetails | null> => {
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
      toast.error('Error fetching adoption details');
      return null;
    }
    
    if (data) {
      // Check if we use pet_id or animal_id
      // First check if pets and animals are valid objects before accessing their properties
      const hasAnimals = data.animals !== null && typeof data.animals === 'object';
      const petName = data.pets?.name || 
        (hasAnimals && 'nome' in data.animals! ? 
          data.animals!.nome as string : "Pet");
      
      // Initialize petImage as empty string to guarantee string type
      let petImage: string = '';
      
      // Try to fetch pet image if we have a pet_id
      if (data.pets?.id) {
        const { data: imageData } = await supabase
          .from('pet_images')
          .select('url')
          .eq('pet_id', data.pets.id)
          .eq('is_primary', true)
          .maybeSingle<{ url: string }>();
        
        if (imageData !== null && typeof imageData === 'object' && 'url' in imageData) {
          petImage = imageData.url;
        }
      }
      
      return {
        id: data.id,
        petName,
        petImage,
        status: data.current_stage,
        fee: await getAdoptionFee(),
        userName: data.users?.name as string || "Adotante"
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in getAdoptionByIdFallback:', error);
    toast.error('Error fetching adoption details');
    return null;
  }
};

// Example usage for frontend component
/*
import { useEffect, useState } from 'react';
import { getAdoptionById } from '@/services/payment/adoptionService';
import { AdoptionDetails } from '@/services/payment/types';

const AdoptionDetails = ({ id }: { id: string }) => {
  const [adoption, setAdoption] = useState<AdoptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAdoption = async () => {
      try {
        setIsLoading(true);
        const data = await getAdoptionById(id);
        setAdoption(data);
      } catch (err) {
        setError('Failed to fetch adoption details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdoption();
  }, [id]);
  
  if (isLoading) return <div>Loading adoption details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!adoption) return <div>No adoption found with ID: {id}</div>;
  
  return (
    <div>
      <h2>Adoption Details</h2>
      <p>Pet: {adoption.petName}</p>
      {adoption.petImage && <img src={adoption.petImage} alt={adoption.petName} />}
      <p>Status: {adoption.status}</p>
      <p>Fee: ${adoption.fee}</p>
      <p>Adopter: {adoption.userName}</p>
    </div>
  );
};
*/
