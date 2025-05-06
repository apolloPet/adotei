
import { supabase } from "@/lib/supabase";
import { toast } from '@/hooks/use-sonner';

// Interface para fornecedores
export interface Supplier {
  id: string;
  name: string;
  type: string;
  description?: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  contact_person?: string;
  created_at: string;
  ratings?: SupplierRating[];
  notes?: string;
  average_rating?: number;
}

// Interface para avaliações de fornecedores
export interface SupplierRating {
  id: string;
  supplier_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// Obter lista de fornecedores
export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('supplier-management', {
      body: {
        method: 'getSuppliers'
      }
    });
    
    if (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro em getSuppliers:', error);
    return [];
  }
};

// Criar novo fornecedor
export const createSupplier = async (supplier: Partial<Supplier>): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('supplier-management', {
      body: {
        method: 'createSupplier',
        ...supplier
      }
    });
    
    if (error) {
      console.error('Erro ao criar fornecedor:', error);
      toast.error('Erro ao criar fornecedor: ' + error.message);
      return null;
    }
    
    toast.success('Fornecedor criado com sucesso!');
    return data;
  } catch (error) {
    console.error('Erro em createSupplier:', error);
    toast.error('Erro ao criar fornecedor');
    return null;
  }
};

// Atualizar fornecedor existente
export const updateSupplier = async (supplier: Partial<Supplier>): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('supplier-management', {
      body: {
        method: 'updateSupplier',
        ...supplier
      }
    });
    
    if (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      toast.error('Erro ao atualizar fornecedor: ' + error.message);
      return null;
    }
    
    toast.success('Fornecedor atualizado com sucesso!');
    return data;
  } catch (error) {
    console.error('Erro em updateSupplier:', error);
    toast.error('Erro ao atualizar fornecedor');
    return null;
  }
};

// Avaliar fornecedor
export const rateSupplier = async (
  supplierId: string, 
  rating: number, 
  comment?: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('supplier-management', {
      body: {
        method: 'rateSupplier',
        supplierId,
        rating,
        comment
      }
    });
    
    if (error) {
      console.error('Erro ao avaliar fornecedor:', error);
      toast.error('Erro ao avaliar fornecedor: ' + error.message);
      return false;
    }
    
    toast.success('Avaliação registrada com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro em rateSupplier:', error);
    toast.error('Erro ao avaliar fornecedor');
    return false;
  }
};

// Obter avaliação média de um fornecedor
export const getAverageRating = (ratings: SupplierRating[] | undefined): number => {
  if (!ratings || ratings.length === 0) {
    return 0;
  }
  
  const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
  return Number((sum / ratings.length).toFixed(1));
};
