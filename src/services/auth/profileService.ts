
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';
import { toast } from '@/hooks/use-sonner';

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
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        }
      });
      
      if (error) {
        console.error('Error fetching profile from edge function:', error);
        toast.error('Erro ao buscar perfil: ' + error.message);
        return null;
      }
      
      const payload = (data as any)?.data ?? data;

      if (!payload) {
        console.log('No profile data returned from edge function');
        return null;
      }
      
      // Transform the data to match the UserProfile interface
      const profile: UserProfile = {
        id: payload.id,
        userId: payload.authSubject ?? payload.auth_id, // Accept backend and edge naming
        firstName: payload.fullName?.split(' ')[0] || payload.name?.split(' ')[0] || '',
        lastName: payload.fullName?.split(' ').slice(1).join(' ') || payload.name?.split(' ').slice(1).join(' ') || '',
        email: payload.email || '',
        phone: payload.phone || '',
        address: payload.addressLine || payload.address || '',
        city: payload.city || '',
        state: payload.state || '',
        zip: payload.zipCode || payload.zip || '',
        avatarUrl: payload.avatarUrl || payload.avatar_url || '',
        housingType: payload.housingType || payload.housing_type || 'house',
        hasChildren: Boolean(payload.hasChildren ?? payload.has_children),
        childrenAges: payload.childrenAges || payload.children_ages || '',
        hadPetsBefore: Boolean(payload.hadPetsBefore ?? payload.had_pets_before),
        hasAllergies: Boolean(payload.hasAllergies ?? payload.has_allergies),
        allergiesDescription: payload.allergiesDescription || payload.allergies_description || '',
        workSchedule: payload.workSchedule || payload.work_schedule || ''
      };
      
      console.log('Profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      console.error('Error in edge function call:', error);
      toast.error('Erro ao processar dados do perfil');
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    toast.error('Erro ao buscar perfil');
    return null;
  }
};

/**
 * Updates the user's profile in the database
 * Uses Edge Function to handle permissions and data validation
 */
export const updateProfile = async (profileData: Partial<UserProfile>): Promise<boolean> => {
  try {
    console.log('Updating profile with data:', profileData);
    
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
      email: profileData.email,
      phone: profileData.phone,
      address: profileData.address,
      city: profileData.city,
      state: profileData.state,
      zip: profileData.zip,
      avatar_url: profileData.avatarUrl || '',
      housing_type: profileData.housingType || 'house',
      has_children: profileData.hasChildren !== undefined ? Boolean(profileData.hasChildren) : false,
      children_ages: profileData.childrenAges || '',
      had_pets_before: profileData.hadPetsBefore !== undefined ? Boolean(profileData.hadPetsBefore) : false,
      has_allergies: profileData.hasAllergies !== undefined ? Boolean(profileData.hasAllergies) : false,
      allergies_description: profileData.allergiesDescription || '',
      work_schedule: profileData.workSchedule || ''
    };
    
    console.log('Sending payload to edge function:', payload);
    
    // Call the user-profile edge function
    const { data, error } = await supabase.functions.invoke('user-profile', {
      method: 'POST',
      body: payload,
      headers: {
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      }
    });
    
    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil: ' + error.message);
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
    // Check if we have user ID from the parameter (preferred method)
    const userId = profileData.userId || (await supabase.auth.getUser()).data.user?.id;

    if (!userId) {
      console.error('No user ID available for profile creation');
      toast.error('Erro de autenticação. Não foi possível identificar o usuário.');
      return false;
    }
    
    // Format name from first and last name
    const name = profileData.firstName && profileData.lastName 
      ? `${profileData.firstName} ${profileData.lastName}` 
      : profileData.firstName || '';
    
    // Prepare data for the edge function - ensure all address fields are included
    const payload = {
      operation: 'create-profile',
      name,
      email: profileData.email || '',
      phone: profileData.phone || '',
      address: profileData.address || '',
      city: profileData.city || '',
      state: profileData.state || '',
      zip: profileData.zip || '',
      avatar_url: profileData.avatarUrl || '',
      housing_type: profileData.housingType || 'house',
      has_children: profileData.hasChildren !== undefined ? Boolean(profileData.hasChildren) : false,
      children_ages: profileData.childrenAges || '',
      had_pets_before: profileData.hadPetsBefore !== undefined ? Boolean(profileData.hadPetsBefore) : false,
      has_allergies: profileData.hasAllergies !== undefined ? Boolean(profileData.hasAllergies) : false,
      allergies_description: profileData.allergiesDescription || '',
      work_schedule: profileData.workSchedule || '',
      user_id: userId // Add explicit user ID
    };
    
    console.log('Creating profile with data:', payload);
    
    // Get active session token for authorization
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    
    if (!accessToken && !userId) {
      console.error('No access token available for profile creation and no user ID');
      toast.error('Erro de autenticação. Tente fazer login novamente.');
      return false;
    }
    
    // Call the edge function with authentication and user ID
    const { data, error } = await supabase.functions.invoke('user-profile', {
      method: 'POST',
      body: payload,
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`
      } : {}
    });
    
    if (error) {
      console.error('Error creating profile via edge function:', error);
      
      // Handling specific error types
      if (error.message && error.message.includes('Key (email)') && error.message.includes('already exists')) {
        toast.error('Este email já está cadastrado. Por favor, use outro email.');
      } else {
        toast.error('Erro ao criar perfil: ' + error.message);
      }
      return false;
    }
    
    console.log('Profile created successfully:', data);
    toast.success('Perfil criado com sucesso!');
    return true;
  } catch (error) {
    console.error('Failed to create profile:', error);
    toast.error('Erro ao criar perfil');
    return false;
  }
};
