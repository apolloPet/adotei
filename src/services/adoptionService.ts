
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/lib/database.types';
import { AdoptionMatch } from '@/components/admin/adoption/types';
import { AdoptionStage } from '@/components/adoption/AdoptionStages';
import { fetchPetById } from './petService';
import { fetchUserById } from './userService';
import { toast } from '@/hooks/use-sonner';

type DbAdoption = Database['public']['Tables']['adoptions']['Row'];

// Fetch all adoptions
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
        
        // Get match data if available
        const { data: matchData } = await supabase
          .from('pet_matches')
          .select('*')
          .eq('pet_id', adoption.pet_id)
          .eq('user_id', adoption.user_id)
          .eq('match_type', 'liked')
          .single();
        
        // Get the pet image from the pet object
        let petImage = '';
        if (pet.images && pet.images.length > 0) {
          // Check if images is an array of objects or an array of strings
          if (typeof pet.images[0] === 'string') {
            petImage = pet.images[0];
          } else if (typeof pet.images[0] === 'object' && pet.images[0] !== null) {
            petImage = pet.images[0].url || '';
          }
        }
        
        return {
          id: adoption.id,
          petId: pet.id,
          petName: pet.name,
          petImage: petImage,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          userEmail: user.email,
          currentStage: adoption.current_stage as AdoptionStage,
          createdAt: adoption.created_at,
          updatedAt: adoption.updated_at,
          notes: adoption.notes || '',
          responsibleId: adoption.responsible_id || '',
          responsibleName: '',
          matchPoints: [],
          followUpStatus: adoption.follow_up_status || 'pending',
          lastFollowUpDate: adoption.last_follow_up_date || null,
          nextFollowUpDate: adoption.next_follow_up_date || null,
          approvedBy: adoption.approved_by || null,
          rejectionReason: adoption.rejection_reason || '',
          matchDate: matchData?.created_at || adoption.created_at,
          animal_id: adoption.animal_id || null
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

// Create a new adoption
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
    
    // Get the pet image from the pet object
    let petImage = '';
    if (pet.images && pet.images.length > 0) {
      // Check if images is an array of objects or an array of strings
      if (typeof pet.images[0] === 'string') {
        petImage = pet.images[0];
      } else if (typeof pet.images[0] === 'object' && pet.images[0] !== null) {
        petImage = pet.images[0].url || '';
      }
    }
    
    return {
      id: adoption.id,
      petId: pet.id,
      petName: pet.name,
      petImage: petImage,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      userEmail: user.email,
      currentStage: adoption.current_stage as AdoptionStage,
      createdAt: adoption.created_at,
      updatedAt: adoption.updated_at,
      notes: adoption.notes || '',
      responsibleId: adoption.responsible_id || '',
      responsibleName: '',
      matchPoints: [],
      followUpStatus: adoption.follow_up_status || 'pending',
      lastFollowUpDate: adoption.last_follow_up_date || null,
      nextFollowUpDate: adoption.next_follow_up_date || null,
      approvedBy: adoption.approved_by || null,
      rejectionReason: adoption.rejection_reason || ''
    };
  } catch (error) {
    console.error('Error creating adoption:', error);
    toast.error('Erro ao criar adoção');
    return null;
  }
};

