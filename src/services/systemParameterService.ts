
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

export interface SystemParameter {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export const getSystemParameters = async (category?: string): Promise<SystemParameter[]> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Erro ao obter sessão:', sessionError);
      toast.error('Você precisa estar autenticado para acessar os parâmetros do sistema');
      return [];
    }
    
    const fetchUrl = category 
      ? '/system-parameters?category=' + encodeURIComponent(category)
      : '/system-parameters';
    
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'GET',
      body: { action: 'getParameters', category },
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (error) {
      console.error('Erro na edge function para obter parâmetros do sistema:', error);
      toast.error(`Erro ao obter parâmetros do sistema: ${error.message}`);
      return [];
    }
    
    if (!data.success || !data.data) {
      console.error('Resposta de erro da edge function:', data);
      toast.error(data.message || 'Erro ao obter parâmetros do sistema');
      return [];
    }
    
    return data.data;
  } catch (error) {
    console.error('Error in getSystemParameters:', error);
    toast.error('Erro ao buscar parâmetros do sistema');
    return [];
  }
};

export const updateSystemParameter = async (
  id: string,
  value: any,
  description?: string
): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Erro ao obter sessão:', sessionError);
      toast.error('Você precisa estar autenticado para atualizar parâmetros');
      return false;
    }
    
    const requestData = {
      action: 'updateParameter',
      id,
      value,
      description
    };
    
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'PUT',
      body: JSON.stringify(requestData),
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (error) {
      console.error('Erro na edge function de atualização de parâmetro:', error);
      toast.error(`Erro ao atualizar parâmetro: ${error.message}`);
      return false;
    }
    
    if (!data.success) {
      console.error('Resposta de erro da edge function:', data);
      toast.error(data.message || 'Erro ao atualizar parâmetro');
      return false;
    }
    
    toast.success('Parâmetro atualizado com sucesso');
    return true;
  } catch (error) {
    console.error('Error in updateSystemParameter:', error);
    toast.error('Erro ao atualizar parâmetro');
    return false;
  }
};

export const createSystemParameter = async (
  category: string,
  key: string,
  value: any,
  description?: string
): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Erro ao obter sessão:', sessionError);
      toast.error('Você precisa estar autenticado para criar parâmetros');
      return false;
    }
    
    const requestData = {
      action: 'createParameter',
      category,
      key,
      value,
      description
    };
    
    const { data, error } = await supabase.functions.invoke('admin-management', {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (error) {
      console.error('Erro na edge function de criação de parâmetro:', error);
      toast.error(`Erro ao criar parâmetro: ${error.message}`);
      return false;
    }
    
    if (!data.success) {
      console.error('Resposta de erro da edge function:', data);
      toast.error(data.message || 'Erro ao criar parâmetro');
      return false;
    }
    
    toast.success('Parâmetro criado com sucesso');
    return true;
  } catch (error) {
    console.error('Error in createSystemParameter:', error);
    toast.error('Erro ao criar parâmetro');
    return false;
  }
};
