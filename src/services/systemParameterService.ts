
import { apiRequest } from '@/lib/apiClient';
import { toast } from '@/hooks/use-sonner';

export interface SystemParameter {
  id: string;
  category: string;
  key: string;
  value: string;
  description: string | null;
  active?: boolean;
}

type BackendSystemParameter = {
  id: string;
  category: string;
  key: string;
  value: string;
  description: string | null;
  active: boolean;
};

const mapParameter = (parameter: BackendSystemParameter): SystemParameter => ({
  id: parameter.id,
  category: parameter.category,
  key: parameter.key,
  value: parameter.value,
  description: parameter.description,
  active: parameter.active,
});

export const getSystemParameters = async (category?: string): Promise<SystemParameter[]> => {
  try {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const data = await apiRequest<BackendSystemParameter[]>(`/api/system-parameters${query}`);
    return data.map(mapParameter);
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
    const allParameters = await apiRequest<BackendSystemParameter[]>('/api/system-parameters');
    const existing = allParameters.find((parameter) => parameter.id === id);

    if (!existing) {
      toast.error('Parâmetro não encontrado para atualização');
      return false;
    }

    await apiRequest(`/api/system-parameters/${id}`, {
      method: 'PUT',
      body: {
        category: existing.category,
        key: existing.key,
        value,
        description: description ?? existing.description,
        active: existing.active,
      },
    });
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
    await apiRequest('/api/system-parameters', {
      method: 'POST',
      body: {
        category,
        key,
      value,
        description,
        active: true,
      },
    });
    toast.success('Parâmetro criado com sucesso');
    return true;
  } catch (error) {
    console.error('Error in createSystemParameter:', error);
    toast.error('Erro ao criar parâmetro');
    return false;
  }
};
