
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/lib/database.types';
import { AdoptionMatch } from '@/components/admin/adoption/types';
import { AdoptionStage } from '@/components/adoption/AdoptionStages';
import { fetchPetById } from './petService';
import { fetchUserById } from './userService';
import { toast } from '@/hooks/use-sonner';

type DbAdoption = Database['public']['Tables']['adoptions']['Row'];

export const fetchAdoptions = async (): Promise<AdoptionMatch[]> => {
  try {
    const { data: adoptions, error } = await supabase
      .from('adoptions')
      .select('*');
    
    if (error) throw error;
    if (!adoptions) return [];
    
    const adoptionMatches = await Promise.all(
      adoptions.map(async (adoption) => {
        const pet = await fetchPetById(adoption.pet_id);
        const user = await fetchUserById(adoption.user_id);
        
        if (!pet || !user) return null;
        
        return {
          id: adoption.id,
          petId: pet.id,
          petName: pet.name,
          petImage: pet.images[0] || '',
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          userEmail: user.email,
          currentStage: adoption.current_stage as AdoptionStage,
          createdAt: adoption.created_at,
          updatedAt: adoption.updated_at,
          notes: adoption.notes,
          responsibleId: adoption.responsible_id || '',
          responsibleName: '',
          matchPoints: []
        };
      })
    );
    
    return adoptionMatches.filter(Boolean) as AdoptionMatch[];
  } catch (error) {
    console.error('Error fetching adoptions:', error);
    toast.error('Erro ao buscar adoções');
    return [];
  }
};

export const createAdoption = async (
  petId: string, 
  userId: string, 
  stage: AdoptionStage = 'interested',
  notes = ''
): Promise<AdoptionMatch | null> => {
  try {
    const { data: adoption, error } = await supabase
      .from('adoptions')
      .insert({
        pet_id: petId,
        user_id: userId,
        current_stage: stage,
        notes: notes,
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!adoption) throw new Error('Failed to create adoption');
    
    const pet = await fetchPetById(adoption.pet_id);
    const user = await fetchUserById(adoption.user_id);
    
    if (!pet || !user) throw new Error('Failed to fetch pet or user');
    
    return {
      id: adoption.id,
      petId: pet.id,
      petName: pet.name,
      petImage: pet.images[0] || '',
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      userEmail: user.email,
      currentStage: adoption.current_stage as AdoptionStage,
      createdAt: adoption.created_at,
      updatedAt: adoption.updated_at,
      notes: adoption.notes,
      responsibleId: adoption.responsible_id || '',
      responsibleName: '',
      matchPoints: []
    };
  } catch (error) {
    console.error('Error creating adoption:', error);
    toast.error('Erro ao criar adoção');
    return null;
  }
};

export const updateAdoptionStage = async (
  id: string, 
  stage: AdoptionStage,
  notes?: string,
  visitDate?: string,
  inspectionDate?: string,
  contractSigned?: boolean,
  paymentComplete?: boolean
): Promise<boolean> => {
  try {
    const updates: any = {
      current_stage: stage,
      updated_at: new Date().toISOString()
    };
    
    if (notes) updates.notes = notes;
    if (visitDate) updates.scheduled_visit_date = visitDate;
    if (inspectionDate) updates.home_inspection_date = inspectionDate;
    if (contractSigned !== undefined) updates.contract_signed = contractSigned;
    if (paymentComplete !== undefined) updates.adoption_fee_paid = paymentComplete;
    
    const { error } = await supabase
      .from('adoptions')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating adoption stage:', error);
    toast.error('Erro ao atualizar estágio da adoção');
    return false;
  }
};

export const recordPetMatch = async (
  petId: string, 
  userId: string, 
  matchType: 'liked' | 'disliked'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pet_matches')
      .insert({
        pet_id: petId,
        user_id: userId,
        match_type: matchType
      });
    
    if (error) throw error;
    
    if (matchType === 'liked') {
      await createAdoption(petId, userId);
    }
    
    return true;
  } catch (error) {
    console.error('Error recording pet match:', error);
    toast.error('Erro ao registrar match com o pet');
    return false;
  }
};
