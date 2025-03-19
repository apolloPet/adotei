
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

// Cache para parâmetros de parceria que mudam com pouca frequência
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos
let partnershipTypesCache = {
  data: null,
  timestamp: 0
};

/**
 * Interface para dados de parceria
 */
export interface Partnership {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  company_size?: string;
  company_website?: string;
  partnership_type: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

/**
 * Cria um novo registro de interesse de parceria
 */
export const createPartnership = async (
  data: Omit<Partnership, 'id' | 'created_at' | 'updated_at' | 'approved_by' | 'approved_at'>
): Promise<Partnership | null> => {
  try {
    console.log("[PartnershipService] Criando nova solicitação de parceria");
    
    const { data: partnershipData, error } = await supabase
      .from('partnerships')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      console.error("[PartnershipService] Erro ao criar parceria:", error);
      throw error;
    }

    console.log("[PartnershipService] Parceria criada com sucesso:", partnershipData);
    
    return partnershipData;
  } catch (error) {
    console.error("[PartnershipService] Erro inesperado ao criar parceria:", error);
    toast.error("Erro ao registrar interesse em parceria");
    return null;
  }
};

/**
 * Recupera todas as parcerias
 */
export const getPartnerships = async (
  filters?: { status?: string, type?: string }
): Promise<Partnership[]> => {
  try {
    console.log("[PartnershipService] Buscando parcerias com filtros:", filters);
    
    let query = supabase
      .from('partnerships')
      .select('*');
    
    // Aplicar filtros se fornecidos
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.type) {
      query = query.eq('partnership_type', filters.type);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("[PartnershipService] Erro ao buscar parcerias:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("[PartnershipService] Erro inesperado ao buscar parcerias:", error);
    toast.error("Erro ao carregar parcerias");
    return [];
  }
};

/**
 * Recupera uma parceria específica pelo ID
 */
export const getPartnershipById = async (id: string): Promise<Partnership | null> => {
  try {
    console.log(`[PartnershipService] Buscando parceria com ID: ${id}`);
    
    const { data, error } = await supabase
      .from('partnerships')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`[PartnershipService] Erro ao buscar parceria ${id}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[PartnershipService] Erro inesperado ao buscar parceria ${id}:`, error);
    toast.error("Erro ao carregar detalhes da parceria");
    return null;
  }
};

/**
 * Atualiza o status de uma parceria
 */
export const updatePartnershipStatus = async (
  id: string, 
  status: 'pending' | 'approved' | 'rejected',
  adminId?: string
): Promise<boolean> => {
  try {
    console.log(`[PartnershipService] Atualizando status da parceria ${id} para ${status}`);
    
    const updates: any = { status };
    
    // Se aprovado, adicionar informações de aprovação
    if (status === 'approved' && adminId) {
      updates.approved_by = adminId;
      updates.approved_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('partnerships')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error(`[PartnershipService] Erro ao atualizar status da parceria ${id}:`, error);
      throw error;
    }

    console.log(`[PartnershipService] Status da parceria ${id} atualizado com sucesso para ${status}`);
    return true;
  } catch (error) {
    console.error(`[PartnershipService] Erro inesperado ao atualizar status da parceria ${id}:`, error);
    toast.error("Erro ao atualizar status da parceria");
    return false;
  }
};

/**
 * Recupera os tipos de parceria disponíveis (com cache)
 */
export const getPartnershipTypes = async (): Promise<string[]> => {
  try {
    const now = Date.now();
    
    // Verificar se o cache ainda é válido
    if (partnershipTypesCache.data && (now - partnershipTypesCache.timestamp < CACHE_DURATION)) {
      console.log('[PartnershipService] Usando tipos de parceria do cache');
      return partnershipTypesCache.data as string[];
    }
    
    console.log('[PartnershipService] Buscando tipos de parceria do banco');
    
    // Implementação rápida - em produção, você pode querer uma tabela separada para tipos
    const { data, error } = await supabase
      .from('partnerships')
      .select('partnership_type')
      .not('partnership_type', 'is', null);

    if (error) {
      console.error('[PartnershipService] Erro ao buscar tipos de parceria:', error);
      throw error;
    }

    // Extrair tipos únicos
    const types = [...new Set(data.map(item => item.partnership_type))];
    
    // Atualizar cache
    partnershipTypesCache = {
      data: types,
      timestamp: now
    };
    
    return types;
  } catch (error) {
    console.error('[PartnershipService] Erro inesperado ao buscar tipos de parceria:', error);
    return [
      "Clínica Veterinária",
      "Fornecedor de Produtos",
      "Abrigo de Animais",
      "Loja de Pets",
      "Serviço de Adestramento",
      "ONG",
      "Empresa de Tecnologia",
      "Marketing e Divulgação",
      "Financeiro",
      "Outros"
    ]; // Fallback para valores padrão
  }
};

/**
 * Deleta uma parceria
 */
export const deletePartnership = async (id: string): Promise<boolean> => {
  try {
    console.log(`[PartnershipService] Deletando parceria ${id}`);
    
    const { error } = await supabase
      .from('partnerships')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`[PartnershipService] Erro ao deletar parceria ${id}:`, error);
      throw error;
    }

    console.log(`[PartnershipService] Parceria ${id} deletada com sucesso`);
    return true;
  } catch (error) {
    console.error(`[PartnershipService] Erro inesperado ao deletar parceria ${id}:`, error);
    toast.error("Erro ao excluir parceria");
    return false;
  }
};

/**
 * Busca métricas agregadas de parcerias
 */
export const getPartnershipMetrics = async (): Promise<any> => {
  try {
    console.log('[PartnershipService] Buscando métricas de parcerias');
    
    // Buscar contagem por status
    const { data: statusCounts, error: statusError } = await supabase
      .from('partnerships')
      .select('status, count')
      .groupBy('status');

    if (statusError) {
      console.error('[PartnershipService] Erro ao buscar contagem por status:', statusError);
      throw statusError;
    }

    // Buscar contagem por tipo
    const { data: typeCounts, error: typeError } = await supabase
      .from('partnerships')
      .select('partnership_type, count')
      .groupBy('partnership_type');

    if (typeError) {
      console.error('[PartnershipService] Erro ao buscar contagem por tipo:', typeError);
      throw typeError;
    }

    // Formatar resultado
    const metrics = {
      byStatus: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr.count;
        return acc;
      }, {}),
      byType: typeCounts.reduce((acc, curr) => {
        acc[curr.partnership_type] = curr.count;
        return acc;
      }, {}),
      total: statusCounts.reduce((sum, curr) => sum + parseInt(curr.count), 0)
    };

    return metrics;
  } catch (error) {
    console.error('[PartnershipService] Erro inesperado ao buscar métricas:', error);
    toast.error("Erro ao carregar métricas de parcerias");
    return {
      byStatus: {},
      byType: {},
      total: 0
    };
  }
};
