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

export const updateAdoptionStage = async (
  id: string, 
  stage: AdoptionStage,
  notes?: string,
  visitDate?: string,
  inspectionDate?: string,
  contractSigned?: boolean,
  paymentComplete?: boolean,
  rejectionReason?: string
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
    
    // Handle approval
    if (stage === 'approved') {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (currentUser) {
        updates.approved_by = currentUser.id;
      }
    }
    
    // Handle rejection
    if (stage === 'rejected' && rejectionReason) {
      updates.rejection_reason = rejectionReason;
    }
    
    const { error } = await supabase
      .from('adoptions')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    
    // Set up follow-up dates for completed adoptions
    if (stage === 'completed') {
      const nextFollowUpDate = new Date();
      nextFollowUpDate.setDate(nextFollowUpDate.getDate() + 14); // First follow-up after 14 days
      
      await supabase
        .from('adoptions')
        .update({
          next_follow_up_date: nextFollowUpDate.toISOString().split('T')[0],
          follow_up_status: 'pending'
        })
        .eq('id', id);
    }
    
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
    // Verificar se o userId é válido, caso contrário, obter o userId atual
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
    
    // Verificar se o ID existe na tabela animals (e não na pets)
    const { data: animalExists, error: animalError } = await supabase
      .from('animals')
      .select('id')
      .eq('id', petId)
      .single();
    
    if (animalError && animalError.code !== 'PGRST116') {
      console.error('Error checking if animal exists:', animalError);
      throw animalError;
    }
    
    // Se o animal existe, precisamos adaptar o processo
    if (animalExists) {
      console.log('Animal exists in animals table. Using direct animal ID for matching.');
      
      // Usar a função de edge para registrar o match e criar adoção se necessário
      try {
        // Construir a URL completa para a função Edge
        const edgeFunctionUrl = `https://jwbcrddblmiurmeziszp.supabase.co/functions/v1/record-adoption`;
        
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        
        if (!accessToken) {
          throw new Error('No access token available');
        }
        
        console.log('Calling edge function at:', edgeFunctionUrl);
        
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
        return true;
      } catch (edgeFunctionError) {
        console.error('Error calling edge function:', edgeFunctionError);
        throw edgeFunctionError;
      }
    }
    
    // Processo original para pets da tabela pets
    const { data, error } = await supabase
      .from('pet_matches')
      .insert({
        pet_id: petId,
        user_id: userIdToUse,
        match_type: matchType
      })
      .select();
    
    if (error) {
      console.error('Error inserting into pet_matches:', error);
      throw error;
    }
    
    console.log('Pet match recorded successfully:', data);
    
    if (matchType === 'liked') {
      console.log('Creating adoption record for pet match');
      const adoption = await createAdoption(petId, userIdToUse);
      console.log('Adoption created:', adoption);
    }
    
    return true;
  } catch (error) {
    console.error('Error recording pet match:', error);
    toast.error('Erro ao registrar match com o pet');
    throw error;
  }
};

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