// Update the stage of an adoption
export const updateAdoptionStage = async (
  id: string, 
  stage: AdoptionStage,
  notes?: string,
  rejectionReason?: string
): Promise<boolean> => {
  try {
    const updates: any = {
      current_stage: stage,
      updated_at: new Date().toISOString()
    };
    
    if (notes) updates.notes = notes;
    
    // Handle rejection
    if (stage === 'rejected' && rejectionReason) {
      updates.rejection_reason = rejectionReason;
    }
    
    // Handle scheduling visit
    if (stage === 'visit_scheduled') {
      // In a real app, we would set the actual date here
      updates.scheduled_visit_date = new Date().toISOString().split('T')[0];
    }
    
    // Handle home inspection
    if (stage === 'home_inspection') {
      updates.home_inspection_date = new Date().toISOString().split('T')[0];
    }
    
    // Handle completion - set up follow-up dates
    if (stage === 'completed') {
      const nextFollowUpDate = new Date();
      nextFollowUpDate.setDate(nextFollowUpDate.getDate() + 14); // First follow-up after 14 days
      
      updates.next_follow_up_date = nextFollowUpDate.toISOString().split('T')[0];
      updates.follow_up_status = 'pending';
    }
    
    // Update the adoption record
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

// Record a match between a pet and a user
export const recordPetMatch = async (
  petId: string, 
  userId: string, 
  matchType: 'liked' | 'disliked'
): Promise<boolean> => {
  try {
    // Verify userID is valid
    let userIdToUse = userId;
    
    if (!userId || userId === 'mock-user-id') {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para realizar esta ação');
        return false;
      }
      userIdToUse = user.id;
    }
    
    console.log('Recording pet match with:', { petId, userId: userIdToUse, matchType });
    
    try {
      // Call the edge function to record the match
      const edgeFunctionUrl = `https://jwbcrddblmiurmeziszp.supabase.co/functions/v1/record-adoption`;
      
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No access token available');
      }
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          petId: petId,
          userId: userIdToUse,
          matchType: matchType
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from edge function:', response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          console.error('Parsed error from edge function:', errorData);
          throw new Error(`Edge function error: ${errorData.error || 'Unknown error'}: ${errorData.details || ''}`);
        } catch (jsonError) {
          throw new Error(`Edge function error: ${response.status} - ${errorText || 'No error details'}`);
        }
      }
      
      const result = await response.json();
      console.log('Edge function result:', result);
      
      // Show success message if it's a positive match
      if (matchType === 'liked') {
        if (result.message === "Adoção já existe") {
          toast.info('Você já demonstrou interesse neste pet!', {
            description: 'Acompanhe o processo na área de adoções.',
            duration: 5000
          });
        } else {
          toast.success('Você demonstrou interesse neste pet!', {
            description: 'A ONG será notificada do seu interesse.',
            duration: 5000
          });
        }
      }
      
      return true;
    } catch (edgeFunctionError) {
      console.error('Error calling edge function:', edgeFunctionError);
      throw edgeFunctionError;
    }
  } catch (error) {
    console.error('Error recording pet match:', error);
    toast.error('Erro ao registrar match com o pet');
    throw error;
  }
};

// Get adoptions by stage
export const getAdoptionsByStage = async (stage: AdoptionStage): Promise<AdoptionMatch[]> => {
  try {
    const { data: adoptions, error } = await supabase
      .from('adoptions')
      .select('*')
      .eq('current_stage', stage);
    
    if (error) throw error;
    if (!adoptions) return [];
    
    const adoptionMatches = await Promise.all(
      adoptions.map(async (adoption) => {
        const pet = await fetchPetById(adoption.pet_id);
        const user = await fetchUserById(adoption.user_id);
        
        if (!pet || !user) return null;
        
        // Get the pet image from the pet object
        let petImage = '';
        if (pet.images && pet.images.length > 0) {
          // Check if images is an array of objects or an array of strings
          if (typeof pet.images[0] === 'string') {
            petImage = pet.images[0];
          } else if (typeof pet.images[0] === 'object' && pet.images[0] !== null) {
            petImage = pet.images[0].url || '';
          }
        }
        
        return {
          id: adoption.id,
          petId: pet.id,
          petName: pet.name,
          petImage: petImage,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          userEmail: user.email,
          currentStage: adoption.current_stage as AdoptionStage,
          createdAt: adoption.created_at,
          updatedAt: adoption.updated_at,
          notes: adoption.notes || '',
          responsibleId: adoption.responsible_id || '',
          responsibleName: '',
          matchPoints: [],
          followUpStatus: adoption.follow_up_status || 'pending',
          lastFollowUpDate: adoption.last_follow_up_date || null,
          nextFollowUpDate: adoption.next_follow_up_date || null,
          approvedBy: adoption.approved_by || null,
          rejectionReason: adoption.rejection_reason || ''
        };
      })
    );
    
    return adoptionMatches.filter(Boolean) as AdoptionMatch[];
  } catch (error) {
    console.error(`Error fetching adoptions by stage ${stage}:`, error);
    toast.error(`Erro ao buscar adoções no estágio ${stage}`);
    return [];
  }
};

