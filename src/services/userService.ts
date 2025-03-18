
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import type { User } from '@/components/admin/users/types';
import { toast } from '@/hooks/use-sonner';

type DbUser = Database['public']['Tables']['users']['Row'];

// Convert database user to frontend user model
export const dbUserToUser = (dbUser: DbUser): User => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    registrationDate: dbUser.created_at,
    address: {
      cep: dbUser.zip,
      street: dbUser.address,
      number: '', // Not stored separately in database
      neighborhood: '', // Not stored separately in database
      city: dbUser.city
    },
    housingType: dbUser.housing_type as 'apartment' | 'house' | 'other',
    hasChildren: dbUser.has_children,
    childrenAges: dbUser.children_ages,
    hadPetsBefore: dbUser.had_pets_before,
    hasAllergies: dbUser.has_allergies,
    allergiesDescription: dbUser.allergies_description,
    workSchedule: dbUser.work_schedule
  };
};

export const fetchUsers = async (): Promise<User[]> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return [];
    }

    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    return (data || []).map((dbUser) => dbUserToUser(dbUser as DbUser));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const fetchUserById = async (id: string): Promise<User | null> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return dbUserToUser(data as DbUser);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};

export const createUser = async (user: Omit<User, 'id' | 'registrationDate'>, authId: string): Promise<User | null> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return null;
    }

    const dbUser = {
      auth_id: authId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address.street,
      city: user.address.city,
      state: '', // Not provided in the user model
      zip: user.address.cep,
      housing_type: user.housingType,
      has_children: user.hasChildren,
      children_ages: user.childrenAges,
      had_pets_before: user.hadPetsBefore,
      has_allergies: user.hasAllergies,
      allergies_description: user.allergiesDescription,
      work_schedule: user.workSchedule
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(dbUser)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create user');
    
    return dbUserToUser(data as DbUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return null;
    }

    const dbUpdates: any = {};
    
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.address) {
      if (updates.address.street) dbUpdates.address = updates.address.street;
      if (updates.address.city) dbUpdates.city = updates.address.city;
      if (updates.address.cep) dbUpdates.zip = updates.address.cep;
    }
    if (updates.housingType) dbUpdates.housing_type = updates.housingType;
    if (updates.hasChildren !== undefined) dbUpdates.has_children = updates.hasChildren;
    if (updates.childrenAges !== undefined) dbUpdates.children_ages = updates.childrenAges;
    if (updates.hadPetsBefore !== undefined) dbUpdates.had_pets_before = updates.hadPetsBefore;
    if (updates.hasAllergies !== undefined) dbUpdates.has_allergies = updates.hasAllergies;
    if (updates.allergiesDescription !== undefined) dbUpdates.allergies_description = updates.allergiesDescription;
    if (updates.workSchedule) dbUpdates.work_schedule = updates.workSchedule;
    
    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to update user');
    
    return dbUserToUser(data as DbUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};
