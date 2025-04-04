
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';
import { toast } from '@/hooks/use-sonner';
import { handleSupabaseError } from '@/lib/supabase';

/**
 * Fetches the user's profile from the database
 * Uses Edge Function to handle complex profile logic
 */
export const getProfile = async (): Promise<UserProfile | null> => {
  try {
    console.log('Fetching profile...');
    
    // Get current session to verify authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log('No active session found');
      return null;
    }
    
    try {
      // Call the user-profile edge function with the token
      const { data, error } = await supabase.functions.invoke('user-profile', {
        method: 'GET'
      });
      
      if (error) {
        console.error('Error fetching profile from edge function:', error);
        return null;
      }
      
      if (!data) {
        console.log('No profile data returned from edge function');
        return null;
      }
      
      // Transform the data to match the UserProfile interface
      const profile: UserProfile = {
        id: data.id,
        firstName: data.name?.split(' ')[0] || '',
        lastName: data.name?.split(' ').slice(1).join(' ') || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || '',
        avatarUrl: data.avatar_url || '',
        housingType: data.housing_type || 'house',
        hasChildren: data.has_children || false,
        childrenAges: data.children_ages || '',
        hadPetsBefore: data.had_pets_before || false,
        hasAllergies: data.has_allergies || false,
        allergiesDescription: data.allergies_description || '',
        workSchedule: data.work_schedule || ''
      };
      
      return profile;
    } catch (error) {
      console.error('Error in edge function call:', error);
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
};

/**
 * Updates the user's profile in the database
 * Uses Edge Function to handle permissions and data validation
 */
export const updateProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
  try {
    console.log('Updating profile...');
    
    // Get current user to verify authentication
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error('Você precisa estar logado para atualizar seu perfil');
      return false;
    }
    
    // Format name from first and last name
    const name = profileData.firstName && profileData.lastName 
      ? `${profileData.firstName} ${profileData.lastName}` 
      : profileData.firstName || '';
    
    // Prepare data in the format expected by the edge function
    const payload = {
      operation: 'create-profile',
      name,
      phone: profileData.phone,
      address: profileData.address,
      city: profileData.city,
      state: profileData.state,
      zip: profileData.zip,
      housing_type: profileData.housingType,
      has_children: profileData.hasChildren,
      children_ages: profileData.childrenAges,
      had_pets_before: profileData.hadPetsBefore,
      has_allergies: profileData.hasAllergies,
      allergies_description: profileData.allergiesDescription,
      work_schedule: profileData.workSchedule
    };
    
    // Call the user-profile edge function
    const { data, error } = await supabase.functions.invoke('user-profile', {
      method: 'POST',
      body: payload
    });
    
    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
      return false;
    }
    
    console.log('Profile updated successfully:', data);
    toast.success('Perfil atualizado com sucesso');
    return true;
  } catch (error) {
    console.error('Failed to update profile:', error);
    toast.error('Erro ao atualizar perfil');
    return false;
  }
};

/**
 * Creates a new profile using the edge function
 */
export const createProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('User not authenticated');
      return false;
    }
    
    // Format name from first and last name
    const name = profileData.firstName && profileData.lastName 
      ? `${profileData.firstName} ${profileData.lastName}` 
      : profileData.firstName || '';
    
    // Prepare data for the edge function
    const payload = {
      operation: 'create-profile',
      name,
      phone: profileData.phone || '',
      address: profileData.address || '',
      city: profileData.city || '',
      state: profileData.state || '',
      zip: profileData.zip || '',
      housing_type: profileData.housingType || 'house',
      has_children: profileData.hasChildren || false,
      children_ages: profileData.childrenAges || '',
      had_pets_before: profileData.hadPetsBefore || false,
      has_allergies: profileData.hasAllergies || false,
      allergies_description: profileData.allergiesDescription || '',
      work_schedule: profileData.workSchedule || ''
    };
    
    console.log('Creating profile with data:', payload);
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('user-profile', {
      method: 'POST',
      body: payload
    });
    
    if (error) {
      console.error('Error creating profile via edge function:', error);
      return false;
    }
    
    console.log('Profile created successfully:', data);
    return true;
  } catch (error) {
    console.error('Failed to create profile:', error);
    return false;
  }
};
