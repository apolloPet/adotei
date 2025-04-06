
import { supabase, isSupabaseConfigured, handleSupabaseError } from '@/lib/supabase';
import type { User } from '@/components/admin/users/types';
import { toast } from '@/hooks/use-sonner';
import { dbUserToUser, DbUser } from '@/utils/dbConverters';

export const fetchUsers = async (): Promise<User[]> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return [];
    }

    console.log('Buscando usuários da tabela users...');
    
    // First try to get session to ensure we're authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('Erro: Usuário não está autenticado');
      toast.error('Você precisa estar autenticado para ver usuários');
      return [];
    }
    
    // Use admin role to bypass RLS if possible
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar usuários:', error);
      handleSupabaseError(error, 'Erro ao buscar usuários');
      
      // If we can't get users directly, try using edge function
      try {
        console.log('Tentando buscar usuários via edge function...');
        const { data: functionData, error: functionError } = await supabase.functions.invoke('admin', {
          method: 'GET',
          path: '/users',
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          }
        });
        
        if (functionError) {
          console.error('Erro ao buscar usuários via edge function:', functionError);
          return [];
        }
        
        console.log(`Encontrados ${functionData?.length || 0} usuários via edge function`);
        return (functionData || []).map(dbUserToUser);
      } catch (functionCallError) {
        console.error('Erro ao chamar edge function:', functionCallError);
        return [];
      }
    }

    console.log(`Encontrados ${userData?.length || 0} usuários na tabela users`);
    
    return (userData || []).map((dbUser) => {
      // Converter usuário do banco para o formato de frontend
      return dbUserToUser(dbUser as DbUser);
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    toast.error('Erro ao buscar usuários');
    return [];
  }
};

export const fetchUserWithRoleInfo = async (userId: string): Promise<{user: User | null, isAdmin: boolean}> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return { user: null, isAdmin: false };
    }

    // Get user info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Erro ao buscar usuário:', userError);
      handleSupabaseError(userError, 'Erro ao buscar usuário');
      return { user: null, isAdmin: false };
    }

    if (!userData) {
      return { user: null, isAdmin: false };
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (roleError) {
      console.error('Erro ao verificar papel de administrador:', roleError);
      handleSupabaseError(roleError, 'Erro ao verificar papel de administrador');
    }

    return { 
      user: dbUserToUser(userData as DbUser), 
      isAdmin: !!roleData 
    };
  } catch (error) {
    console.error('Erro ao buscar usuário com informações de papel:', error);
    toast.error('Erro ao buscar informações do usuário');
    return { user: null, isAdmin: false };
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
