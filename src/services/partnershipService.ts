
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

export interface Partnership {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  company_size?: string;
  company_website?: string;
  partnership_type: string;
  status: 'pending' | 'contacted' | 'in_progress' | 'partnered' | 'declined';
  notes?: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

export const createPartnership = async (partnership: Omit<Partnership, 'id' | 'created_at' | 'updated_at' | 'approved_by' | 'approved_at'>): Promise<Partnership | null> => {
  try {
    const { data, error } = await supabase
      .from('partnerships')
      .insert({
        ...partnership
      })
      .select('*')
      .single();

    if (error) throw error;
    
    toast.success('Solicitação de parceria enviada com sucesso');
    return data as Partnership;
  } catch (error) {
    console.error('Error creating partnership request:', error);
    toast.error('Erro ao enviar solicitação de parceria');
    return null;
  }
};

export const getPartnerships = async (status?: string): Promise<Partnership[]> => {
  try {
    let query = supabase
      .from('partnerships')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Partnership[];
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    toast.error('Erro ao buscar parcerias');
    return [];
  }
};

export const updatePartnershipStatus = async (id: string, status: string, notes?: string): Promise<boolean> => {
  try {
    const updates: any = { status };
    if (notes) updates.notes = notes;
    
    if (status === 'partnered') {
      updates.approved_by = (await supabase.auth.getUser()).data.user?.id;
      updates.approved_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('partnerships')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    
    toast.success('Status da parceria atualizado');
    return true;
  } catch (error) {
    console.error('Error updating partnership status:', error);
    toast.error('Erro ao atualizar status da parceria');
    return false;
  }
};
