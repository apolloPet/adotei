
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

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
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  average_rating?: number;
}

export interface SupplierRating {
  id: string;
  supplier_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export const createSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'average_rating'>): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        ...supplier,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select('*')
      .single();

    if (error) throw error;
    
    toast.success('Fornecedor adicionado com sucesso');
    return data as Supplier;
  } catch (error) {
    console.error('Error creating supplier:', error);
    toast.error('Erro ao adicionar fornecedor');
    return null;
  }
};

export const getSuppliers = async (type?: string): Promise<Supplier[]> => {
  try {
    let query = supabase
      .from('suppliers')
      .select(`
        *,
        supplier_ratings (rating)
      `)
      .order('created_at', { ascending: false });
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    
    // Calculate average rating for each supplier
    const suppliersWithRating = (data || []).map(supplier => {
      const ratings = supplier.supplier_ratings || [];
      const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const average = ratings.length > 0 ? sum / ratings.length : 0;
      
      return {
        ...supplier,
        supplier_ratings: undefined, // Remove the ratings array
        average_rating: Number(average.toFixed(1))
      };
    });
    
    return suppliersWithRating as Supplier[];
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    toast.error('Erro ao buscar fornecedores');
    return [];
  }
};

export const rateSupplier = async (supplierId: string, rating: number, comment?: string): Promise<boolean> => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      toast.error('Usuário não autenticado');
      return false;
    }
    
    // Check if user already rated this supplier
    const { data: existingRating } = await supabase
      .from('supplier_ratings')
      .select('*')
      .eq('supplier_id', supplierId)
      .eq('user_id', userId)
      .single();
    
    if (existingRating) {
      // Update existing rating
      const { error } = await supabase
        .from('supplier_ratings')
        .update({
          rating,
          comment: comment || existingRating.comment
        })
        .eq('id', existingRating.id);
        
      if (error) throw error;
      toast.success('Avaliação atualizada com sucesso');
    } else {
      // Create new rating
      const { error } = await supabase
        .from('supplier_ratings')
        .insert({
          supplier_id: supplierId,
          user_id: userId,
          rating,
          comment
        });
        
      if (error) throw error;
      toast.success('Fornecedor avaliado com sucesso');
    }
    
    return true;
  } catch (error) {
    console.error('Error rating supplier:', error);
    toast.error('Erro ao avaliar fornecedor');
    return false;
  }
};

export const getSupplierRatings = async (supplierId: string): Promise<SupplierRating[]> => {
  try {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as SupplierRating[];
  } catch (error) {
    console.error('Error fetching supplier ratings:', error);
    toast.error('Erro ao buscar avaliações do fornecedor');
    return [];
  }
};
