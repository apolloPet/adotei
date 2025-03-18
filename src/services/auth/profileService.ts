
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';
import { toast } from '@/hooks/use-sonner';
import { fetchUserById, updateUser } from '../userService';

export const getProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      avatarUrl: data.avatar_url,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      phone: data.phone,
      housingType: data.housing_type,
      hasChildren: data.has_children,
      childrenAges: data.children_ages,
      hadPetsBefore: data.had_pets_before,
      hasAllergies: data.has_allergies,
      allergiesDescription: data.allergies_description,
      workSchedule: data.work_schedule
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateProfile = async (profile: Partial<UserProfile>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }
    
    const updates = {
      first_name: profile.firstName,
      last_name: profile.lastName,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zip: profile.zip,
      phone: profile.phone,
      avatar_url: profile.avatarUrl,
      housing_type: profile.housingType,
      has_children: profile.hasChildren,
      children_ages: profile.childrenAges,
      had_pets_before: profile.hadPetsBefore,
      has_allergies: profile.hasAllergies,
      allergies_description: profile.allergiesDescription,
      work_schedule: profile.workSchedule,
      updated_at: new Date().toISOString()
    };
    
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
      
    if (error) throw error;
    
    if (profile.firstName || profile.lastName) {
      const userData = await fetchUserById(user.id);
      if (userData) {
        const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        if (fullName && fullName !== userData.name) {
          await updateUser(user.id, { name: fullName });
        }
      }
    }
    
    toast.success('Perfil atualizado com sucesso!');
    return true;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    toast.error(`Erro ao atualizar perfil: ${error.message}`);
    return false;
  }
};
