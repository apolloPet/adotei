import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { AdoptionMatch, mockAdoptionMatches } from '@/components/admin/adoption/types';
import { AdoptionStage } from '@/components/adoption/AdoptionStages';
import { fetchPetById } from './petService';
import { fetchUserById } from './userService';
import { toast } from '@/hooks/use-sonner';

type DbAdoption = Database['public']['Tables']['adoptions']['Row'];

// Helper function to extract pet image safely
const extractPetImage = (petImages: any): string => {
  if (!petImages || !petImages.length) return '';
  
  const firstImage = petImages[0];
  
  if (typeof firstImage === 'string') {
    return firstImage;
  } 
  
  if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
    return firstImage.url || '';
  }
  
  return '';
};

// Fetch all adoptions
export const fetchAdoptions = async (): Promise<AdoptionMatch[]> => {
  try {
    console.log('Modo local ativo: usando adoções mockadas');
    return mockAdoptionMatches;

    console.log('Fetching all adoption matches');
    
    // First try using the edge function to get complete data
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        console.warn('No access token available for edge function call');
        throw new Error('No authentication token');
      }
      
      const response = await fetch('https://jwbcrddblmiurmeziszp.supabase.co/functions/v1/adoptions/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Edge function returned ${response.status}: ${await response.text()}`);
      }
      
      const adoptionsData = await response.json();
      console.log('Successfully fetched adoptions from edge function:', adoptionsData.length);
      
      if (adoptionsData && Array.isArray(adoptionsData) && adoptionsData.length > 0) {
        return adoptionsData.map(adoption => {
          const pet = adoption.pets || {};
          const user = adoption.users || {};
          const petImages = pet.pet_images || [];
          
          // Get the pet image safely
          const petImage = petImages.length > 0 ? 
            (petImages.find((img: any) => img.is_primary)?.url || petImages[0]?.url || '') : '';
          
          return {
            id: adoption.id,
            petId: pet.id || '',
            petName: pet.name || 'Unknown Pet',
            petImage,
            userId: user.id || '',
            userName: user.name || 'Unknown User',
            userPhone: user.phone || 'No Phone',
            userEmail: user.email || 'No Email',
            currentStage: adoption.current_stage as AdoptionStage,
            createdAt: adoption.created_at,
            updatedAt: adoption.updated_at,
            notes: adoption.notes || '',
            responsibleId: adoption.responsible_id || '',
            responsibleName: '',  // Will be populated if needed
            matchPoints: [],  // Will be calculated if needed
            followUpStatus: adoption.follow_up_status || 'pending',
            lastFollowUpDate: adoption.last_follow_up_date || null,
            nextFollowUpDate: adoption.next_follow_up_date || null,
            approvedBy: adoption.approved_by || null,
            rejectionReason: adoption.rejection_reason || '',
            matchDate: adoption.created_at,
            animal_id: adoption.animal_id || null
          };
        });
      }
      
      console.warn('Edge function returned empty or invalid data, falling back to manual fetch');
      throw new Error('Invalid data format');
    } catch (edgeError) {
      console.error('Error fetching data from edge function:', edgeError);
      console.log('Falling back to direct database query');
      // Fall back to direct database queries
    }
    
    // Direct database query fallback
    const { data: adoptions, error } = await supabase
      .from('adoptions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database query error:', error);
      throw error;
    }
    
    if (!adoptions || adoptions.length === 0) {
      console.log('No adoptions found in database');
      return [];
    }
    
    console.log(`Found ${adoptions.length} adoptions, fetching related data`);
    
    const adoptionMatches = await Promise.all(
      adoptions.map(async (adoption) => {
        try {
          const pet = await fetchPetById(adoption.pet_id);
          const user = await fetchUserById(adoption.user_id);
          
          if (!pet || !user) {
            console.warn(`Missing data for adoption ${adoption.id}: pet=${!!pet}, user=${!!user}`);
            return null;
          }
          
          // Get match data if available
          const { data: matchData } = await supabase
            .from('pet_matches')
            .select('*')
            .eq('pet_id', adoption.pet_id)
            .eq('user_id', adoption.user_id)
            .eq('match_type', 'liked')
            .single();
          
          // Get the pet image safely using our helper function
          const petImage = extractPetImage(pet.images);
          
          return {
            id: adoption.id,
            petId: pet.id,
            petName: pet.name,
            petImage,
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
        } catch (itemError) {
          console.error(`Error processing adoption ${adoption.id}:`, itemError);
          return null;
        }
      })
    );
    
    const validAdoptions = adoptionMatches.filter(Boolean) as AdoptionMatch[];
    console.log(`Successfully processed ${validAdoptions.length} adoptions`);
    return validAdoptions;
  } catch (error) {
    console.error('Error fetching adoptions:', error);
    toast.error('Erro ao buscar adoções');
    return [];
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
    console.log('Modo local ativo: atualização de estágio simulada', { id, stage, notes, rejectionReason });
    toast.success('Estágio atualizado localmente');
    return true;

    console.log(`Updating adoption ${id} to stage ${stage}`);
    
    // Build updates object based on the stage
    const updates: any = {
      current_stage: stage,
      updated_at: new Date().toISOString()
    };
    
    if (notes) updates.notes = notes;
    
    // Stage-specific updates
    switch(stage) {
      case 'interested':
        break;
      case 'pending_approval':
        // When a user's interest is being reviewed
        break;
      case 'approved':
        // When application is approved, record who approved it
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          updates.approved_by = user.id;
        }
        break;
      case 'visit_scheduled':
        // In a real app, we would set the actual date here
        updates.scheduled_visit_date = new Date().toISOString().split('T')[0];
        break;
      case 'home_inspection':
        updates.home_inspection_date = new Date().toISOString().split('T')[0];
        break;
      case 'completed':
        const nextFollowUpDate = new Date();
        nextFollowUpDate.setDate(nextFollowUpDate.getDate() + 14); // First follow-up after 14 days
        
        updates.next_follow_up_date = nextFollowUpDate.toISOString().split('T')[0];
        updates.follow_up_status = 'pending';
        updates.contract_signed = true;
        break;
      case 'rejected':
        if (rejectionReason) {
          updates.rejection_reason = rejectionReason;
        }
        break;
    }
    
    console.log('Sending updates to database:', updates);
    
    // Try to use the edge function first for more complex processing
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch('https://jwbcrddblmiurmeziszp.supabase.co/functions/v1/adoptions/update-stage', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          id,
          stage,
          notes,
          rejectionReason
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Edge function error (${response.status}):`, errorText);
        throw new Error(`API error: ${errorText}`);
      }
      
      console.log('Successfully updated adoption via edge function');
      return true;
    } catch (edgeError) {
      console.warn('Edge function call failed, falling back to direct update:', edgeError);
      // Fall back to direct update
    }
    
    // Direct update as fallback
    const { error } = await supabase
      .from('adoptions')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating adoption stage:', error);
      throw error;
    }
    
    console.log('Successfully updated adoption via direct database update');
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
    console.log('Modo local ativo: match registrado localmente', { petId, userId, matchType });
    if (matchType === 'liked') {
      toast.success('Você demonstrou interesse neste pet!', {
        description: 'Modo local: a interação foi simulada.',
        duration: 5000
      });
    }
    return true;

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
      
      // Fallback to direct database operations
      console.log('Attempting fallback to direct database operations...');
      
      if (matchType === 'liked') {
        // Check if match already exists
        const { data: existingMatch } = await supabase
          .from('pet_matches')
          .select('*')
          .eq('pet_id', petId)
          .eq('user_id', userIdToUse)
          .eq('match_type', 'liked')
          .maybeSingle();
        
        if (!existingMatch) {
          // Create the match
          await supabase
            .from('pet_matches')
            .insert({
              pet_id: petId,
              user_id: userIdToUse,
              match_type: matchType
            });
          
          // Create the adoption record
          const { data: adoption, error: adoptionError } = await supabase
            .from('adoptions')
            .insert({
              pet_id: petId,
              user_id: userIdToUse,
              current_stage: 'interested',
              notes: 'Match automático via navegação de animais (fallback)'
            })
            .select()
            .single();
          
          if (adoptionError) {
            console.error('Error creating adoption record:', adoptionError);
            throw adoptionError;
          }
          
          toast.success('Você demonstrou interesse neste pet!', {
            description: 'A ONG será notificada do seu interesse.',
            duration: 5000
          });
        } else {
          toast.info('Você já demonstrou interesse neste pet!', {
            description: 'Acompanhe o processo na área de adoções.',
            duration: 5000
          });
        }
      } else {
        // For dislikes, just record the match
        await supabase
          .from('pet_matches')
          .insert({
            pet_id: petId,
            user_id: userIdToUse,
            match_type: matchType
          });
      }
      
      return true;
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
        
        // Get the pet image safely using our helper function
        const petImage = extractPetImage(pet.images);
        
        return {
          id: adoption.id,
          petId: pet.id,
          petName: pet.name,
          petImage,
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
        
        // Get the pet image safely using our helper function
        const petImage = extractPetImage(pet.images);
        
        return {
          id: adoption.id,
          petId: pet.id,
          petName: pet.name,
          petImage,
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