// Get pending follow-ups
export const getPendingFollowUps = async (): Promise<AdoptionMatch[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: adoptions, error } = await supabase
      .from('adoptions')
      .select('*')
      .eq('follow_up_status', 'pending')
      .lte('next_follow_up_date', today)
      .eq('current_stage', 'completed');
    
    if (error) throw error;
    if (!adoptions) return [];
    
    const adoptionMatches = await Promise.all(
      adoptions.map(async (adoption) => {
        const pet = await fetchPetById(adoption.pet_id);
        const user = await fetchUserById(adoption.user_id);
        
        if (!pet || !user) return null;
        
        // Get the pet image from the pet object
        let petImage = '';
        if (pet.images && pet.images.length > 0) {
          // Check if images is an array of objects or an array of strings
          if (typeof pet.images[0] === 'string') {
            petImage = pet.images[0];
          } else if (typeof pet.images[0] === 'object' && pet.images[0] !== null) {
            petImage = pet.images[0].url || '';
          }
        }
        
        return {
          id: adoption.id,
          petId: pet.id,
          petName: pet.name,
          petImage: petImage,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          userEmail: user.email,
          currentStage: adoption.current_stage as AdoptionStage,
          createdAt: adoption.created_at,
          updatedAt: adoption.updated_at,
          notes: adoption.notes || '',
          responsibleId: adoption.responsible_id || '',
          responsibleName: '',
          matchPoints: [],
          followUpStatus: adoption.follow_up_status || 'pending',
          lastFollowUpDate: adoption.last_follow_up_date || null,
          nextFollowUpDate: adoption.next_follow_up_date || null,
          approvedBy: adoption.approved_by || null,
          rejectionReason: adoption.rejection_reason || ''
        };
      })
    );
    
    return adoptionMatches.filter(Boolean) as AdoptionMatch[];
  } catch (error) {
    console.error('Error fetching pending follow-ups:', error);
    toast.error('Erro ao buscar acompanhamentos pendentes');
    return [];
  }
};

// Assign a responsible for an adoption
export const assignResponsible = async (
  adoptionId: string,
  responsibleId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('adoptions')
      .update({ responsible_id: responsibleId })
      .eq('id', adoptionId);
    
    if (error) throw error;
    
    toast.success('Responsável atribuído com sucesso');
    return true;
  } catch (error) {
    console.error('Error assigning responsible:', error);
    toast.error('Erro ao atribuir responsável');
    return false;
  }
};

// Record a follow-up for an adoption
export const recordFollowUp = async (
  adoptionId: string,
  notes: string,
  status: 'successful' | 'needs_attention' | 'failed'
): Promise<boolean> => {
  try {
    // Record the follow-up
    const { error: followUpError } = await supabase
      .from('adoption_follow_ups')
      .insert({
        adoption_id: adoptionId,
        notes: notes,
        status: status,
        follow_up_date: new Date().toISOString().split('T')[0]
      });
    
    if (followUpError) throw followUpError;
    
    // Update the adoption record
    const { error: adoptionError } = await supabase
      .from('adoptions')
      .update({
        last_follow_up_date: new Date().toISOString().split('T')[0],
        follow_up_status: status === 'successful' ? 'completed' : 'needs_attention'
      })
      .eq('id', adoptionId);
    
    if (adoptionError) throw adoptionError;
    
    // If successful, schedule next follow-up in 30 days
    if (status === 'successful') {
      const nextFollowUpDate = new Date();
      nextFollowUpDate.setDate(nextFollowUpDate.getDate() + 30);
      
      const { error: nextFollowUpError } = await supabase
        .from('adoptions')
        .update({
          next_follow_up_date: nextFollowUpDate.toISOString().split('T')[0],
          follow_up_status: 'pending'
        })
        .eq('id', adoptionId);
      
      if (nextFollowUpError) throw nextFollowUpError;
    }
    
    toast.success('Acompanhamento registrado com sucesso');
    return true;
  } catch (error) {
    console.error('Error recording follow-up:', error);
    toast.error('Erro ao registrar acompanhamento');
    return false;
  }
};
