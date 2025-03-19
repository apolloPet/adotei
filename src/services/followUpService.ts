
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

export interface FollowUpRecord {
  id: string;
  adoption_id: string;
  follow_up_date: string;
  notes: string;
  status: 'pending' | 'completed' | 'missed';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUpCreateParams {
  adoption_id: string;
  follow_up_date: string;
  notes?: string;
  status: 'pending' | 'completed' | 'missed';
}

export const createFollowUpRecord = async (params: FollowUpCreateParams): Promise<FollowUpRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('adoption_follow_ups')
      .insert({
        ...params,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    
    // Update the adoption record with the latest follow-up
    await supabase
      .from('adoptions')
      .update({
        last_follow_up_date: params.follow_up_date,
        follow_up_status: params.status
      })
      .eq('id', params.adoption_id);
      
    // Schedule next follow-up if current one is completed
    if (params.status === 'completed') {
      const nextDate = new Date(params.follow_up_date);
      nextDate.setDate(nextDate.getDate() + 30); // Schedule next in 30 days
      
      await supabase
        .from('adoptions')
        .update({
          next_follow_up_date: nextDate.toISOString().split('T')[0]
        })
        .eq('id', params.adoption_id);
    }
    
    toast.success('Acompanhamento registrado com sucesso');
    return data;
  } catch (error) {
    console.error('Error creating follow-up record:', error);
    toast.error('Erro ao registrar acompanhamento');
    return null;
  }
};

export const getFollowUpsByAdoption = async (adoptionId: string): Promise<FollowUpRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('adoption_follow_ups')
      .select('*')
      .eq('adoption_id', adoptionId)
      .order('follow_up_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching follow-up records:', error);
    toast.error('Erro ao buscar registros de acompanhamento');
    return [];
  }
};

export const getPendingFollowUps = async (): Promise<FollowUpRecord[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('adoption_follow_ups')
      .select('*')
      .eq('status', 'pending')
      .lte('follow_up_date', today)
      .order('follow_up_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending follow-ups:', error);
    toast.error('Erro ao buscar acompanhamentos pendentes');
    return [];
  }
};

export const updateFollowUpStatus = async (
  id: string, 
  status: 'pending' | 'completed' | 'missed',
  notes?: string
): Promise<boolean> => {
  try {
    const updates: any = { status };
    if (notes) updates.notes = notes;
    
    const { error } = await supabase
      .from('adoption_follow_ups')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    
    toast.success('Status do acompanhamento atualizado');
    return true;
  } catch (error) {
    console.error('Error updating follow-up status:', error);
    toast.error('Erro ao atualizar status do acompanhamento');
    return false;
  }
};
